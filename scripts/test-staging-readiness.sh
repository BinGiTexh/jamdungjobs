#!/bin/bash

# JamDung Jobs v1.2 - Staging Deployment Readiness Test
# Tests local environment and prepares for automated deployment

set -e

echo "🚀 JamDung Jobs v1.2 - Staging Deployment Readiness Test"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
print_test() {
    echo -e "${BLUE}🔍 Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test 1: Check Docker setup
print_test "Docker Environment"
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    print_success "Docker and Docker Compose are installed"
    
    # Test if Docker is running
    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
    else
        print_error "Docker daemon is not running"
    fi
else
    print_error "Docker or Docker Compose not found"
fi

# Test 2: Check required files
print_test "Required Deployment Files"
required_files=(
    "docker-compose.prod.yml"
    "Dockerfile.api"
    "Dockerfile.frontend.static"
    ".github/workflows/staging-deploy-v1.2.yml"
    "backend/prisma/schema.prisma"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found: $file"
    else
        print_error "Missing: $file"
    fi
done

# Test 3: Verify v1.2 features in code
print_test "v1.2 Feature Implementation"

# Check for JobViewService
if [ -f "backend/services/jobViewService.js" ]; then
    print_success "JobViewService implemented"
else
    print_error "JobViewService missing"
fi

# Check for billing endpoints
if grep -q "/subscription" backend/routes/employer.routes.js; then
    print_success "Billing endpoints implemented"
else
    print_error "Billing endpoints missing"
fi

# Check for JobView model in schema
if grep -q "model JobView" backend/prisma/schema.prisma; then
    print_success "JobView database model defined"
else
    print_error "JobView database model missing"
fi

# Check for Navigation component updates
if [ -f "web-frontend/src/components/ui/Navigation.js" ]; then
    if grep -q "markAllAsRead" web-frontend/src/components/ui/Navigation.js; then
        print_success "Notification bell fix implemented"
    else
        print_error "Notification bell fix missing"
    fi
else
    print_error "Navigation component missing"
fi

# Test 4: Check Docker image tags
print_test "Docker Image Version Tags"
if grep -q "jamdungjobs-api:1.2.0" docker-compose.prod.yml && grep -q "jamdungjobs-frontend:1.2.0" docker-compose.prod.yml; then
    print_success "Docker images tagged for v1.2.0"
else
    print_error "Docker images not properly tagged for v1.2.0"
fi

# Test 5: Test local build capability
print_test "Local Build Test"
if docker-compose -f docker-compose.prod.yml config &> /dev/null; then
    print_success "Docker Compose configuration is valid"
    
    # Try building just the API service (quick test)
    if docker build -f Dockerfile.api -t jamdungjobs-api:test . &> /dev/null; then
        print_success "API Docker image builds successfully"
        docker rmi jamdungjobs-api:test &> /dev/null || true
    else
        print_error "API Docker build failed"
    fi
else
    print_error "Docker Compose configuration is invalid"
fi

# Test 6: Check Git repository status
print_test "Git Repository Status"
if git status &> /dev/null; then
    UNTRACKED=$(git ls-files --others --exclude-standard | wc -l)
    MODIFIED=$(git diff --name-only | wc -l)
    STAGED=$(git diff --cached --name-only | wc -l)
    
    echo "   📋 Repository Status:"
    echo "      - Untracked files: $UNTRACKED"
    echo "      - Modified files: $MODIFIED" 
    echo "      - Staged files: $STAGED"
    
    if [ $MODIFIED -eq 0 ] && [ $STAGED -eq 0 ]; then
        print_success "Repository is clean and ready for deployment"
    else
        print_warning "Repository has uncommitted changes"
    fi
    
    # Check if we're on main branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" = "main" ]; then
        print_success "On main branch (deployment trigger)"
    else
        print_warning "Not on main branch (current: $CURRENT_BRANCH)"
    fi
else
    print_error "Not in a Git repository"
fi

# Test 7: Verify environment template
print_test "Environment Configuration Template"
if [ -f "local-dev/.env.example" ]; then
    print_success "Environment template found"
    
    # Check for required environment variables
    required_env_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "NODE_ENV"
        "POSTGRES_PASSWORD"
    )
    
    for var in "${required_env_vars[@]}"; do
        if grep -q "$var" local-dev/.env.example; then
            print_success "Environment variable documented: $var"
        else
            print_warning "Environment variable missing from template: $var"
        fi
    done
else
    print_warning "Environment template missing (local-dev/.env.example)"
fi

# Test 8: Network connectivity test (if we can reach the staging server)
print_test "Staging Server Connectivity (Optional)"
STAGING_HOST="3.89.154.166"

if ping -c 1 -W 3 $STAGING_HOST &> /dev/null; then
    print_success "Can reach staging server at $STAGING_HOST"
else
    print_warning "Cannot reach staging server at $STAGING_HOST (this is OK if you're not on the right network)"
fi

# Test 9: Check GitHub Actions workflow syntax
print_test "GitHub Actions Workflow Validation"
if command -v yamllint &> /dev/null; then
    if yamllint .github/workflows/staging-deploy-v1.2.yml &> /dev/null; then
        print_success "GitHub Actions workflow syntax is valid"
    else
        print_error "GitHub Actions workflow has syntax errors"
    fi
else
    print_warning "yamllint not installed, skipping workflow syntax check"
fi

# Summary
echo ""
echo "========================================================"
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "========================================================"
echo -e "✅ Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Your v1.2 deployment is ready!${NC}"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Ensure your GitHub repository secrets are configured:"
    echo "      - STAGING_SSH_PRIVATE_KEY"
    echo "   2. Ensure .env file is properly configured on staging server"
    echo "   3. Push to main branch to trigger automated deployment"
    echo ""
    echo "📋 Deployment will be available at:"
    echo "   🌐 https://staging-jobs.bingitech.io"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please fix the issues before deploying.${NC}"
    echo ""
    echo "📋 Common fixes:"
    echo "   - Ensure Docker is installed and running"
    echo "   - Commit any pending changes"
    echo "   - Verify all v1.2 features are implemented"
    echo "   - Check Docker Compose configuration"
    echo ""
    exit 1
fi