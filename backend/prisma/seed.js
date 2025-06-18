const { PrismaClient, JobType } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Only seed if there are no jobs yet
  const jobCount = await prisma.job.count();
  if (jobCount > 0) {
    console.log(`Database already has ${jobCount} job(s). Skipping seed.`);
    return;
  }

  // Create a few sample companies
  const companiesData = [
    {
      name: 'Kingston Tech',
      website: 'https://k-tech.jm',
      location: 'Kingston',
      description: 'Innovative Jamaican software company.'
    },
    {
      name: 'Montego Finance',
      website: 'https://montegofin.jm',
      location: 'Montego Bay',
      description: 'Fin-tech solutions for the Caribbean.'
    },
    {
      name: 'Negril Resorts Group',
      website: 'https://negrilresorts.jm',
      location: 'Negril',
      description: 'Hospitality and tourism leader on the west coast.'
    }
  ];

  const companies = [];
  for (const data of companiesData) {
    const company = await prisma.company.create({ data });
    companies.push(company);
  }

  const jobsData = [
    {
      title: 'Full-Stack Developer',
      description: 'Build cutting-edge web applications with React and Node.js.',
      location: 'Kingston',
      type: 'FULL_TIME',
      companyId: companies[0].id,
      salary: { min: 1200000, max: 1800000, currency: 'JMD' }
    },
    {
      title: 'Junior QA Engineer',
      description: 'Ensure quality across mobile and web products.',
      location: 'Kingston',
      type: 'FULL_TIME',
      companyId: companies[0].id,
      salary: { min: 800000, max: 1200000, currency: 'JMD' }
    },
    {
      title: 'Financial Analyst',
      description: 'Analyse market trends and create financial models.',
      location: 'Montego Bay',
      type: 'FULL_TIME',
      companyId: companies[1].id,
      salary: { min: 1500000, max: 2200000, currency: 'JMD' }
    },
    {
      title: 'Front Desk Associate',
      description: 'Provide exceptional guest services at our flagship resort.',
      location: 'Negril',
      type: 'FULL_TIME',
      companyId: companies[2].id,
      salary: { min: 600000, max: 900000, currency: 'JMD' }
    },
    {
      title: 'Restaurant Manager',
      description: 'Lead daily operations of on-site restaurants.',
      location: 'Negril',
      type: 'FULL_TIME',
      companyId: companies[2].id,
      salary: { min: 1400000, max: 2000000, currency: 'JMD' }
    }
  ];

  for (const data of jobsData) {
    await prisma.job.create({ data });
  }

  console.log('Seeded companies and jobs successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
