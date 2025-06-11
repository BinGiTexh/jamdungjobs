/**
 * JamDung Jobs API Tests
 * 
 * This file contains automated tests for the JamDung Jobs API endpoints
 * using Jest and Axios for HTTP requests.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:5000/api';
const TEST_ACCOUNTS = {
  jobSeeker: {
    firstName: 'Test',
    lastName: 'JobSeeker',
    email: 'testjobseeker@jamdungjobs.com',
    password: 'Test@123',
    role: 'JOBSEEKER'
  },
  employer: {
    firstName: 'Test',
    lastName: 'Employer',
    email: 'testemployer@jamdungjobs.com',
    password: 'Test@123',
    role: 'EMPLOYER',
    companyName: 'Test Company Ltd.',
    companyWebsite: 'https://testcompany.com',
    companyLocation: 'Kingston, Jamaica',
    companyDescription: 'A test company account used for testing the JamDung Jobs platform.'
  }
};

// Global variables to store tokens and IDs
let jobSeekerToken;
let employerToken;
let jobId;
let applicationId;

// Setup axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  validateStatus: () => true // Don't throw on non-2xx responses
});

// Helper function to check response
const checkResponse = (response, expectedStatus = 200) => {
  expect(response.status).toBe(expectedStatus);
  return response.data;
};

// Test suite
describe('JamDung Jobs API Tests', () => {
  
  // Authentication tests
  describe('Authentication', () => {
    
    test('Register job seeker account', async () => {
      const response = await api.post('/auth/register', TEST_ACCOUNTS.jobSeeker);
      
      // If account already exists (409) that's also acceptable
      if (response.status !== 409) {
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('token');
      } else {
        console.log('Job seeker account already exists, continuing with tests');
      }
    });
    
    test('Register employer account', async () => {
      const response = await api.post('/auth/register', TEST_ACCOUNTS.employer);
      
      // If account already exists (409) that's also acceptable
      if (response.status !== 409) {
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('token');
      } else {
        console.log('Employer account already exists, continuing with tests');
      }
    });
    
    test('Login as job seeker', async () => {
      const response = await api.post('/auth/login', {
        email: TEST_ACCOUNTS.jobSeeker.email,
        password: TEST_ACCOUNTS.jobSeeker.password
      });
      
      const data = checkResponse(response);
      expect(data).toHaveProperty('token');
      jobSeekerToken = data.token;
    });
    
    test('Login as employer', async () => {
      const response = await api.post('/auth/login', {
        email: TEST_ACCOUNTS.employer.email,
        password: TEST_ACCOUNTS.employer.password
      });
      
      const data = checkResponse(response);
      expect(data).toHaveProperty('token');
      employerToken = data.token;
    });
  });
  
  // User profile tests
  describe('User Profiles', () => {
    
    test('Get job seeker profile', async () => {
      const response = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${jobSeekerToken}` }
      });
      
      const data = checkResponse(response);
      expect(data).toHaveProperty('email', TEST_ACCOUNTS.jobSeeker.email);
      expect(data).toHaveProperty('role', TEST_ACCOUNTS.jobSeeker.role);
    });
    
    test('Get employer profile', async () => {
      const response = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${employerToken}` }
      });
      
      const data = checkResponse(response);
      expect(data).toHaveProperty('email', TEST_ACCOUNTS.employer.email);
      expect(data).toHaveProperty('role', TEST_ACCOUNTS.employer.role);
    });
    
    test('Update job seeker profile', async () => {
      const profileUpdate = {
        bio: 'Updated bio for testing',
        skills: ['JavaScript', 'React', 'Node.js']
      };
      
      const response = await api.put('/users/me', profileUpdate, {
        headers: { Authorization: `Bearer ${jobSeekerToken}` }
      });
      
      const data = checkResponse(response);
      expect(data).toHaveProperty('bio', profileUpdate.bio);
    });
    
    test('Update employer profile', async () => {
      const profileUpdate = {
        companyDescription: 'Updated company description for testing'
      };
      
      const response = await api.put('/users/me', profileUpdate, {
        headers: { Authorization: `Bearer ${employerToken}` }
      });
      
      const data = checkResponse(response);
      expect(data).toHaveProperty('companyDescription', profileUpdate.companyDescription);
    });
  });
  
  // Job management tests
  describe('Job Management', () => {
    
    test('Create job posting', async () => {
      const jobData = {
        title: 'Test Software Developer',
        description: 'This is a test job posting for API testing.',
        location: 'Kingston, Jamaica',
        type: 'FULL_TIME',
        skills: ['JavaScript', 'React', 'Node.js'],
        salary: {
          min: 50000,
          max: 80000,
          currency: 'USD'
        },
        experience: '3+ years',
        education: "Bachelor's degree",
        status: 'ACTIVE'
      };
      
      const response = await api.post('/jobs', jobData, {
        headers: { Authorization: `Bearer ${employerToken}` }
      });
      
      const data = checkResponse(response, 201);
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('title', jobData.title);
      jobId = data.id;
    });
    
    test('Get all jobs', async () => {
      const response = await api.get('/jobs');
      
      const data = checkResponse(response);
      expect(Array.isArray(data)).toBe(true);
    });
    
    test('Get job by ID', async () => {
      const response = await api.get(`/jobs/${jobId}`);
      
      const data = checkResponse(response);
      expect(data).toHaveProperty('id', jobId);
    });
    
    test('Search jobs', async () => {
      const response = await api.get('/jobs/search', {
        params: {
          query: 'Developer',
          location: 'Kingston'
        }
      });
      
      const data = checkResponse(response);
      expect(Array.isArray(data)).toBe(true);
    });
    
    test('Update job posting', async () => {
      const updateData = {
        title: 'Updated Test Software Developer',
        description: 'This job posting has been updated for testing.'
      };
      
      const response = await api.put(`/jobs/${jobId}`, updateData, {
        headers: { Authorization: `Bearer ${employerToken}` }
      });
      
      const data = checkResponse(response);
      expect(data).toHaveProperty('title', updateData.title);
      expect(data).toHaveProperty('description', updateData.description);
    });
  });
  
  // Application tests
  describe('Job Applications', () => {
    
    test('Apply for job', async () => {
      // Create form data for application
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('coverLetter', 'This is a test cover letter for API testing.');
      formData.append('phoneNumber', '+1876123456');
      formData.append('availability', 'IMMEDIATE');
      formData.append('salary', '60000 USD');
      formData.append('additionalInfo', 'This is a test application.');
      
      // Create a test resume file
      const testResumePath = path.join(__dirname, 'test_resume.pdf');
      if (!fs.existsSync(testResumePath)) {
        fs.writeFileSync(testResumePath, 'Test resume content');
      }
      
      // Append resume file
      const resumeFile = fs.readFileSync(testResumePath);
      formData.append('resume', new Blob([resumeFile]), 'test_resume.pdf');
      
      const response = await api.post('/applications', formData, {
        headers: { 
          Authorization: `Bearer ${jobSeekerToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const data = checkResponse(response, 201);
      expect(data).toHaveProperty('id');
      applicationId = data.id;
    });
    
    test('Get job seeker applications', async () => {
      const response = await api.get('/applications/my', {
        headers: { Authorization: `Bearer ${jobSeekerToken}` }
      });
      
      const data = checkResponse(response);
      expect(Array.isArray(data)).toBe(true);
    });
    
    test('Get employer applications', async () => {
      const response = await api.get('/applications/employer', {
        headers: { Authorization: `Bearer ${employerToken}` }
      });
      
      const data = checkResponse(response);
      expect(Array.isArray(data)).toBe(true);
    });
    
    test('Get applications for job', async () => {
      const response = await api.get(`/jobs/${jobId}/applications`, {
        headers: { Authorization: `Bearer ${employerToken}` }
      });
      
      const data = checkResponse(response);
      expect(Array.isArray(data)).toBe(true);
    });
    
    test('Update application status', async () => {
      const response = await api.patch(`/applications/${applicationId}/status`, {
        status: 'INTERVIEW'
      }, {
        headers: { Authorization: `Bearer ${employerToken}` }
      });
      
      const data = checkResponse(response);
      expect(data).toHaveProperty('status', 'INTERVIEW');
    });
  });
  
  // Skills tests
  describe('Skills', () => {
    
    test('Get all skills', async () => {
      const response = await api.get('/skills');
      
      const data = checkResponse(response);
      expect(Array.isArray(data)).toBe(true);
    });
  });
  
  // Cleanup - Delete job posting
  describe('Cleanup', () => {
    
    test('Delete job posting', async () => {
      const response = await api.delete(`/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${employerToken}` }
      });
      
      checkResponse(response, 204);
    });
  });
});
