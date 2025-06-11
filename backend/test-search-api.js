/**
 * Test script for Search Enhancement API
 * 
 * This script tests the enhanced search endpoints using curl commands
 */

const { execSync } = require('child_process');

// Configuration
const API_URL = 'http://localhost:5000/api';

// Helper function to run curl commands and format output
function runCurl(command) {
  console.log(`\n> ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    try {
      // Try to parse and pretty print JSON response
      const jsonOutput = JSON.parse(output);
      console.log(JSON.stringify(jsonOutput, null, 2));
      return jsonOutput;
    } catch (e) {
      // If not JSON, return raw output
      console.log(output);
      return output;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.stdout) console.log(`Output: ${error.stdout}`);
    if (error.stderr) console.error(`Error output: ${error.stderr}`);
    return null;
  }
}

// Test search endpoints
function testSearchEndpoints() {
  console.log('\n=== TESTING SEARCH ENHANCEMENT ENDPOINTS ===\n');
  
  // 1. Basic job search
  console.log('\n1. Basic job search');
  runCurl(`curl -s -X GET "${API_URL}/jobs/search"`);
  
  // 2. Search with query
  console.log('\n2. Search with text query');
  runCurl(`curl -s -X GET "${API_URL}/jobs/search?query=developer"`);
  
  // 3. Search with location filter
  console.log('\n3. Search with location filter');
  runCurl(`curl -s -X GET "${API_URL}/jobs/search?location=kingston"`);
  
  // 4. Search with job type filter
  console.log('\n4. Search with job type filter');
  runCurl(`curl -s -X GET "${API_URL}/jobs/search?type=FULL_TIME"`);
  
  // 5. Search with multiple filters
  console.log('\n5. Search with multiple filters');
  runCurl(`curl -s -X GET "${API_URL}/jobs/search?query=developer&location=kingston&type=FULL_TIME"`);
  
  // 6. Get filter options
  console.log('\n6. Get filter options');
  runCurl(`curl -s -X GET "${API_URL}/jobs/filters"`);
}

// Test job recommendations
function testRecommendationsEndpoints() {
  console.log('\n=== TESTING JOB RECOMMENDATIONS ENDPOINTS ===\n');
  
  // 1. Get job recommendations (requires authentication)
  console.log('\n1. Get job recommendations (requires authentication)');
  const JOBSEEKER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE4Y2UzZjMyLWNjNmUtNDgzYS1iYTQ5LWQ5MGQxZTAyNjFiZiIsImVtYWlsIjoidGVzdGpvYnNlZWtlckBqYW1kdW5nam9icy5jb20iLCJyb2xlIjoiSk9CU0VFS0VSIiwiaWF0IjoxNzQ4ODgyOTEwLCJleHAiOjE3NDg5NjkzMTB9.WaXux3kDysbAzd2OBoBmfoEySnKSBKijkQ47N15NkbI';
  runCurl(`curl -s -X GET "${API_URL}/jobseeker/recommendations" -H "Authorization: Bearer ${JOBSEEKER_TOKEN}"`);
}

// Main test function
async function runTests() {
  console.log('=== SEARCH ENHANCEMENT API TEST ===');
  console.log('Testing API endpoints with curl commands\n');
  
  // Run search tests
  testSearchEndpoints();
  
  // Run recommendations tests
  testRecommendationsEndpoints();
  
  console.log('\n=== TEST COMPLETE ===');
}

// Run the tests
runTests().catch(console.error);
