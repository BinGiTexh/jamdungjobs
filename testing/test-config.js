/**
 * Test Configuration for JamDung Jobs
 * 
 * This file contains configuration settings for running tests against different environments.
 */

module.exports = {
  // API endpoints
  api: {
    local: 'http://localhost:5000/api',
    staging: 'https://staging-jobs.bingitech.io/api',
    production: 'https://jobs.bingitech.io/api'
  },
  
  // Test account credentials
  testAccounts: {
    jobSeeker: {
      email: 'testjobseeker@jamdungjobs.com',
      password: 'Test@123'
    },
    employer: {
      email: 'testemployer@jamdungjobs.com',
      password: 'Test@123'
    }
  },
  
  // Test data
  testData: {
    job: {
      title: 'Test Job ' + Math.floor(Math.random() * 1000),
      description: 'This is a test job posting',
      location: 'Kingston, Jamaica',
      type: 'FULL_TIME',
      salary: '50000-70000',
      category: 'Software Development',
      requirements: ['2+ years experience', 'Bachelor\'s degree'],
      skills: ['JavaScript', 'React', 'Node.js']
    },
    application: {
      coverLetter: 'I am very interested in this position!',
      resumeUrl: 'https://example.com/resume.pdf'
    }
  },
  
  // Timeouts
  timeouts: {
    short: 5000,    // 5 seconds
    medium: 15000,  // 15 seconds
    long: 30000     // 30 seconds
  }
};
