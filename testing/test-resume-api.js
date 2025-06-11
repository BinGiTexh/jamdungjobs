// Simple script to test the resume API endpoint

const axios = require('axios');

// Get the token from command line or use a default test token
const token = process.argv[2] || 'YOUR_TEST_TOKEN';

console.log('Using token:', token.substring(0, 10) + '...');

// Make a direct API call with explicit authorization header
axios.get('http://localhost:5000/api/candidate/resume', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => {
  console.log('API call successful!');
  console.log('Resume filename:', response.data.resumeFileName);
  console.log('Resume URL exists:', !!response.data.resumeUrl);
  console.log('Resume URL starts with:', response.data.resumeUrl.substring(0, 30) + '...');
})
.catch(error => {
  console.error('API call failed:', error.message);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  }
});
