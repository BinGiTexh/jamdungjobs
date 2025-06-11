const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Initialize Prisma client
const prisma = new PrismaClient();

// Configuration
const userId = '18ce3f32-cc6e-483a-ba49-d90d1e0261bf'; // From JWT token
const jobId = '7f54ee6a-02f1-4285-802d-d40c50204192';  // Job ID
const coverLetter = 'This is a test cover letter for the job application.';

// Helper function to generate a unique filename
const generateUniqueFilename = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}-${random}.pdf`;
};

// Main function
async function applyForJob() {
  try {
    console.log('Starting job application process...');
    
    // Check if the job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true }
    });
    
    if (!job) {
      console.error('Job not found!');
      return;
    }
    
    console.log(`Found job: ${job.title} at ${job.company.name}`);
    
    // Check if already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId: job.id,
        userId: userId
      }
    });
    
    if (existingApplication) {
      console.error('Already applied to this job!');
      return;
    }
    
    // Generate a unique filename for the resume
    const filename = generateUniqueFilename();
    const uploadDir = path.join(__dirname, '../backend/uploads');
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Copy test_resume.pdf to uploads directory with the unique filename
    fs.copyFileSync(
      path.join(__dirname, 'test_resume.pdf'),
      path.join(uploadDir, filename)
    );
    
    const resumeUrl = `/uploads/${filename}`;
    console.log(`Resume saved to: ${resumeUrl}`);
    
    // Create the application
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
    
    console.log('Application submitted successfully!');
    console.log('Application ID:', application.id);
    
  } catch (error) {
    console.error('Error applying for job:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the application
applyForJob().catch(console.error);
