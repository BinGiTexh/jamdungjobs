import { scrapeLinkedIn } from './src/scrapers/linkedin.js';
import { scrapeCaribbeanJobs } from './src/scrapers/caribbeanjobs.js';
import { scrapeEJamJobs } from './src/scrapers/ejamjobs.js';
import { validateJobs } from './src/validateJobs.js';
import { categorizeJamaicanJob, normalizeJamaicanLocation, extractJamaicanSkills } from './src/utils/jamaicaJobUtils.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a test function that runs a single scraper and saves results to a JSON file
async function testScraper(scraperFn, name) {
  console.log(`Testing ${name} scraper...`);
  try {
    // Run the scraper
    const startTime = new Date();
    console.log(`${name} scraper started at ${startTime.toISOString()}`);
    
    const jobs = await scraperFn();
    
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    console.log(`${name} scraper completed in ${duration} seconds`);
    console.log(`Found ${jobs.length} jobs`);
    
    // Save results to a file
    const outputDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputFile = path.join(outputDir, `${name}-jobs.json`);
    fs.writeFileSync(outputFile, JSON.stringify(jobs, null, 2));
    
    console.log(`Results saved to ${outputFile}`);
    return jobs;
  } catch (error) {
    console.error(`Error testing ${name} scraper:`, error);
    return [];
  }
}

// Function to test Jamaica-specific enhancements
async function testJamaicanEnhancements(jobs) {
  console.log('\nTesting Jamaica-specific enhancements...');
  
  const enhancedJobs = jobs.map(job => {
    // Apply Jamaica-specific enhancements
    const industry = categorizeJamaicanJob(job.title, job.description);
    const normalizedLocation = normalizeJamaicanLocation(job.location);
    const extractedSkills = extractJamaicanSkills(job.description);
    
    return {
      ...job,
      industry,
      location: normalizedLocation,
      skills: job.skills || extractedSkills
    };
  });
  
  // Save enhanced jobs to file
  const outputDir = path.join(process.cwd(), 'data');
  const outputFile = path.join(outputDir, 'enhanced-jobs.json');
  fs.writeFileSync(outputFile, JSON.stringify(enhancedJobs, null, 2));
  
  console.log(`Enhanced ${enhancedJobs.length} jobs with Jamaica-specific information`);
  console.log(`Results saved to ${outputFile}`);
  
  return enhancedJobs;
}

// Function to test job validation
async function testValidation(jobs) {
  console.log('\nTesting job validation...');
  
  const validationResults = validateJobs(jobs);
  
  // Save validation results to file
  const outputDir = path.join(process.cwd(), 'data');
  const outputFile = path.join(outputDir, 'validation-results.json');
  fs.writeFileSync(outputFile, JSON.stringify(validationResults, null, 2));
  
  console.log('Validation results:');
  console.log(`- Valid: ${validationResults.valid.length}`);
  console.log(`- Warnings: ${validationResults.warnings.length}`);
  console.log(`- Invalid: ${validationResults.invalid.length}`);
  console.log(`Results saved to ${outputFile}`);
  
  return validationResults;
}

// Main test function
async function runTests() {
  console.log('Starting scraper tests...');
  
  // Test each scraper individually
  const linkedinJobs = await testScraper(scrapeLinkedIn, 'linkedin');
  const caribbeanJobs = await testScraper(scrapeCaribbeanJobs, 'caribbeanjobs');
  const ejamJobs = await testScraper(scrapeEJamJobs, 'ejamjobs');
  
  // Combine all results with source attribution
  const allJobs = [
    ...linkedinJobs.map(job => ({ ...job, source: 'linkedin' })),
    ...caribbeanJobs.map(job => ({ ...job, source: 'caribbeanjobs' })),
    ...ejamJobs.map(job => ({ ...job, source: 'ejamjobs' }))
  ];
  
  // Save combined results
  const outputDir = path.join(process.cwd(), 'data');
  const allJobsFile = path.join(outputDir, 'all-jobs.json');
  fs.writeFileSync(allJobsFile, JSON.stringify(allJobs, null, 2));
  console.log(`Combined results saved to ${allJobsFile}`);
  
  // Test Jamaica-specific enhancements
  const enhancedJobs = await testJamaicanEnhancements(allJobs);
  
  // Test validation
  const validationResults = await testValidation(enhancedJobs);
  
  console.log('\nTest Summary:');
  console.log(`Total jobs found: ${allJobs.length}`);
  console.log(`- LinkedIn: ${linkedinJobs.length}`);
  console.log(`- CaribbeanJobs: ${caribbeanJobs.length}`);
  console.log(`- EJamJobs: ${ejamJobs.length}`);
  console.log(`\nEnhanced with Jamaica-specific information: ${enhancedJobs.length}`);
  console.log(`\nValidation results:`);
  console.log(`- Valid: ${validationResults.valid.length}`);
  console.log(`- Warnings: ${validationResults.warnings.length}`);
  console.log(`- Invalid: ${validationResults.invalid.length}`);
  console.log('\nTest completed successfully!');
  
  // Print some example jobs with enhancements
  if (validationResults.valid.length > 0) {
    const exampleJob = validationResults.valid[0];
    console.log('\nExample valid job:');
    console.log(`- Title: ${exampleJob.title}`);
    console.log(`- Company: ${exampleJob.companyName || exampleJob.company}`);
    console.log(`- Location: ${exampleJob.location}`);
    console.log(`- Industry: ${exampleJob.industry || 'Not categorized'}`);
    console.log(`- Skills: ${(exampleJob.skills || []).join(', ')}`);
  }
  
  const outputFile = path.join(process.cwd(), 'data', 'all-jobs.json');
  fs.writeFileSync(outputFile, JSON.stringify(allJobs, null, 2));
  console.log(`Combined results saved to ${outputFile}`);
}

// Run the tests
runTests().catch(console.error);
