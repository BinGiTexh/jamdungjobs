import { logger } from './utils/logger.js';

/**
 * Validates job data before importing to the main database
 * @param {Object} job - Job object to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validateJob(job) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    job: { ...job } // Create a copy to modify if needed
  };

  // Required fields validation
  const requiredFields = ['title', 'description', 'companyName', 'location'];
  for (const field of requiredFields) {
    if (!job[field] || job[field].trim() === '') {
      result.isValid = false;
      result.errors.push(`Missing required field: ${field}`);
    }
  }

  // Title validation
  if (job.title) {
    // Check for spam keywords in title
    const spamKeywords = ['urgent', 'immediate', 'apply now', '!!!', '$$$'];
    for (const keyword of spamKeywords) {
      if (job.title.toLowerCase().includes(keyword.toLowerCase())) {
        result.warnings.push(`Title contains potential spam keyword: ${keyword}`);
      }
    }

    // Check title length
    if (job.title.length < 5) {
      result.warnings.push('Title is too short');
    }
    if (job.title.length > 100) {
      // Truncate overly long titles
      result.job.title = job.title.substring(0, 100);
      result.warnings.push('Title was truncated (too long)');
    }
  }

  // Description validation
  if (job.description) {
    // Check for minimum description length
    if (job.description.length < 100) {
      result.warnings.push('Description is too short');
    }

    // Check for HTML issues
    if (job.description.includes('<script')) {
      result.isValid = false;
      result.errors.push('Description contains script tags');
    }

    // Sanitize description if needed
    // In a real implementation, you would use a proper HTML sanitizer
    if (job.description.includes('javascript:')) {
      result.job.description = job.description.replace(/javascript:/gi, '');
      result.warnings.push('Removed javascript: from description');
    }
  }

  // Location validation - ensure it's in Jamaica
  if (job.location && !isJamaicanLocation(job.location)) {
    result.warnings.push('Location may not be in Jamaica');
  }

  // Salary validation
  if (job.salaryMin !== null && job.salaryMax !== null) {
    // Ensure salary range makes sense
    if (job.salaryMin > job.salaryMax) {
      // Swap values
      const temp = result.job.salaryMin;
      result.job.salaryMin = result.job.salaryMax;
      result.job.salaryMax = temp;
      result.warnings.push('Salary min/max were swapped (min was greater than max)');
    }

    // Check for unrealistic salary values
    if (job.salaryCurrency === 'JMD') {
      if (job.salaryMin < 100000) {
        result.warnings.push('Salary minimum seems too low for Jamaica');
      }
      if (job.salaryMax > 10000000) {
        result.warnings.push('Salary maximum seems too high for Jamaica');
      }
    } else if (job.salaryCurrency === 'USD') {
      if (job.salaryMin < 1000) {
        result.warnings.push('Salary minimum seems too low for USD');
      }
      if (job.salaryMax > 300000) {
        result.warnings.push('Salary maximum seems too high for USD');
      }
    }
  }

  // Skills validation
  if (job.skills && Array.isArray(job.skills)) {
    // Limit number of skills
    if (job.skills.length > 20) {
      result.job.skills = job.skills.slice(0, 20);
      result.warnings.push('Limited skills to 20 items');
    }
  }

  // Log validation results
  if (!result.isValid) {
    logger.warn(`Job validation failed for "${job.title}": ${result.errors.join(', ')}`);
  } else if (result.warnings.length > 0) {
    logger.info(`Job validated with warnings for "${job.title}": ${result.warnings.join(', ')}`);
  } else {
    logger.debug(`Job validated successfully: "${job.title}"`);
  }

  return result;
}

/**
 * Checks if a location is in Jamaica
 * @param {string} location - Location string to check
 * @returns {boolean} True if location is likely in Jamaica
 */
function isJamaicanLocation(location) {
  if (!location) return false;
  
  const locationLower = location.toLowerCase();
  
  // List of Jamaican parishes and major cities/towns
  const jamaicanLocations = [
    'kingston', 'montego bay', 'spanish town', 'portmore', 'mandeville', 
    'may pen', 'old harbour', 'ocho rios', 'port antonio', 'negril',
    'st. andrew', 'st andrew', 'st. catherine', 'st catherine', 
    'st. james', 'st james', 'manchester', 'clarendon', 'westmoreland',
    'hanover', 'st. elizabeth', 'st elizabeth', 'st. mary', 'st mary',
    'st. ann', 'st ann', 'portland', 'st. thomas', 'st thomas',
    'trelawny', 'jamaica'
  ];
  
  // Check if any Jamaican location is mentioned
  return jamaicanLocations.some(place => locationLower.includes(place));
}

/**
 * Batch validates an array of jobs
 * @param {Array} jobs - Array of job objects to validate
 * @returns {Object} Validation results with valid and invalid jobs
 */
export function validateJobs(jobs) {
  const results = {
    valid: [],
    warnings: [],
    invalid: []
  };
  
  for (const job of jobs) {
    const validationResult = validateJob(job);
    
    if (!validationResult.isValid) {
      results.invalid.push({
        job,
        errors: validationResult.errors
      });
    } else if (validationResult.warnings.length > 0) {
      results.warnings.push({
        job: validationResult.job,
        warnings: validationResult.warnings
      });
    } else {
      results.valid.push(validationResult.job);
    }
  }
  
  logger.info(`Job validation complete: ${results.valid.length} valid, ${results.warnings.length} with warnings, ${results.invalid.length} invalid`);
  return results;
}
