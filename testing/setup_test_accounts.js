/**
 * JamDung Jobs - Test Account Setup Script
 * 
 * This script creates test accounts for both job seeker and employer roles,
 * which can be used for API testing and browser flow testing.
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
    role: 'JOBSEEKER',
    skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS'],
    bio: 'I am a test job seeker account used for testing the JamDung Jobs platform.'
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

// Helper function to register a user
async function registerUser(userData) {
  try {
    console.log(`Attempting to register user:`, JSON.stringify(userData, null, 2));
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    console.log(`✅ Successfully registered ${userData.role} account: ${userData.email}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log(`⚠️ Account already exists: ${userData.email}`);
      return { message: 'Account already exists' };
    }
    console.error(`❌ Failed to register ${userData.role} account:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Helper function to login and get token
async function loginUser(email, password) {
  try {
    console.log(`Attempting to login with email: ${email}`);
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    console.log(`✅ Successfully logged in as: ${email}`);
    return response.data.token;
  } catch (error) {
    console.error(`❌ Failed to login as ${email}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Helper function to update user profile
async function updateUserProfile(token, profileData) {
  try {
    const response = await axios.put(`${API_URL}/users/me`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Successfully updated user profile');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to update user profile:', error.message);
    return null;
  }
}

// Helper function to create a test job posting
async function createTestJob(token, jobData) {
  try {
    const response = await axios.post(`${API_URL}/jobs`, jobData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Successfully created test job: ${jobData.title}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to create test job:`, error.message);
    return null;
  }
}

// Helper function to reset password for existing accounts
async function resetPassword(email, password) {
  try {
    console.log(`Attempting to reset password for: ${email}`);
    // Use a direct database update approach since we're in testing
    const response = await axios.post(`${API_URL}/auth/reset-password`, { 
      email, 
      password,
      resetCode: 'TEST_RESET_CODE' // Special code for testing
    });
    console.log(`✅ Successfully reset password for: ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to reset password for ${email}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Main function to set up test accounts
async function setupTestAccounts() {
  console.log('🚀 Setting up test accounts for JamDung Jobs...');
  
  // Try to register job seeker account
  const jobSeekerResult = await registerUser(TEST_ACCOUNTS.jobSeeker);
  
  // If registration failed because account exists, try to reset password
  if (!jobSeekerResult) {
    await resetPassword(TEST_ACCOUNTS.jobSeeker.email, TEST_ACCOUNTS.jobSeeker.password);
  }
  
  // Try to register employer account
  const employerResult = await registerUser(TEST_ACCOUNTS.employer);
  
  // If registration failed because account exists, try to reset password
  if (!employerResult) {
    await resetPassword(TEST_ACCOUNTS.employer.email, TEST_ACCOUNTS.employer.password);
  }
  
  // Login as job seeker and update profile
  const jobSeekerToken = await loginUser(TEST_ACCOUNTS.jobSeeker.email, TEST_ACCOUNTS.jobSeeker.password);
  if (jobSeekerToken) {
    await updateUserProfile(jobSeekerToken, {
      bio: TEST_ACCOUNTS.jobSeeker.bio,
      skills: TEST_ACCOUNTS.jobSeeker.skills
    });
  }
  
  // Login as employer and update profile
  const employerToken = await loginUser(TEST_ACCOUNTS.employer.email, TEST_ACCOUNTS.employer.password);
  if (employerToken) {
    await updateUserProfile(employerToken, {
      companyName: TEST_ACCOUNTS.employer.companyName,
      companyWebsite: TEST_ACCOUNTS.employer.companyWebsite,
      companyLocation: TEST_ACCOUNTS.employer.companyLocation,
      companyDescription: TEST_ACCOUNTS.employer.companyDescription
    });
    
    // Create test job postings
    const testJobs = [
      {
        title: 'Frontend Developer',
        description: 'We are looking for a skilled frontend developer with experience in React and modern JavaScript.',
        location: 'Kingston, Jamaica',
        type: 'FULL_TIME',
        skills: ['JavaScript', 'React', 'HTML', 'CSS', 'TypeScript'],
        salary: {
          min: 50000,
          max: 80000,
          currency: 'USD'
        },
        experience: '2+ years',
        education: "Bachelor's degree",
        status: 'ACTIVE'
      },
      {
        title: 'Backend Developer',
        description: 'Looking for a backend developer with experience in Node.js and database design.',
        location: 'Montego Bay, Jamaica',
        type: 'FULL_TIME',
        skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'API Design'],
        salary: {
          min: 60000,
          max: 90000,
          currency: 'USD'
        },
        experience: '3+ years',
        education: "Bachelor's degree",
        status: 'ACTIVE'
      },
      {
        title: 'UI/UX Designer',
        description: 'Join our creative team as a UI/UX designer to create beautiful and intuitive user experiences.',
        location: 'Kingston, Jamaica',
        type: 'FULL_TIME',
        skills: ['UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Prototyping'],
        salary: {
          min: 45000,
          max: 75000,
          currency: 'USD'
        },
        experience: '2+ years',
        education: "Bachelor's degree in Design",
        status: 'ACTIVE'
      }
    ];
    
    for (const jobData of testJobs) {
      await createTestJob(employerToken, jobData);
    }
  }
  
  // Save test account credentials to a file
  const credentialsData = {
    jobSeeker: {
      email: TEST_ACCOUNTS.jobSeeker.email,
      password: TEST_ACCOUNTS.jobSeeker.password
    },
    employer: {
      email: TEST_ACCOUNTS.employer.email,
      password: TEST_ACCOUNTS.employer.password
    },
    apiUrl: API_URL
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'test_credentials.json'),
    JSON.stringify(credentialsData, null, 2)
  );
  
  console.log('✅ Test credentials saved to test_credentials.json');
  console.log('🎉 Test account setup complete!');
}

// Run the setup
setupTestAccounts().catch(error => {
  console.error('❌ Setup failed:', error);
});
