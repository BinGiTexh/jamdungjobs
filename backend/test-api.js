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
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE4Y2UzZjMyLWNjNmUtNDgzYS1iYTQ5LWQ5MGQxZTAyNjFiZiIsImVtYWlsIjoidGVzdGpvYnNlZWtlckBqYW1kdW5nam9icy5jb20iLCJyb2xlIjoiSk9CU0VFS0VSIiwiaWF0IjoxNzQ4ODgyOTEwLCJleHAiOjE3NDg5NjkzMTB9.WaXux3kDysbAzd2OBoBmfoEySnKSBKijkQ47N15NkbI'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          console.log('RESPONSE BODY (parsed):', JSON.stringify(parsedData, null, 2).substring(0, 500) + '...');
          resolve(parsedData);
        } catch (e) {
          console.log('RESPONSE BODY (raw):', data.substring(0, 500) + '...');
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
  console.log('\n--- Testing /applications/my endpoint ---');
  await testEndpoint('/applications/my');
  
  console.log('\n--- Testing /api/applications endpoint ---');
  await testEndpoint('/api/applications');
};

main().catch(console.error);
