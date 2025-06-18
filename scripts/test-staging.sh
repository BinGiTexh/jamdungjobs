#!/bin/bash

# Test script for JamDung Jobs Staging Environment
# This script runs smoke tests against the staging environment

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting JamDung Jobs Staging Tests${NC}"
echo -e "🌐 Environment: ${GREEN}staging${NC}"
echo -e "🔗 Testing URL: ${GREEN}https://staging-jobs.bingitech.io${NC}"
echo

# Install dependencies if needed
echo -e "🔧 Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 14+ and try again.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi

# Install test dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "📦 Installing test dependencies..."
    npm install axios
fi

# Run smoke tests
echo -e "\n🔍 Running smoke tests..."
cd testing

# Run the basic smoke test against staging
node basic-smoke-test.js staging

# Check if tests passed
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ All tests passed successfully!${NC}"
else
    echo -e "\n${RED}❌ Some tests failed. Check the logs above for details.${NC}"
    exit 1
fi

echo -e "\n🚀 Staging environment is ready for testing!"
echo -e "🔗 URL: ${GREEN}https://staging-jobs.bingitech.io${NC}"
echo -e "👥 Test accounts:"
echo -e "   👤 Job Seeker: ${YELLOW}testjobseeker@jamdungjobs.com${NC} / ${YELLOW}Test@123${NC}"
echo -e "   👔 Employer:    ${YELLOW}testemployer@jamdungjobs.com${NC} / ${YELLOW}Test@123${NC}"

# Make the script executable
chmod +x /Users/mcameron/jamdungjobs/scripts/test-staging.sh
