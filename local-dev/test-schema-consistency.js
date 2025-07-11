#!/usr/bin/env node

const axios = require('axios');

// Test configuration
const API_BASE = 'http://localhost:5000';
const TEST_USER_EMAIL = 'schema_test@example.com';
const TEST_USER_PASSWORD = 'Test123!';

// Helper function to make authenticated requests
let authToken = null;

const makeRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...headers
      }
    };
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 0
    };
  }
};

// Test suite
const tests = {
  // Test 1: Registration with camelCase fields
  testRegistration: async () => {
    console.log('\n🧪 Testing Registration Schema Consistency...');
    
    const registrationData = {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      firstName: 'Schema',
      lastName: 'Test',
      role: 'JOBSEEKER'
    };
    
    const result = await makeRequest('POST', '/api/auth/register', registrationData);
    
    if (result.success) {
      console.log('✅ Registration successful');
      console.log('   Response includes token:', !!result.data.token);
      console.log('   Response includes user:', !!result.data.user);
      console.log('   User firstName:', result.data.user?.firstName);
      console.log('   User role:', result.data.user?.role);
      
      // Store auth token for subsequent tests
      authToken = result.data.token;
      return true;
    } else {
      console.log('❌ Registration failed:', result.error);
      return false;
    }
  },

  // Test 2: Token validation response structure
  testTokenValidation: async () => {
    console.log('\n🧪 Testing Token Validation Schema...');
    
    if (!authToken) {
      console.log('❌ No auth token available');
      return false;
    }
    
    const result = await makeRequest('GET', '/api/auth/validate');
    
    if (result.success) {
      console.log('✅ Token validation successful');
      console.log('   Response has user data:', !!result.data.user || !!result.data.id);
      console.log('   User ID present:', !!(result.data.user?.id || result.data.id));
      console.log('   User role present:', !!(result.data.user?.role || result.data.role));
      return true;
    } else {
      console.log('❌ Token validation failed:', result.error);
      return false;
    }
  },

  // Test 3: User profile update with camelCase
  testUserProfileUpdate: async () => {
    console.log('\n🧪 Testing User Profile Update Schema...');
    
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      phoneNumber: '+1-876-555-0123',
      location: 'Kingston, Jamaica',
      bio: 'Updated bio for schema testing'
    };
    
    const result = await makeRequest('PUT', '/api/users/me', updateData);
    
    if (result.success) {
      console.log('✅ User profile update successful');
      console.log('   Updated firstName:', result.data.data?.firstName || result.data.firstName);
      console.log('   Updated phoneNumber:', result.data.data?.phoneNumber || result.data.phoneNumber);
      return true;
    } else {
      console.log('❌ User profile update failed:', result.error);
      return false;
    }
  },

  // Test 4: Jobseeker profile update with camelCase
  testJobseekerProfileUpdate: async () => {
    console.log('\n🧪 Testing Jobseeker Profile Update Schema...');
    
    const profileData = {
      firstName: 'Schema',
      lastName: 'Tester',
      bio: 'Testing schema consistency',
      location: 'Spanish Town, St Catherine, Jamaica',
      phoneNumber: '+1-876-555-0123',
      skills: ['JavaScript', 'Node.js', 'Testing'],
      education: ['Bachelor of Computer Science'],
      experience: ['Software Developer at Test Company']
    };
    
    const result = await makeRequest('PUT', '/api/jobseeker/profile', profileData);
    
    if (result.success) {
      console.log('✅ Jobseeker profile update successful');
      console.log('   Profile has skills:', Array.isArray(result.data.data?.candidateProfile?.skills));
      console.log('   Skills count:', result.data.data?.candidateProfile?.skills?.length || 0);
      return true;
    } else {
      console.log('❌ Jobseeker profile update failed:', result.error);
      console.log('   Error details:', JSON.stringify(result.error, null, 2));
      return false;
    }
  },

  // Test 5: Get user profile and verify response structure
  testGetUserProfile: async () => {
    console.log('\n🧪 Testing Get User Profile Response Schema...');
    
    const result = await makeRequest('GET', '/api/users/me');
    
    if (result.success) {
      console.log('✅ Get user profile successful');
      console.log('   Response structure:', Object.keys(result.data));
      console.log('   Has success field:', !!result.data.success);
      console.log('   Has data field:', !!result.data.data);
      console.log('   User firstName in data:', result.data.data?.firstName);
      console.log('   Has candidateProfile:', !!result.data.data?.candidateProfile);
      return true;
    } else {
      console.log('❌ Get user profile failed:', result.error);
      return false;
    }
  }
};

// Run all tests
const runTests = async () => {
  console.log('🚀 Starting Schema Consistency Tests...\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const [testName, testFn] of Object.entries(tests)) {
    totalTests++;
    try {
      const passed = await testFn();
      if (passed) passedTests++;
    } catch (error) {
      console.log(`❌ Test ${testName} threw an exception:`, error.message);
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All schema consistency tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Schema inconsistencies remain.');
    process.exit(1);
  }
};

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Tests interrupted by user');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
runTests().catch(error => {
  console.error('🚨 Test suite failed:', error);
  process.exit(1);
});