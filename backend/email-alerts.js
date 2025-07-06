/**
 * Email Alerts API
 * Handles job alert subscriptions and email notifications
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Authentication middleware (optional for anonymous users)
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    // Add your JWT verification logic here
    // For now, we'll assume user is authenticated if token exists
    req.user = { id: 'user-id-from-token' }; // Replace with actual JWT decode
  }
  next();
};

/**
 * POST /api/email-alerts
 * Create a job alert subscription (anonymous or authenticated)
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { 
      email, 
      searchQuery = '', 
      searchLocation = '', 
      jobType = '', 
      skills = [], 
      salaryMin = 0,
      frequency = 'DAILY' // DAILY, WEEKLY, INSTANT
    } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        message: 'Valid email address is required' 
      });
    }

    // Check if alert already exists for this email and criteria
    const existingAlert = await prisma.jobAlert.findFirst({
      where: {
        email,
        searchQuery,
        searchLocation,
        jobType,
        active: true
      }
    });

    if (existingAlert) {
      return res.status(409).json({ 
        message: 'Job alert with similar criteria already exists',
        alertId: existingAlert.id
      });
    }

    // Create job alert
    const jobAlert = await prisma.jobAlert.create({
      data: {
        email,
        searchQuery,
        searchLocation,
        jobType,
        skills,
        salaryMin: parseInt(salaryMin),
        frequency,
        userId: req.user?.id || null, // Link to user if authenticated
        active: true,
        lastSent: null
      }
    });

    // Create welcome notification for authenticated users
    if (req.user?.id) {
      await prisma.notification.create({
        data: {
          type: 'SYSTEM',
          status: 'UNREAD',
          title: 'Job Alert Created',
          message: `You'll receive ${frequency.toLowerCase()} job alerts for "${searchQuery || 'all jobs'}"${searchLocation ? ` in ${searchLocation}` : ''}`,
          recipientId: req.user.id,
          relatedEntityIds: { alertId: jobAlert.id }
        }
      });
    }

    // Log successful alert creation
    console.log(`Job alert created: ${email} - ${searchQuery || 'all jobs'}`);

    res.status(201).json({
      message: 'Job alert created successfully',
      alert: {
        id: jobAlert.id,
        email: jobAlert.email,
        searchQuery: jobAlert.searchQuery,
        searchLocation: jobAlert.searchLocation,
        frequency: jobAlert.frequency,
        active: jobAlert.active
      }
    });

  } catch (error) {
    console.error('Error creating job alert:', error);
    res.status(500).json({ 
      message: 'Error creating job alert',
      error: error.message 
    });
  }
});

/**
 * GET /api/email-alerts
 * Get user's job alerts (authenticated users only)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const alerts = await prisma.jobAlert.findMany({
      where: {
        userId: req.user.id,
        active: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      alerts: alerts.map(alert => ({
        id: alert.id,
        searchQuery: alert.searchQuery,
        searchLocation: alert.searchLocation,
        jobType: alert.jobType,
        skills: alert.skills,
        frequency: alert.frequency,
        createdAt: alert.createdAt,
        lastSent: alert.lastSent
      }))
    });

  } catch (error) {
    console.error('Error fetching job alerts:', error);
    res.status(500).json({ 
      message: 'Error fetching job alerts',
      error: error.message 
    });
  }
});

/**
 * DELETE /api/email-alerts/:id
 * Unsubscribe from job alert
 */
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query; // Allow unsubscribe by email for anonymous users

    // Build where clause
    const where = { id };
    if (req.user?.id) {
      where.userId = req.user.id;
    } else if (email) {
      where.email = email;
    } else {
      return res.status(400).json({ 
        message: 'Authentication or email required for unsubscribe' 
      });
    }

    // Find and deactivate alert
    const alert = await prisma.jobAlert.findFirst({ where });
    
    if (!alert) {
      return res.status(404).json({ message: 'Job alert not found' });
    }

    await prisma.jobAlert.update({
      where: { id },
      data: { active: false }
    });

    console.log(`Job alert unsubscribed: ${alert.email} - ${id}`);

    res.json({ message: 'Successfully unsubscribed from job alert' });

  } catch (error) {
    console.error('Error unsubscribing from job alert:', error);
    res.status(500).json({ 
      message: 'Error unsubscribing from job alert',
      error: error.message 
    });
  }
});

/**
 * POST /api/email-alerts/send-digest
 * Send job alert digest (internal/cron use)
 */
router.post('/send-digest', async (req, res) => {
  try {
    const { frequency = 'DAILY' } = req.body;

    // Get active alerts for the specified frequency
    const alerts = await prisma.jobAlert.findMany({
      where: {
        active: true,
        frequency
      }
    });

    let sentCount = 0;
    const errors = [];

    for (const alert of alerts) {
      try {
        // Build search criteria
        const searchWhere = {
          status: 'ACTIVE',
          ...(alert.searchQuery && {
            OR: [
              { title: { contains: alert.searchQuery, mode: 'insensitive' } },
              { description: { contains: alert.searchQuery, mode: 'insensitive' } }
            ]
          }),
          ...(alert.searchLocation && {
            location: { contains: alert.searchLocation, mode: 'insensitive' }
          }),
          ...(alert.jobType && { type: alert.jobType }),
          ...(alert.skills.length > 0 && {
            skills: { hasSome: alert.skills }
          }),
          ...(alert.salaryMin > 0 && {
            salaryMin: { gte: alert.salaryMin }
          })
        };

        // Get jobs created since last alert or in the last day/week
        const timeThreshold = new Date();
        if (frequency === 'DAILY') {
          timeThreshold.setDate(timeThreshold.getDate() - 1);
        } else if (frequency === 'WEEKLY') {
          timeThreshold.setDate(timeThreshold.getDate() - 7);
        }

        if (alert.lastSent) {
          searchWhere.createdAt = { gte: alert.lastSent };
        } else {
          searchWhere.createdAt = { gte: timeThreshold };
        }

        const matchingJobs = await prisma.job.findMany({
          where: searchWhere,
          include: {
            company: {
              select: { name: true, logoUrl: true }
            }
          },
          take: 10, // Limit to 10 jobs per alert
          orderBy: { createdAt: 'desc' }
        });

        if (matchingJobs.length > 0) {
          // Here you would integrate with your email service
          // For now, we'll just log and update the lastSent timestamp
          console.log(`Would send ${matchingJobs.length} jobs to ${alert.email}`);
          
          await prisma.jobAlert.update({
            where: { id: alert.id },
            data: { lastSent: new Date() }
          });

          sentCount++;
        }

      } catch (alertError) {
        console.error(`Error processing alert ${alert.id}:`, alertError);
        errors.push({ alertId: alert.id, error: alertError.message });
      }
    }

    res.json({
      message: `Job alert digest processed`,
      sentCount,
      totalAlerts: alerts.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error sending job alert digest:', error);
    res.status(500).json({ 
      message: 'Error sending job alert digest',
      error: error.message 
    });
  }
});

/**
 * GET /api/email-alerts/stats
 * Get job alert statistics (admin only)
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await prisma.jobAlert.groupBy({
      by: ['frequency', 'active'],
      _count: {
        id: true
      }
    });

    const totalActive = await prisma.jobAlert.count({
      where: { active: true }
    });

    const recentSignups = await prisma.jobAlert.count({
      where: {
        active: true,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    res.json({
      totalActive,
      recentSignups,
      breakdown: stats
    });

  } catch (error) {
    console.error('Error fetching job alert stats:', error);
    res.status(500).json({ 
      message: 'Error fetching job alert stats',
      error: error.message 
    });
  }
});

module.exports = router;
