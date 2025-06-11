#!/usr/bin/env node

/**
 * JamDung Jobs Scraper - Integration Test Script
 * 
 * This script tests the integration between the job scraper service and 
 * the main JamDung Jobs platform, focusing on Jamaica-specific enhancements.
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { validateJobs } from './src/validateJobs.js';
import { 
  categorizeJobIndustry,
  extractSkills,
  normalizeJamaicanLocation,
  estimateSalary
} from './src/utils/jamaicaJobUtils.js';
import { syncJobsToJamDung } from './src/syncToJamDung.js';

// Initialize dotenv
dotenv.config();

// Get current directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const JAMDUNG_API_URL = process.env.JAMDUNG_API_URL || 'http://localhost:5000';
const JAMDUNG_API_TOKEN = process.env.JAMDUNG_API_TOKEN;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Test Jamaica-specific enhancements on sample job data
 */
async function testJamaicanEnhancements() {
  console.log(`${colors.blue}Testing Jamaica-specific enhancements...${colors.reset}`);
  
  // Sample job data
  const sampleJobs = [
    {
      title: 'Software Developer',
      companyName: 'Tech Jamaica Ltd',
      location: 'kingston, jamaica',
      description: 'Looking for a skilled developer with experience in React, Node.js, and PostgreSQL.',
      url: 'https://example.com/job1',
      source: 'linkedin'
    },
    {
      title: 'Customer Service Representative',
      companyName: 'Call Center International',
      location: 'Montego Bay',
      description: 'Customer service position for a BPO in Montego Bay. Must have good communication skills.',
      url: 'https://example.com/job2',
      source: 'caribbeanjobs'
    },
    {
      title: 'Hotel Manager',
      companyName: 'Paradise Resort',
      location: 'Ocho Rios, St. Ann',
      description: 'Experienced hotel manager needed for luxury resort. Hospitality degree required.',
      url: 'https://example.com/job3',
      source: 'ejamjobs'
    }
  ];

  // Apply enhancements
  const enhancedJobs = sampleJobs.map(job => {
    const enhanced = { ...job };
    
    // Normalize location
    enhanced.location = normalizeJamaicanLocation(job.location);
    
    // Categorize industry
    enhanced.industry = categorizeJobIndustry(job.title, job.description);
    
    // Extract skills
    enhanced.skills = extractSkills(job.description);
    
    // Estimate salary if not provided
    if (!job.salary) {
      enhanced.salary = estimateSalary(job.title, enhanced.industry);
    }
    
    return enhanced;
  });

  // Save enhanced jobs
  const enhancedJobsFile = path.join(dataDir, 'enhanced-jobs.json');
  fs.writeFileSync(enhancedJobsFile, JSON.stringify(enhancedJobs, null, 2));
  console.log(`${colors.green}✓ Enhanced jobs saved to ${enhancedJobsFile}${colors.reset}`);
  
  // Print example
  console.log(`${colors.cyan}Example of enhanced job:${colors.reset}`);
  console.log(`- Original location: "${sampleJobs[0].location}" → Enhanced: "${enhancedJobs[0].location}"`);
  console.log(`- Industry: ${enhancedJobs[0].industry}`);
  console.log(`- Skills: ${enhancedJobs[0].skills.join(', ')}`);
  console.log(`- Estimated salary: $${enhancedJobs[0].salary.min.toLocaleString()} - $${enhancedJobs[0].salary.max.toLocaleString()} ${enhancedJobs[0].salary.currency}`);
  
  return enhancedJobs;
}

/**
 * Test job validation
 */
async function testValidation(jobs) {
  console.log(`\n${colors.blue}Testing job validation...${colors.reset}`);
  
  const validationResults = validateJobs(jobs);
  
  // Save validation results
  const validationFile = path.join(dataDir, 'validation-results.json');
  fs.writeFileSync(validationFile, JSON.stringify(validationResults, null, 2));
  console.log(`${colors.green}✓ Validation results saved to ${validationFile}${colors.reset}`);
  
  // Print stats
  console.log(`${colors.cyan}Validation stats:${colors.reset}`);
  console.log(`- Valid jobs: ${validationResults.valid.length}`);
  console.log(`- Invalid jobs: ${validationResults.invalid.length}`);
  console.log(`- Jobs with warnings: ${validationResults.warnings.length}`);
  
  return validationResults;
}

/**
 * Test API connection to JamDung Jobs platform
 */
async function testApiConnection() {
  console.log(`\n${colors.blue}Testing connection to JamDung Jobs API...${colors.reset}`);
  
  if (!JAMDUNG_API_TOKEN) {
    console.log(`${colors.red}✗ No API token provided. Set JAMDUNG_API_TOKEN in your .env file.${colors.reset}`);
    return false;
  }
  
  try {
    const response = await axios.get(`${JAMDUNG_API_URL}/api/health`, {
      headers: {
        'Authorization': `Bearer ${JAMDUNG_API_TOKEN}`
      }
    });
    
    if (response.status === 200) {
      console.log(`${colors.green}✓ Successfully connected to JamDung Jobs API${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ API responded with status ${response.status}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Failed to connect to JamDung Jobs API: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test job synchronization to JamDung Jobs platform
 */
async function testJobSync(jobs) {
  console.log(`\n${colors.blue}Testing job synchronization to JamDung Jobs platform...${colors.reset}`);
  
  if (!await testApiConnection()) {
    console.log(`${colors.yellow}⚠ Skipping synchronization test due to API connection failure${colors.reset}`);
    return;
  }
  
  try {
    // Only sync valid jobs
    const validJobs = jobs.filter(job => {
      // Simple validation for testing
      return job.title && job.companyName && job.location && job.description;
    });
    
    if (validJobs.length === 0) {
      console.log(`${colors.yellow}⚠ No valid jobs to synchronize${colors.reset}`);
      return;
    }
    
    console.log(`${colors.cyan}Attempting to sync ${validJobs.length} jobs...${colors.reset}`);
    
    // Use the syncToJamDung module
    const syncResults = await syncJobsToJamDung(validJobs);
    
    // Save sync results
    const syncResultsFile = path.join(dataDir, 'sync-results.json');
    fs.writeFileSync(syncResultsFile, JSON.stringify(syncResults, null, 2));
    console.log(`${colors.green}✓ Sync results saved to ${syncResultsFile}${colors.reset}`);
    
    // Print stats
    console.log(`${colors.cyan}Sync stats:${colors.reset}`);
    console.log(`- Successfully synced: ${syncResults.success.length}`);
    console.log(`- Failed to sync: ${syncResults.failed.length}`);
    
    return syncResults;
  } catch (error) {
    console.log(`${colors.red}✗ Job synchronization failed: ${error.message}${colors.reset}`);
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log(`${colors.green}=== JamDung Jobs Scraper Integration Test ====${colors.reset}\n`);
  
  try {
    // Test Jamaica-specific enhancements
    const enhancedJobs = await testJamaicanEnhancements();
    
    // Test validation
    const validationResults = await testValidation(enhancedJobs);
    
    // Test synchronization to JamDung Jobs platform
    if (validationResults.valid.length > 0) {
      await testJobSync(validationResults.valid);
    }
    
    console.log(`\n${colors.green}=== Integration test completed ====${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error during testing: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the tests
runTests();
