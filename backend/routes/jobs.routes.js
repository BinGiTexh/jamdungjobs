/**
 * Job routes
 * @module routes/jobs
 */

const express = require('express');
const { authenticateJWT, checkRole } = require('../middleware/auth');
const router = express.Router();

/**
 * Initialize job routes
 * @param {PrismaClient} prisma - Prisma client instance
 */
module.exports = (prisma) => {
  /**
   * @route GET /api/jobs
   * @description Get all jobs with filtering
   * @access Public
   */
  router.get('/', async (req, res) => {
    try {
      const { 
        search, // legacy param from backend
        query,  // alias used by frontend
        queryMatchMode = 'partial',
        location, 
        type,
        minSalary,
        maxSalary,
        page = 1,
        limit = 10
      } = req.query;

      const keyword = search || query;

      const buildTextFilter = (field) => {
        if (!keyword) return undefined;
        if (queryMatchMode === 'exact') {
          return { [field]: { equals: keyword, mode: 'insensitive' } };
        }
        // default partial/contains
        return { [field]: { contains: keyword, mode: 'insensitive' } };
      };

      const where = {
        status: 'ACTIVE',
        ...(keyword && {
          OR: [
            buildTextFilter('title'),
            buildTextFilter('description')
          ].filter(Boolean)
        }),
        ...(location && {
          location: { contains: location, mode: 'insensitive' }
        }),
        ...(type && { type: type }),
      };

      // Fetch all active jobs matching non-salary criteria, include company data
      let jobs = await prisma.job.findMany({
        where,
        include: {
          company: true
        },
        orderBy: { updatedAt: 'desc' }
      });

      // Apply salary range filtering in-memory since salary is stored as JSON
      if (minSalary || maxSalary) {
        const min = minSalary ? parseInt(minSalary, 10) : null;
        const max = maxSalary ? parseInt(maxSalary, 10) : null;

        jobs = jobs.filter((j) => {
          const sal = j.salary || {};
          const jobMin = typeof sal.min === 'number' ? sal.min : null;
          const jobMax = typeof sal.max === 'number' ? sal.max : jobMin;

          const minOk = min === null || (jobMin !== null && jobMin >= min);
          const maxOk = max === null || (jobMax !== null && jobMax <= max);
          return minOk && maxOk;
        });
      }

      // Total after filtering
      const total = jobs.length;

      // Pagination (slice after filtering)
      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      const paginatedJobs = jobs.slice((pageInt - 1) * limitInt, pageInt * limitInt);

      res.json({
        jobs: paginatedJobs,
        pagination: {
          total,
          pages: Math.ceil(total / limitInt),
          currentPage: pageInt
        }
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ message: 'Error fetching jobs' });
    }
  });

  /**
   * @route GET /api/jobs/search
   * @desc    Alias to list jobs with filters (same as /api/jobs)
   * @access  Public
   */
  router.get('/search', async (req, res) => {
    // Delegate to the same handler by calling next with modified url
    req.url = '/';
    return router.handle(req, res);
  });

  /**
   * @route POST /api/jobs
   * @description Create a new job
   * @access Private (Employer only)
   */
  router.post('/', authenticateJWT, async (req, res) => {
    try {
      if (req.user.role !== 'EMPLOYER') {
        return res.status(403).json({ message: 'Only employers can create jobs' });
      }

      const {
        title,
        description,
        location,
        type,
        skills,
        salary,
        experience,
        education
      } = req.body;

      // Resolve company for employer
      let companyId = req.user.companyId;
      if (!companyId) {
        const company = await prisma.company.findFirst({
          where: { employees: { some: { id: req.user.id } } },
          select: { id: true }
        });
        if (!company) {
          return res.status(400).json({ message: 'Employer has no company profile' });
        }
        companyId = company.id;
      }

      const job = await prisma.job.create({
        data: {
          title,
          description,
          location,
          type,
          skills,
          salary,
          experience,
          education,
          status: 'ACTIVE',
          company: {
            connect: { id: companyId }
          }
        },
        include: {
          company: true
        }
      });

      res.status(201).json(job);
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ message: 'Error creating job' });
    }
  });

  /**
   * @route GET /api/jobs/:id
   * @description Get job by ID
   * @access Public
   */
  router.get('/:id', async (req, res) => {
    try {
      const job = await prisma.job.findUnique({
        where: { id: req.params.id },
        include: {
          company: true
        }
      });

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      res.json(job);
    } catch (error) {
      console.error('Error fetching job:', error);
      res.status(500).json({ message: 'Error fetching job' });
    }
  });

  /**
   * @route POST /api/jobs/:id/apply
   * @desc  Jobseeker applies to a job
   * @access Private/Jobseeker
   */
  router.post('/:id/apply', authenticateJWT, checkRole('JOBSEEKER'), async (req, res) => {
    try {
      const { coverLetter } = req.body;
      const jobId = req.params.id;

      // Ensure job exists
      const job = await prisma.job.findUnique({ where: { id: jobId }, include: { company: true } });
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Prevent duplicate application
      const existing = await prisma.jobApplication.findFirst({
        where: { jobId, userId: req.user.id }
      });
      if (existing) {
        return res.status(409).json({ 
          success: false,
          code: 'ALREADY_APPLIED',
          message: 'You have applied to this job already. The employer will be in touch with you soon.'
        });
      }

      const application = await prisma.jobApplication.create({
        data: {
          jobId,
          userId: req.user.id,
          coverLetter,
          status: 'PENDING'
        }
      });

      // Notify candidate of successful application
      await prisma.notification.create({
        data: {
          type: 'APPLICATION_SUBMITTED',
          title: `Application submitted for ${job.title}`,
          message: `You applied to ${job.title} at ${job.company?.name || 'company'}`,
          recipientId: req.user.id,
          jobApplicationId: application.id
        }
      });

      // Notify all employer users of the company
      if (job.company) {
        const employers = await prisma.user.findMany({
          where: {
            companyId: job.company.id,
            role: 'EMPLOYER'
          },
          select: { id: true }
        });

        if (employers.length) {
          await prisma.notification.createMany({
            data: employers.map((emp) => ({
              type: 'NEW_APPLICATION',
              title: `New application for ${job.title}`,
              message: `${req.user.email} applied to ${job.title}`,
              recipientId: emp.id,
              jobApplicationId: application.id
            }))
          });
        }
      }

      res.status(201).json(application);
    } catch (error) {
      console.error('Error applying to job:', error);
      res.status(500).json({ message: 'Error applying to job' });
    }
  });

  return router;
};
