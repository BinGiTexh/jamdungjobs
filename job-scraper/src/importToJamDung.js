import axios from 'axios';
import { query } from './database.js';
import { logger } from './utils/logger.js';

/**
 * Imports scraped jobs into the main JamDung Jobs database via API
 * @returns {Promise<Object>} Statistics about the import process
 */
export async function importToJamDungDatabase() {
  logger.info('Starting import to JamDung Jobs database');
  
  const stats = {
    total: 0,
    imported: 0,
    errors: 0
  };
  
  try {
    // Get all scraped jobs that haven't been imported to JamDung yet
    const result = await query(
      'SELECT * FROM scraped_jobs WHERE imported = FALSE',
      []
    );
    
    const jobs = result.rows;
    stats.total = jobs.length;
    
    logger.info(`Found ${jobs.length} jobs to import to JamDung Jobs`);
    
    if (jobs.length === 0) {
      return stats;
    }
    
    // Get API token (in a real implementation, you would securely store and retrieve this)
    const apiToken = process.env.JAMDUNG_API_TOKEN;
    
    if (!apiToken) {
      logger.error('No API token available for JamDung Jobs API');
      throw new Error('No API token available');
    }
    
    // Import each job
    for (const job of jobs) {
      try {
        // Map the scraped job to JamDung Jobs format
        const jamDungJob = {
          title: job.title,
          description: job.description,
          location: job.location,
          type: convertJobType(job.job_type),
          status: 'ACTIVE',
          salary: {
            min: job.salary_min || 0,
            max: job.salary_max || 0,
            currency: job.salary_currency || 'JMD'
          },
          skills: job.skills || [],
          experience: job.experience || '',
          education: job.education || '',
          // Add source information in the description
          requirements: `This job was originally posted on ${job.source}. View the original posting at: ${job.url}`,
          benefits: 'Benefits information not available from source.',
          // Add metadata
          metadata: {
            source: job.source,
            externalId: job.external_id,
            originalUrl: job.url,
            scrapedAt: job.created_at
          }
        };
        
        // Create a company for this job if it doesn't exist
        // In a real implementation, you would check if the company already exists
        const companyResponse = await axios.post(
          'http://localhost:5000/api/employer/create-company',
          {
            name: job.company_name,
            description: `Company imported from ${job.source}`,
            location: job.location,
            website: ''
          },
          {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const companyId = companyResponse.data.id;
        
        // Create the job using the JamDung Jobs API
        await axios.post(
          'http://localhost:5000/api/employer/jobs',
          {
            ...jamDungJob,
            companyId
          },
          {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Mark the job as imported in our database
        await query(
          'UPDATE scraped_jobs SET imported = TRUE WHERE id = $1',
          [job.id]
        );
        
        stats.imported++;
        logger.info(`Imported job "${job.title}" to JamDung Jobs`);
      } catch (error) {
        logger.error(`Error importing job ${job.id} to JamDung Jobs:`, error);
        stats.errors++;
      }
    }
    
    logger.info(`Import to JamDung Jobs completed: ${stats.imported} imported, ${stats.errors} errors`);
    return stats;
  } catch (error) {
    logger.error('Error during import to JamDung Jobs:', error);
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
