#!/usr/bin/env node

/**
 * JamDung Jobs Scraper - Enhancement Demonstration
 * 
 * This script demonstrates the Jamaica-specific enhancements applied to job listings.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Jamaica-specific enhancement functions
// These would normally be imported from jamaicaJobUtils.js

/**
 * Normalize Jamaican location names
 */
function normalizeJamaicanLocation(location) {
  if (!location) return 'Jamaica';
  
  // Convert to lowercase and remove extra spaces
  let normalized = location.toLowerCase().trim();
  
  // Handle common variations of Kingston
  if (normalized.includes('kingston') || normalized.includes('kgn')) {
    normalized = 'Kingston, Jamaica';
  }
  // Handle common variations of Montego Bay
  else if (normalized.includes('montego bay') || normalized.includes('mobay')) {
    normalized = 'Montego Bay, St. James';
  }
  // Handle Ocho Rios
  else if (normalized.includes('ocho rios')) {
    normalized = 'Ocho Rios, St. Ann';
  }
  // Handle St. Elizabeth
  else if (normalized.includes('st elizabeth') || normalized.includes('saint elizabeth')) {
    normalized = 'St. Elizabeth, Jamaica';
  }
  // Handle New Kingston (part of Kingston)
  else if (normalized.includes('new kingston')) {
    normalized = 'New Kingston, Kingston, Jamaica';
  }
  
  // Ensure "Jamaica" is included if not already present
  if (!normalized.includes('jamaica')) {
    normalized += ', Jamaica';
  }
  
  return normalized;
}

/**
 * Categorize job into Jamaican industry sectors
 */
function categorizeJobIndustry(title, description) {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  
  // Tourism and Hospitality
  if (
    titleLower.includes('hotel') || 
    titleLower.includes('tourism') || 
    titleLower.includes('resort') ||
    titleLower.includes('hospitality') ||
    descLower.includes('hotel') || 
    descLower.includes('resort') || 
    descLower.includes('guest')
  ) {
    return 'Tourism and Hospitality';
  }
  
  // BPO and Customer Service
  if (
    titleLower.includes('customer service') || 
    titleLower.includes('call center') || 
    titleLower.includes('representative') ||
    descLower.includes('bpo') || 
    descLower.includes('call center') || 
    descLower.includes('customer service')
  ) {
    return 'Business Process Outsourcing';
  }
  
  // Technology
  if (
    titleLower.includes('developer') || 
    titleLower.includes('software') || 
    titleLower.includes('it ') ||
    titleLower.includes('tech') ||
    descLower.includes('javascript') || 
    descLower.includes('programming') || 
    descLower.includes('software')
  ) {
    return 'Information Technology';
  }
  
  // Agriculture
  if (
    titleLower.includes('farm') || 
    titleLower.includes('agriculture') || 
    titleLower.includes('crop') ||
    descLower.includes('farm') || 
    descLower.includes('agriculture') || 
    descLower.includes('crop')
  ) {
    return 'Agriculture';
  }
  
  // Marketing and Creative
  if (
    titleLower.includes('marketing') || 
    titleLower.includes('creative') || 
    titleLower.includes('design') ||
    descLower.includes('marketing') || 
    descLower.includes('creative') || 
    descLower.includes('content creation')
  ) {
    return 'Marketing and Creative';
  }
  
  return 'General';
}

/**
 * Extract skills from job description
 */
function extractSkills(description) {
  if (!description) return [];
  
  const skills = [];
  const descLower = description.toLowerCase();
  
  // Technical skills
  const techSkills = [
    'javascript', 'react', 'node.js', 'postgresql', 'database',
    'software', 'programming', 'agile', 'web development'
  ];
  
  // Soft skills
  const softSkills = [
    'communication', 'leadership', 'problem-solving', 'teamwork',
    'customer service', 'management', 'collaboration'
  ];
  
  // Jamaica-specific skills
  const jamaicanSkills = [
    'patois', 'jamaican culture', 'local market knowledge',
    'caribbean', 'hospitality', 'tourism', 'call center',
    'tropical agriculture', 'sustainable farming'
  ];
  
  // Check for skills in description
  [...techSkills, ...softSkills, ...jamaicanSkills].forEach(skill => {
    if (descLower.includes(skill.toLowerCase())) {
      // Capitalize first letter of each word
      const formattedSkill = skill.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      skills.push(formattedSkill);
    }
  });
  
  return skills;
}

/**
 * Estimate salary based on Jamaican market data
 */
function estimateSalary(title, industry) {
  const titleLower = title.toLowerCase();
  
  // Default salary range in JMD
  let min = 70000;
  let max = 100000;
  
  // Technology jobs
  if (
    titleLower.includes('developer') || 
    titleLower.includes('software') || 
    titleLower.includes('engineer')
  ) {
    min = 150000;
    max = 300000;
  }
  
  // Management positions
  else if (
    titleLower.includes('manager') || 
    titleLower.includes('director') || 
    titleLower.includes('lead')
  ) {
    min = 200000;
    max = 400000;
  }
  
  // Customer service / BPO
  else if (
    titleLower.includes('customer service') || 
    titleLower.includes('representative') || 
    titleLower.includes('agent')
  ) {
    min = 60000;
    max = 90000;
  }
  
  // Agricultural positions
  else if (
    titleLower.includes('farm') || 
    titleLower.includes('agriculture') || 
    titleLower.includes('technician')
  ) {
    min = 65000;
    max = 120000;
  }
  
  // Marketing positions
  else if (
    titleLower.includes('marketing') || 
    titleLower.includes('creative') || 
    titleLower.includes('specialist')
  ) {
    min = 100000;
    max = 180000;
  }
  
  // Adjust based on industry
  if (industry === 'Information Technology') {
    min *= 1.2;
    max *= 1.2;
  } else if (industry === 'Tourism and Hospitality') {
    min *= 1.1;
    max *= 1.1;
  } else if (industry === 'Business Process Outsourcing') {
    min *= 0.9;
    max *= 0.9;
  }
  
  return {
    min: Math.round(min),
    max: Math.round(max),
    currency: 'JMD',
    period: 'monthly'
  };
}

/**
 * Validate job data
 */
function validateJob(job) {
  const errors = [];
  const warnings = [];
  
  // Check required fields
  if (!job.title) errors.push('Missing job title');
  if (!job.companyName) errors.push('Missing company name');
  if (!job.location) errors.push('Missing location');
  if (!job.description) errors.push('Missing description');
  
  // Check for spam keywords
  const spamKeywords = ['work from home', 'earn money fast', 'no experience needed'];
  spamKeywords.forEach(keyword => {
    if (job.title.toLowerCase().includes(keyword)) {
      warnings.push(`Potential spam keyword in title: "${keyword}"`);
    }
  });
  
  // Validate location is in Jamaica
  if (job.location && !job.location.toLowerCase().includes('jamaica')) {
    warnings.push('Job location may not be in Jamaica');
  }
  
  // Validate description length
  if (job.description && job.description.length < 50) {
    warnings.push('Job description is too short');
  }
  
  return { errors, warnings, isValid: errors.length === 0 };
}

/**
 * Main function to demonstrate enhancements
 */
async function demonstrateEnhancements() {
  console.log(`${colors.green}=== JamDung Jobs Jamaica-Specific Enhancements Demo ====${colors.reset}\n`);
  
  try {
    // Load sample jobs
    const sampleJobsPath = path.join(__dirname, 'data', 'sample-jobs.json');
    const sampleJobs = JSON.parse(fs.readFileSync(sampleJobsPath, 'utf8'));
    
    console.log(`${colors.blue}Loaded ${sampleJobs.length} sample jobs${colors.reset}\n`);
    
    // Process each job
    const enhancedJobs = sampleJobs.map(job => {
      console.log(`${colors.yellow}Processing job: ${job.title} at ${job.companyName}${colors.reset}`);
      
      // Create enhanced job object
      const enhanced = { ...job };
      
      // 1. Normalize location
      console.log(`  Location: "${job.location}" → `);
      enhanced.location = normalizeJamaicanLocation(job.location);
      console.log(`  ${colors.green}Normalized: "${enhanced.location}"${colors.reset}`);
      
      // 2. Categorize industry
      console.log(`  Industry: `);
      enhanced.industry = categorizeJobIndustry(job.title, job.description);
      console.log(`  ${colors.green}Categorized: "${enhanced.industry}"${colors.reset}`);
      
      // 3. Extract skills
      console.log(`  Skills: `);
      enhanced.skills = extractSkills(job.description);
      console.log(`  ${colors.green}Extracted: ${enhanced.skills.join(', ')}${colors.reset}`);
      
      // 4. Estimate salary
      console.log(`  Salary: `);
      enhanced.salary = estimateSalary(job.title, enhanced.industry);
      console.log(`  ${colors.green}Estimated: $${enhanced.salary.min.toLocaleString()} - $${enhanced.salary.max.toLocaleString()} ${enhanced.salary.currency} (${enhanced.salary.period})${colors.reset}`);
      
      // 5. Validate job
      console.log(`  Validation: `);
      const validation = validateJob(enhanced);
      if (validation.isValid) {
        console.log(`  ${colors.green}Valid: Yes${colors.reset}`);
      } else {
        console.log(`  ${colors.red}Valid: No - ${validation.errors.join(', ')}${colors.reset}`);
      }
      
      if (validation.warnings.length > 0) {
        console.log(`  ${colors.yellow}Warnings: ${validation.warnings.join(', ')}${colors.reset}`);
      }
      
      console.log(''); // Empty line for separation
      
      return {
        ...enhanced,
        validation
      };
    });
    
    // Save enhanced jobs
    const outputPath = path.join(__dirname, 'data', 'enhanced-jobs.json');
    fs.writeFileSync(outputPath, JSON.stringify(enhancedJobs, null, 2));
    console.log(`${colors.green}Enhanced jobs saved to ${outputPath}${colors.reset}\n`);
    
    // Summary
    console.log(`${colors.magenta}=== Enhancement Summary ====${colors.reset}`);
    console.log(`${colors.cyan}Total jobs processed: ${enhancedJobs.length}${colors.reset}`);
    
    // Count by industry
    const industriesCounts = {};
    enhancedJobs.forEach(job => {
      industriesCounts[job.industry] = (industriesCounts[job.industry] || 0) + 1;
    });
    
    console.log(`${colors.cyan}Jobs by industry:${colors.reset}`);
    Object.entries(industriesCounts).forEach(([industry, count]) => {
      console.log(`  - ${industry}: ${count}`);
    });
    
    // Count valid/invalid
    const validCount = enhancedJobs.filter(job => job.validation.isValid).length;
    console.log(`${colors.cyan}Valid jobs: ${validCount}/${enhancedJobs.length}${colors.reset}`);
    
    console.log(`\n${colors.green}=== Demo completed successfully ====${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error during demonstration: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the demonstration
demonstrateEnhancements();
