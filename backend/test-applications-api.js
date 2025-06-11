const axios = require('axios');

// Set up axios with the same configuration as the frontend
const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Set the JWT token in the Authorization header
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE4Y2UzZjMyLWNjNmUtNDgzYS1iYTQ5LWQ5MGQxZTAyNjFiZiIsImVtYWlsIjoidGVzdGpvYnNlZWtlckBqYW1kdW5nam9icy5jb20iLCJyb2xlIjoiSk9CU0VFS0VSIiwiaWF0IjoxNzQ4ODgyOTEwLCJleHAiOjE3NDg5NjkzMTB9.WaXux3kDysbAzd2OBoBmfoEySnKSBKijkQ47N15NkbI';
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Test both endpoints
async function testEndpoints() {
  console.log('Testing /applications/my endpoint...');
  try {
    const response1 = await api.get('/applications/my');
    console.log('SUCCESS: /applications/my returned:', {
      status: response1.status,
      hasApplications: Array.isArray(response1.data.applications),
      applicationCount: response1.data.applications?.length || 0
    });
    if (response1.data.applications && response1.data.applications.length > 0) {
      const firstApp = response1.data.applications[0];
      console.log('First application:', {
        id: firstApp.id,
        jobTitle: firstApp.job?.title,
        company: firstApp.job?.company?.name,
        status: firstApp.status
      });
    }
  } catch (error) {
    console.error('ERROR with /applications/my:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
  
  console.log('\nTesting /api/applications endpoint...');
  try {
    const response2 = await api.get('/api/applications');
    console.log('SUCCESS: /api/applications returned:', {
      status: response2.status,
      hasApplications: Array.isArray(response2.data.applications),
      applicationCount: response2.data.applications?.length || 0
    });
    if (response2.data.applications && response2.data.applications.length > 0) {
      const firstApp = response2.data.applications[0];
      console.log('First application:', {
        id: firstApp.id,
        jobTitle: firstApp.job?.title,
        company: firstApp.job?.company?.name,
        status: firstApp.status
      });
    }
  } catch (error) {
    console.error('ERROR with /api/applications:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

testEndpoints().catch(console.error);
