// Simple HTTP request using Node.js built-in http module
const http = require('http');

const testEndpoint = (endpoint) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliOGNjZjNhLTU0ZWMtNDY5Mi05ZjZkLWYxYTUwOTExYjYwMCIsInJvbGUiOiJKT0JTRUVLRVIiLCJpYXQiOjE3NDk0ODUxMDUsImV4cCI6MTc0OTU3MTUwNX0.uguRTuctMc522s5-IqQfQ7wYHpl4KqpZ6QTR6G9anWE'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`\nTesting endpoint: ${endpoint}`);
      console.log(`Status: ${res.statusCode} ${http.STATUS_CODES[res.statusCode]}`);
      console.log('Headers:', JSON.stringify(res.headers, null, 2));
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          console.log('Response body:', JSON.stringify(parsedData, null, 2));
          if (res.statusCode >= 400) {
            console.error('Error:', parsedData.message || 'Unknown error');
          }
          resolve(parsedData);
        } catch (e) {
          console.log('Raw response:', data);
          if (res.statusCode >= 400) {
            console.error('Error: Could not parse response as JSON');
          }
          resolve(data);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);
      reject(e);
    });

    req.end();
  });
};

const main = async () => {
  try {
    console.log('\n=== Testing Job Application Endpoints ===');
    
    // Test applications endpoints
    await testEndpoint('/api/applications/my');
    await testEndpoint('/api/applications');
    
    // Additional test endpoints
    console.log('\n=== Testing Job Search Endpoints ===');
    await testEndpoint('/api/jobs/search?query=developer');
    await testEndpoint('/api/jobs/filters');
  } catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  }
};

main().catch(console.error);
