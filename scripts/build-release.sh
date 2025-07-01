#!/bin/bash

# Build and tag Docker images for release
# Usage: ./scripts/build-release.sh [version]

set -e

# Get version from argument or package.json
VERSION=${1:-$(grep '"version"' backend/package.json | sed 's/.*"version": "\(.*\)".*/\1/')}

if [ -z "$VERSION" ]; then
    echo "❌ Error: Could not determine version"
    echo "Usage: $0 [version]"
    exit 1
fi

echo "🚀 Building Docker images for version: $VERSION"

# Function to build and tag an image
build_and_tag() {
    local service=$1
    local dockerfile=$2
    local image_name="jamdungjobs-${service}:${VERSION}"
    
    echo "🔨 Building $service..."
    docker build -t "$image_name" -f "$dockerfile" .
    
    # Also tag as 'latest'
    docker tag "$image_name" "jamdungjobs-${service}:latest"
    
    echo "✅ Built and tagged: $image_name"
}

# Build frontend
echo "📦 Building frontend..."
build_and_tag "frontend" "Dockerfile.frontend.static"

# Build backend/API
echo "📦 Building backend API..."
build_and_tag "api" "Dockerfile.api"

echo ""
echo "🎉 All images built successfully!"
echo ""
echo "📋 Tagged images:"
echo "  • jamdungjobs-frontend:$VERSION"
echo "  • jamdungjobs-frontend:latest"
echo "  • jamdungjobs-api:$VERSION"
echo "  • jamdungjobs-api:latest"
echo ""
echo "💡 Next steps:"
echo "  1. Test the images locally: docker-compose -f docker-compose.prod.yml up"
echo "  2. Create git tag: git tag v$VERSION"
echo "  3. Push changes: git push origin main --tags"
echo "  4. Deploy to staging via GitHub Actions"
