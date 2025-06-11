import axios from 'axios';
import cheerio from 'cheerio';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Scrapes job listings from CaribbeanJobs.com
 * @returns {Promise<Array>} Array of job objects
 */
export async function caribbeanJobsScraper() {
  logger.info('Starting CaribbeanJobs scraper');
  const jobs = [];
  
  try {
    // Make request to CaribbeanJobs Jamaica page
    const response = await axios.get('https://www.caribbeanjobs.com/ShowResults.aspx?Keywords=&Location=124&Category=&Recruiter=Company&Recruiter=Agency', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (response.status !== 200) {
      logger.error(`CaribbeanJobs returned status code ${response.status}`);
      return jobs;
    }
    
    // Load HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Get all job listings
    const jobListings = $('.job-result');
    logger.info(`Found ${jobListings.length} job listings on CaribbeanJobs`);
    
    // Process each job listing
    for (let i = 0; i < jobListings.length; i++) {
      try {
        const listing = jobListings[i];
        
        // Extract basic job info
        const title = $(listing).find('.job-result-title h2').text().trim();
        const companyName = $(listing).find('.job-result-company').text().trim();
        const location = $(listing).find('.job-result-location').text().trim();
        
        // Get the job URL
        const relativeUrl = $(listing).find('.job-result-title a').attr('href');
        const jobUrl = relativeUrl ? `https://www.caribbeanjobs.com${relativeUrl}` : '';
        
        // Extract job ID from URL
        const jobIdMatch = jobUrl.match(/\/(\d+)\//);
        const jobId = jobIdMatch ? jobIdMatch[1] : `caribbeanjobs-${uuidv4()}`;
        
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
            const description = detailsPage('.job-details-content').html() || '';
            
            // Extract job type
            const jobTypeElement = detailsPage('.job-details-item:contains("Job type")');
            const jobType = jobTypeElement.length ? jobTypeElement.find('.job-details-value').text().trim() : '';
            
            // Extract salary if available
            const salaryElement = detailsPage('.job-details-item:contains("Salary")');
            const salaryText = salaryElement.length ? salaryElement.find('.job-details-value').text().trim() : '';
            
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
            const requirementsSection = detailsPage('.job-details-content h3:contains("Requirements"), .job-details-content h2:contains("Requirements")').next();
            const skillsList = [];
            
            if (requirementsSection.length) {
              requirementsSection.find('li').each((_, el) => {
                skillsList.push(detailsPage(el).text().trim());
              });
            }
            
            // Extract experience
            let experience = '';
            detailsPage('.job-details-content').text().replace(/experience:?\s*([^.]+)/i, (_, exp) => {
              experience = exp.trim();
              return '';
            });
            
            // Extract education
            let education = '';
            detailsPage('.job-details-content').text().replace(/education:?\s*([^.]+)/i, (_, edu) => {
              education = edu.trim();
              return '';
            });
            
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
              source: 'caribbeanjobs'
            };
            
            jobs.push(job);
            logger.debug(`Processed CaribbeanJobs job: ${title} at ${companyName}`);
          }
        }
      } catch (error) {
        logger.error(`Error processing CaribbeanJobs listing ${i}:`, error);
      }
    }
    
    logger.info(`CaribbeanJobs scraper completed. Found ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    logger.error('Error in CaribbeanJobs scraper:', error);
    return jobs;
  }
}
