/**
 * Application Management API
 * 
 * This file contains endpoints for managing job applications:
 * - GET /api/employer/applications - List all applications for employer's jobs
 * - GET /api/employer/applications/:id - Get application details
 * - PATCH /api/employer/applications/:id/status - Update application status
 * - GET /api/jobseeker/applications - List all applications for a job seeker
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateJWT, checkRole } = require('./middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'uploads');
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept PDF, DOC, DOCX files
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
    }
  }
});

/**
 * GET /api/employer/applications
 * List all applications for jobs posted by the employer's company
 * Supports filtering by status and sorting
 */
router.get('/employer/applications', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const { status, sort = 'createdAt', order = 'desc', limit = 20, offset = 0 } = req.query;
    
    // Get the employer's company
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });
    
    if (!user || !user.company) {
      return res.status(403).json({ message: 'Access denied - no company associated with user' });
    }
    
    // Build the where clause
    const where = {
      job: {
        companyId: user.company.id
      }
    };
    
    // Add status filter if provided
    if (status) {
      where.status = status;
    }
    
    // Get applications
    const applications = await prisma.jobApplication.findMany({
      where,
      orderBy: { [sort]: order },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            candidateProfile: {
              select: {
                resumeUrl: true,
                skills: true,
                education: true
              }
            }
          }
        }
      }
    });
    
    // Get total count
    const total = await prisma.jobApplication.count({ where });
    
    res.json({
      applications,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching employer applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

/**
 * GET /api/employer/applications/:id
 * Get application details
 */
router.get('/employer/applications/:id', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the employer's company
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });
    
    if (!user || !user.company) {
      return res.status(403).json({ message: 'Access denied - no company associated with user' });
    }
    
    // Get application with authorization check
    const application = await prisma.jobApplication.findFirst({
      where: {
        id,
        job: {
          companyId: user.company.id
        }
      },
      include: {
        job: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            location: true,
            candidateProfile: true
          }
        }
      }
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found or access denied' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ message: 'Error fetching application details', error: error.message });
  }
});

/**
 * PATCH /api/employer/applications/:id/status
 * Update application status
 */
router.patch('/employer/applications/:id/status', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status', 
        validStatuses 
      });
    }
    
    // Get the employer's company
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });
    
    if (!user || !user.company) {
      return res.status(403).json({ message: 'Access denied - no company associated with user' });
    }
    
    // Get application to verify ownership
    const applicationCheck = await prisma.jobApplication.findFirst({
      where: {
        id,
        job: {
          companyId: user.company.id
        }
      },
      include: {
        job: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    if (!applicationCheck) {
      return res.status(404).json({ message: 'Application not found or access denied' });
    }
    
    // Update application status
    const updatedApplication = await prisma.jobApplication.update({
      where: { id },
      data: { status },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    // Create notification for the job seeker
    await prisma.notification.create({
      data: {
        type: 'APPLICATION_UPDATE',
        title: `Application ${status.toLowerCase()}`,
        message: `Your application for ${applicationCheck.job.title} has been ${status.toLowerCase()}.`,
        recipientId: applicationCheck.user.id,
        jobApplicationId: id,
        metadata: {
          status,
          jobTitle: applicationCheck.job.title,
          companyName: user.company.name
        }
      }
    });
    
    res.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
});

/**
 * POST /api/applications
 * Submit a new job application
 */
router.post('/applications', authenticateJWT, upload.single('resume'), async (req, res) => {
  try {
    const { 
      jobId, 
      coverLetter, 
      phoneNumber, 
      availability, 
      salary, 
      additionalInfo,
      savedResumeId,
      applicationSource,
      sourceDetails
    } = req.body;

    // Validate required fields
    if (!jobId) {
      return res.status(400).json({ 
        success: false,
        message: 'Job ID is required',
        code: 'MISSING_JOB_ID'
      });
    }

    if (!applicationSource) {
      return res.status(400).json({
        success: false,
        message: 'Application source is required',
        code: 'MISSING_APPLICATION_SOURCE'
      });
    }

    if (applicationSource === 'OTHER' && !sourceDetails) {
      return res.status(400).json({
        success: false,
        message: 'Source details are required when selecting "Other"',
        code: 'MISSING_SOURCE_DETAILS'
      });
    }

    // Ensure job exists
    const job = await prisma.job.findUnique({ 
      where: { id: jobId }, 
      include: { company: true } 
    });
    
    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found',
        code: 'JOB_NOT_FOUND'
      });
    }

    // Prevent duplicate application
    const existing = await prisma.jobApplication.findFirst({
      where: { jobId, userId: req.user.id }
    });
    
    if (existing) {
      return res.status(409).json({ 
        success: false,
        code: 'ALREADY_APPLIED',
        message: 'You have already applied to this job'
      });
    }

    // Handle resume upload or saved resume
    let resumeUrl = null;
    if (req.file) {
      resumeUrl = `/uploads/${req.file.filename}`;
    }

    // Create application with source tracking
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        userId: req.user.id,
        coverLetter,
        phoneNumber,
        availability,
        salary,
        additionalInfo,
        savedResumeId,
        resumeUrl,
        applicationSource,
        sourceDetails,
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

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error submitting application', 
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/jobseeker/applications
 * List all applications for the current job seeker
 */
router.get('/jobseeker/applications', authenticateJWT, checkRole('JOBSEEKER'), async (req, res) => {
  try {
    const { status, sort = 'createdAt', order = 'desc', limit = 20, offset = 0 } = req.query;
    
    // Build the where clause
    const where = {
      userId: req.user.id
    };
    
    // Add status filter if provided
    if (status) {
      where.status = status;
    }
    
    // Get applications
    const applications = await prisma.jobApplication.findMany({
      where,
      orderBy: { [sort]: order },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true,
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true
              }
            }
          }
        }
      }
    });
    
    // Get total count
    const total = await prisma.jobApplication.count({ where });
    
    res.json({
      applications,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching jobseeker applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

module.exports = router;
