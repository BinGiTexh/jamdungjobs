# JamDung Jobs API Testing Guide

This document provides instructions for testing the JamDung Jobs API endpoints using cURL and Postman, along with test credentials for both candidate and employer flows.

## Environment Setup

### Base URLs
- **Local Development**: `http://localhost:5000/api`
- **Staging**: `https://staging-api.jamdungjobs.com/api` (future)
- **Production**: `https://api.jamdungjobs.com/api` (future)

### Test Credentials

#### Job Seeker Account
- **Email**: `testjobseeker@jamdungjobs.com`
- **Password**: `Test@123`

#### Employer Account
- **Email**: `testemployer@jamdungjobs.com`
- **Password**: `Test@123`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Getting a Token

```bash
# Using cURL
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testjobseeker@jamdungjobs.com", "password": "Test@123"}'
```

```javascript
// Using Postman
// POST http://localhost:5000/api/auth/login
// Body (raw JSON):
{
  "email": "testjobseeker@jamdungjobs.com",
  "password": "Test@123"
}
```

## API Endpoints

### Authentication Endpoints

#### Register User

```bash
# Using cURL
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "newuser@jamdungjobs.com",
    "password": "Test@123",
    "role": "JOBSEEKER"
  }'
```

```javascript
// Using Postman
// POST http://localhost:5000/api/auth/register
// Body (raw JSON):
{
  "firstName": "Test",
  "lastName": "User",
  "email": "newuser@jamdungjobs.com",
  "password": "Test@123",
  "role": "JOBSEEKER"
}
```

#### Login

```bash
# Using cURL
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testjobseeker@jamdungjobs.com",
    "password": "Test@123"
  }'
```

```javascript
// Using Postman
// POST http://localhost:5000/api/auth/login
// Body (raw JSON):
{
  "email": "testjobseeker@jamdungjobs.com",
  "password": "Test@123"
}
```

### User Endpoints

#### Get Current User

```bash
# Using cURL
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <token>"
```

```javascript
// Using Postman
// GET http://localhost:5000/api/users/me
// Headers:
// Authorization: Bearer <token>
```

#### Update User Profile

```bash
# Using cURL
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "bio": "This is my updated bio"
  }'
```

```javascript
// Using Postman
// PUT http://localhost:5000/api/users/me
// Headers:
// Authorization: Bearer <token>
// Body (raw JSON):
{
  "firstName": "Updated",
  "lastName": "Name",
  "bio": "This is my updated bio"
}
```

### Job Endpoints

#### Get All Jobs

```bash
# Using cURL
curl -X GET http://localhost:5000/api/jobs
```

```javascript
// Using Postman
// GET http://localhost:5000/api/jobs
```

#### Get Job by ID

```bash
# Using cURL
curl -X GET http://localhost:5000/api/jobs/1
```

```javascript
// Using Postman
// GET http://localhost:5000/api/jobs/1
```

#### Create Job (Employer Only)

```bash
# Using cURL
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer <employer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Developer",
    "description": "We are looking for a skilled software developer...",
    "location": "Kingston, Jamaica",
    "type": "FULL_TIME",
    "skills": ["JavaScript", "React", "Node.js"],
    "salary": {
      "min": 50000,
      "max": 80000,
      "currency": "USD"
    },
    "experience": "3+ years",
    "education": "Bachelor's degree",
    "status": "ACTIVE"
  }'
```

```javascript
// Using Postman
// POST http://localhost:5000/api/jobs
// Headers:
// Authorization: Bearer <employer_token>
// Body (raw JSON):
{
  "title": "Software Developer",
  "description": "We are looking for a skilled software developer...",
  "location": "Kingston, Jamaica",
  "type": "FULL_TIME",
  "skills": ["JavaScript", "React", "Node.js"],
  "salary": {
    "min": 50000,
    "max": 80000,
    "currency": "USD"
  },
  "experience": "3+ years",
  "education": "Bachelor's degree",
  "status": "ACTIVE"
}
```

#### Update Job (Employer Only)

```bash
# Using cURL
curl -X PUT http://localhost:5000/api/jobs/1 \
  -H "Authorization: Bearer <employer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Software Developer",
    "description": "Updated job description...",
    "status": "ACTIVE"
  }'
```

```javascript
// Using Postman
// PUT http://localhost:5000/api/jobs/1
// Headers:
// Authorization: Bearer <employer_token>
// Body (raw JSON):
{
  "title": "Senior Software Developer",
  "description": "Updated job description...",
  "status": "ACTIVE"
}
```

#### Delete Job (Employer Only)

```bash
# Using cURL
curl -X DELETE http://localhost:5000/api/jobs/1 \
  -H "Authorization: Bearer <employer_token>"
```

```javascript
// Using Postman
// DELETE http://localhost:5000/api/jobs/1
// Headers:
// Authorization: Bearer <employer_token>
```

#### Search Jobs

```bash
# Using cURL
curl -X GET "http://localhost:5000/api/jobs/search?query=developer&location=Kingston&jobType=FULL_TIME"
```

```javascript
// Using Postman
// GET http://localhost:5000/api/jobs/search?query=developer&location=Kingston&jobType=FULL_TIME
```

### Application Endpoints

#### Apply for Job (Job Seeker Only)

```bash
# Using cURL
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer <jobseeker_token>" \
  -H "Content-Type: multipart/form-data" \
  -F "jobId=1" \
  -F "coverLetter=I am excited to apply for this position..." \
  -F "resume=@/path/to/resume.pdf" \
  -F "phoneNumber=+1876123456" \
  -F "availability=IMMEDIATE" \
  -F "salary=60000 USD" \
  -F "additionalInfo=Additional information about my application..."
```

```javascript
// Using Postman
// POST http://localhost:5000/api/applications
// Headers:
// Authorization: Bearer <jobseeker_token>
// Body (form-data):
// jobId: 1
// coverLetter: I am excited to apply for this position...
// resume: [file upload]
// phoneNumber: +1876123456
// availability: IMMEDIATE
// salary: 60000 USD
// additionalInfo: Additional information about my application...
```

#### Get Job Seeker Applications

```bash
# Using cURL
curl -X GET http://localhost:5000/api/applications/my \
  -H "Authorization: Bearer <jobseeker_token>"
```

```javascript
// Using Postman
// GET http://localhost:5000/api/applications/my
// Headers:
// Authorization: Bearer <jobseeker_token>
```

#### Get Employer Applications

```bash
# Using cURL
curl -X GET http://localhost:5000/api/applications/employer \
  -H "Authorization: Bearer <employer_token>"
```

```javascript
// Using Postman
// GET http://localhost:5000/api/applications/employer
// Headers:
// Authorization: Bearer <employer_token>
```

#### Get Applications for a Job

```bash
# Using cURL
curl -X GET http://localhost:5000/api/jobs/1/applications \
  -H "Authorization: Bearer <employer_token>"
```

```javascript
// Using Postman
// GET http://localhost:5000/api/jobs/1/applications
// Headers:
// Authorization: Bearer <employer_token>
```

#### Update Application Status (Employer Only)

```bash
# Using cURL
curl -X PATCH http://localhost:5000/api/applications/1/status \
  -H "Authorization: Bearer <employer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INTERVIEW"
  }'
```

```javascript
// Using Postman
// PATCH http://localhost:5000/api/applications/1/status
// Headers:
// Authorization: Bearer <employer_token>
// Body (raw JSON):
{
  "status": "INTERVIEW"
}
```

### Skills Endpoints

#### Get All Skills

```bash
# Using cURL
curl -X GET http://localhost:5000/api/skills
```

```javascript
// Using Postman
// GET http://localhost:5000/api/skills
```

## Browser Testing Flows

### Job Seeker Flow

1. **Registration and Login**
   - Navigate to http://localhost:3000/register
   - Fill out the registration form with job seeker role
   - Login with the created credentials

2. **Profile Setup**
   - Navigate to profile page
   - Add skills, education, and experience
   - Upload a resume

3. **Job Search**
   - Navigate to the jobs page
   - Use filters to search for jobs
   - Test the skill matching functionality

4. **Job Application**
   - View a job posting
   - Apply for the job with cover letter and resume
   - Check application status in the applications dashboard

### Employer Flow

1. **Registration and Login**
   - Navigate to http://localhost:3000/register
   - Fill out the registration form with employer role
   - Login with the created credentials

2. **Company Profile Setup**
   - Navigate to company profile page
   - Add company details, logo, and description

3. **Job Posting**
   - Create a new job posting
   - Edit an existing job posting
   - Change job status (active, closed, etc.)

4. **Application Management**
   - View applications for posted jobs
   - Update application statuses
   - Contact applicants

## Automating Tests with GitHub Actions

For future implementation, we can automate these tests using GitHub Actions before staging/production AWS deploys. Here's a basic structure for a GitHub Actions workflow:

```yaml
name: API Tests

on:
  push:
    branches: [ main, staging ]
  pull_request:
    branches: [ main, staging ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Start test database
      run: docker-compose up -d postgres
      
    - name: Run migrations
      run: npm run migrate
      
    - name: Seed test data
      run: npm run seed:test
      
    - name: Start API server
      run: npm run start:test &
      
    - name: Wait for API server
      run: sleep 10
      
    - name: Run API tests
      run: npm run test:api
      
    - name: Run E2E tests
      run: npm run test:e2e
```

This workflow will:
1. Set up the environment
2. Start a test database
3. Run migrations and seed test data
4. Start the API server
5. Run API tests
6. Run end-to-end tests

## Next Steps

1. Create automated test scripts using a testing framework like Jest or Mocha
2. Set up a Postman collection for easier API testing
3. Implement GitHub Actions workflow for CI/CD
4. Set up staging and production environments on AWS
