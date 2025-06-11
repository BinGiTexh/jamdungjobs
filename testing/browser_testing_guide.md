# JamDung Jobs Browser Testing Guide

This document provides step-by-step instructions for testing the JamDung Jobs platform through the browser, covering both job seeker and employer user flows.

## Test Credentials

Use these credentials for testing:

### Job Seeker Account
- **Email**: `testjobseeker@jamdungjobs.com`
- **Password**: `Test@123`

### Employer Account
- **Email**: `testemployer@jamdungjobs.com`
- **Password**: `Test@123`

## Setting Up Test Accounts

Before testing, run the setup script to create test accounts:

```bash
cd /Users/mcameron/jamdungjobs
node testing/setup_test_accounts.js
```

## Job Seeker Testing Flow

### 1. Registration and Login

**Test Case: New User Registration**
1. Navigate to http://localhost:3000/register
2. Fill out the registration form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `newjobseeker@jamdungjobs.com`
   - Password: `Test@123`
   - Confirm Password: `Test@123`
   - Role: `Job Seeker`
3. Click "Create Account"
4. Verify redirect to dashboard

**Test Case: User Login**
1. Navigate to http://localhost:3000/login
2. Enter credentials:
   - Email: `testjobseeker@jamdungjobs.com`
   - Password: `Test@123`
3. Click "Sign In"
4. Verify redirect to dashboard

### 2. Profile Management

**Test Case: Update Profile Information**
1. Login as job seeker
2. Navigate to profile page
3. Update personal information:
   - Bio
   - Contact information
   - Education
4. Click "Save Changes"
5. Verify changes are saved

**Test Case: Add Skills**
1. Navigate to profile page
2. Add skills using the skills autocomplete:
   - JavaScript
   - React
   - Node.js
3. Verify skills are added to profile

**Test Case: Upload Resume**
1. Navigate to profile page
2. Click "Upload Resume"
3. Select a PDF file
4. Verify resume is uploaded

### 3. Job Search

**Test Case: Basic Job Search**
1. Navigate to jobs page
2. Enter "Developer" in the search field
3. Click "Search Jobs"
4. Verify relevant results appear

**Test Case: Filter by Location**
1. Navigate to jobs page
2. Enter "Kingston" in the location field
3. Set radius to 10km
4. Click "Search Jobs"
5. Verify results are filtered by location

**Test Case: Filter by Job Type**
1. Navigate to jobs page
2. Select "Full Time" from job type dropdown
3. Click "Search Jobs"
4. Verify results only show full-time positions

**Test Case: Skill Matching**
1. Navigate to jobs page
2. Add skills:
   - JavaScript
   - React
3. Click "Search Jobs"
4. Verify jobs are sorted by skill match percentage
5. Verify matching skills are highlighted

### 4. Job Application

**Test Case: View Job Details**
1. Navigate to jobs page
2. Click on a job listing
3. Verify job details page loads with:
   - Job title
   - Company information
   - Job description
   - Requirements
   - Apply button

**Test Case: Submit Job Application**
1. Navigate to a job details page
2. Click "Apply Now"
3. Fill out application form:
   - Cover letter
   - Upload resume
   - Phone number
   - Availability
   - Expected salary
4. Click "Submit Application"
5. Verify success message

**Test Case: View Application Status**
1. Navigate to "My Applications" page
2. Verify list of submitted applications
3. Check status of applications
4. Click on an application to view details

## Employer Testing Flow

### 1. Registration and Login

**Test Case: Employer Registration**
1. Navigate to http://localhost:3000/register
2. Fill out the registration form:
   - First Name: `Test`
   - Last Name: `Employer`
   - Email: `newemployer@jamdungjobs.com`
   - Password: `Test@123`
   - Confirm Password: `Test@123`
   - Role: `Employer`
3. Fill out company information:
   - Company Name: `Test Company`
   - Company Website: `https://testcompany.com`
   - Company Location: `Kingston, Jamaica`
   - Company Description: `This is a test company.`
4. Click "Create Account"
5. Verify redirect to dashboard

**Test Case: Employer Login**
1. Navigate to http://localhost:3000/login
2. Enter credentials:
   - Email: `testemployer@jamdungjobs.com`
   - Password: `Test@123`
3. Click "Sign In"
4. Verify redirect to employer dashboard

### 2. Company Profile Management

**Test Case: Update Company Profile**
1. Login as employer
2. Navigate to company profile page
3. Update company information:
   - Company description
   - Industry
   - Company size
4. Click "Save Changes"
5. Verify changes are saved

**Test Case: Upload Company Logo**
1. Navigate to company profile page
2. Click "Upload Logo"
3. Select an image file
4. Verify logo is uploaded and displayed

### 3. Job Posting

**Test Case: Create New Job Posting**
1. Navigate to "Job Listings" page
2. Click "Create New Job"
3. Fill out job details:
   - Job Title: `Software Engineer`
   - Description: `We are looking for a skilled software engineer...`
   - Location: `Kingston, Jamaica`
   - Job Type: `Full Time`
   - Skills: `JavaScript, React, Node.js`
   - Salary Range: `$50,000 - $80,000`
   - Experience: `2+ years`
   - Education: `Bachelor's degree`
4. Click "Create Job"
5. Verify job is created and appears in listings

**Test Case: Edit Job Posting**
1. Navigate to "Job Listings" page
2. Find a job posting and click "Edit"
3. Modify job details:
   - Update title to `Senior Software Engineer`
   - Update salary range
4. Click "Save Changes"
5. Verify changes are saved

**Test Case: Change Job Status**
1. Navigate to "Job Listings" page
2. Find a job posting and click "Edit"
3. Change status to "Closed"
4. Click "Save Changes"
5. Verify job status is updated

### 4. Application Management

**Test Case: View Applications**
1. Navigate to "Applications" page
2. Verify list of received applications
3. Filter applications by status

**Test Case: Review Application**
1. Navigate to "Applications" page
2. Click on an application to view details
3. Verify applicant information is displayed:
   - Name
   - Contact information
   - Resume
   - Cover letter

**Test Case: Update Application Status**
1. Navigate to "Applications" page
2. Open an application
3. Change status to "Interview"
4. Verify status is updated

**Test Case: Contact Applicant**
1. Navigate to "Applications" page
2. Open an application
3. Click "Contact Applicant"
4. Enter a message
5. Click "Send Message"
6. Verify confirmation message

## Cross-Browser Testing

Test the application in the following browsers:
- Google Chrome
- Mozilla Firefox
- Safari
- Microsoft Edge

## Responsive Design Testing

Test the application on the following devices/screen sizes:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

## Reporting Issues

When reporting issues, include:
1. Test case name
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)
6. Browser/device information

## Next Steps for Automated Testing

1. Convert these manual test cases to automated tests using Cypress or Selenium
2. Integrate with GitHub Actions for CI/CD
3. Set up automated visual regression testing
4. Implement performance testing
