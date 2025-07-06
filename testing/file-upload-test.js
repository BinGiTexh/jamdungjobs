/**
 * File Upload Testing for JamDung Jobs
 * Tests existing file upload functionality:
 * - Resume uploads (jobseeker)
 * - Profile photo uploads (jobseeker)
 * - Company logo uploads (employer)
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const config = require('./test-config');

const TEST_ENV = process.env.TEST_ENV || 'local';
const API_BASE_URL = process.env.API_URL || config.api[TEST_ENV] || config.api.local;

// Test results tracking
let results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, status, message = '') {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${emoji} ${name} ${message ? `(${message})` : ''}`);
  
  results.tests.push({ name, status, message, timestamp: new Date().toISOString() });
  
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
}

async function createTestFiles() {
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  // Create a small test PDF
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R 
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj
4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Times-Roman
>>
endobj
5 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test Resume) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000100 00000 n 
0000000242 00000 n 
0000000321 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
413
%%EOF`;

  // Create test image (1x1 PNG)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x00, 0x00, 0x37, 0x6E, 0xF9, 0x24, 0x00, 0x00, 0x00,
    0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x62, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
    0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  fs.writeFileSync(path.join(testDir, 'test-resume.pdf'), pdfContent);
  fs.writeFileSync(path.join(testDir, 'test-photo.png'), pngBuffer);
  fs.writeFileSync(path.join(testDir, 'test-logo.png'), pngBuffer);

  return {
    resume: path.join(testDir, 'test-resume.pdf'),
    photo: path.join(testDir, 'test-photo.png'),
    logo: path.join(testDir, 'test-logo.png')
  };
}

async function loginUser(credentials) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testResumeUpload(token, filePath) {
  try {
    const formData = new FormData();
    formData.append('resume', fs.createReadStream(filePath));

    const response = await axios.post(`${API_BASE_URL}/jobseeker/profile/resume`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    if (response.status === 200 && response.data.success) {
      logTest('Resume Upload', 'PASS', `File uploaded: ${response.data.resumeFileName}`);
      return response.data.resumeUrl;
    } else {
      logTest('Resume Upload', 'FAIL', `Status: ${response.status}`);
      return null;
    }
  } catch (error) {
    logTest('Resume Upload', 'FAIL', error.response?.data?.message || error.message);
    return null;
  }
}

async function testProfilePhotoUpload(token, filePath) {
  try {
    const formData = new FormData();
    formData.append('photo', fs.createReadStream(filePath));

    const response = await axios.post(`${API_BASE_URL}/jobseeker/profile/photo`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    if (response.status === 200 && response.data.success) {
      logTest('Profile Photo Upload', 'PASS', `Photo uploaded successfully`);
      return response.data.photoUrl;
    } else {
      logTest('Profile Photo Upload', 'FAIL', `Status: ${response.status}`);
      return null;
    }
  } catch (error) {
    logTest('Profile Photo Upload', 'FAIL', error.response?.data?.message || error.message);
    return null;
  }
}

async function testCompanyLogoUpload(token, filePath) {
  try {
    const formData = new FormData();
    formData.append('logo', fs.createReadStream(filePath));
    formData.append('name', 'Test Company');
    formData.append('industry', 'Technology');
    formData.append('location', 'Kingston, Jamaica');
    formData.append('description', 'A test company for file upload testing');
    
    // Debug: Log all fields being sent
    console.log('FormData fields being sent:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${typeof value === 'object' ? '[FILE]' : value}`);
    }

    const response = await axios.put(`${API_BASE_URL}/employer/company`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    if (response.status === 200 && response.data.success) {
      logTest('Company Logo Upload', 'PASS', `Logo uploaded successfully`);
      return response.data.data.company.logoUrl;
    } else {
      logTest('Company Logo Upload', 'FAIL', `Status: ${response.status}`);
      return null;
    }
  } catch (error) {
    logTest('Company Logo Upload', 'FAIL', error.response?.data?.message || error.message);
    return null;
  }
}

async function testFileAccess(fileUrl) {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}${fileUrl}`);
    
    if (response.status === 200) {
      logTest('File Access', 'PASS', `File accessible: ${fileUrl}`);
      return true;
    } else {
      logTest('File Access', 'FAIL', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('File Access', 'FAIL', error.message);
    return false;
  }
}

async function testInvalidFileUpload(token) {
  try {
    // Create a text file and try to upload as resume
    const testDir = path.join(__dirname, 'test-files');
    const invalidFile = path.join(testDir, 'invalid-resume.txt');
    fs.writeFileSync(invalidFile, 'This is not a PDF');

    const formData = new FormData();
    formData.append('resume', fs.createReadStream(invalidFile));

    const response = await axios.post(`${API_BASE_URL}/jobseeker/profile/resume`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    if (response.status >= 400) {
      logTest('Invalid File Validation', 'PASS', 'Rejected invalid file type');
    } else {
      logTest('Invalid File Validation', 'FAIL', 'Should reject non-PDF files');
    }

    // Clean up
    fs.unlinkSync(invalidFile);
  } catch (error) {
    if (error.response && error.response.status >= 400) {
      logTest('Invalid File Validation', 'PASS', 'Rejected invalid file type');
    } else {
      logTest('Invalid File Validation', 'FAIL', error.message);
    }
  }
}

async function runFileUploadTests() {
  console.log('🧪 JamDung Jobs File Upload Test Suite');
  console.log('=' .repeat(60));
  console.log(`🌐 Environment: ${TEST_ENV.toUpperCase()}`);
  console.log(`🔗 API: ${API_BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);
  console.log('=' .repeat(60));

  try {
    // Create test files
    console.log('\n📁 Creating test files...');
    const testFiles = await createTestFiles();

    // Test credentials
    const jobSeekerCredentials = {
      email: 'testjobseeker@jamdungjobs.com',
      password: 'Test@123'
    };

    const employerCredentials = {
      email: 'testemployer@jamdungjobs.com',
      password: 'Test@123'
    };

    // Login job seeker
    console.log('\n👤 Testing Job Seeker File Uploads...');
    const jobSeekerToken = await loginUser(jobSeekerCredentials);
    
    if (jobSeekerToken) {
      logTest('Job Seeker Login', 'PASS', 'Authentication successful');
      
      // Test resume upload
      const resumeUrl = await testResumeUpload(jobSeekerToken, testFiles.resume);
      
      // Test profile photo upload
      const photoUrl = await testProfilePhotoUpload(jobSeekerToken, testFiles.photo);
      
      // Test file access
      if (resumeUrl) {
        await testFileAccess(resumeUrl);
      }
      
      if (photoUrl) {
        await testFileAccess(photoUrl);
      }
      
      // Test invalid file upload
      await testInvalidFileUpload(jobSeekerToken);
    } else {
      logTest('Job Seeker Login', 'FAIL', 'Authentication failed');
    }

    // Login employer
    console.log('\n🏢 Testing Employer File Uploads...');
    const employerToken = await loginUser(employerCredentials);
    
    if (employerToken) {
      logTest('Employer Login', 'PASS', 'Authentication successful');
      
      // Test company logo upload
      const logoUrl = await testCompanyLogoUpload(employerToken, testFiles.logo);
      
      // Test file access
      if (logoUrl) {
        await testFileAccess(logoUrl);
      }
    } else {
      logTest('Employer Login', 'FAIL', 'Authentication failed');
    }

    // Clean up test files
    console.log('\n🧹 Cleaning up test files...');
    Object.values(testFiles).forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    const testDir = path.join(__dirname, 'test-files');
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir);
    }

  } catch (error) {
    logTest('Test Suite Error', 'FAIL', error.message);
  }

  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 FILE UPLOAD TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  const total = results.passed + results.failed;
  const successRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;
  console.log(`📊 Success Rate: ${successRate}%`);

  if (results.failed > 0) {
    console.log('\n🔍 FAILED TESTS:');
    results.tests
      .filter(test => test.status === 'FAIL')
      .forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.name} - ${test.message}`);
      });
  }

  console.log('\n📝 FILE UPLOAD READINESS:');
  if (successRate >= 80) {
    console.log('🟢 FILE UPLOADS READY - All core functionality working');
  } else if (successRate >= 60) {
    console.log('🟡 MOSTLY READY - Minor issues to fix');
  } else {
    console.log('🔴 NEEDS WORK - Major file upload issues');
  }

  console.log('=' .repeat(60));
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
if (require.main === module) {
  runFileUploadTests();
}

module.exports = { runFileUploadTests };
