const axios = require('axios');
const fs = require('fs');
const config = require('./test-config');

// Simple test runner
async function runTests(env = 'staging') {
  const environment = env;
  const API_URL = config.api[environment] || config.api.staging;
  const testStart = Date.now();
  
  console.log('🚀 Starting JamDung Jobs Smoke Tests');
  console.log(`🌐 Environment: ${environment.toUpperCase()}`);
  console.log(`🔗 Testing API at: ${API_URL}\n`);
  console.log('⏳ Please wait, running tests...\n');

  const results = [];
  const testData = [];
  
  function logResult(testName, passed, details = '') {
    const status = passed ? '✅' : '❌';
    const result = { testName, passed, details };
    results.push(result);
    testData.push({ name: testName, status: passed ? 'passed' : 'failed', details });
    console.log(`${status} ${testName} ${details}`);
    return passed;
  }

  // Helper function to make API requests with error handling
  async function apiRequest(method, endpoint, data = null, token = null) {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios({
        method,
        url: `${API_URL}${endpoint}`,
        data,
        headers,
        validateStatus: () => true // Don't throw on non-2xx responses
      });
      
      return response;
    } catch (error) {
      console.error(`API Request Error (${method} ${endpoint}):`, error.message);
      return { status: 500, data: { error: error.message } };
    }
  }

  try {
    // Test 1: Health Check
    const health = await apiRequest('GET', '/health');
    const healthPassed = health?.data?.status === 'ok';
    logResult('1. Health Check', healthPassed, 
      healthPassed ? '' : `(Status: ${health?.status} - ${JSON.stringify(health?.data)})`);

    // Test 2: Public Job Listings
    const jobs = await apiRequest('GET', '/jobs');
    const jobsPassed = jobs?.status === 200;
    logResult('2. Public Job Listings', jobsPassed, 
      jobsPassed ? `(${jobs?.data?.length || 0} jobs found)` : `(Status: ${jobs?.status})`);

    // Test 3: Job Search
    const search = await apiRequest('GET', '/jobs?q=developer');
    const searchPassed = search?.status === 200;
    logResult('3. Job Search', searchPassed, 
      searchPassed ? `(${search?.data?.length || 0} results)` : `(Status: ${search?.status})`);

    // Test 4: Authentication Flow
    try {
      // 4.1 Login with test job seeker
      const loginResponse = await apiRequest('POST', '/auth/login', {
        email: config.testAccounts.jobSeeker.email,
        password: config.testAccounts.jobSeeker.password
      });
      
      const loginPassed = loginResponse?.status === 200 && loginResponse?.data?.token;
      logResult('4.1 Job Seeker Login', loginPassed, 
        loginPassed ? '(Success)' : `(Status: ${loginResponse?.status})`);
      
      if (loginPassed) {
        const token = loginResponse.data.token;
        
        // 4.2 Get job seeker profile
        const profileResponse = await apiRequest('GET', '/jobseeker/profile', null, token);
        const profilePassed = profileResponse?.status === 200;
        logResult('4.2 Get Job Seeker Profile', profilePassed,
          profilePassed ? '(Success)' : `(Status: ${profileResponse?.status})`);
      }
      
    } catch (e) {
      logResult('4. Authentication Flow', false, `(Error: ${e.message})`);
    }
    
    // Test 5: Company Listings (if available)
    try {
      const companies = await apiRequest('GET', '/companies');
      const companiesPassed = companies?.status === 200;
      logResult('5. Company Listings', companiesPassed, 
        companiesPassed ? `(${companies?.data?.length || 0} companies)` : '(Not available)');
    } catch (e) {
      logResult('5. Company Listings', false, '(Endpoint not available)');
    }

    // Test 6: Employer Flow
    try {
      // 6.1 Login with test employer
      const employerLogin = await apiRequest('POST', '/auth/login', {
        email: config.testAccounts.employer.email,
        password: config.testAccounts.employer.password
      });
      
      const employerLoginPassed = employerLogin?.status === 200 && employerLogin?.data?.token;
      logResult('6.1 Employer Login', employerLoginPassed,
        employerLoginPassed ? '(Success)' : `(Status: ${employerLogin?.status})`);
      
      if (employerLoginPassed) {
        const token = employerLogin.data.token;
        
        // 6.2 Get employer profile
        const employerProfile = await apiRequest('GET', '/employer/profile', null, token);
        const employerProfilePassed = employerProfile?.status === 200;
        logResult('6.2 Get Employer Profile', employerProfilePassed,
          employerProfilePassed ? '(Success)' : `(Status: ${employerProfile?.status})`);
        
        // 6.3 Get employer's job postings
        if (employerProfilePassed) {
          const employerJobs = await apiRequest('GET', '/employer/jobs', null, token);
          const jobsPassed = employerJobs?.status === 200;
          logResult('6.3 Get Employer Jobs', jobsPassed,
            jobsPassed ? `(${employerJobs?.data?.length || 0} jobs)` : `(Status: ${employerJobs?.status})`);
        }
      }
      
    } catch (e) {
      logResult('6. Employer Flow', false, `(Error: ${e.message})`);
    }
    
    // Test 7: Job Application Flow (if jobs exist)
    try {
      // Get a job to apply to
      const jobsResponse = await apiRequest('GET', '/jobs?limit=1');
      if (jobsResponse?.status === 200 && jobsResponse.data?.length > 0) {
        const job = jobsResponse.data[0];
        
        // Login as job seeker
        const login = await apiRequest('POST', '/auth/login', {
          email: config.testAccounts.jobSeeker.email,
          password: config.testAccounts.jobSeeker.password
        });
        
        if (login?.status === 200 && login.data?.token) {
          const token = login.data.token;
          
          // Apply for the job
          const application = await apiRequest('POST', `/jobs/${job.id}/apply`, {
            coverLetter: 'I am very interested in this position!',
            resumeUrl: 'https://example.com/resume.pdf'
          }, token);
          
          const applicationPassed = application?.status === 201 || application?.status === 200;
          logResult('7.1 Job Application', applicationPassed,
            applicationPassed ? '(Success)' : `(Status: ${application?.status})`);
        }
      } else {
        logResult('7. Job Application Flow', false, '(No jobs available to apply to)');
      }
    } catch (e) {
      logResult('7. Job Application Flow', false, `(Error: ${e.message})`);
    }
    
    // Calculate results
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const percentage = Math.round((passed / total) * 100);
    
    // Generate detailed test report
    const report = {
      environment,
      apiUrl: API_URL,
      timestamp: new Date().toISOString(),
      duration: (Date.now() - testStart) / 1000,
      summary: {
        total,
        passed,
        failed: total - passed,
        percentage
      },
      tests: testData,
      testAccounts: config.testAccounts
    };
    
    // Save detailed report to file
    const reportFile = `test-report-${environment}-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY'.padEnd(30) + '📋'.padStart(30));
    console.log('='.repeat(60));
    console.log(`🌐 Environment:`.padEnd(20) + environment.toUpperCase());
    console.log(`🔗 API:`.padEnd(20) + API_URL);
    console.log(`📅 Timestamp:`.padEnd(20) + new Date().toLocaleString());
    console.log(`⏱️  Duration:`.padEnd(20) + `${report.duration.toFixed(2)}s`);
    console.log('-'.repeat(60));
    
    // Test results summary
    console.log(`✅ Passed:`.padEnd(20) + `${passed}`.padStart(10));
    console.log(`❌ Failed:`.padEnd(20) + `${total - passed}`.padStart(10));
    console.log(`📊 Success Rate:`.padEnd(20) + `${percentage}%`.padStart(10));
    
    // Failed tests details
    const failedTests = results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log('\n🔍 Failed Tests:');
      failedTests.forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.testName} ${test.details}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (passed < total) {
      console.log('\n❌ Some tests failed. Check the logs above for details.');
      console.log(`📝 Detailed report saved to: ${reportFile}`);
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed successfully!');
      console.log(`📝 Report saved to: ${reportFile}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test runner error:', error);
    process.exit(1);
  }
}

// Run tests with environment from command line or default to 'staging'
runTests(process.argv[2] || 'staging');
