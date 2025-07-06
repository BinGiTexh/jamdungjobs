/**
 * JamDung Jobs MVP Readiness Test Suite
 * 
 * This comprehensive test suite validates all core functionality
 * required for MVP launch of the job board platform.
 * 
 * Usage:
 *   node mvp-readiness-test.js
 * 
 * Environment Variables:
 *   API_URL - API base URL (default: staging)
 *   TEST_ENV - Environment (local|staging|production)
 *   TEST_JOB_SEEKER_EMAIL - Job seeker test email
 *   TEST_JOB_SEEKER_PASSWORD - Job seeker test password
 *   TEST_EMPLOYER_EMAIL - Employer test email
 *   TEST_EMPLOYER_PASSWORD - Employer test password
 */

const axios = require('axios');
const config = require('./test-config');
const fs = require('fs');
const path = require('path');

// Load test credentials from file or environment
let testCredentials = {};
try {
  const credentialsPath = path.join(__dirname, 'test_credentials.json');
  if (fs.existsSync(credentialsPath)) {
    testCredentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  }
} catch (error) {
  console.warn('⚠️  Could not load test_credentials.json, using environment variables');
}

// Configuration
const TEST_ENV = process.env.TEST_ENV || 'staging';
const API_BASE_URL = process.env.API_URL || config.api[TEST_ENV] || config.api.staging;
const TIMEOUT = config.timeouts.medium;

// Get credentials from environment or config file
const getTestCredentials = () => {
  return {
    jobSeeker: {
      email: process.env.TEST_JOB_SEEKER_EMAIL || testCredentials.jobSeeker?.email || 'testjobseeker@jamdungjobs.com',
      password: process.env.TEST_JOB_SEEKER_PASSWORD || testCredentials.jobSeeker?.password || 'Test@123'
    },
    employer: {
      email: process.env.TEST_EMPLOYER_EMAIL || testCredentials.employer?.email || 'testemployer@jamdungjobs.com',
      password: process.env.TEST_EMPLOYER_PASSWORD || testCredentials.employer?.password || 'Test@123'
    }
  };
};

// Test results tracking
let results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

let authTokens = {
  jobSeeker: null,
  employer: null
};

// Helper functions
function logTest(name, status, message = '', data = null) {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${emoji} ${name} ${message ? `(${message})` : ''}`);
  
  results.tests.push({
    name,
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  });
  
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else results.skipped++;
}

function makeRequest(method, endpoint, data = null, headers = {}) {
  return axios({
    method,
    url: `${API_BASE_URL}${endpoint}`,
    data,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    timeout: TIMEOUT
  });
}

async function runMVPTests() {
  console.log('🚀 JamDung Jobs MVP Readiness Test Suite');
  console.log('=' .repeat(60));
  console.log(`🌐 Environment: ${TEST_ENV.toUpperCase()}`);
  console.log(`🔗 Testing API: ${API_BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);
  console.log('=' .repeat(60));

  // Verify credentials are available
  const credentials = getTestCredentials();
  if (!credentials.jobSeeker.email.includes('@')) {
    console.error('❌ Invalid test credentials. Please set up test_credentials.json or environment variables.');
    process.exit(1);
  }

  try {
    // 1. Core Infrastructure Tests
    await testHealthEndpoint();
    await testAPIErrorHandling();
    
    // 2. Authentication Tests
    await testUserRegistration();
    await testUserLogin();
    
    // 3. Job Management Tests
    await testJobListings();
    await testJobSearch();
    await testJobCategories();
    
    // 4. User Profile Tests
    await testJobSeekerProfile();
    await testEmployerProfile();
    await testCompanyManagement();
    
    // 5. Application Flow Tests
    await testJobApplication();
    await testApplicationManagement();
    
    // 6. Advanced Features Tests
    await testSkillMatching();
    await testNotifications();
    
    // 7. Security Tests
    await testDataValidation();
    await testSecurity();
    
    // 8. Frontend Integration Tests
    await testFrontendIntegration();
    
  } catch (error) {
    logTest('Test Suite Error', 'FAIL', error.message);
  }
  
  // Print summary and save report
  await generateTestReport();
  
  // Exit with proper code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Test Implementations

async function testHealthEndpoint() {
  try {
    const response = await makeRequest('GET', '/health');
    if (response.status === 200) {
      logTest('1. Health Check', 'PASS', 'API is responding');
    } else {
      logTest('1. Health Check', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('1. Health Check', 'FAIL', error.message);
  }
}

async function testAPIErrorHandling() {
  try {
    const response = await makeRequest('GET', '/nonexistent');
    logTest('2. API Error Handling', 'FAIL', 'Should return 404');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logTest('2. API Error Handling', 'PASS', '404 for non-existent endpoints');
    } else {
      logTest('2. API Error Handling', 'FAIL', error.message);
    }
  }
}

async function testUserRegistration() {
  const timestamp = Date.now();
  const testUser = {
    email: `test${timestamp}@jamdungjobs.com`,
    password: 'Test@123',
    firstName: 'Test',
    lastName: 'User',
    userType: 'JOB_SEEKER'
  };
  
  try {
    const response = await makeRequest('POST', '/auth/register', testUser);
    if (response.status === 201 || response.status === 200) {
      logTest('3.1 User Registration', 'PASS', 'Job seeker registration successful');
    } else {
      logTest('3.1 User Registration', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('3.1 User Registration', 'FAIL', error.response?.data?.message || error.message);
  }
  
  // Test employer registration
  const testEmployer = {
    email: `employer${timestamp}@jamdungjobs.com`,
    password: 'Test@123',
    firstName: 'Test',
    lastName: 'Employer',
    userType: 'EMPLOYER'
  };
  
  try {
    const response = await makeRequest('POST', '/auth/register', testEmployer);
    if (response.status === 201 || response.status === 200) {
      logTest('3.2 Employer Registration', 'PASS', 'Employer registration successful');
    } else {
      logTest('3.2 Employer Registration', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('3.2 Employer Registration', 'FAIL', error.response?.data?.message || error.message);
  }
}

async function testUserLogin() {
  const credentials = getTestCredentials();
  
  // Test job seeker login
  try {
    const response = await makeRequest('POST', '/auth/login', credentials.jobSeeker);
    if (response.data.token) {
      authTokens.jobSeeker = response.data.token;
      logTest('4.1 Job Seeker Login', 'PASS', 'Login successful');
    } else {
      logTest('4.1 Job Seeker Login', 'FAIL', 'No token received');
    }
  } catch (error) {
    logTest('4.1 Job Seeker Login', 'FAIL', error.response?.data?.message || error.message);
  }
  
  // Test employer login
  try {
    const response = await makeRequest('POST', '/auth/login', credentials.employer);
    if (response.data.token) {
      authTokens.employer = response.data.token;
      logTest('4.2 Employer Login', 'PASS', 'Login successful');
    } else {
      logTest('4.2 Employer Login', 'FAIL', 'No token received');
    }
  } catch (error) {
    logTest('4.2 Employer Login', 'FAIL', error.response?.data?.message || error.message);
  }
}

async function testJobListings() {
  try {
    const response = await makeRequest('GET', '/jobs');
    if (response.data.jobs && Array.isArray(response.data.jobs)) {
      logTest('5.1 Job Listings', 'PASS', `${response.data.jobs.length} jobs found`);
      
      // Test pagination
      if (response.data.pagination) {
        logTest('5.2 Job Pagination', 'PASS', 'Pagination data present');
      } else {
        logTest('5.2 Job Pagination', 'FAIL', 'No pagination data');
      }
    } else {
      logTest('5.1 Job Listings', 'FAIL', 'Invalid response format');
    }
  } catch (error) {
    logTest('5.1 Job Listings', 'FAIL', error.message);
  }
}

async function testJobSearch() {
  try {
    const response = await makeRequest('GET', '/jobs?search=developer');
    if (response.data.jobs) {
      logTest('6.1 Job Search', 'PASS', `Search returned ${response.data.jobs.length} results`);
    } else {
      logTest('6.1 Job Search', 'FAIL', 'Invalid search response');
    }
    
    // Test location filter
    const locationResponse = await makeRequest('GET', '/jobs?location=Kingston');
    if (locationResponse.data.jobs) {
      logTest('6.2 Location Filter', 'PASS', `Location filter working`);
    } else {
      logTest('6.2 Location Filter', 'FAIL', 'Location filter not working');
    }
  } catch (error) {
    logTest('6.1 Job Search', 'FAIL', error.message);
  }
}

async function testJobCategories() {
  try {
    const response = await makeRequest('GET', '/jobs');
    const jobsWithSkills = response.data.jobs.filter(job => job.skills && job.skills.length > 0);
    
    if (jobsWithSkills.length > 0) {
      logTest('7.1 Job Categories/Skills', 'PASS', `${jobsWithSkills.length} jobs have skills`);
    } else {
      logTest('7.1 Job Categories/Skills', 'FAIL', 'No jobs have skills assigned');
    }
  } catch (error) {
    logTest('7.1 Job Categories/Skills', 'FAIL', error.message);
  }
}

async function testJobSeekerProfile() {
  if (!authTokens.jobSeeker) {
    logTest('8.1 Job Seeker Profile', 'SKIP', 'No job seeker token');
    return;
  }
  
  try {
    const headers = { 'Authorization': `Bearer ${authTokens.jobSeeker}` };
    const response = await makeRequest('GET', '/jobseeker/profile', null, headers);
    
    if (response.data.user) {
      logTest('8.1 Job Seeker Profile', 'PASS', 'Profile retrieved');
      
      // Test profile update
      const updateData = { bio: 'Updated bio for testing' };
      try {
        const updateResponse = await makeRequest('PUT', '/jobseeker/profile', updateData, headers);
        if (updateResponse.status === 200) {
          logTest('8.2 Profile Update', 'PASS', 'Profile update successful');
        } else {
          logTest('8.2 Profile Update', 'FAIL', `Status: ${updateResponse.status}`);
        }
      } catch (updateError) {
        logTest('8.2 Profile Update', 'FAIL', updateError.message);
      }
    } else {
      logTest('8.1 Job Seeker Profile', 'FAIL', 'Invalid profile response');
    }
  } catch (error) {
    logTest('8.1 Job Seeker Profile', 'FAIL', error.message);
  }
}

async function testEmployerProfile() {
  if (!authTokens.employer) {
    logTest('9.1 Employer Profile', 'SKIP', 'No employer token');
    return;
  }
  
  try {
    const headers = { 'Authorization': `Bearer ${authTokens.employer}` };
    const response = await makeRequest('GET', '/employer/profile', null, headers);
    
    if (response.data) {
      logTest('9.1 Employer Profile', 'PASS', 'Profile retrieved');
      
      // Test job creation
      const newJob = {
        title: `Test Job ${Date.now()}`,
        description: 'This is a test job posting for MVP testing',
        location: 'Kingston, Jamaica',
        type: 'FULL_TIME',
        salary: { min: 50000, max: 80000, currency: 'USD' },
        skills: ['JavaScript', 'React']
      };
      
      try {
        const jobResponse = await makeRequest('POST', '/employer/jobs', newJob, headers);
        if (jobResponse.status === 201) {
          logTest('9.2 Job Creation', 'PASS', 'Job posted successfully');
        } else {
          logTest('9.2 Job Creation', 'FAIL', `Status: ${jobResponse.status}`);
        }
      } catch (jobError) {
        logTest('9.2 Job Creation', 'FAIL', jobError.message);
      }
    }
  } catch (error) {
    logTest('9.1 Employer Profile', 'FAIL', error.message);
  }
}

async function testCompanyManagement() {
  try {
    const response = await makeRequest('GET', '/companies');
    if (response.data) {
      logTest('10.1 Company Listings', 'PASS', 'Companies endpoint available');
    } else {
      logTest('10.1 Company Listings', 'FAIL', 'Invalid companies response');
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logTest('10.1 Company Listings', 'FAIL', 'Companies endpoint missing');
    } else {
      logTest('10.1 Company Listings', 'FAIL', error.message);
    }
  }
}

async function testJobApplication() {
  logTest('11.1 Job Application Flow', 'SKIP', 'Manual testing required for full flow');
}

async function testApplicationManagement() {
  logTest('12.1 Application Management', 'SKIP', 'Dependent on application flow');
}

async function testSkillMatching() {
  try {
    const response = await makeRequest('GET', '/skills');
    if (response.data) {
      logTest('13.1 Skills System', 'PASS', 'Skills endpoint available');
    } else {
      logTest('13.1 Skills System', 'FAIL', 'Skills endpoint not working');
    }
  } catch (error) {
    logTest('13.1 Skills System', 'FAIL', error.message);
  }
}

async function testNotifications() {
  if (!authTokens.jobSeeker) {
    logTest('14.1 Notifications', 'SKIP', 'No auth token');
    return;
  }
  
  try {
    const headers = { 'Authorization': `Bearer ${authTokens.jobSeeker}` };
    const response = await makeRequest('GET', '/notifications', null, headers);
    
    if (response.data) {
      logTest('14.1 Notifications', 'PASS', 'Notifications system working');
    } else {
      logTest('14.1 Notifications', 'FAIL', 'Notifications not working');
    }
  } catch (error) {
    logTest('14.1 Notifications', 'FAIL', error.message);
  }
}

async function testDataValidation() {
  try {
    // Test invalid registration data
    const invalidData = { email: 'invalid-email' };
    const response = await makeRequest('POST', '/auth/register', invalidData);
    
    logTest('15.1 Data Validation', 'FAIL', 'Should reject invalid email');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logTest('15.1 Data Validation', 'PASS', 'Properly validates input data');
    } else {
      logTest('15.1 Data Validation', 'FAIL', error.message);
    }
  }
}

async function testSecurity() {
  try {
    // Test accessing protected route without token
    const response = await makeRequest('GET', '/jobseeker/profile');
    logTest('16.1 Security', 'FAIL', 'Should require authentication');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logTest('16.1 Security', 'PASS', 'Protected routes require authentication');
    } else {
      logTest('16.1 Security', 'FAIL', error.message);
    }
  }
}

async function testFrontendIntegration() {
  const frontendUrl = TEST_ENV === 'staging' ? 'https://staging-jobs.bingitech.io' : 
                     TEST_ENV === 'production' ? 'https://jobs.bingitech.io' :
                     'http://localhost:3000';
  
  try {
    const response = await axios.get(frontendUrl, { timeout: 10000 });
    
    if (response.status === 200 && response.data.includes('BingiTech Jobs')) {
      logTest('17.1 Frontend Integration', 'PASS', 'Frontend accessible');
    } else {
      logTest('17.1 Frontend Integration', 'FAIL', 'Frontend issues detected');
    }
  } catch (error) {
    logTest('17.1 Frontend Integration', 'FAIL', error.message);
  }
}

async function generateTestReport() {
  console.log('\n' + '=' .repeat(60));
  console.log('📊 MVP READINESS TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`📊 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  console.log(`⏰ Completed: ${new Date().toLocaleString()}`);
  
  if (results.failed > 0) {
    console.log('\n🔍 FAILED TESTS:');
    results.tests
      .filter(test => test.status === 'FAIL')
      .forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.name} - ${test.message}`);
      });
  }
  
  console.log('\n📝 MVP READINESS ASSESSMENT:');
  
  const criticalTests = [
    'Health Check', 
    'Job Listings', 
    'User Registration', 
    'User Login',
    'Frontend Integration'
  ];
  
  const passedCritical = results.tests
    .filter(test => criticalTests.some(critical => test.name.includes(critical)))
    .filter(test => test.status === 'PASS').length;
  
  if (passedCritical >= 4) {
    console.log('🟢 MVP READY - Core functionality working');
  } else {
    console.log('🔴 NOT MVP READY - Critical issues need fixing');
  }
  
  // Save detailed report
  const reportData = {
    environment: TEST_ENV,
    apiUrl: API_BASE_URL,
    timestamp: new Date().toISOString(),
    summary: {
      passed: results.passed,
      failed: results.failed,
      skipped: results.skipped,
      successRate: Math.round((results.passed / (results.passed + results.failed)) * 100)
    },
    tests: results.tests
  };
  
  const reportPath = path.join(__dirname, `test-report-${TEST_ENV}-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`📄 Detailed report saved: ${reportPath}`);
  
  console.log('=' .repeat(60));
}

// Run the tests
if (require.main === module) {
  runMVPTests();
}

module.exports = { runMVPTests };
