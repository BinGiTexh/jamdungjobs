/**
 * Job routes
 * @module routes/jobs
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateJWT, checkRole } = require('../middleware/auth');
const jobViewService = require('../services/jobViewService');
const router = express.Router();

/**
 * Initialize job routes
 * @param {PrismaClient} prisma - Prisma client instance
 */
module.exports = (prisma) => {
  // Configure multer storage (reuse uploads directory)
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
      cb(null, uniqueName);
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

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
        // Create a minimal company and associate the employer with it
        const company = await prisma.company.create({
          data: {
            name: req.user.companyName || 'My Company',
            employees: {
              connect: { id: req.user.id }
            }
          }
        });
        companyId = company.id;

        // Persist the link on the user record so future requests carry companyId
        await prisma.user.update({
          where: { id: req.user.id },
          data: { companyId }
        });
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
   * @route PUT /api/jobs/:id
   * @description Update an existing job (employer only)
   * @access Private (Employer only)
   */
  router.put('/:id', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
    try {
      const jobId = req.params.id;
      const {
        title,
        description,
        location,
        type,
        salary,
        experience,
        education,
        requirements,
        benefits,
        responsibilities,
        status
      } = req.body;

      // Fetch job and validate ownership
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { company: true }
      });

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Authorization checks for employers (admin bypasses)
      if (req.user.role !== 'ADMIN') {
        const sameCompany = req.user.companyId && req.user.companyId === job.companyId;
        const creator = job.createdById && job.createdById === req.user.id;
        let employeeOfCompany = false;
        if (job.companyId) {
          const count = await prisma.company.count({
            where: { id: job.companyId, employees: { some: { id: req.user.id } } }
          });
          employeeOfCompany = count > 0;
        }
        if (!sameCompany && !creator && !employeeOfCompany) {
          return res.status(403).json({ message: 'Not authorized to update this job' });
        }
      }

      // Normalize salary if a string range was supplied
      let normalizedSalary = salary;
      if (salary && typeof salary === 'string') {
        const match = salary.replace(/[$,\s]/g, '').split('-');
        if (match.length === 2) {
          const [minStr, maxStr] = match;
          const min = parseInt(minStr, 10);
          const max = parseInt(maxStr, 10);
          if (!Number.isNaN(min) && !Number.isNaN(max)) {
            normalizedSalary = { min, max };
          }
        }
      }

      const updated = await prisma.job.update({
        where: { id: jobId },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(location !== undefined && { location }),
          ...(type !== undefined && { type }),
          ...(normalizedSalary !== undefined && { salary: normalizedSalary }),
          ...(experience !== undefined && { experience }),
          ...(education !== undefined && { education }),
          ...(status !== undefined && { status })
        }
      });

      res.json(updated);
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({ message: 'Error updating job' });
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

      // Track job view (async, don't wait for it)
      const userId = req.user?.id || null;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      const referrer = req.get('Referer');
      
      jobViewService.trackJobView({
        jobId: job.id,
        userId,
        ipAddress,
        userAgent,
        referrer
      }).catch(error => {
        console.error('Error tracking job view:', error);
      });

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
  router.post('/:id/apply', authenticateJWT, checkRole('JOBSEEKER'), upload.single('coverLetterFile'), async (req, res) => {
    try {
      let { coverLetter } = req.body;
      const jobId = req.params.id;

      // If a PDF file is uploaded, validate and use its URL instead of text cover letter
      if (req.file) {
        if (req.file.mimetype !== 'application/pdf') {
          // Remove invalid file
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: 'Only PDF cover letters are allowed' });
        }
        coverLetter = `/uploads/${req.file.filename}`;
      }

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
          type: 'APPLICATION_UPDATE',
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
              type: 'APPLICATION_UPDATE',
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

  /**
   * @route POST /api/jobs/:id/track-view
   * @desc Track job view explicitly (for SPA navigation)
   * @access Public
   */
  router.post('/:id/track-view', async (req, res) => {
    try {
      const jobId = req.params.id;
      const userId = req.user?.id || null;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      const referrer = req.get('Referer');
      
      const jobView = await jobViewService.trackJobView({
        jobId,
        userId,
        ipAddress,
        userAgent,
        referrer
      });

      res.json({ success: true, viewId: jobView.id });
    } catch (error) {
      console.error('Error tracking job view:', error);
      res.status(500).json({ message: 'Error tracking job view' });
    }
  });

  /**
   * @route GET /api/jobs/:id/stats
   * @desc Get job view statistics
   * @access Private (Employer only)
   */
  router.get('/:id/stats', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
    try {
      const jobId = req.params.id;
      
      // Verify job ownership
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { company: true }
      });

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Check if user has access to this job
      if (req.user.role !== 'ADMIN') {
        const hasAccess = req.user.companyId === job.companyId ||
                         (job.company && job.company.employees?.some(emp => emp.id === req.user.id));
        
        if (!hasAccess) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      const stats = await jobViewService.getJobViewStats(jobId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching job stats:', error);
      res.status(500).json({ message: 'Error fetching job stats' });
    }
  });

  return router;
};
