import axios from 'axios';
import cheerio from 'cheerio';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Scrapes job listings from EJamJobs.com
 * @returns {Promise<Array>} Array of job objects
 */
export async function ejamJobsScraper() {
  logger.info('Starting EJamJobs scraper');
  const jobs = [];
  
  try {
    // Make request to EJamJobs main page
    const response = await axios.get('https://www.ejamjobs.com/jobs', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (response.status !== 200) {
      logger.error(`EJamJobs returned status code ${response.status}`);
      return jobs;
    }
    
    // Load HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Get all job listings
    const jobListings = $('.job-listing');
    logger.info(`Found ${jobListings.length} job listings on EJamJobs`);
    
    // Process each job listing
    for (let i = 0; i < jobListings.length; i++) {
      try {
        const listing = jobListings[i];
        
        // Extract basic job info
        const title = $(listing).find('.job-title').text().trim();
        const companyName = $(listing).find('.company-name').text().trim();
        const location = $(listing).find('.job-location').text().trim();
        
        // Get the job URL
        const jobUrl = $(listing).find('a.job-link').attr('href');
        
        // Extract job ID from URL or generate one
        const jobIdMatch = jobUrl ? jobUrl.match(/\/jobs\/([^\/]+)/) : null;
        const jobId = jobIdMatch ? jobIdMatch[1] : `ejamjobs-${uuidv4()}`;
        
        // Get job details by making another request
        if (jobUrl) {
          const detailsResponse = await axios.get(jobUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          
          if (detailsResponse.status === 200) {
            const detailsPage = cheerio.load(detailsResponse.data);
            
            // Extract job description
            const description = detailsPage('.job-description').html() || '';
            
            // Extract job type
            const jobTypeElement = detailsPage('.job-detail:contains("Job Type:")');
            const jobType = jobTypeElement.length ? jobTypeElement.text().replace('Job Type:', '').trim() : '';
            
            // Extract salary if available
            const salaryElement = detailsPage('.job-detail:contains("Salary:")');
            const salaryText = salaryElement.length ? salaryElement.text().replace('Salary:', '').trim() : '';
            
            // Parse salary range
            let salaryMin = null;
            let salaryMax = null;
            let salaryCurrency = 'JMD';
            
            if (salaryText) {
              // Check for currency
              if (salaryText.includes('USD')) salaryCurrency = 'USD';
              if (salaryText.includes('$')) {
                // Extract numbers from salary text
                const numbers = salaryText.match(/[\d,]+/g);
                if (numbers && numbers.length >= 1) {
                  salaryMin = parseFloat(numbers[0].replace(/,/g, ''));
                }
                if (numbers && numbers.length >= 2) {
                  salaryMax = parseFloat(numbers[1].replace(/,/g, ''));
                }
              }
            }
            
            // Extract skills from requirements section
            const requirementsSection = detailsPage('.job-requirements');
            const skillsList = [];
            
            if (requirementsSection.length) {
              requirementsSection.find('li').each((_, el) => {
                skillsList.push(detailsPage(el).text().trim());
              });
            }
            
            // Extract experience
            let experience = '';
            const experienceElement = detailsPage('.job-detail:contains("Experience:")');
            if (experienceElement.length) {
              experience = experienceElement.text().replace('Experience:', '').trim();
            }
            
            // Extract education
            let education = '';
            const educationElement = detailsPage('.job-detail:contains("Education:")');
            if (educationElement.length) {
              education = educationElement.text().replace('Education:', '').trim();
            }
            
            // Create job object
            const job = {
              externalId: jobId,
              title,
              description,
              companyName,
              location,
              jobType,
              salaryMin,
              salaryMax,
              salaryCurrency,
              skills: skillsList,
              experience,
              education,
              url: jobUrl,
              source: 'ejamjobs'
            };
            
            jobs.push(job);
            logger.debug(`Processed EJamJobs job: ${title} at ${companyName}`);
          }
        }
      } catch (error) {
        logger.error(`Error processing EJamJobs listing ${i}:`, error);
      }
    }
    
    logger.info(`EJamJobs scraper completed. Found ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    logger.error('Error in EJamJobs scraper:', error);
    return jobs;
  }
}
