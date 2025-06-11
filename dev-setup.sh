#!/bin/bash
#
# JamDung Jobs Development Environment Setup
# This script sets up and manages the development environment for JamDung Jobs.
#
# Usage: ./dev-setup.sh [OPTIONS]
# Options:
#   --clean    Clean existing environment before setup
#   --help     Show this help message
#

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script constants
DOCKER_COMPOSE_DEV="docker-compose.dev.yml"
LOG_DIR="logs"
LOG_FILE="${LOG_DIR}/dev-setup.log"
BACKEND_ENV="backend/.env"
FRONTEND_ENV="web-frontend/.env"

# Ensure log directory exists
mkdir -p "${LOG_DIR}"

# Logging functions
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} $1" | tee -a "${LOG_FILE}"
}

info() { log "${GREEN}[INFO]${NC} $1"; }
warn() { log "${YELLOW}[WARN]${NC} $1"; }
error() { log "${RED}[ERROR]${NC} $1"; }
section() { echo -e "\n${BLUE}=== $1 ===${NC}"; }

# Help message
show_help() {
    cat << EOF
Development Environment Setup for JamDung Jobs

Usage: 
    ./dev-setup.sh [OPTIONS]

Options:
    --clean     Clean existing environment before setup
    --help      Show this help message

This script will:
    1. Check system requirements
    2. Set up development environment files
    3. Initialize Docker containers
    4. Set up the database
    5. Start development services
    6. Verify service health

Requirements:
    - Docker and Docker Compose
    - Node.js v20 or higher (optional, will use container version)
    - 4GB+ available memory
    - 10GB+ available disk space

Example:
    ./dev-setup.sh --clean    # Clean setup
    ./dev-setup.sh           # Normal setup
EOF
    exit 0
}

# Check system requirements
check_requirements() {
    section "Checking System Requirements"

    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    info "✓ Docker is installed"

    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    info "✓ Docker Compose is installed"

    # Check Node.js (optional)
    if command -v node &> /dev/null; then
        local node_version=$(node -v)
        info "✓ Node.js ${node_version} is installed locally"
    else
        warn "Node.js is not installed locally (will use container version)"
    fi

    # Check system resources
    local available_memory=$(free -g | awk '/^Mem:/{print $7}')
    local available_disk=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    
    if [[ "${available_memory}" -lt 4 ]]; then
        warn "Less than 4GB of available memory (${available_memory}GB). Performance may be affected."
    else
        info "✓ Sufficient memory available (${available_memory}GB)"
    fi

    if [[ "${available_disk%G}" -lt 10 ]]; then
        warn "Less than 10GB of available disk space (${available_disk}GB). Performance may be affected."
    else
        info "✓ Sufficient disk space available (${available_disk}GB)"
    fi
}

# Setup environment files
setup_env_files() {
    section "Setting Up Environment Files"

    # Backend .env
    if [[ ! -f "${BACKEND_ENV}" ]]; then
        info "Creating backend environment file..."
        cat > "${BACKEND_ENV}" << EOL
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@db:5432/jamdung
JWT_SECRET=dev_secret_key
DEBUG=backend:*
PRISMA_BINARY_TARGETS=linux-arm64-openssl-3.0.x
EOL
        info "✓ Created ${BACKEND_ENV}"
    else
        info "✓ Backend environment file exists"
    fi

    # Frontend .env
    if [[ ! -f "${FRONTEND_ENV}" ]]; then
        info "Creating frontend environment file..."
        cat > "${FRONTEND_ENV}" << EOL
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENV=development
WDS_SOCKET_PORT=0
CHOKIDAR_USEPOLLING=true
FAST_REFRESH=true
BROWSER=none
EOL
        info "✓ Created ${FRONTEND_ENV}"
    else
        info "✓ Frontend environment file exists"
    fi
}

# Clean up development environment
cleanup() {
    section "Cleaning Up Development Environment"

    info "Stopping containers..."
    docker compose -f "${DOCKER_COMPOSE_DEV}" down -v 2>/dev/null || true

    info "Removing node_modules..."
    rm -rf backend/node_modules web-frontend/node_modules

    info "Removing build artifacts..."
    rm -rf backend/dist web-frontend/build

    info "Cleaning up volumes..."
    docker volume prune -f

    info "✓ Cleanup complete"
}

# Initialize services
init_services() {
    section "Initializing Services"

    info "Building and starting containers..."
    docker compose -f "${DOCKER_COMPOSE_DEV}" up --build -d

    # Wait for database
    info "Waiting for database..."
    local retries=0
    until docker compose -f "${DOCKER_COMPOSE_DEV}" exec -T db pg_isready 2>/dev/null || [ $retries -eq 30 ]; do
        echo -n "."
        sleep 1
        ((retries++))
    done
    echo ""

    if [ $retries -eq 30 ]; then
        error "Database failed to start"
        docker compose -f "${DOCKER_COMPOSE_DEV}" logs db
        exit 1
    fi
    info "✓ Database is ready"

    # Run migrations
    info "Running database migrations..."
    docker compose -f "${DOCKER_COMPOSE_DEV}" exec -T api npx prisma migrate dev
    info "✓ Migrations complete"
}

# Check service health
check_health() {
    section "Checking Service Health"

    # Check API health
    info "Checking API health..."
    local retries=0
    until curl -s http://localhost:3000/health > /dev/null || [ $retries -eq 30 ]; do
        echo -n "."
        sleep 1
        ((retries++))
    done
    echo ""

    if [ $retries -eq 30 ]; then
        error "API failed to start"
        docker compose -f "${DOCKER_COMPOSE_DEV}" logs api
        exit 1
    fi
    info "✓ API is healthy"

    # Check frontend
    info "Checking frontend..."
    retries=0
    until curl -s http://localhost:3001 > /dev/null || [ $retries -eq 30 ]; do
        echo -n "."
        sleep 1
        ((retries++))
    done
    echo ""

    if [ $retries -eq 30 ]; then
        error "Frontend failed to start"
        docker compose -f "${DOCKER_COMPOSE_DEV}" logs frontend
        exit 1
    fi
    info "✓ Frontend is ready"
}

# Print final information
print_info() {
    section "Development Environment Ready!"

    cat << EOF

Access your development environment:

Frontend:    ${GREEN}http://localhost:3001${NC}
Backend API: ${GREEN}http://localhost:3000${NC}
Health:      ${GREEN}http://localhost:3000/health${NC}
Database:    ${GREEN}postgresql://localhost:5432${NC}

Useful commands:

  ${YELLOW}# View service logs${NC}
  docker compose -f ${DOCKER_COMPOSE_DEV} logs -f [service]

  ${YELLOW}# Restart a service${NC}
  docker compose -f ${DOCKER_COMPOSE_DEV} restart [service]

  ${YELLOW}# Stop all services${NC}
  docker compose -f ${DOCKER_COMPOSE_DEV} down

  ${YELLOW}# Clean restart${NC}
  ./dev-setup.sh --clean

Development logs are available in: ${YELLOW}${LOG_DIR}/${NC}

Happy coding! 🚀
EOF
}

# Main execution
main() {
    # Process arguments
    while [[ "$#" -gt 0 ]]; do
        case $1 in
            --clean) cleanup ;;
            --help) show_help ;;
            *) error "Unknown parameter: $1"; exit 1 ;;
        esac
        shift
    done

    # Run setup steps
    check_requirements
    setup_env_files
    init_services
    check_health
    print_info
}

# Handle errors
trap 'error "An error occurred. Check the logs for details."' ERR

# Make script executable
chmod +x "$0"

# Run main function
main "$@"

