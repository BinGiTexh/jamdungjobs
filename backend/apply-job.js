// Simple Node.js script to apply for a job
const fs = require('fs');
const http = require('http');
const path = require('path');

// Configuration
const jobId = '7f54ee6a-02f1-4285-802d-d40c50204192';
const jwtToken = process.env.JWT_TOKEN || '';
const coverLetter = 'This is a test cover letter for the job application.';

// Create a test resume file if it doesn't exist
const resumePath = '/tmp/test_resume.pdf';
fs.writeFileSync(resumePath, 'This is a test resume content');

// Function to create a multipart/form-data request
function applyForJob() {
  // Generate a boundary for multipart form data
  const boundary = '----' + Math.random().toString(36).substring(2);
  
  // Prepare form data
  let formData = '';
  
  // Add cover letter field
  formData += `--${boundary}\r\n`;
  formData += 'Content-Disposition: form-data; name="coverLetter"\r\n\r\n';
  formData += `${coverLetter}\r\n`;
  
  // Add resume file
  const resumeContent = fs.readFileSync(resumePath);
  formData += `--${boundary}\r\n`;
  formData += 'Content-Disposition: form-data; name="resume"; filename="test_resume.pdf"\r\n';
  formData += 'Content-Type: application/pdf\r\n\r\n';
  
  // Create a Buffer for the complete request
  const dataStart = Buffer.from(formData, 'utf8');
  const dataEnd = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
  const fileBuffer = Buffer.from(resumeContent);
  
  const multipartBody = Buffer.concat([
    dataStart,
    fileBuffer,
    dataEnd
  ]);
  
  // Setup HTTP request options
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/jobs/${jobId}/apply`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': multipartBody.length
    }
  };
  
  // Send the request
  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Response body:', responseData);
    });
  });
  
  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });
  
  // Write data to request body
  req.write(multipartBody);
  req.end();
}

// Run the application
console.log('Applying for job...');
applyForJob();
