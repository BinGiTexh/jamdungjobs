const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Delete all related records first
    await prisma.jobApplication.deleteMany({
      where: {
        user: {
          email: {
            in: ['employer@test.com', 'jobseeker@test.com']
          }
        }
      }
    });

    await prisma.savedJob.deleteMany({
      where: {
        user: {
          email: {
            in: ['employer@test.com', 'jobseeker@test.com']
          }
        }
      }
    });

    await prisma.job.deleteMany({
      where: {
        company: {
          name: 'Tech Corp'
        }
      }
    });

    // Delete test accounts
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['employer@test.com', 'jobseeker@test.com']
        }
      }
    });

    // Delete test company
    await prisma.company.deleteMany({
      where: {
        name: 'Tech Corp'
      }
    });
    // Create a test company
    const company = await prisma.company.create({
      data: {
        name: 'Tech Corp',
        description: 'A leading technology company',
        location: 'San Francisco, CA',
        website: 'https://techcorp-example.com'
      }
    });

    // Create employer account
    const employer = await prisma.user.create({
      data: {
        email: 'employer@test.com',
        passwordHash: await bcrypt.hash('password123', 10),
        firstName: 'John',
        lastName: 'Employer',
        role: 'EMPLOYER',
        companyId: company.id
      }
    });

    // Create jobseeker account
    const jobseeker = await prisma.user.create({
      data: {
        email: 'jobseeker@test.com',
        passwordHash: await bcrypt.hash('password123', 10),
        firstName: 'Jane',
        lastName: 'Jobseeker',
        role: 'JOBSEEKER',
        title: 'Software Engineer',
        bio: 'Experienced software engineer looking for new opportunities',
        location: 'San Francisco, CA'
      }
    });

    // Create a test job posting
    const job = await prisma.job.create({
      data: {
        title: 'Senior Software Engineer',
        description: 'We are looking for an experienced software engineer to join our team...',
        location: 'San Francisco, CA',
        type: 'FULL_TIME',
        status: 'ACTIVE',
        salary: { min: 120000, max: 180000, currency: 'USD' },
        companyId: company.id,
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: '5+ years',
        education: 'Bachelor\'s degree in Computer Science or related field'
      }
    });

    console.log('Test accounts created successfully:');
    console.log('\nEmployer Login:');
    console.log('Email: employer@test.com');
    console.log('Password: employer123');
    console.log('\nJobseeker Login:');
    console.log('Email: jobseeker@test.com');
    console.log('Password: jobseeker123');

  } catch (error) {
    console.error('Error creating test accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
