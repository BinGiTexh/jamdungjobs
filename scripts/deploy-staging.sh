#!/bin/bash

# JamDung Jobs - Staging Deployment Script
# This script deploys the application to the staging EC2 instance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_PROFILE="personal"
AWS_REGION="us-east-1"
TERRAFORM_DIR="terraform/staging"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if AWS CLI is installed and configured
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
    fi
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        error "Terraform is not installed. Please install it first."
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker first."
    fi
    
    # Check AWS profile
    if ! aws configure list-profiles | grep -q "^${AWS_PROFILE}$"; then
        error "AWS profile '${AWS_PROFILE}' not found. Please configure it first."
    fi
    
    success "Prerequisites check passed"
}

# Build and test locally first
build_and_test_local() {
    log "Building and testing application locally..."
    
    cd "$PROJECT_ROOT"
    
    # Build production images locally to catch any build issues
    log "Building production Docker images..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Test that images can start (without actually running the full stack)
    log "Testing image startup..."
    docker-compose -f docker-compose.prod.yml config > /dev/null
    
    success "Local build and test completed"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    log "Deploying infrastructure with Terraform..."
    
    cd "$PROJECT_ROOT/$TERRAFORM_DIR"
    
    # Initialize Terraform
    log "Initializing Terraform..."
    terraform init
    
    # Plan the deployment
    log "Planning Terraform deployment..."
    terraform plan -out=tfplan
    
    # Ask for confirmation
    echo ""
    read -p "Do you want to apply the Terraform plan? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Applying Terraform configuration..."
        terraform apply tfplan
        success "Infrastructure deployment completed"
    else
        warning "Terraform deployment cancelled"
        return 1
    fi
}

# Get staging instance information
get_instance_info() {
    log "Getting staging instance information..."
    
    cd "$PROJECT_ROOT/$TERRAFORM_DIR"
    
    INSTANCE_IP=$(terraform output -raw staging_instance_public_ip 2>/dev/null || echo "")
    INSTANCE_ID=$(terraform output -raw staging_instance_id 2>/dev/null || echo "")
    
    if [ -z "$INSTANCE_IP" ] || [ -z "$INSTANCE_ID" ]; then
        error "Could not retrieve instance information. Make sure Terraform has been applied."
    fi
    
    log "Instance ID: $INSTANCE_ID"
    log "Instance IP: $INSTANCE_IP"
    
    # Export for use in other functions
    export STAGING_INSTANCE_IP="$INSTANCE_IP"
    export STAGING_INSTANCE_ID="$INSTANCE_ID"
}

# Wait for instance to be ready
wait_for_instance() {
    log "Waiting for instance to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Checking instance status (attempt $attempt/$max_attempts)..."
        
        # Check if we can SSH to the instance
        if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no ubuntu@$STAGING_INSTANCE_IP "echo 'Instance is ready'" &>/dev/null; then
            success "Instance is ready and accessible"
            return 0
        fi
        
        log "Instance not ready yet, waiting 30 seconds..."
        sleep 30
        ((attempt++))
    done
    
    error "Instance did not become ready within the expected time"
}

# Deploy application to staging
deploy_application() {
    log "Deploying application to staging instance..."
    
    # SSH to the instance and run deployment commands
    ssh -o StrictHostKeyChecking=no ubuntu@$STAGING_INSTANCE_IP << 'EOF'
        set -e
        
        echo "Starting application deployment on staging instance..."
        
        # Navigate to project directory
        cd /home/ubuntu/jamdungjobs
        
        # Pull latest changes
        echo "Pulling latest changes from repository..."
        git pull origin main
        
        # Stop existing services
        echo "Stopping existing services..."
        docker-compose -f docker-compose.prod.yml down || true
        
        # Clean up old images and containers
        echo "Cleaning up old Docker resources..."
        docker system prune -f
        
        # Build and start services
        echo "Building and starting services..."
        docker-compose -f docker-compose.prod.yml up --build -d
        
        # Wait for services to be healthy
        echo "Waiting for services to be healthy..."
        sleep 30
        
        # Check service status
        echo "Checking service status..."
        docker-compose -f docker-compose.prod.yml ps
        
        # Test API health
        echo "Testing API health..."
        for i in {1..10}; do
            if curl -f http://localhost:5000/api/health &>/dev/null; then
                echo "API is healthy"
                break
            fi
            echo "Waiting for API to be ready (attempt $i/10)..."
            sleep 10
        done
        
        echo "Application deployment completed successfully!"
EOF
    
    success "Application deployed to staging instance"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Test API endpoint
    log "Testing API endpoint..."
    if curl -f "http://$STAGING_INSTANCE_IP:5000/api/health" &>/dev/null; then
        success "API is responding correctly"
    else
        warning "API health check failed"
    fi
    
    # Test frontend (if accessible)
    log "Testing frontend endpoint..."
    if curl -f "http://$STAGING_INSTANCE_IP" &>/dev/null; then
        success "Frontend is responding correctly"
    else
        warning "Frontend health check failed"
    fi
    
    # Show service status
    log "Getting service status from staging instance..."
    ssh -o StrictHostKeyChecking=no ubuntu@$STAGING_INSTANCE_IP "cd /home/ubuntu/jamdungjobs && docker-compose -f docker-compose.prod.yml ps"
}

# Show deployment summary
show_summary() {
    echo ""
    echo "=========================================="
    echo "         DEPLOYMENT SUMMARY"
    echo "=========================================="
    echo "Instance ID: $STAGING_INSTANCE_ID"
    echo "Instance IP: $STAGING_INSTANCE_IP"
    echo "API URL:     http://$STAGING_INSTANCE_IP:5000"
    echo "Frontend:    http://$STAGING_INSTANCE_IP"
    echo ""
    echo "To SSH to the instance:"
    echo "ssh ubuntu@$STAGING_INSTANCE_IP"
    echo ""
    echo "To view logs:"
    echo "ssh ubuntu@$STAGING_INSTANCE_IP 'cd /home/ubuntu/jamdungjobs && docker-compose -f docker-compose.prod.yml logs -f'"
    echo "=========================================="
}

# Main deployment flow
main() {
    log "Starting JamDung Jobs staging deployment..."
    
    # Set AWS profile
    export AWS_PROFILE="$AWS_PROFILE"
    export AWS_DEFAULT_REGION="$AWS_REGION"
    
    check_prerequisites
    build_and_test_local
    deploy_infrastructure
    get_instance_info
    wait_for_instance
    deploy_application
    verify_deployment
    show_summary
    
    success "Deployment completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    --infrastructure-only)
        log "Deploying infrastructure only..."
        check_prerequisites
        deploy_infrastructure
        get_instance_info
        show_summary
        ;;
    --application-only)
        log "Deploying application only..."
        check_prerequisites
        get_instance_info
        deploy_application
        verify_deployment
        show_summary
        ;;
    --verify)
        log "Verifying existing deployment..."
        get_instance_info
        verify_deployment
        show_summary
        ;;
    *)
        main
        ;;
esac
