#!/bin/bash

# JamDung Jobs - Local Testing Stack Runner
# Mimics the GitHub Actions testing workflow locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_SUITE="${1:-all}"
ENVIRONMENT="${2:-local}"
SKIP_SETUP="${3:-false}"

# Test configuration
API_PORT=5001
FRONTEND_PORT=3001
POSTGRES_PORT=5433  # Different from dev to avoid conflicts
REDIS_PORT=6380     # Different from dev to avoid conflicts

# PIDs for cleanup
API_PID=""
FRONTEND_PID=""
POSTGRES_PID=""
REDIS_PID=""

# Functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    cleanup_and_exit 1
}

info() {
    echo -e "${PURPLE}[INFO]${NC} $1"
}

# Cleanup function
cleanup_and_exit() {
    local exit_code=${1:-0}
    
    log "Cleaning up test environment..."
    
    # Kill background processes
    if [ -n "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
        log "Stopped API server (PID: $API_PID)"
    fi
    
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        log "Stopped frontend server (PID: $FRONTEND_PID)"
    fi
    
    # Stop Docker containers if running
    if [ "$ENVIRONMENT" = "docker" ]; then
        log "Stopping Docker containers..."
        docker-compose -f local-dev/docker-compose.yml down -v 2>/dev/null || true
    fi
    
    # Clean up test database
    if command -v psql >/dev/null 2>&1; then
        PGPASSWORD=testpassword psql -h localhost -p $POSTGRES_PORT -U postgres -c "DROP DATABASE IF EXISTS jobboard_test;" 2>/dev/null || true
    fi
    
    success "Cleanup completed"
    exit $exit_code
}

# Trap cleanup on script exit
trap cleanup_and_exit EXIT

# Setup test environment
setup_test_environment() {
    log "Setting up test environment..."
    
    cd "$PROJECT_ROOT"
    
    # Check if Docker is running for Docker mode
    if [ "$ENVIRONMENT" = "docker" ]; then
        if ! docker info >/dev/null 2>&1; then
            error "Docker is not running. Please start Docker Desktop."
        fi
    fi
    
    # Install dependencies
    log "Installing dependencies..."
    cd backend && npm ci --silent
    cd ../web-frontend && npm ci --silent
    cd ../testing && npm ci --silent
    cd ..
    
    # Create test environment file
    log "Creating test environment configuration..."
    cat > .env.test << EOF
NODE_ENV=test
PORT=$API_PORT
DATABASE_URL=postgresql://postgres:testpassword@localhost:$POSTGRES_PORT/jobboard_test
JWT_SECRET=test-jwt-secret-for-local-testing-only
REDIS_URL=redis://localhost:$REDIS_PORT
FRONTEND_URL=http://localhost:$FRONTEND_PORT
API_URL=http://localhost:$API_PORT
GOOGLE_MAPS_API_KEY=test-key
AWS_REGION=us-east-1
CLOUDFLARE_TUNNEL_TOKEN=test-token
EOF
    
    # Copy environment files
    cp .env.test backend/.env
    cp .env.test web-frontend/.env
    
    success "Test environment configuration created"
}

# Setup services based on environment
setup_services() {
    if [ "$ENVIRONMENT" = "docker" ]; then
        setup_docker_services
    else
        setup_local_services
    fi
}

# Setup Docker-based services
setup_docker_services() {
    log "Setting up Docker-based test services..."
    
    cd "$PROJECT_ROOT"
    
    # Update docker-compose for testing
    export POSTGRES_PORT=$POSTGRES_PORT
    export API_PORT=$API_PORT
    export FRONTEND_PORT=$FRONTEND_PORT
    
    # Start services
    docker-compose -f local-dev/docker-compose.yml up -d
    
    # Wait for services
    log "Waiting for Docker services to be ready..."
    sleep 30
    
    # Check service health
    docker-compose -f local-dev/docker-compose.yml ps
    
    success "Docker services are ready"
}

# Setup local services
setup_local_services() {
    log "Setting up local test services..."
    
    cd "$PROJECT_ROOT"
    
    # Start PostgreSQL (if not running)
    if ! pg_isready -h localhost -p $POSTGRES_PORT >/dev/null 2>&1; then
        log "Starting PostgreSQL..."
        if command -v postgres >/dev/null 2>&1; then
            # Start PostgreSQL locally
            postgres -D /usr/local/var/postgres -p $POSTGRES_PORT &
            POSTGRES_PID=$!
            sleep 5
        else
            warning "PostgreSQL not found locally. Using Docker for database..."
            docker run -d --name test-postgres \
                -e POSTGRES_USER=postgres \
                -e POSTGRES_PASSWORD=testpassword \
                -e POSTGRES_DB=jobboard_test \
                -p $POSTGRES_PORT:5432 \
                postgres:15
            sleep 10
        fi
    fi
    
    # Start Redis (if not running)
    if ! redis-cli -p $REDIS_PORT ping >/dev/null 2>&1; then
        log "Starting Redis..."
        if command -v redis-server >/dev/null 2>&1; then
            redis-server --port $REDIS_PORT --daemonize yes
        else
            warning "Redis not found locally. Using Docker for Redis..."
            docker run -d --name test-redis \
                -p $REDIS_PORT:6379 \
                redis:7
            sleep 5
        fi
    fi
    
    # Setup database
    log "Setting up test database..."
    cd backend
    
    # Create database if it doesn't exist
    PGPASSWORD=testpassword createdb -h localhost -p $POSTGRES_PORT -U postgres jobboard_test 2>/dev/null || true
    
    # Generate Prisma client and run migrations
    npx prisma generate
    npx prisma migrate deploy || npx prisma db push
    
    # Start API server
    log "Starting API server..."
    npm start &
    API_PID=$!
    
    # Wait for API to be ready
    log "Waiting for API to start..."
    for i in {1..30}; do
        if curl -f http://localhost:$API_PORT/api/health >/dev/null 2>&1; then
            success "API is ready at http://localhost:$API_PORT"
            break
        fi
        if [ $i -eq 30 ]; then
            error "API failed to start within timeout"
        fi
        sleep 2
    done
    
    # Build and start frontend
    log "Building and starting frontend..."
    cd ../web-frontend
    npm run build
    npx serve -s build -l $FRONTEND_PORT &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    log "Waiting for frontend to start..."
    for i in {1..30}; do
        if curl -f http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
            success "Frontend is ready at http://localhost:$FRONTEND_PORT"
            break
        fi
        if [ $i -eq 30 ]; then
            error "Frontend failed to start within timeout"
        fi
        sleep 2
    done
    
    success "Local services are ready"
}

# Setup test accounts
setup_test_accounts() {
    if [ "$SKIP_SETUP" = "true" ]; then
        log "Skipping test account setup"
        return
    fi
    
    log "Setting up test accounts..."
    cd "$PROJECT_ROOT/testing"
    
    if [ "$ENVIRONMENT" = "docker" ]; then
        node setup_test_accounts_docker.js
    else
        node setup_test_accounts.js
    fi
    
    success "Test accounts created"
}

# Run health checks
run_health_checks() {
    log "Running environment health checks..."
    
    echo "=== Test Environment Health Check ==="
    echo "API Health:"
    curl -f http://localhost:$API_PORT/api/health | jq '.' || echo "API health check failed"
    echo ""
    
    echo "Frontend Health:"
    curl -f -s http://localhost:$FRONTEND_PORT | head -n 5 || echo "Frontend health check failed"
    echo ""
    
    echo "Database Connection:"
    cd "$PROJECT_ROOT/backend"
    npx prisma db seed --preview-feature 2>/dev/null || echo "No seed script found"
    echo ""
    
    echo "Redis Connection:"
    redis-cli -p $REDIS_PORT ping || echo "Redis connection failed"
    echo ""
    
    success "Health checks completed"
}

# Run specific test suite
run_test_suite() {
    local suite=$1
    
    cd "$PROJECT_ROOT/testing"
    
    case $suite in
        "smoke")
            log "Running smoke tests..."
            node basic-smoke-test.js
            ;;
        "api")
            log "Running API tests..."
            node api.test.js
            node test-resume-api.js
            ;;
        "comprehensive")
            log "Running comprehensive QA tests..."
            node comprehensive-qa-test.js
            ;;
        "mvp-readiness")
            log "Running MVP readiness tests..."
            node mvp-readiness-test.js
            ;;
        "file-upload")
            log "Running file upload tests..."
            node file-upload-test.js
            ;;
        "new-features")
            log "Running new features tests..."
            node test-new-features.js
            ;;
        "all")
            log "Running all test suites..."
            node basic-smoke-test.js
            node api.test.js
            node test-resume-api.js
            node comprehensive-qa-test.js
            node mvp-readiness-test.js
            node file-upload-test.js
            node test-new-features.js
            ;;
        *)
            warning "Unknown test suite: $suite"
            warning "Available suites: smoke, api, comprehensive, mvp-readiness, file-upload, new-features, all"
            return 1
            ;;
    esac
    
    success "Test suite '$suite' completed"
}

# Run Postman collection
run_postman_tests() {
    log "Running Postman collection tests..."
    
    cd "$PROJECT_ROOT/testing"
    
    if ! command -v newman >/dev/null 2>&1; then
        log "Installing Newman..."
        npm install -g newman
    fi
    
    # Create environment file for Newman
    cat > newman-environment.json << EOF
{
  "name": "Local Test Environment",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:$API_PORT"
    },
    {
      "key": "frontendUrl",
      "value": "http://localhost:$FRONTEND_PORT"
    }
  ]
}
EOF
    
    newman run JamDungJobs_Postman_Collection.json \
        -e newman-environment.json \
        --reporters cli,json \
        --reporter-json-export postman-results-local.json
    
    success "Postman collection tests completed"
}

# Generate test report
generate_test_report() {
    log "Generating test report..."
    
    cd "$PROJECT_ROOT/testing"
    
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local report_file="test-report-local-$timestamp.json"
    
    cat > "$report_file" << EOF
{
  "testRun": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "environment": "$ENVIRONMENT",
    "testSuite": "$TEST_SUITE",
    "commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
  },
  "services": {
    "api": "http://localhost:$API_PORT",
    "frontend": "http://localhost:$FRONTEND_PORT",
    "database": "postgresql://localhost:$POSTGRES_PORT/jobboard_test",
    "redis": "redis://localhost:$REDIS_PORT"
  },
  "artifacts": {
    "qaReports": $(ls qa-report-*.json 2>/dev/null | jq -R . | jq -s . || echo '[]'),
    "postmanResults": $(ls postman-results-*.json 2>/dev/null | jq -R . | jq -s . || echo '[]')
  }
}
EOF
    
    success "Test report generated: $report_file"
}

# Main execution
main() {
    echo "=========================================="
    echo "    JamDung Jobs - Local Testing Stack"
    echo "=========================================="
    echo "🧪 Test Suite: $TEST_SUITE"
    echo "🌍 Environment: $ENVIRONMENT"
    echo "⚙️  Skip Setup: $SKIP_SETUP"
    echo "=========================================="
    echo ""
    
    setup_test_environment
    setup_services
    setup_test_accounts
    run_health_checks
    
    log "Starting test execution..."
    run_test_suite "$TEST_SUITE"
    
    if [ "$TEST_SUITE" = "all" ]; then
        run_postman_tests
    fi
    
    generate_test_report
    
    echo ""
    echo "=========================================="
    echo "         TEST EXECUTION COMPLETE"
    echo "=========================================="
    echo "✅ All tests completed successfully!"
    echo "📊 Test reports available in testing/ directory"
    echo "🌐 Services running at:"
    echo "   - API: http://localhost:$API_PORT"
    echo "   - Frontend: http://localhost:$FRONTEND_PORT"
    echo ""
    echo "To stop services, press Ctrl+C or run:"
    echo "kill $API_PID $FRONTEND_PID"
    echo "=========================================="
}

# Handle script arguments
show_usage() {
    echo "Usage: $0 [TEST_SUITE] [ENVIRONMENT] [SKIP_SETUP]"
    echo ""
    echo "TEST_SUITE options:"
    echo "  all (default)    - Run all test suites"
    echo "  smoke           - Basic smoke tests"
    echo "  api             - API endpoint tests"
    echo "  comprehensive   - Full QA test suite"
    echo "  mvp-readiness   - MVP validation tests"
    echo "  file-upload     - File upload tests"
    echo "  new-features    - New feature tests"
    echo ""
    echo "ENVIRONMENT options:"
    echo "  local (default) - Use local services"
    echo "  docker          - Use Docker Compose"
    echo ""
    echo "SKIP_SETUP options:"
    echo "  false (default) - Setup test accounts"
    echo "  true            - Skip test account setup"
    echo ""
    echo "Examples:"
    echo "  $0                          # Run all tests locally"
    echo "  $0 smoke                    # Run smoke tests only"
    echo "  $0 api docker               # Run API tests in Docker"
    echo "  $0 comprehensive local true # Run comprehensive tests, skip setup"
}

case "${1:-}" in
    -h|--help|help)
        show_usage
        exit 0
        ;;
    *)
        main
        ;;
esac
