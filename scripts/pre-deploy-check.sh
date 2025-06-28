#!/bin/bash

# Pre-deployment consistency check script
# Run this locally before pushing to ensure deployment will succeed

set -e

echo "🔍 JamDung Jobs Pre-deployment Check"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Check Docker Compose files exist
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}❌ docker-compose.prod.yml not found${NC}"
    exit 1
fi

if [ ! -f "local-dev/docker-compose.yml" ]; then
    echo -e "${RED}❌ local-dev/docker-compose.yml not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker Compose files found${NC}"

# Validate Docker Compose configurations
echo "🔧 Validating Docker Compose configurations..."

echo "  📋 Local development services:"
docker-compose -f local-dev/docker-compose.yml config --services | sort | sed 's/^/    - /'

echo "  📋 Production services:"
docker-compose -f docker-compose.prod.yml config --services 2>/dev/null | sort | sed 's/^/    - /' || {
    echo -e "${YELLOW}⚠️  Production config has environment variable warnings (this is normal)${NC}"
    docker-compose -f docker-compose.prod.yml config --services 2>&1 | grep -v "warning" | sort | sed 's/^/    - /'
}

# Test production Docker builds
echo "🔨 Testing production Docker image builds..."
if docker-compose -f docker-compose.prod.yml build --quiet > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Production Docker images build successfully${NC}"
else
    echo -e "${RED}❌ Production Docker build failed${NC}"
    echo "Run 'docker-compose -f docker-compose.prod.yml build' to see detailed errors"
    exit 1
fi

# Check for required Dockerfiles
echo "📦 Checking Dockerfiles..."
required_dockerfiles=("Dockerfile.api" "Dockerfile.frontend")
for dockerfile in "${required_dockerfiles[@]}"; do
    if [ -f "$dockerfile" ]; then
        echo -e "${GREEN}✅ $dockerfile exists${NC}"
    else
        echo -e "${RED}❌ $dockerfile missing${NC}"
        exit 1
    fi
done

# Check Git status
echo "📝 Checking Git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
    git status --short
    echo -e "${YELLOW}   Consider committing these changes before deployment${NC}"
else
    echo -e "${GREEN}✅ Working directory is clean${NC}"
fi

# Check current branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "🌿 Current branch: $current_branch"
echo -e "${GREEN}✅ Ready to deploy from any branch (manual deployment only)${NC}"

# Environment file check
echo "🔧 Environment configuration check..."
if [ -f ".env.staging.template" ]; then
    echo -e "${GREEN}✅ Staging environment template exists${NC}"
else
    echo -e "${YELLOW}⚠️  No staging environment template found${NC}"
    echo "   Run './scripts/local-to-staging-sync.sh' to generate one"
fi

# Final summary
echo ""
echo "📊 Pre-deployment Summary"
echo "========================"
echo -e "${GREEN}✅ Docker is running and configured${NC}"
echo -e "${GREEN}✅ Production images build successfully${NC}"
echo -e "${GREEN}✅ All required files present${NC}"

echo ""
echo -e "${GREEN}🚀 Ready for manual deployment!${NC}"
echo "   Go to GitHub Actions → 'Manual Deploy to Staging' → Run workflow"
echo "   Choose your branch: $current_branch (or any other branch)"

echo ""
echo "🔗 Useful commands:"
echo "   Local test: ./scripts/run-local-tests.sh smoke local"
echo "   Full sync:  ./scripts/local-to-staging-sync.sh"
echo "   Manual deploy: Go to GitHub Actions → 'Manual Deploy to Staging' → Run workflow"
