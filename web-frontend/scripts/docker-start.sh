#!/bin/bash

# Docker-specific startup script for JamDung Jobs Frontend
# Includes theme consistency checks for containerized development

set -e

echo "🐳 Starting JamDung Jobs Frontend in Docker..."

# Create reports directory if it doesn't exist
mkdir -p reports

# Run theme consistency check in development mode (warn-only)
echo "🎨 Running theme consistency check..."
npm run theme:check || echo "⚠️  Theme issues detected, but continuing..."

# Start the development server
echo "🚀 Starting React development server..."
REACT_APP_API_URL=${REACT_APP_API_URL:-http://localhost:5000} npm run docker:dev
