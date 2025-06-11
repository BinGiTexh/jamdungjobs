# JamDung Jobs Testing Documentation

This directory contains comprehensive testing documentation and tools for the JamDung Jobs platform.

## Overview

The testing suite includes:

1. **API Testing Guide** - Documentation for testing all API endpoints using cURL and Postman
2. **Browser Testing Guide** - Step-by-step instructions for testing user flows in the browser
3. **Postman Collection** - Ready-to-import collection for API testing
4. **Automated Tests** - Jest-based test scripts for API endpoints
5. **Test Account Setup** - Script to create test accounts and data

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Docker and Docker Compose (for running the local development environment)
- Postman (for API testing)

### Setup

1. Start the local development environment:

```bash
cd /Users/mcameron/jamdungjobs/local-dev
docker-compose up -d
```

2. Create test accounts:

```bash
cd /Users/mcameron/jamdungjobs
node testing/setup_test_accounts.js
```

3. Import the Postman collection:
   - Open Postman
   - Click "Import" and select the `JamDungJobs_Postman_Collection.json` file
   - Create an environment with variable `baseUrl` set to `http://localhost:5000/api`

## Testing Guides

- [API Testing Guide](./api_testing_guide.md) - Detailed instructions for testing API endpoints
- [Browser Testing Guide](./browser_testing_guide.md) - Step-by-step instructions for testing user flows

## Test Credentials

Default test accounts:

### Job Seeker
- Email: `testjobseeker@jamdungjobs.com`
- Password: `Test@123`

### Employer
- Email: `testemployer@jamdungjobs.com`
- Password: `Test@123`

## Running Automated Tests

To run the automated API tests:

```bash
cd /Users/mcameron/jamdungjobs
npm install jest axios --save-dev
npx jest testing/api.test.js
```

## Test Coverage

The testing suite covers:

1. **Authentication** - Registration and login for both user types
2. **User Profiles** - Profile management for job seekers and employers
3. **Job Management** - Creating, updating, and searching for jobs
4. **Application Process** - Submitting and managing job applications
5. **Skill Matching** - Testing the skill matching functionality

## Future Enhancements

- Integration with GitHub Actions for CI/CD
- End-to-end testing with Cypress
- Visual regression testing
- Performance testing

## Contributing to Testing

When adding new features to JamDung Jobs:

1. Update the API testing guide with new endpoints
2. Add new test cases to the browser testing guide
3. Update the Postman collection
4. Add automated tests for new functionality
