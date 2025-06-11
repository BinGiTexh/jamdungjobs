#!/usr/bin/env node

/**
 * Display enhanced jobs in a tabular format
 * This script reads the enhanced-jobs.json file and displays the data in a table
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the enhanced jobs file
const enhancedJobsPath = path.join(__dirname, 'data', 'enhanced-jobs.json');

// Function to create a table row with fixed column widths
function formatTableRow(columns, widths) {
  return columns.map((col, i) => {
    const value = col === null || col === undefined ? '' : String(col);
    return value.padEnd(widths[i]);
  }).join(' | ');
}

// Function to create a separator line
function createSeparator(widths) {
  return widths.map(w => '-'.repeat(w)).join('-+-');
}

// Main function to display jobs in a table
async function displayJobsTable() {
  try {
    // Check if the enhanced jobs file exists
    if (!fs.existsSync(enhancedJobsPath)) {
      console.error('\x1b[31mEnhanced jobs file not found. Please run the demo first.\x1b[0m');
      return;
    }

    // Read the enhanced jobs file
    const jobsData = JSON.parse(fs.readFileSync(enhancedJobsPath, 'utf8'));
    
    if (!Array.isArray(jobsData) || jobsData.length === 0) {
      console.error('\x1b[31mNo jobs found in the enhanced jobs file.\x1b[0m');
      return;
    }

    // Define column headers and widths
    const headers = ['Title', 'Company', 'Location', 'Industry', 'Salary Range (JMD)', 'Skills'];
    const widths = [30, 25, 30, 25, 25, 50];
    
    // Print table header
    console.log('\x1b[32m=== JamDung Jobs - Enhanced Jobs Table ===\x1b[0m');
    console.log();
    console.log(formatTableRow(headers, widths));
    console.log(createSeparator(widths));
    
    // Print each job row
    jobsData.forEach(job => {
      const salaryRange = `${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} ${job.salary.currency}`;
      const skills = job.skills.slice(0, 3).join(', ') + (job.skills.length > 3 ? '...' : '');
      
      const row = [
        job.title,
        job.companyName,
        job.location,
        job.industry,
        salaryRange,
        skills
      ];
      
      console.log(formatTableRow(row, widths));
    });
    
    console.log();
    console.log(`\x1b[34mTotal jobs: ${jobsData.length}\x1b[0m`);
    
  } catch (error) {
    console.error('\x1b[31mError displaying jobs table:', error.message, '\x1b[0m');
  }
}

// Run the function
displayJobsTable();
