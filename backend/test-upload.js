const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const path = require('path');

// When running inside the API container, use localhost
const API_URL = 'http://localhost:5000';

// Ensure upload directories exist
const uploadDir = path.join(__dirname, 'uploads/profile-photos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function testUpload() {
  // Define testFilePath at the function scope so it's available in finally block
  const testFilePath = path.join(__dirname, 'test_profile.jpg');
  
  try {
    // Create a test image file
    const testImageData = Buffer.from('R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=', 'base64');
    fs.writeFileSync(testFilePath, testImageData);

    console.log('Test file created at:', testFilePath);
    console.log('API URL:', API_URL);

    const form = new FormData();
    form.append('photo', fs.createReadStream(testFilePath));

    console.log('Starting file upload test...');
    console.log('Form data created with headers:', form.getHeaders());

    // Add a delay to ensure the file stream is ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await axios.post(`${API_URL}/api/jobseeker/profile/photo`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNmMTg4YmVhLWQyNmYtNDdlNS1hYThkLTQwZmMxMzhmODRmNyIsInJvbGUiOiJKT0JTRUVLRVIiLCJpYXQiOjE3NDk0ODU0NjIsImV4cCI6MTc0OTU3MTg2Mn0.w0RTW8lc72er5ogZRnFGmf0HXHj0HOIbnkhsZIWNCwQ'
      },
      // Increase timeout to handle potential slow responses
      timeout: 10000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('Upload successful:', response.data);

    // Test if the file is accessible
    const photoUrl = response.data.photoUrl;
    console.log('Trying to access uploaded file at:', `${API_URL}${photoUrl}`);
    
    const accessResponse = await axios.get(`${API_URL}${photoUrl}`, {
      responseType: 'arraybuffer'
    });
    console.log('File is accessible:', accessResponse.status === 200);
    console.log('File size:', accessResponse.headers['content-length']);
    console.log('Content type:', accessResponse.headers['content-type']);

  } catch (error) {
    console.error('Upload failed:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
  } finally {
    // Clean up test file
    try {
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
        console.log('Test file cleaned up successfully');
      }
    } catch (err) {
      console.error('Error cleaning up test file:', err);
      console.error('Path attempted:', testFilePath);
    }
  }
}

testUpload();

