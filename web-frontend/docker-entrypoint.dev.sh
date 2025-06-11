#!/bin/sh
set -e

# Function to cleanup child processes
cleanup() {
    echo "Cleaning up..."
    # Kill all child processes
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

# Set up signal trapping
trap cleanup INT TERM

# Check if node_modules needs to be rebuilt
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "Installing dependencies..."
    npm install --legacy-peer-deps
    touch node_modules/.package-lock.json
fi

# Check for TypeScript types
if [ -f "tsconfig.json" ]; then
    echo "Checking TypeScript types..."
    npx tsc --noEmit
fi

# Start the development server
echo "Starting React development server..."
exec "$@"

