#!/usr/bin/env node
/**
 * Seed demo jobs, candidate skills and company for manual QA.
 *
 * Usage:
 *   node backend/scripts/seed-demo-data.js
 *
 * Requires DATABASE_URL in env and will NOT wipe data. It upserts records so it
 * is safe to run multiple times.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ----------------------------------------------------------------------------------
// CONFIG
// ----------------------------------------------------------------------------------
const JOBS = [
  {
    title: 'Full-Stack JavaScript Developer',
    description: 'Build and maintain React / Node applications for Caribbean clients.',
    location: 'Kingston',
    type: 'FULL_TIME',
    skills: ['React', 'Node.js', 'PostgreSQL'],
    salary: 160000,
    experience: '3+ years',
    education: 'BSc Computer Science',
  },
  {
    title: 'Data Analyst (Python / SQL)',
    description: 'Analyse large datasets and create reports for decision-making.',
    location: 'Montego Bay',
    type: 'FULL_TIME',
    skills: ['Python', 'SQL', 'PowerBI'],
    salary: 120000,
    experience: '2+ years',
    education: 'BSc Statistics',
  },
  {
    title: 'Graphic Designer (Remote)',
    description: 'Create visual assets for marketing campaigns.',
    location: 'Remote',
    type: 'CONTRACT',
    skills: ['Photoshop', 'Illustrator', 'Figma'],
    salary: 90000,
    experience: 'Portfolio required',
    education: 'Diploma Graphic Design',
  },
  {
    title: 'Project Manager – Agile',
    description: 'Lead software teams using Scrum / Kanban methodologies.',
    location: 'Ocho Rios',
    type: 'FULL_TIME',
    skills: ['Agile', 'Scrum', 'Communication'],
    salary: 180000,
    experience: '5+ years',
    education: 'PMP / Certified Scrum Master',
  },
];

const CANDIDATE_EMAIL = 'testjobseeker@jamdungjobs.com';
const CANDIDATE_SKILLS = [
  'React',
  'Node.js',
  'SQL',
  'Python',
  'PowerBI',
  'Communication',
];

// ----------------------------------------------------------------------------------
async function main() {
  console.log('🌱  Seeding demo data …');

  // Ensure demo company exists (used for employer / job postings)
  let company = await prisma.company.findFirst({
    where: { name: 'JamTest Ltd' }
  });
  
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'JamTest Ltd',
        description: 'Demo company for automated QA seeds.',
        industry: 'Technology',
        location: 'Kingston',
        website: 'https://jamtest.example.com',
      }
    });
  }

  // Find any employer
  let employer = await prisma.user.findFirst({ where: { role: 'EMPLOYER' } });
  if (!employer) {
    employer = await prisma.user.create({
      data: {
        email: 'testemployer@jamdungjobs.com',
        firstName: 'Test',
        lastName: 'Employer',
        passwordHash: '$2b$10$abcdefg', // dummy hash – won’t be used to login
        role: 'EMPLOYER',
        company: { connect: { id: company.id } },
      },
    });
  } else if (!employer.companyId) {
    await prisma.user.update({
      where: { id: employer.id },
      data: { companyId: company.id },
    });
  }

  // Create jobs if they don't exist
  for (const job of JOBS) {
    const existingJob = await prisma.job.findFirst({
      where: {
        title: job.title,
        companyId: company.id
      }
    });
    
    if (!existingJob) {
      await prisma.job.create({
        data: {
          ...job,
          companyId: company.id,
          status: 'ACTIVE',
        }
      });
      console.log(`✅ Created job: ${job.title}`);
    } else {
      console.log(`⏭️  Job already exists: ${job.title}`);
    }
  }

  // Attach skills to candidate profile
  const candidate = await prisma.user.findUnique({ where: { email: CANDIDATE_EMAIL } });
  if (!candidate) {
    console.warn(`⚠️  Candidate ${CANDIDATE_EMAIL} not found – skipping skill attach.`);
  } else {
    await prisma.candidateProfile.upsert({
      where: { userId: candidate.id },
      create: {
        userId: candidate.id,
        skills: CANDIDATE_SKILLS,
      },
      update: {
        skills: CANDIDATE_SKILLS,
      },
    });
  }

  console.log('✅  Demo data seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
