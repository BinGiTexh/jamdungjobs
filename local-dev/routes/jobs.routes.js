/**
 * Job routes
 * @module routes/jobs
 */

const express = require('express');
const { authenticateJWT } = require('../middleware/auth');
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
        search, 
        location, 
        type,
        minSalary,
        maxSalary,
        page = 1,
        limit = 10
      } = req.query;

      const where = {
        status: 'ACTIVE',
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }),
        ...(location && {
          location: { contains: location, mode: 'insensitive' }
        }),
        ...(type && { type: type }),
        ...(minSalary && {
          salary: {
            min: { gte: parseInt(minSalary) }
          }
        }),
        ...(maxSalary && {
          salary: {
            max: { lte: parseInt(maxSalary) }
          }
        })
      };

      const jobs = await prisma.job.findMany({
        where,
        include: {
          company: true
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' }
      });

      const total = await prisma.job.count({ where });

      res.json({
        data: jobs,
        pagination: {
          total,
          pages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page)
        }
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ message: 'Error fetching jobs' });
    }
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
          company: {
            connect: { id: req.user.companyId }
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

  return router;
};

