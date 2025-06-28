#!/bin/bash

# JamDung Jobs - Local to Staging Sync Script
# Ensures consistency between local-dev and staging environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_COMPOSE_FILE="local-dev/docker-compose.yml"
PROD_COMPOSE_FILE="docker-compose.prod.yml"

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
    exit 1
}

# Compare Docker Compose configurations
compare_compose_configs() {
    log "Comparing Docker Compose configurations..."
    
    cd "$PROJECT_ROOT"
    
    # Extract service names from both files
    local_services=$(docker-compose -f "$LOCAL_COMPOSE_FILE" config --services | sort)
    prod_services=$(docker-compose -f "$PROD_COMPOSE_FILE" config --services | sort)
    
    echo "Local services: $local_services"
    echo "Production services: $prod_services"
    
    # Check for missing services
    local missing_in_prod=""
    local missing_in_local=""
    
    for service in $local_services; do
        if ! echo "$prod_services" | grep -q "^$service$"; then
            missing_in_prod="$missing_in_prod $service"
        fi
    done
    
    for service in $prod_services; do
        if ! echo "$local_services" | grep -q "^$service$"; then
            missing_in_local="$missing_in_local $service"
        fi
    done
    
    if [ -n "$missing_in_prod" ]; then
        warning "Services in local but not in production:$missing_in_prod"
    fi
    
    if [ -n "$missing_in_local" ]; then
        warning "Services in production but not in local:$missing_in_local"
    fi
    
    if [ -z "$missing_in_prod" ] && [ -z "$missing_in_local" ]; then
        success "Service configurations are consistent"
    fi
}

# Test local environment matches production structure
test_local_prod_parity() {
    log "Testing local-production parity..."
    
    cd "$PROJECT_ROOT"
    
    # Test that production images can be built locally
    log "Building production images locally..."
    docker-compose -f "$PROD_COMPOSE_FILE" build --no-cache
    
    # Test configuration validity
    log "Validating production configuration..."
    docker-compose -f "$PROD_COMPOSE_FILE" config > /dev/null
    
    success "Local-production parity test passed"
}

# Sync environment variables template
sync_env_template() {
    log "Syncing environment variable templates..."
    
    cd "$PROJECT_ROOT"
    
    # Create a comprehensive .env.template that works for both environments
    cat > .env.staging.template << 'EOF'
# JamDung Jobs - Staging Environment Template
# Copy this to .env on your staging server and fill in the values

# Application
NODE_ENV=production
PORT=5000

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_db_password_here
POSTGRES_DB=jobboard
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/jobboard

# Authentication
JWT_SECRET=your_jwt_secret_here_minimum_32_characters

# Redis
REDIS_URL=redis://redis:6379

# AWS (if using S3 for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Cloudflare Tunnel (optional)
CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token_here
CLOUDFLARE_ACCOUNT_TAG=your_account_tag
CLOUDFLARE_TUNNEL_SECRET=your_tunnel_secret
CLOUDFLARE_TUNNEL_ID=your_tunnel_id

# Email (if using SES or other email service)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Google Maps API (for location features)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Application URLs
FRONTEND_URL=your_staging_frontend_url
API_URL=your_staging_api_url
EOF

    success "Environment template created: .env.staging.template"
}

# Create deployment checklist
create_deployment_checklist() {
    log "Creating deployment checklist..."
    
    cat > "$PROJECT_ROOT/DEPLOYMENT_CHECKLIST.md" << 'EOF'
# JamDung Jobs - Deployment Checklist

## Pre-Deployment Checks

### Local Environment
- [ ] All tests pass locally
- [ ] Local development environment runs without errors
- [ ] Production Docker images build successfully locally
- [ ] Database migrations are ready (if any)
- [ ] Environment variables are properly configured

### Code Quality
- [ ] Code has been reviewed
- [ ] No sensitive data in code (API keys, passwords, etc.)
- [ ] All new features have been tested
- [ ] Documentation is updated

### Staging Environment
- [ ] Staging server is accessible via SSH
- [ ] Environment variables are properly set in staging
- [ ] Database backup is recent (if needed)
- [ ] Sufficient disk space available
- [ ] All required secrets are configured in GitHub

## Deployment Process

### Automatic Deployment (GitHub Actions)
1. Push to `main` or `staging` branch
2. GitHub Actions will automatically:
   - Build Docker images
   - Deploy to staging server
   - Run health checks
   - Run feature tests
   - Rollback on failure

### Manual Deployment (if needed)
1. SSH to staging server: `ssh ubuntu@your-staging-ip`
2. Navigate to project: `cd /home/ubuntu/jamdungjobs`
3. Pull latest changes: `git pull origin main`
4. Stop services: `docker-compose -f docker-compose.prod.yml down`
5. Build and start: `docker-compose -f docker-compose.prod.yml up --build -d`
6. Check status: `docker-compose -f docker-compose.prod.yml ps`

## Post-Deployment Verification

### Health Checks
- [ ] API health endpoint responds: `curl http://your-staging-ip:5000/api/health`
- [ ] Frontend loads correctly: `curl http://your-staging-ip`
- [ ] Database connection works
- [ ] All services are running

### Feature Testing
- [ ] User registration works
- [ ] Job posting works
- [ ] Job search works
- [ ] Application process works
- [ ] Profile management works

### Performance Checks
- [ ] Page load times are acceptable
- [ ] API response times are good
- [ ] No memory leaks or high CPU usage
- [ ] Logs show no critical errors

## Rollback Procedure (if needed)

### Automatic Rollback
GitHub Actions will automatically attempt rollback on deployment failure.

### Manual Rollback
1. SSH to staging server
2. Navigate to project directory
3. Stop current services: `docker-compose -f docker-compose.prod.yml down`
4. Restore from backup: `mv jamdungjobs_backup jamdungjobs`
5. Start services: `docker-compose -f docker-compose.prod.yml up -d`

## Monitoring

### Log Locations
- Application logs: `docker-compose -f docker-compose.prod.yml logs -f`
- System logs: `/var/log/jamdungjobs-init.log`
- Individual service logs: `docker-compose -f docker-compose.prod.yml logs -f [service-name]`

### Key Metrics to Monitor
- Response times
- Error rates
- Database performance
- Disk usage
- Memory usage
- Active user sessions
EOF

    success "Deployment checklist created: DEPLOYMENT_CHECKLIST.md"
}

# Create environment comparison script
create_env_comparison() {
    log "Creating environment comparison script..."
    
    cat > "$PROJECT_ROOT/scripts/compare-environments.sh" << 'EOF'
#!/bin/bash

# Compare local and staging environments

echo "=== Docker Compose Service Comparison ==="
echo "Local services:"
docker-compose -f local-dev/docker-compose.yml config --services | sort

echo -e "\nProduction services:"
docker-compose -f docker-compose.prod.yml config --services | sort

echo -e "\n=== Environment Variables Comparison ==="
echo "Checking for required environment variables..."

# List of critical environment variables
REQUIRED_VARS=(
    "NODE_ENV"
    "DATABASE_URL"
    "JWT_SECRET"
    "PORT"
)

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "$var" .env.staging.template 2>/dev/null; then
        echo "✅ $var - documented in staging template"
    else
        echo "❌ $var - missing from staging template"
    fi
done

echo -e "\n=== Docker Image Comparison ==="
echo "Local development images:"
docker-compose -f local-dev/docker-compose.yml config | grep "image:" | sort | uniq

echo -e "\nProduction images:"
docker-compose -f docker-compose.prod.yml config | grep "image:" | sort | uniq
EOF

    chmod +x "$PROJECT_ROOT/scripts/compare-environments.sh"
    success "Environment comparison script created"
}

# Main execution
main() {
    log "Starting local-to-staging sync analysis..."
    
    compare_compose_configs
    test_local_prod_parity
    sync_env_template
    create_deployment_checklist
    create_env_comparison
    
    echo ""
    echo "=========================================="
    echo "         SYNC ANALYSIS COMPLETE"
    echo "=========================================="
    echo "✅ Docker Compose configurations compared"
    echo "✅ Local-production parity tested"
    echo "✅ Environment template created"
    echo "✅ Deployment checklist created"
    echo "✅ Environment comparison script created"
    echo ""
    echo "Next steps:"
    echo "1. Review .env.staging.template and configure your staging environment"
    echo "2. Follow DEPLOYMENT_CHECKLIST.md for deployments"
    echo "3. Use scripts/compare-environments.sh to verify consistency"
    echo "4. Your GitHub Actions workflow will handle automatic deployments"
    echo "=========================================="
}

# Handle script arguments
case "${1:-}" in
    --compare-only)
        compare_compose_configs
        ;;
    --test-only)
        test_local_prod_parity
        ;;
    *)
        main
        ;;
esac
EOF
