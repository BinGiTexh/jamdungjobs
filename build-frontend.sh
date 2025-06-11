#!/bin/bash
# Script to build the frontend inside the Docker container

# Navigate to the local-dev directory where docker-compose is set up
cd /Users/mcameron/jamdungjobs/local-dev

# Run docker build command
docker-compose exec frontend npm run build

echo "Frontend build completed inside Docker container"
