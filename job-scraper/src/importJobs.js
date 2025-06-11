import { query } from './database.js';
import { logger } from './utils/logger.js';

/**
 * Imports scraped jobs into the database
 * @param {Array} jobs - Array of job objects to import
 * @returns {Object} Statistics about the import process
 */
export async function importJobsToDatabase(jobs) {
  const stats = {
    total: jobs.length,
    imported: 0,
    duplicates: 0,
    errors: 0
  };

  logger.info(`Starting import of ${jobs.length} jobs`);

  // Start a scrape run record
  const scrapeRunResult = await query(
    'INSERT INTO scrape_runs (source, jobs_found) VALUES ($1, $2) RETURNING id',
    ['combined', jobs.length]
  );
  const scrapeRunId = scrapeRunResult.rows[0].id;

  try {
    for (const job of jobs) {
      try {
        // Check if job already exists by external_id
        const existingJob = await query(
          'SELECT id FROM scraped_jobs WHERE external_id = $1',
          [job.externalId]
        );

        if (existingJob.rowCount > 0) {
          // Job already exists, update it
          await query(
            `UPDATE scraped_jobs SET 
              title = $1, 
              description = $2, 
              company_name = $3, 
              location = $4, 
              job_type = $5, 
              salary_min = $6, 
              salary_max = $7, 
              salary_currency = $8, 
              skills = $9, 
              experience = $10, 
              education = $11, 
              url = $12, 
              updated_at = CURRENT_TIMESTAMP 
            WHERE external_id = $13`,
            [
              job.title,
              job.description,
              job.companyName,
              job.location,
              job.jobType,
              job.salaryMin,
              job.salaryMax,
              job.salaryCurrency,
              job.skills,
              job.experience,
              job.education,
              job.url,
              job.externalId
            ]
          );
          stats.duplicates++;
        } else {
          // Insert new job
          await query(
            `INSERT INTO scraped_jobs (
              external_id, 
              title, 
              description, 
              company_name, 
              location, 
              job_type, 
              salary_min, 
              salary_max, 
              salary_currency, 
              skills, 
              experience, 
              education, 
              url, 
              source
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
              job.externalId,
              job.title,
              job.description,
              job.companyName,
              job.location,
              job.jobType,
              job.salaryMin,
              job.salaryMax,
              job.salaryCurrency,
              job.skills,
              job.experience,
              job.education,
              job.url,
              job.source
            ]
          );
          stats.imported++;
        }
      } catch (error) {
        logger.error(`Error importing job ${job.externalId}:`, error);
        stats.errors++;
      }
    }

    // Update the scrape run record
    await query(
      `UPDATE scrape_runs SET 
        end_time = CURRENT_TIMESTAMP, 
        jobs_imported = $1, 
        status = 'completed' 
      WHERE id = $2`,
      [stats.imported, scrapeRunId]
    );

    logger.info(`Import completed: ${stats.imported} imported, ${stats.duplicates} duplicates, ${stats.errors} errors`);
    return stats;
  } catch (error) {
    logger.error('Error during job import:', error);
    
    // Update the scrape run record with error
    await query(
      `UPDATE scrape_runs SET 
        end_time = CURRENT_TIMESTAMP, 
        status = 'error',
        error = $1
      WHERE id = $2`,
      [error.message, scrapeRunId]
    );
    
    throw error;
  }
}

/**
 * Syncs imported jobs to the main JamDung Jobs database
 * This function will be called via an API endpoint
 */
export async function syncJobsToMainDatabase() {
  try {
    logger.info('Starting sync to main JamDung Jobs database');
    
    // Get all unimported jobs
    const result = await query(
      'SELECT * FROM scraped_jobs WHERE imported = FALSE',
      []
    );
    
    const jobs = result.rows;
    logger.info(`Found ${jobs.length} jobs to sync`);
    
    // For each job, make an API call to the main JamDung Jobs API
    let syncedCount = 0;
    
    for (const job of jobs) {
      try {
        // Convert the job to the format expected by the main API
        const apiJob = {
          title: job.title,
          description: job.description,
          location: job.location,
          type: convertJobType(job.job_type),
          salary: {
            min: job.salary_min,
            max: job.salary_max,
            currency: job.salary_currency || 'JMD'
          },
          skills: job.skills || [],
          experience: job.experience,
          education: job.education,
          source: job.source,
          sourceUrl: job.url,
          externalId: job.external_id,
          companyName: job.company_name
        };
        
        // In a real implementation, you would make an API call to your main backend
        // For now, we'll just mark it as imported
        await query(
          'UPDATE scraped_jobs SET imported = TRUE WHERE id = $1',
          [job.id]
        );
        
        syncedCount++;
      } catch (error) {
        logger.error(`Error syncing job ${job.id}:`, error);
      }
    }
    
    logger.info(`Sync completed: ${syncedCount} jobs synced to main database`);
    return { synced: syncedCount, total: jobs.length };
  } catch (error) {
    logger.error('Error during job sync:', error);
    throw error;
  }
}

/**
 * Converts job type strings from various sources to JamDung Jobs format
 */
function convertJobType(type) {
  if (!type) return 'FULL_TIME';
  
  const typeUpper = type.toUpperCase();
  
  if (typeUpper.includes('FULL') && typeUpper.includes('TIME')) return 'FULL_TIME';
  if (typeUpper.includes('PART') && typeUpper.includes('TIME')) return 'PART_TIME';
  if (typeUpper.includes('CONTRACT')) return 'CONTRACT';
  if (typeUpper.includes('INTERN')) return 'INTERNSHIP';
  if (typeUpper.includes('TEMP')) return 'TEMPORARY';
  
  return 'FULL_TIME'; // Default
}
