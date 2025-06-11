#!/bin/bash

# JamDung Jobs Scraper Service Setup Script
# This script sets up the necessary directories and initial configuration

# Set text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== JamDung Jobs Scraper Service Setup ===${NC}"
echo "Setting up directories and configuration..."

# Create necessary directories
mkdir -p data/logs
mkdir -p logs

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo -e "${YELLOW}Creating .env file from template...${NC}"
  cp .env.example .env
  echo "Please edit the .env file to set your JamDung Jobs API token."
else
  echo ".env file already exists."
fi

# Create data directories for test outputs
mkdir -p data/linkedin
mkdir -p data/caribbeanjobs
mkdir -p data/ejamjobs

# Set permissions
chmod +x test-scraper.js

echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit the .env file to configure your environment"
echo "2. Run 'npm install' to install dependencies"
echo "3. Test the scrapers with 'node test-scraper.js'"
echo "4. Build and start the Docker containers with 'docker-compose up -d'"
echo ""
echo -e "${YELLOW}For more information, see the README.md file.${NC}"
