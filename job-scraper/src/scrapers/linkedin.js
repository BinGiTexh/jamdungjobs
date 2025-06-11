import puppeteer from 'puppeteer';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Scrapes job listings from LinkedIn
 * @returns {Promise<Array>} Array of job objects
 */
export async function linkedinScraper() {
  logger.info('Starting LinkedIn scraper');
  const jobs = [];
  
  try {
    // Launch a headless browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null
    });
    
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to LinkedIn jobs page for Jamaica
    await page.goto('https://www.linkedin.com/jobs/search/?location=Jamaica', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    logger.info('LinkedIn page loaded');
    
    // Wait for job listings to load
    await page.waitForSelector('.job-search-card', { timeout: 30000 });
    
    // Get all job cards
    const jobCards = await page.$$('.job-search-card');
    logger.info(`Found ${jobCards.length} job cards on LinkedIn`);
    
    // Process each job card
    for (let i = 0; i < jobCards.length; i++) {
      try {
        const card = jobCards[i];
        
        // Extract job details from the card
        const jobId = await card.evaluate(el => el.getAttribute('data-id') || '');
        const title = await card.evaluate(el => {
          const titleEl = el.querySelector('.job-search-card__title');
          return titleEl ? titleEl.textContent.trim() : '';
        });
        
        const companyName = await card.evaluate(el => {
          const companyEl = el.querySelector('.job-search-card__company-name');
          return companyEl ? companyEl.textContent.trim() : '';
        });
        
        const location = await card.evaluate(el => {
          const locationEl = el.querySelector('.job-search-card__location');
          return locationEl ? locationEl.textContent.trim() : '';
        });
        
        const jobUrl = await card.evaluate(el => {
          const linkEl = el.querySelector('.job-search-card__title a');
          return linkEl ? linkEl.href : '';
        });
        
        // Click on the job card to view details
        await card.click();
        
        // Wait for job details to load
        await page.waitForSelector('.show-more-less-html__markup', { timeout: 10000 });
        
        // Extract job description
        const description = await page.evaluate(() => {
          const descEl = document.querySelector('.show-more-less-html__markup');
          return descEl ? descEl.innerHTML : '';
        });
        
        // Extract job type
        const jobType = await page.evaluate(() => {
          const typeEls = Array.from(document.querySelectorAll('.description__job-criteria-text'));
          const typeEl = typeEls.find(el => {
            const label = el.closest('.description__job-criteria-container')?.querySelector('.description__job-criteria-subheader')?.textContent;
            return label && label.includes('Employment type');
          });
          return typeEl ? typeEl.textContent.trim() : '';
        });
        
        // Extract experience
        const experience = await page.evaluate(() => {
          const expEls = Array.from(document.querySelectorAll('.description__job-criteria-text'));
          const expEl = expEls.find(el => {
            const label = el.closest('.description__job-criteria-container')?.querySelector('.description__job-criteria-subheader')?.textContent;
            return label && label.includes('Experience');
          });
          return expEl ? expEl.textContent.trim() : '';
        });
        
        // Extract skills (this is more complex and might not be directly available)
        const skills = await page.evaluate(() => {
          // Look for skills section or extract from description
          const skillsSection = document.querySelector('.skills-section');
          if (skillsSection) {
            return Array.from(skillsSection.querySelectorAll('li')).map(el => el.textContent.trim());
          }
          
          // If no skills section, try to extract from description
          const description = document.querySelector('.show-more-less-html__markup')?.textContent || '';
          const skillsMatch = description.match(/skills:(.+?)(?:\\.|\n|$)/i);
          if (skillsMatch) {
            return skillsMatch[1].split(',').map(s => s.trim());
          }
          
          return [];
        });
        
        // Create job object
        const job = {
          externalId: jobId || `linkedin-${uuidv4()}`,
          title,
          description,
          companyName,
          location,
          jobType,
          salaryMin: null,
          salaryMax: null,
          salaryCurrency: 'JMD',
          skills,
          experience,
          education: null,
          url: jobUrl,
          source: 'linkedin'
        };
        
        jobs.push(job);
        logger.debug(`Processed LinkedIn job: ${title} at ${companyName}`);
      } catch (error) {
        logger.error(`Error processing LinkedIn job card ${i}:`, error);
      }
    }
    
    // Close the browser
    await browser.close();
    logger.info(`LinkedIn scraper completed. Found ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    logger.error('Error in LinkedIn scraper:', error);
    return jobs;
  }
}
