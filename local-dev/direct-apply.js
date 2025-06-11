// Direct application script using Prisma
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Initialize Prisma client
const prisma = new PrismaClient();

// Configuration
const userId = '18ce3f32-cc6e-483a-ba49-d90d1e0261bf'; // From JWT token
const jobId = '7f54ee6a-02f1-4285-802d-d40c50204192';  // Job ID
const coverLetter = 'This is a test cover letter for the job application.';

// Main function
async function createJobApplication() {
  try {
    console.log('Starting direct job application process...');
    
    // Check if the job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });
    
    if (!job) {
      console.error('Job not found!');
      return;
    }
    
    console.log(`Found job: ${job.title}`);
    
    // Check if already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId,
        userId
      }
    });
    
    if (existingApplication) {
      console.error('Already applied to this job!');
      return;
    }
    
    // Create test resume content
    const resumeUrl = '/tmp/test_resume.pdf';
    fs.writeFileSync(resumeUrl, 'This is a test resume content');
    console.log('Created test resume file');
    
    // Create the application directly in the database
    const application = await prisma.jobApplication.create({
      data: {
        job: {
          connect: { id: jobId }
        },
        user: {
          connect: { id: userId }
        },
        status: 'PENDING',
        resumeUrl,
        coverLetter
      }
    });
    
    console.log('Job application created successfully!');
    console.log('Application ID:', application.id);
    
  } catch (error) {
    console.error('Error creating job application:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the application
createJobApplication().catch(console.error);
