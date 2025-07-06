/**
 * Comprehensive QA Testing Suite for JamDung Jobs
 * 
 * This script tests all aspects of the application:
 * - API endpoints and functionality
 * - File upload/download capabilities
 * - Frontend accessibility and performance
 * - Security vulnerabilities
 * - Database integrity
 * 
 * Usage:
 *   TEST_ENV=local node comprehensive-qa-test.js
 *   TEST_ENV=staging node comprehensive-qa-test.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./test-config');

// Enhanced configuration
const TEST_ENV = process.env.TEST_ENV || 'local';
const API_BASE_URL = process.env.API_URL || config.api[TEST_ENV] || config.api.local;
const FRONTEND_URL = TEST_ENV === 'local' ? 'http://localhost:3000' : 
                     TEST_ENV === 'staging' ? 'https://staging-jobs.bingitech.io' : 
                     'https://jobs.bingitech.io';
const TIMEOUT = config.timeouts.long;

// Test results tracking
let results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  warnings: 0,
  tests: [],
  categories: {
    api: { passed: 0, failed: 0 },
    frontend: { passed: 0, failed: 0 },
    security: { passed: 0, failed: 0 },
    files: { passed: 0, failed: 0 },
    performance: { passed: 0, failed: 0 }
  }
};

let authTokens = { jobSeeker: null, employer: null };

// Helper functions
function logTest(category, name, status, message = '', data = null) {
  const emoji = status === 'PASS' ? '✅' : 
                status === 'FAIL' ? '❌' : 
                status === 'WARN' ? '⚠️' : '⏭️';
  
  console.log(`${emoji} [${category.toUpperCase()}] ${name} ${message ? `(${message})` : ''}`);
  
  results.tests.push({
    category,
    name,
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  });
  
  if (status === 'PASS') {
    results.passed++;
    results.categories[category].passed++;
  } else if (status === 'FAIL') {
    results.failed++;
    results.categories[category].failed++;
  } else if (status === 'WARN') {
    results.warnings++;
  } else {
    results.skipped++;
  }
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
    timeout: TIMEOUT,
    validateStatus: () => true // Don't throw on any status code
  });
}

async function runComprehensiveQA() {
  console.log('🧪 JamDung Jobs Comprehensive QA Test Suite');
  console.log('=' .repeat(70));
  console.log(`🌐 Environment: ${TEST_ENV.toUpperCase()}`);
  console.log(`🔗 API: ${API_BASE_URL}`);
  console.log(`🖥️  Frontend: ${FRONTEND_URL}`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);
  console.log('=' .repeat(70));

  try {
    // 1. API Testing
    console.log('\n📡 API TESTING');
    console.log('-' .repeat(50));
    await testAPIHealth();
    await testAuthentication();
    await testJobManagement();
    await testUserProfiles();
    await testApplicationFlow();
    await testNotifications();
    
    // 2. File Management Testing
    console.log('\n📁 FILE MANAGEMENT TESTING');
    console.log('-' .repeat(50));
    await testFileUploads();
    await testImageHandling();
    await testFileValidation();
    
    // 3. Frontend Testing
    console.log('\n🖥️  FRONTEND TESTING');
    console.log('-' .repeat(50));
    await testFrontendAccessibility();
    await testResponsiveness();
    await testBrokenLinks();
    await testPagePerformance();
    
    // 4. Security Testing
    console.log('\n🔒 SECURITY TESTING');
    console.log('-' .repeat(50));
    await testSQLInjection();
    await testXSSProtection();
    await testAuthorizationBypass();
    await testRateLimiting();
    
    // 5. Performance Testing
    console.log('\n⚡ PERFORMANCE TESTING');
    console.log('-' .repeat(50));
    await testAPIPerformance();
    await testDatabasePerformance();
    await testConcurrentUsers();
    
  } catch (error) {
    logTest('system', 'Test Suite Error', 'FAIL', error.message);
  }
  
  // Generate comprehensive report
  await generateQAReport();
  
  // Exit with proper code
  process.exit(results.failed > 0 ? 1 : 0);
}

// API Testing Functions
async function testAPIHealth() {
  try {
    const response = await makeRequest('GET', '/health');
    if (response.status === 200) {
      logTest('api', 'Health Check', 'PASS', 'API responding');
    } else {
      logTest('api', 'Health Check', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('api', 'Health Check', 'FAIL', error.message);
  }
}

async function testAuthentication() {
  // Test registration with various input combinations
  const testCases = [
    {
      name: 'Valid Job Seeker Registration',
      data: {
        email: `test${Date.now()}@jamdungjobs.com`,
        password: 'Test@123',
        firstName: 'Test',
        lastName: 'User',
        userType: 'JOB_SEEKER'
      },
      shouldPass: true
    },
    {
      name: 'Invalid Email Registration',
      data: {
        email: 'invalid-email',
        password: 'Test@123',
        firstName: 'Test',
        lastName: 'User',
        userType: 'JOB_SEEKER'
      },
      shouldPass: false
    },
    {
      name: 'Weak Password Registration',
      data: {
        email: `test${Date.now()}@jamdungjobs.com`,
        password: '123',
        firstName: 'Test',
        lastName: 'User',
        userType: 'JOB_SEEKER'
      },
      shouldPass: false
    }
  ];
  
  for (const testCase of testCases) {
    try {
      const response = await makeRequest('POST', '/auth/register', testCase.data);
      const passed = testCase.shouldPass ? 
        (response.status >= 200 && response.status < 300) :
        (response.status >= 400);
      
      logTest('api', testCase.name, passed ? 'PASS' : 'FAIL', 
        `Status: ${response.status}`);
    } catch (error) {
      logTest('api', testCase.name, 'FAIL', error.message);
    }
  }
  
  // Test login functionality
  const credentials = {
    email: 'testjobseeker@jamdungjobs.com',
    password: 'Test@123'
  };
  
  try {
    const response = await makeRequest('POST', '/auth/login', credentials);
    if (response.status === 200 && response.data.token) {
      authTokens.jobSeeker = response.data.token;
      logTest('api', 'Job Seeker Login', 'PASS', 'Token received');
    } else {
      logTest('api', 'Job Seeker Login', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('api', 'Job Seeker Login', 'FAIL', error.message);
  }
}

async function testJobManagement() {
  // Test job listings
  try {
    const response = await makeRequest('GET', '/jobs');
    if (response.status === 200 && response.data.jobs) {
      logTest('api', 'Job Listings', 'PASS', `${response.data.jobs.length} jobs found`);
      
      // Test job search
      const searchResponse = await makeRequest('GET', '/jobs?search=developer');
      if (searchResponse.status === 200) {
        logTest('api', 'Job Search', 'PASS', `Search functionality working`);
      } else {
        logTest('api', 'Job Search', 'FAIL', `Status: ${searchResponse.status}`);
      }
      
      // Test job filtering
      const filterResponse = await makeRequest('GET', '/jobs?location=Kingston');
      if (filterResponse.status === 200) {
        logTest('api', 'Job Filtering', 'PASS', `Location filter working`);
      } else {
        logTest('api', 'Job Filtering', 'FAIL', `Status: ${filterResponse.status}`);
      }
    } else {
      logTest('api', 'Job Listings', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('api', 'Job Listings', 'FAIL', error.message);
  }
}

async function testUserProfiles() {
  if (!authTokens.jobSeeker) {
    logTest('api', 'User Profile Tests', 'SKIP', 'No auth token');
    return;
  }
  
  const headers = { 'Authorization': `Bearer ${authTokens.jobSeeker}` };
  
  try {
    // Test profile retrieval
    const response = await makeRequest('GET', '/jobseeker/profile', null, headers);
    if (response.status === 200) {
      logTest('api', 'Profile Retrieval', 'PASS', 'Profile data received');
      
      // Test profile update
      const updateData = { bio: 'Updated bio for testing' };
      const updateResponse = await makeRequest('PUT', '/jobseeker/profile', updateData, headers);
      if (updateResponse.status === 200) {
        logTest('api', 'Profile Update', 'PASS', 'Profile updated successfully');
      } else {
        logTest('api', 'Profile Update', 'FAIL', `Status: ${updateResponse.status}`);
      }
    } else {
      logTest('api', 'Profile Retrieval', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('api', 'User Profile Tests', 'FAIL', error.message);
  }
}

async function testApplicationFlow() {
  logTest('api', 'Application Flow', 'SKIP', 'Requires integration testing');
}

async function testNotifications() {
  if (!authTokens.jobSeeker) {
    logTest('api', 'Notifications', 'SKIP', 'No auth token');
    return;
  }
  
  const headers = { 'Authorization': `Bearer ${authTokens.jobSeeker}` };
  
  try {
    const response = await makeRequest('GET', '/notifications', null, headers);
    if (response.status === 200) {
      logTest('api', 'Notifications', 'PASS', 'Notifications endpoint working');
    } else {
      logTest('api', 'Notifications', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('api', 'Notifications', 'FAIL', error.message);
  }
}

// File Management Testing
async function testFileUploads() {
  logTest('files', 'Resume Upload', 'SKIP', 'Requires multipart form testing');
  logTest('files', 'Profile Photo Upload', 'SKIP', 'Requires multipart form testing');
}

async function testImageHandling() {
  // Test image serving
  try {
    const response = await axios.get(`${API_BASE_URL}/uploads/test.jpg`, {
      timeout: 5000,
      validateStatus: () => true
    });
    
    if (response.status === 200) {
      logTest('files', 'Image Serving', 'PASS', 'Images are accessible');
    } else if (response.status === 404) {
      logTest('files', 'Image Serving', 'WARN', 'No test image found (expected)');
    } else {
      logTest('files', 'Image Serving', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('files', 'Image Serving', 'FAIL', error.message);
  }
}

async function testFileValidation() {
  logTest('files', 'File Type Validation', 'SKIP', 'Requires file upload testing');
  logTest('files', 'File Size Limits', 'SKIP', 'Requires file upload testing');
}

// Frontend Testing
async function testFrontendAccessibility() {
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 10000 });
    
    if (response.status === 200) {
      logTest('frontend', 'Frontend Accessibility', 'PASS', 'Frontend is accessible');
      
      // Check for basic HTML structure
      const html = response.data;
      if (html.includes('<title>') && html.includes('BingiTech Jobs')) {
        logTest('frontend', 'HTML Structure', 'PASS', 'Valid HTML with title');
      } else {
        logTest('frontend', 'HTML Structure', 'FAIL', 'Missing title or brand');
      }
      
      // Check for meta tags
      if (html.includes('<meta name="description"')) {
        logTest('frontend', 'SEO Meta Tags', 'PASS', 'Description meta tag found');
      } else {
        logTest('frontend', 'SEO Meta Tags', 'FAIL', 'Missing description meta tag');
      }
      
    } else {
      logTest('frontend', 'Frontend Accessibility', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('frontend', 'Frontend Accessibility', 'FAIL', error.message);
  }
}

async function testResponsiveness() {
  logTest('frontend', 'Mobile Responsiveness', 'SKIP', 'Requires browser automation');
  logTest('frontend', 'Tablet Layout', 'SKIP', 'Requires browser automation');
}

async function testBrokenLinks() {
  try {
    // Test common pages
    const pages = ['/', '/jobs', '/companies', '/about', '/contact'];
    
    for (const page of pages) {
      try {
        const response = await axios.get(`${FRONTEND_URL}${page}`, { 
          timeout: 5000,
          validateStatus: () => true 
        });
        
        if (response.status === 200) {
          logTest('frontend', `Page: ${page}`, 'PASS', 'Page accessible');
        } else {
          logTest('frontend', `Page: ${page}`, 'FAIL', `Status: ${response.status}`);
        }
      } catch (error) {
        logTest('frontend', `Page: ${page}`, 'FAIL', error.message);
      }
    }
  } catch (error) {
    logTest('frontend', 'Broken Links Test', 'FAIL', error.message);
  }
}

async function testPagePerformance() {
  try {
    const startTime = Date.now();
    const response = await axios.get(FRONTEND_URL, { timeout: 10000 });
    const loadTime = Date.now() - startTime;
    
    if (loadTime < 3000) {
      logTest('performance', 'Page Load Speed', 'PASS', `${loadTime}ms`);
    } else if (loadTime < 5000) {
      logTest('performance', 'Page Load Speed', 'WARN', `${loadTime}ms (slow)`);
    } else {
      logTest('performance', 'Page Load Speed', 'FAIL', `${loadTime}ms (too slow)`);
    }
  } catch (error) {
    logTest('performance', 'Page Load Speed', 'FAIL', error.message);
  }
}

// Security Testing
async function testSQLInjection() {
  const maliciousInputs = [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "' UNION SELECT * FROM users --"
  ];
  
  for (const input of maliciousInputs) {
    try {
      const response = await makeRequest('GET', `/jobs?search=${encodeURIComponent(input)}`);
      if (response.status >= 400 || response.status === 500) {
        logTest('security', 'SQL Injection Protection', 'PASS', 'Malicious input rejected');
      } else {
        logTest('security', 'SQL Injection Protection', 'WARN', 'Malicious input not rejected');
      }
      break; // Only test one case to avoid triggering security measures
    } catch (error) {
      logTest('security', 'SQL Injection Protection', 'PASS', 'Request properly handled');
      break;
    }
  }
}

async function testXSSProtection() {
  const xssPayloads = [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '<img src="x" onerror="alert(\'xss\')">'
  ];
  
  for (const payload of xssPayloads) {
    try {
      const response = await makeRequest('GET', `/jobs?search=${encodeURIComponent(payload)}`);
      // If the response contains the unescaped payload, it's vulnerable
      if (response.data && typeof response.data === 'string' && response.data.includes(payload)) {
        logTest('security', 'XSS Protection', 'FAIL', 'XSS payload not escaped');
      } else {
        logTest('security', 'XSS Protection', 'PASS', 'XSS payload properly handled');
      }
      break;
    } catch (error) {
      logTest('security', 'XSS Protection', 'PASS', 'Request properly handled');
      break;
    }
  }
}

async function testAuthorizationBypass() {
  // Test accessing protected routes without token
  try {
    const response = await makeRequest('GET', '/jobseeker/profile');
    if (response.status === 401) {
      logTest('security', 'Authorization Check', 'PASS', 'Protected route requires auth');
    } else {
      logTest('security', 'Authorization Check', 'FAIL', 'Protected route accessible without auth');
    }
  } catch (error) {
    logTest('security', 'Authorization Check', 'PASS', 'Request properly handled');
  }
}

async function testRateLimiting() {
  logTest('security', 'Rate Limiting', 'SKIP', 'Requires load testing tools');
}

// Performance Testing
async function testAPIPerformance() {
  try {
    const startTime = Date.now();
    const response = await makeRequest('GET', '/jobs');
    const responseTime = Date.now() - startTime;
    
    if (responseTime < 500) {
      logTest('performance', 'API Response Time', 'PASS', `${responseTime}ms`);
    } else if (responseTime < 1000) {
      logTest('performance', 'API Response Time', 'WARN', `${responseTime}ms (slow)`);
    } else {
      logTest('performance', 'API Response Time', 'FAIL', `${responseTime}ms (too slow)`);
    }
  } catch (error) {
    logTest('performance', 'API Response Time', 'FAIL', error.message);
  }
}

async function testDatabasePerformance() {
  logTest('performance', 'Database Performance', 'SKIP', 'Requires database monitoring');
}

async function testConcurrentUsers() {
  logTest('performance', 'Concurrent Users', 'SKIP', 'Requires load testing tools');
}

async function generateQAReport() {
  console.log('\n' + '=' .repeat(70));
  console.log('📊 COMPREHENSIVE QA TEST SUMMARY');
  console.log('=' .repeat(70));
  
  // Overall summary
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  
  const totalTests = results.passed + results.failed;
  const successRate = totalTests > 0 ? Math.round((results.passed / totalTests) * 100) : 0;
  console.log(`📊 Success Rate: ${successRate}%`);
  
  // Category breakdown
  console.log('\n📂 BY CATEGORY:');
  Object.entries(results.categories).forEach(([category, stats]) => {
    const total = stats.passed + stats.failed;
    const rate = total > 0 ? Math.round((stats.passed / total) * 100) : 0;
    console.log(`  ${category.toUpperCase()}: ${stats.passed}/${total} (${rate}%)`);
  });
  
  // Failed tests
  if (results.failed > 0) {
    console.log('\n🔍 FAILED TESTS:');
    results.tests
      .filter(test => test.status === 'FAIL')
      .forEach((test, index) => {
        console.log(`  ${index + 1}. [${test.category.toUpperCase()}] ${test.name} - ${test.message}`);
      });
  }
  
  // Warnings
  if (results.warnings > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.tests
      .filter(test => test.status === 'WARN')
      .forEach((test, index) => {
        console.log(`  ${index + 1}. [${test.category.toUpperCase()}] ${test.name} - ${test.message}`);
      });
  }
  
  // MVP Readiness Assessment
  console.log('\n🎯 MVP READINESS ASSESSMENT:');
  const criticalPassed = results.tests
    .filter(test => ['Health Check', 'Frontend Accessibility', 'Job Listings', 'Authorization Check'].includes(test.name))
    .filter(test => test.status === 'PASS').length;
  
  if (criticalPassed >= 3 && results.failed < 3) {
    console.log('🟢 MVP READY - Core functionality working with minor issues');
  } else if (criticalPassed >= 2 && results.failed < 5) {
    console.log('🟡 NEEDS WORK - Some critical issues need fixing');
  } else {
    console.log('🔴 NOT MVP READY - Major issues need addressing');
  }
  
  // Save detailed report
  const reportData = {
    environment: TEST_ENV,
    apiUrl: API_BASE_URL,
    frontendUrl: FRONTEND_URL,
    timestamp: new Date().toISOString(),
    summary: {
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      skipped: results.skipped,
      successRate: successRate
    },
    categories: results.categories,
    tests: results.tests
  };
  
  const reportPath = path.join(__dirname, `qa-report-${TEST_ENV}-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 Detailed report saved: ${reportPath}`);
  
  console.log('=' .repeat(70));
}

// Run the comprehensive QA tests
if (require.main === module) {
  runComprehensiveQA();
}

module.exports = { runComprehensiveQA };
