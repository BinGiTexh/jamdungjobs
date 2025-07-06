#!/usr/bin/env node
/**
 * Seed test users for JamDung Jobs platform testing
 * 
 * This script creates comprehensive test accounts for different user types
 * and scenarios to facilitate thorough testing of the platform.
 * 
 * Usage:
 *   node backend/scripts/seed-test-users.js
 * 
 * This script is safe to run multiple times - it will update existing users
 * rather than create duplicates.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Test password for all accounts (hashed)
const TEST_PASSWORD = 'TestPass123!';

// Test user configurations
const TEST_USERS = [
  // ========================================
  // JOB SEEKERS
  // ========================================
  {
    email: 'jobseeker@test.com',
    password: TEST_PASSWORD,
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'JOBSEEKER',
    bio: 'Experienced software developer looking for new opportunities in Jamaica.',
    profile: {
      skills: ['React', 'Node.js', 'JavaScript', 'Python', 'SQL', 'Git'],
      experience: '5 years',
      education: 'BSc Computer Science - UWI',
      location: 'Kingston'
    }
  },
  {
    email: 'graduate@test.com',
    password: TEST_PASSWORD,
    firstName: 'Marcus',
    lastName: 'Brown',
    role: 'JOBSEEKER',
    bio: 'Recent graduate eager to start my career in the tech industry.',
    profile: {
      skills: ['Java', 'Python', 'HTML', 'CSS', 'MySQL'],
      experience: 'Entry level',
      education: 'BSc Information Technology - UTech',
      location: 'Spanish Town'
    }
  },
  {
    email: 'experienced@test.com',
    password: TEST_PASSWORD,
    firstName: 'Jennifer',
    lastName: 'Williams',
    role: 'JOBSEEKER',
    bio: 'Senior marketing professional with 10+ years experience in Caribbean markets.',
    profile: {
      skills: ['Digital Marketing', 'Social Media', 'Content Strategy', 'Analytics', 'Project Management'],
      experience: '10+ years',
      education: 'MBA Marketing - UWI',
      location: 'Montego Bay'
    }
  },
  {
    email: 'remote@test.com',
    password: TEST_PASSWORD,
    firstName: 'David',
    lastName: 'Thompson',
    role: 'JOBSEEKER',
    bio: 'Digital nomad specializing in remote work and freelance projects.',
    profile: {
      skills: ['Graphic Design', 'UI/UX', 'Adobe Creative Suite', 'Figma', 'Freelancing'],
      experience: '7 years',
      education: 'Diploma Graphic Design - HEART Trust',
      location: 'Remote'
    }
  },
  {
    email: 'hospitality@test.com',
    password: TEST_PASSWORD,
    firstName: 'Keisha',
    lastName: 'Campbell',
    role: 'JOBSEEKER',
    bio: 'Hospitality professional with extensive experience in luxury resorts.',
    profile: {
      skills: ['Customer Service', 'Hotel Management', 'Event Planning', 'Tourism', 'Languages'],
      experience: '8 years',
      education: 'Diploma Hotel Management - HEART Trust',
      location: 'Negril'
    }
  },

  // ========================================
  // EMPLOYERS
  // ========================================
  {
    email: 'employer@test.com',
    password: TEST_PASSWORD,
    firstName: 'Michael',
    lastName: 'Davis',
    role: 'EMPLOYER',
    bio: 'HR Manager at leading tech company in Jamaica.',
    company: {
      name: 'TechJam Solutions',
      description: 'Leading software development company specializing in Caribbean market solutions.',
      industry: 'Technology',
      location: 'Kingston',
      website: 'https://techjam.example.com',
      size: '50-100 employees'
    }
  },
  {
    email: 'startup@test.com',
    password: TEST_PASSWORD,
    firstName: 'Lisa',
    lastName: 'Morgan',
    role: 'EMPLOYER',
    bio: 'Founder of innovative fintech startup.',
    company: {
      name: 'CariPay Innovations',
      description: 'Revolutionary mobile payment solutions for the Caribbean region.',
      industry: 'Financial Technology',
      location: 'Kingston',
      website: 'https://caripay.example.com',
      size: '10-25 employees'
    }
  },
  {
    email: 'hotel@test.com',
    password: TEST_PASSWORD,
    firstName: 'Robert',
    lastName: 'Clarke',
    role: 'EMPLOYER',
    bio: 'General Manager at luxury resort chain.',
    company: {
      name: 'Paradise Resorts Jamaica',
      description: 'Luxury resort chain offering world-class hospitality experiences.',
      industry: 'Hospitality & Tourism',
      location: 'Montego Bay',
      website: 'https://paradise-resorts.example.com',
      size: '200+ employees'
    }
  },
  {
    email: 'bank@test.com',
    password: TEST_PASSWORD,
    firstName: 'Patricia',
    lastName: 'Reid',
    role: 'EMPLOYER',
    bio: 'Senior Recruitment Manager at major financial institution.',
    company: {
      name: 'Caribbean Banking Corp',
      description: 'Leading financial services provider across the Caribbean region.',
      industry: 'Banking & Finance',
      location: 'Kingston',
      website: 'https://caribank.example.com',
      size: '500+ employees'
    }
  },
  {
    email: 'agency@test.com',
    password: TEST_PASSWORD,
    firstName: 'Andrew',
    lastName: 'Green',
    role: 'EMPLOYER',
    bio: 'Director at creative marketing agency.',
    company: {
      name: 'Island Creative Agency',
      description: 'Full-service creative agency specializing in Caribbean brands and culture.',
      industry: 'Marketing & Advertising',
      location: 'Kingston',
      website: 'https://island-creative.example.com',
      size: '25-50 employees'
    }
  },

  // ========================================
  // SPECIAL TEST CASES
  // ========================================
  {
    email: 'incomplete@test.com',
    password: TEST_PASSWORD,
    firstName: 'Test',
    lastName: 'Incomplete',
    role: 'JOBSEEKER',
    bio: 'User with incomplete profile for testing profile completion flows.',
    profile: {
      skills: ['Basic Skills']
      // Intentionally missing other fields
    }
  },
  {
    email: 'premium@test.com',
    password: TEST_PASSWORD,
    firstName: 'Premium',
    lastName: 'User',
    role: 'EMPLOYER',
    bio: 'Premium employer account for testing paid features.',
    company: {
      name: 'Premium Corp',
      description: 'Premium company account for testing subscription features.',
      industry: 'Technology',
      location: 'Kingston',
      website: 'https://premium.example.com',
      size: '100+ employees'
    }
  }
];

// Sample job applications for testing
const SAMPLE_APPLICATIONS = [
  {
    jobseekerEmail: 'jobseeker@test.com',
    jobTitle: 'Full-Stack JavaScript Developer',
    status: 'PENDING'
  },
  {
    jobseekerEmail: 'graduate@test.com',
    jobTitle: 'Junior QA Engineer',
    status: 'REVIEWED'
  },
  {
    jobseekerEmail: 'experienced@test.com',
    jobTitle: 'Project Manager – Agile',
    status: 'INTERVIEW'
  }
];

async function main() {
  console.log('🌱 Seeding test users for JamDung Jobs...\n');

  try {
    // Hash the test password once
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

    for (const userData of TEST_USERS) {
      console.log(`Creating/updating user: ${userData.email}`);

      // Create or update user
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        create: {
          email: userData.email,
          passwordHash: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          bio: userData.bio
        },
        update: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          bio: userData.bio
        }
      });

      // Handle employer-specific data
      if (userData.role === 'EMPLOYER' && userData.company) {
        const company = await prisma.company.upsert({
          where: { name: userData.company.name },
          create: {
            ...userData.company,
            employees: {
              connect: { id: user.id }
            }
          },
          update: {
            ...userData.company,
            employees: {
              connect: { id: user.id }
            }
          }
        });

        // Update user with company reference
        await prisma.user.update({
          where: { id: user.id },
          data: { companyId: company.id }
        });
      }

      // Create candidate profile if user is a job seeker
      if (userData.role === 'JOBSEEKER' && userData.profile) {
        await prisma.candidateProfile.upsert({
          where: { userId: user.id },
          update: {
            skills: userData.profile.skills || [],
            experience: userData.profile.experience || '',
            education: userData.profile.education || '',
            location: userData.profile.location || '',
            title: userData.profile.title || null,
            bio: userData.profile.bio || null
          },
          create: {
            userId: user.id,
            skills: userData.profile.skills || [],
            experience: userData.profile.experience || '',
            education: userData.profile.education || '',
            location: userData.profile.location || '',
            title: userData.profile.title || null,
            bio: userData.profile.bio || null
          }
        });
      }

      console.log(`✅ ${userData.role}: ${userData.firstName} ${userData.lastName}`);
    }

    // Create sample applications
    console.log('\n📝 Creating sample job applications...');
    for (const app of SAMPLE_APPLICATIONS) {
      const jobseeker = await prisma.user.findUnique({
        where: { email: app.jobseekerEmail }
      });

      const job = await prisma.job.findFirst({
        where: { title: app.jobTitle }
      });

      if (jobseeker && job) {
        await prisma.application.upsert({
          where: {
            userId_jobId: {
              userId: jobseeker.id,
              jobId: job.id
            }
          },
          create: {
            userId: jobseeker.id,
            jobId: job.id,
            status: app.status,
            coverLetter: `Sample cover letter for ${app.jobTitle} position.`
          },
          update: {
            status: app.status
          }
        });
        console.log(`✅ Application: ${app.jobseekerEmail} → ${app.jobTitle}`);
      }
    }

    console.log('\n🎉 Test users seeded successfully!\n');
    console.log('='.repeat(60));
    console.log('TEST LOGIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log('Password for ALL accounts: TestPass123!\n');
    
    console.log('👤 JOB SEEKERS:');
    console.log('• jobseeker@test.com    - Experienced Developer');
    console.log('• graduate@test.com     - Recent Graduate');
    console.log('• experienced@test.com  - Senior Marketing Pro');
    console.log('• remote@test.com       - Digital Nomad Designer');
    console.log('• hospitality@test.com  - Hotel Professional');
    console.log('• incomplete@test.com   - Incomplete Profile (for testing)');
    
    console.log('\n🏢 EMPLOYERS:');
    console.log('• employer@test.com     - Tech Company HR');
    console.log('• startup@test.com      - Fintech Startup Founder');
    console.log('• hotel@test.com        - Resort General Manager');
    console.log('• bank@test.com         - Banking Recruiter');
    console.log('• agency@test.com       - Creative Agency Director');
    console.log('• premium@test.com      - Premium Account (for paid features)');
    
    console.log('\n📱 TESTING SCENARIOS:');
    console.log('• Use jobseeker@test.com to test job search and applications');
    console.log('• Use employer@test.com to test job posting and candidate management');
    console.log('• Use incomplete@test.com to test profile completion flows');
    console.log('• Use premium@test.com to test subscription/payment features');
    console.log('• Different locations: Kingston, Montego Bay, Spanish Town, Negril, Remote');
    console.log('• Various industries: Tech, Finance, Hospitality, Marketing');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error seeding test users:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
