import axios from 'axios';
import { logger } from './utils/logger.js';
import { validateJob } from './validateJobs.js';
import { categorizeJamaicanJob, normalizeJamaicanLocation, extractJamaicanSkills } from './utils/jamaicaJobUtils.js';

// API client for JamDung Jobs
const createApiClient = () => {
  const apiUrl = process.env.JAMDUNG_API_URL || 'http://api:3000';
  const apiToken = process.env.JAMDUNG_API_TOKEN;
  
  if (!apiToken) {
    logger.error('JAMDUNG_API_TOKEN environment variable is not set');
    throw new Error('API token is required for JamDung Jobs integration');
  }
  
  const client = axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`
    },
    timeout: 10000
  });
  
  // Add response interceptor for logging
  client.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        logger.error(`API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        logger.error(`API request failed: ${error.message}`);
      } else {
        logger.error(`API error: ${error.message}`);
      }
      return Promise.reject(error);
    }
  );
  
  return client;
};

/**
 * Creates or finds a company in JamDung Jobs
 * @param {Object} job - Job data containing company information
 * @returns {Promise<string>} Company ID
 */
async function createOrFindCompany(job, apiClient) {
  try {
    // First try to find if company already exists
    const searchResponse = await apiClient.get(`/api/companies/search?name=${encodeURIComponent(job.companyName)}`);
    
    if (searchResponse.data && searchResponse.data.length > 0) {
      logger.info(`Found existing company: ${job.companyName}`);
      return searchResponse.data[0].id;
    }
    
    // Create new company if not found
    const companyData = {
      name: job.companyName,
      description: job.companyDescription || `Employer in ${job.location || 'Jamaica'}`,
      website: job.companyWebsite || '',
      location: normalizeJamaicanLocation(job.location) || 'Jamaica',
      logoUrl: job.companyLogoUrl || '',
      industry: categorizeJamaicanJob(job.title, job.description)
    };
    
    const createResponse = await apiClient.post('/api/companies', companyData);
    logger.info(`Created new company: ${job.companyName}`);
    return createResponse.data.id;
  } catch (error) {
    logger.error(`Failed to create/find company ${job.companyName}: ${error.message}`);
    throw error;
  }
}

/**
 * Creates a job posting in JamDung Jobs
 * @param {Object} job - Validated job data
 * @param {string} companyId - ID of the company for this job
 * @returns {Promise<Object>} Created job data
 */
async function createJobPosting(job, companyId, apiClient) {
  try {
    // Prepare job data for JamDung Jobs API
    const jobData = {
      title: job.title,
      description: job.description,
      companyId: companyId,
      location: normalizeJamaicanLocation(job.location),
      jobType: job.jobType || 'FULL_TIME',
      salaryMin: job.salaryMin || null,
      salaryMax: job.salaryMax || null,
      salaryCurrency: job.salaryCurrency || 'JMD',
      skills: job.skills || extractJamaicanSkills(job.description),
      experienceLevel: job.experienceLevel || 'MID_LEVEL',
      educationLevel: job.educationLevel || 'BACHELORS',
      applicationUrl: job.applicationUrl || job.url || '',
      externalId: job.externalId,
      externalSource: job.source,
      isActive: true,
      industry: categorizeJamaicanJob(job.title, job.description)
    };
    
    const response = await apiClient.post('/api/jobs', jobData);
    logger.info(`Created job posting: ${job.title} (ID: ${response.data.id})`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to create job posting ${job.title}: ${error.message}`);
    throw error;
  }
}

/**
 * Syncs a single job to JamDung Jobs platform
 * @param {Object} job - Job data to sync
 * @returns {Promise<Object>} Sync result
 */
export async function syncJobToJamDung(job) {
  try {
    // Validate job before syncing
    const validationResult = validateJob(job);
    if (!validationResult.isValid) {
      logger.warn(`Skipping invalid job "${job.title}": ${validationResult.errors.join(', ')}`);
      return { 
        success: false, 
        job: job, 
        errors: validationResult.errors 
      };
    }
    
    // Use validated job data
    const validatedJob = validationResult.job;
    
    // Create API client
    const apiClient = createApiClient();
    
    // Check if job already exists in JamDung Jobs
    try {
      const existingJobResponse = await apiClient.get(`/api/jobs/external/${encodeURIComponent(job.source)}/${encodeURIComponent(job.externalId)}`);
      if (existingJobResponse.data && existingJobResponse.data.id) {
        logger.info(`Job already exists in JamDung Jobs: ${job.title} (ID: ${existingJobResponse.data.id})`);
        
        // Update the existing job if needed
        // This could be implemented based on requirements
        
        return {
          success: true,
          job: existingJobResponse.data,
          updated: false,
          message: 'Job already exists'
        };
      }
    } catch (error) {
      // 404 is expected if job doesn't exist yet
      if (error.response && error.response.status !== 404) {
        throw error;
      }
    }
    
    // Create or find company
    const companyId = await createOrFindCompany(validatedJob, apiClient);
    
    // Create job posting
    const createdJob = await createJobPosting(validatedJob, companyId, apiClient);
    
    return {
      success: true,
      job: createdJob,
      created: true,
      message: 'Job created successfully'
    };
  } catch (error) {
    logger.error(`Failed to sync job "${job.title}": ${error.message}`);
    return {
      success: false,
      job: job,
      errors: [error.message]
    };
  }
}

/**
 * Syncs multiple jobs to JamDung Jobs platform
 * @param {Array} jobs - Array of job data to sync
 * @returns {Promise<Object>} Sync results
 */
export async function syncJobsToJamDung(jobs) {
  logger.info(`Starting sync of ${jobs.length} jobs to JamDung Jobs platform`);
  
  const results = {
    total: jobs.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    details: []
  };
  
  for (const job of jobs) {
    try {
      const syncResult = await syncJobToJamDung(job);
      results.details.push(syncResult);
      
      if (syncResult.success) {
        if (syncResult.created) {
          results.successful++;
        } else {
          results.skipped++;
        }
      } else {
        results.failed++;
      }
    } catch (error) {
      logger.error(`Unexpected error syncing job "${job.title}": ${error.message}`);
      results.failed++;
      results.details.push({
        success: false,
        job: job,
        errors: [error.message]
      });
    }
  }
  
  logger.info(`Sync complete: ${results.successful} created, ${results.skipped} skipped, ${results.failed} failed`);
  return results;
}

/**
 * Gets statistics about jobs in JamDung Jobs platform
 * @returns {Promise<Object>} Stats about jobs in the platform
 */
export async function getJamDungJobStats() {
  try {
    const apiClient = createApiClient();
    const response = await apiClient.get('/api/jobs/stats');
    return response.data;
  } catch (error) {
    logger.error(`Failed to get JamDung job stats: ${error.message}`);
    throw error;
  }
}
