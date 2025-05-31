const { MongoClient } = require('mongodb');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

async function migrateData() {
  // Store ID mappings
  const idMappings = {
    users: new Map(),
    companies: new Map(),
    jobs: new Map()
  }
  // Connect to MongoDB
  const mongoClient = new MongoClient('mongodb://jobboard:jobboard@mongodb:27017/jobboard?authSource=admin')
  await mongoClient.connect()
  const db = mongoClient.db()

  try {
    // Migrate Users
    const users = await db.collection('users').find({}).toArray()
    console.log(`Found ${users.length} users to migrate`)
    for (const user of users) {
      const newUser = await prisma.user.create({
        data: {
          email: user.email || `user_${user._id}@example.com`,
          passwordHash: user.password || 'migrated_password',
          firstName: user.name?.split(' ')[0] || 'Unknown',
          lastName: user.name?.split(' ')[1] || 'Unknown',
          role: (user.role === 'candidate' ? 'JOBSEEKER' : (user.role || 'JOBSEEKER').toUpperCase()),
          title: user.title || null,
          bio: user.bio || null,
          location: user.location || null,
          phoneNumber: user.phoneNumber || null,
          createdAt: new Date(user.createdAt || Date.now()),
          updatedAt: new Date(user.updatedAt || user.createdAt || Date.now())
        }
      })
      idMappings.users.set(user._id.toString(), newUser.id)
      console.log(`Migrated user ${user._id} -> ${newUser.id}`)
    }

    // Migrate Companies
    const companies = await db.collection('companies').find({}).toArray()
    console.log(`Found ${companies.length} companies to migrate`)
    for (const company of companies) {
      const newCompany = await prisma.company.create({
        data: {
          name: company.name || 'Unknown Company',
          description: company.description || null,
          location: company.location || null,
          website: company.website || null,
          logo: company.logo || null,
          createdAt: new Date(company.createdAt || Date.now()),
          updatedAt: new Date(company.updatedAt || company.createdAt || Date.now())
        }
      })
      idMappings.companies.set(company._id.toString(), newCompany.id)
      console.log(`Migrated company ${company._id} -> ${newCompany.id}`)
    }

    // Migrate Jobs
    const jobs = await db.collection('jobs').find({}).toArray()
    console.log(`Found ${jobs.length} jobs to migrate`)
    for (const job of jobs) {
      if (!job.companyId) {
        console.log(`Skipping job ${job._id} - no company ID`)
        continue
      }
      const newJob = await prisma.job.create({
        data: {
          title: job.title || 'Unknown Position',
          description: job.description || 'No description provided',
          location: job.location || 'Remote',
          type: (job.type || 'FULL_TIME').toUpperCase(),
          status: (job.status || 'ACTIVE').toUpperCase(),
          salary: job.salary ? {
            min: job.salary.min || 0,
            max: job.salary.max || 0,
            currency: job.salary.currency || 'USD'
          } : null,
          skills: job.skills || [],
          experience: job.experience || null,
          education: job.education || null,
          createdAt: new Date(job.createdAt || Date.now()),
          updatedAt: new Date(job.updatedAt || job.createdAt || Date.now()),
          companyId: idMappings.companies.get(job.companyId.toString())
        }
      })
      idMappings.jobs.set(job._id.toString(), newJob.id)
      console.log(`Migrated job ${job._id} -> ${newJob.id}`)
    }

    // Migrate Job Applications
    const applications = await db.collection('applications').find({}).toArray()
    console.log(`Found ${applications.length} applications to migrate`)
    for (const app of applications) {
      if (!app.jobId || !app.userId) {
        console.log(`Skipping application ${app._id} - missing job or user ID`)
        continue
      }
      await prisma.jobApplication.create({
        data: {
          status: (app.status || 'PENDING').toUpperCase(),
          resumeUrl: app.resumeUrl || null,
          coverLetter: app.coverLetter || null,
          createdAt: new Date(app.createdAt || Date.now()),
          updatedAt: new Date(app.updatedAt || app.createdAt || Date.now()),
          jobId: idMappings.jobs.get(app.jobId.toString()),
          userId: idMappings.users.get(app.userId.toString())
        }
      })
      console.log(`Migrated application ${app._id}`)
    }

    // Migrate Saved Jobs
    const savedJobs = await db.collection('savedJobs').find({}).toArray()
    console.log(`Found ${savedJobs.length} saved jobs to migrate`)
    for (const saved of savedJobs) {
      if (!saved.jobId || !saved.userId) {
        console.log(`Skipping saved job ${saved._id} - missing job or user ID`)
        continue
      }
      await prisma.savedJob.create({
        data: {
          createdAt: new Date(saved.createdAt || Date.now()),
          jobId: idMappings.jobs.get(saved.jobId.toString()),
          userId: idMappings.users.get(saved.userId.toString())
        }
      })
      console.log(`Migrated saved job ${saved._id}`)
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await mongoClient.close()
    await prisma.$disconnect()
  }
}

migrateData().catch(console.error)
