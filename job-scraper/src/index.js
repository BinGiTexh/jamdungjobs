import express from 'express';
import cron from 'node-cron';
import { setupDatabase, query } from './database.js';
import { importJobs } from './importJobs.js';
import { logger } from './utils/logger.js';
import { scrapeCaribbeanJobs } from './scrapers/caribbeanjobs.js';
import { scrapeEJamJobs } from './scrapers/ejamjobs.js';
import { scrapeLinkedIn } from './scrapers/linkedin.js';
import { validateJobs } from './validateJobs.js';
import { syncJobsToJamDung, getJamDungJobStats } from './syncToJamDung.js';

// Initialize Express app
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3500;

// Initialize database
setupDatabase().catch(err => {
  logger.error('Failed to setup database:', err);
  process.exit(1);
});

// Schedule job scraping
const SCRAPE_INTERVAL = process.env.SCRAPE_INTERVAL || '0 */6 * * *'; // Default: every 6 hours
let scrapeRunning = false;

// Function to run all scrapers
async function runScrapers() {
  if (scrapeRunning) {
    logger.info('Scrape already in progress, skipping');
    return;
  }

  scrapeRunning = true;
  logger.info('Starting scheduled scrape');

  try {
    // Run all scrapers
    const linkedInJobs = await scrapeLinkedIn();
    const caribbeanJobs = await scrapeCaribbeanJobs();
    const eJamJobs = await scrapeEJamJobs();

    // Combine all jobs with their sources
    const allJobs = [
      ...linkedInJobs.map(job => ({ ...job, source: 'linkedin' })),
      ...caribbeanJobs.map(job => ({ ...job, source: 'caribbeanjobs' })),
      ...eJamJobs.map(job => ({ ...job, source: 'ejamjobs' }))
    ];

    // Validate jobs
    logger.info(`Validating ${allJobs.length} scraped jobs`);
    const validationResults = validateJobs(allJobs);
    
    // Import all valid jobs and those with warnings
    const jobsToImport = [
      ...validationResults.valid,
      ...validationResults.warnings.map(item => item.job)
    ];
    
    const importResults = await importJobs(jobsToImport);
    logger.info(`Import complete: ${importResults.imported} jobs imported, ${importResults.updated} updated, ${importResults.skipped} skipped`);

    // Sync to JamDung Jobs if API token is configured
    if (process.env.JAMDUNG_API_TOKEN) {
      logger.info(`Syncing ${jobsToImport.length} jobs to JamDung Jobs platform`);
      const syncResults = await syncJobsToJamDung(jobsToImport);
      logger.info(`Sync complete: ${syncResults.successful} created, ${syncResults.skipped} skipped, ${syncResults.failed} failed`);
    } else {
      logger.warn('JAMDUNG_API_TOKEN not set, skipping sync to JamDung Jobs platform');
    }
  } catch (error) {
    logger.error('Error during scrape:', error);
  } finally {
    scrapeRunning = false;
  }
}

// Schedule the scraper
cron.schedule(SCRAPE_INTERVAL, runScrapers);
logger.info(`Scheduled job scraping with interval: ${SCRAPE_INTERVAL}`);

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'JamDung Jobs Scraper Service',
    version: '1.0.0',
    description: 'Scrapes job listings from various Jamaican job sites and imports them into JamDung Jobs'
  });
});

// Trigger manual scrape
app.post('/api/scrape', async (req, res) => {
  if (scrapeRunning) {
    return res.status(409).json({ message: 'Scrape already in progress' });
  }

  // Start scrape in background
  runScrapers().catch(err => logger.error('Error in manual scrape:', err));
  
  res.json({ message: 'Scrape started' });
});

// Trigger manual scrape for a specific source
app.post('/api/scrape/:source', async (req, res) => {
  const { source } = req.params;
  
  if (scrapeRunning) {
    return res.status(409).json({ message: 'Scrape already in progress' });
  }
  
  scrapeRunning = true;
  
  try {
    let jobs = [];
    
    // Run the specified scraper
    switch (source.toLowerCase()) {
      case 'linkedin':
        jobs = await scrapeLinkedIn();
        jobs = jobs.map(job => ({ ...job, source: 'linkedin' }));
        break;
      case 'caribbeanjobs':
        jobs = await scrapeCaribbeanJobs();
        jobs = jobs.map(job => ({ ...job, source: 'caribbeanjobs' }));
        break;
      case 'ejamjobs':
        jobs = await scrapeEJamJobs();
        jobs = jobs.map(job => ({ ...job, source: 'ejamjobs' }));
        break;
      default:
        scrapeRunning = false;
        return res.status(400).json({ message: 'Invalid source. Use linkedin, caribbeanjobs, or ejamjobs' });
    }
    
    // Validate jobs
    const validationResults = validateJobs(jobs);
    
    // Import valid jobs and those with warnings
    const jobsToImport = [
      ...validationResults.valid,
      ...validationResults.warnings.map(item => item.job)
    ];
    
    const importResults = await importJobs(jobsToImport);
    
    // Sync to JamDung Jobs if API token is configured
    let syncResults = null;
    if (process.env.JAMDUNG_API_TOKEN) {
      syncResults = await syncJobsToJamDung(jobsToImport);
    }
    
    res.json({
      message: `Scrape of ${source} complete`,
      scraped: jobs.length,
      validation: {
        valid: validationResults.valid.length,
        warnings: validationResults.warnings.length,
        invalid: validationResults.invalid.length
      },
      import: importResults,
      sync: syncResults
    });
  } catch (error) {
    logger.error(`Error during ${source} scrape:`, error);
    res.status(500).json({ message: `Error during scrape: ${error.message}` });
  } finally {
    scrapeRunning = false;
  }
});

// Get scrape stats
app.get('/api/stats', async (req, res) => {
  try {
    const scrapeRuns = await query('SELECT * FROM scrape_runs ORDER BY created_at DESC LIMIT 10');
    const jobCounts = await query(`
      SELECT source, COUNT(*) as count 
      FROM scraped_jobs 
      GROUP BY source
    `);
    
    // Get JamDung platform stats if API token is configured
    let jamDungStats = null;
    if (process.env.JAMDUNG_API_TOKEN) {
      try {
        jamDungStats = await getJamDungJobStats();
      } catch (error) {
        logger.warn('Failed to get JamDung job stats:', error.message);
      }
    }

    res.json({
      scrapeRunning,
      recentRuns: scrapeRuns,
      jobCounts,
      jamDungStats
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get validation stats for recent jobs
app.get('/api/validation', async (req, res) => {
  try {
    const recentJobs = await query(`
      SELECT * FROM scraped_jobs 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
    
    const validationResults = validateJobs(recentJobs);
    
    res.json({
      total: recentJobs.length,
      valid: validationResults.valid.length,
      warnings: validationResults.warnings.length,
      invalid: validationResults.invalid.length,
      warningDetails: validationResults.warnings.map(item => ({
        title: item.job.title,
        warnings: item.warnings
      })),
      invalidDetails: validationResults.invalid.map(item => ({
        title: item.job.title,
        errors: item.errors
      }))
    });
  } catch (error) {
    logger.error('Error fetching validation stats:', error);
    res.status(500).json({ error: 'Failed to fetch validation stats' });
  }
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Scraper service running on port ${PORT}`);
});
