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

const router = express.Router();
const prisma = new PrismaClient();

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
