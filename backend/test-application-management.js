/**
 * Test script for Application Management API
 * 
 * This script tests the application management endpoints using curl commands
 * It demonstrates how to use the API for both employers and job seekers
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:5000/api';
const EMPLOYER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVtcGxveWVyLWlkIiwiZW1haWwiOiJ0ZXN0ZW1wbG95ZXJAamFtZHVuZ2pvYnMuY29tIiwicm9sZSI6IkVNUExPWUVSIiwiaWF0IjoxNzQ4ODgyOTEwLCJleHAiOjE3NDg5NjkzMTB9.WaXux3kDysbAzd2OBoBmfoEySnKSBKijkQ47N15NkbI';
const JOBSEEKER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE4Y2UzZjMyLWNjNmUtNDgzYS1iYTQ5LWQ5MGQxZTAyNjFiZiIsImVtYWlsIjoidGVzdGpvYnNlZWtlckBqYW1kdW5nam9icy5jb20iLCJyb2xlIjoiSk9CU0VFS0VSIiwiaWF0IjoxNzQ4ODgyOTEwLCJleHAiOjE3NDg5NjkzMTB9.WaXux3kDysbAzd2OBoBmfoEySnKSBKijkQ47N15NkbI';

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

// Test employer endpoints
function testEmployerEndpoints() {
  console.log('\n=== TESTING EMPLOYER ENDPOINTS ===\n');
  
  // 1. List all applications for employer
  console.log('\n1. List all applications for employer');
  runCurl(`curl -s -X GET "${API_URL}/employer/applications" -H "Authorization: Bearer ${EMPLOYER_TOKEN}"`);
  
  // 2. List applications with status filter
  console.log('\n2. List applications with status filter (PENDING)');
  runCurl(`curl -s -X GET "${API_URL}/employer/applications?status=PENDING" -H "Authorization: Bearer ${EMPLOYER_TOKEN}"`);
  
  // 3. Get application details
  console.log('\n3. Get application details (replace with actual ID)');
  runCurl(`curl -s -X GET "${API_URL}/employer/applications/application-id-here" -H "Authorization: Bearer ${EMPLOYER_TOKEN}"`);
  
  // 4. Update application status
  console.log('\n4. Update application status (replace with actual ID)');
  runCurl(`curl -s -X PATCH "${API_URL}/employer/applications/application-id-here/status" -H "Authorization: Bearer ${EMPLOYER_TOKEN}" -H "Content-Type: application/json" -d '{"status": "SHORTLISTED"}'`);
}

// Test jobseeker endpoints
function testJobseekerEndpoints() {
  console.log('\n=== TESTING JOBSEEKER ENDPOINTS ===\n');
  
  // 1. List all applications for jobseeker
  console.log('\n1. List all applications for jobseeker');
  runCurl(`curl -s -X GET "${API_URL}/jobseeker/applications" -H "Authorization: Bearer ${JOBSEEKER_TOKEN}"`);
  
  // 2. List applications with status filter
  console.log('\n2. List applications with status filter (PENDING)');
  runCurl(`curl -s -X GET "${API_URL}/jobseeker/applications?status=PENDING" -H "Authorization: Bearer ${JOBSEEKER_TOKEN}"`);
}

// Main test function
async function runTests() {
  console.log('=== APPLICATION MANAGEMENT API TEST ===');
  console.log('Testing API endpoints with curl commands\n');
  
  // Run employer tests
  testEmployerEndpoints();
  
  // Run jobseeker tests
  testJobseekerEndpoints();
  
  console.log('\n=== TEST COMPLETE ===');
}

// Run the tests
runTests().catch(console.error);
