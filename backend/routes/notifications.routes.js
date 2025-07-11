/**
 * Notification routes
 * @module routes/notifications
 */

const express = require('express');
const { param, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { authenticateJWT } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const router = express.Router();

// Rate limiting configurations
const notificationsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: 'Too many notification requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded for notifications', {
      requestId: req.id,
      userId: req.user?.id,
      ip: req.ip
    });
    res.status(429).json({
      message: 'Too many requests, please try again later',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }
});

/**
 * Initialize notification routes
 * @param {PrismaClient} prisma - Prisma client instance
 */
module.exports = (prisma) => {
  // Input validation middleware
  const validateNotificationQuery = [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['READ', 'UNREAD', 'ALL']),
    query('type').optional().isIn([
      'APPLICATION_UPDATE',
      'MESSAGE',
      'JOB_RECOMMENDATION',
      'SAVED_JOB_UPDATE',
      'PROFILE_VIEW',
      'REMINDER',
      'SYSTEM'
    ])
  ];

  const validateNotificationId = [
    param('id').isUUID().withMessage('Invalid notification ID')
  ];

  /**
   * @route GET /api/notifications
   * @description Get user's notifications with filtering and pagination
   * @access Private
   */
  router.get('/', 
    authenticateJWT,
    notificationsRateLimit,
    validateNotificationQuery,
    async (req, res) => {
      const startTime = Date.now();
      const requestId = req.id;

      try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          logger.warn('Invalid notification query parameters', {
            requestId,
            errors: errors.array()
          });
          return res.status(400).json({ errors: errors.array() });
        }

        const {
          page = 1,
          limit = 20,
          status = 'ALL',
          type
        } = req.query;

        // Build where clause
        const where = {
          recipientId: req.user.id,
          ...(status !== 'ALL' && { status }),
          ...(type && { type })
        };

        // Get notifications with pagination
        const [notifications, total] = await prisma.$transaction([
          prisma.notification.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              jobApplication: {
                include: {
                  job: {
                    select: {
                      id: true,
                      title: true,
                      company: {
                        select: {
                          id: true,
                          name: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }),
          prisma.notification.count({ where })
        ]);

        logger.info('Notifications retrieved successfully', {
          requestId,
          userId: req.user.id,
          count: notifications.length,
          duration: Date.now() - startTime
        });

        res.json({
          data: notifications,
          pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            perPage: limit
          }
        });
      } catch (error) {
        logger.error('Error fetching notifications', {
          requestId,
          userId: req.user.id,
          error: error.message,
          stack: error.stack
        });
        res.status(500).json({
          message: 'Error fetching notifications',
          requestId
        });
      }
    }
  );

  /**
   * @route GET /api/notifications/count
   * @description Get count of unread notifications
   * @access Private
   */
  router.get('/count',
    authenticateJWT,
    notificationsRateLimit,
    async (req, res) => {
      const startTime = Date.now();
      const requestId = req.id;

      try {
        const count = await prisma.notification.count({
          where: {
            recipientId: req.user.id,
            status: 'UNREAD'
          }
        });

        logger.info('Notification count retrieved', {
          requestId,
          userId: req.user.id,
          count,
          duration: Date.now() - startTime
        });

        res.json({ count });
      } catch (error) {
        logger.error('Error fetching notification count', {
          requestId,
          userId: req.user.id,
          error: error.message,
          stack: error.stack
        });
        res.status(500).json({
          message: 'Error fetching notification count',
          requestId
        });
      }
    }
  );

  /**
   * @route PATCH /api/notifications/:id/mark-read
   * @description Alias endpoint to mark a notification as read (backward compatibility)
   * @access Private
   */
  router.patch('/:id/mark-read',
    authenticateJWT,
    notificationsRateLimit,
    validateNotificationId,
    async (req, res, next) => {
      // Delegate to the existing handler logic by rewriting the URL and calling next route
      req.url = `/${req.params.id}`; // Express will match the next PATCH /:id route
      next();
    }
  );

  /**
   * @route PATCH /api/notifications/:id
   * @description Mark a notification as read
   * @access Private
   */
  router.patch('/:id',
    authenticateJWT,
    notificationsRateLimit,
    validateNotificationId,
    async (req, res) => {
      const startTime = Date.now();
      const requestId = req.id;

      try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          logger.warn('Invalid notification ID', {
            requestId,
            errors: errors.array()
          });
          return res.status(400).json({ errors: errors.array() });
        }

        // Check if notification exists and belongs to user
        const notification = await prisma.notification.findFirst({
          where: {
            id: req.params.id,
            recipientId: req.user.id
          }
        });

        if (!notification) {
          logger.warn('Notification not found or unauthorized access', {
            requestId,
            userId: req.user.id,
            notificationId: req.params.id
          });
          return res.status(404).json({
            message: 'Notification not found',
            requestId
          });
        }

        // Update notification
        const updated = await prisma.notification.update({
          where: { id: req.params.id },
          data: { status: 'READ' }
        });

        logger.info('Notification marked as read', {
          requestId,
          userId: req.user.id,
          notificationId: req.params.id,
          duration: Date.now() - startTime
        });

        res.json(updated);
      } catch (error) {
        logger.error('Error updating notification', {
          requestId,
          userId: req.user.id,
          notificationId: req.params.id,
          error: error.message,
          stack: error.stack
        });
        res.status(500).json({
          message: 'Error updating notification',
          requestId
        });
      }
    }
  );

  /**
   * @route PATCH /api/notifications/mark-all-read
   * @description Mark all notifications as read for the authenticated user
   * @access Private
   */
  router.patch('/mark-all-read',
    authenticateJWT,
    notificationsRateLimit,
    async (req, res) => {
      const startTime = Date.now();
      const requestId = req.id;

      try {
        // Update all unread notifications for the user
        const result = await prisma.notification.updateMany({
          where: {
            recipientId: req.user.id,
            status: 'UNREAD'
          },
          data: {
            status: 'READ'
          }
        });

        logger.info('All notifications marked as read', {
          requestId,
          userId: req.user.id,
          updatedCount: result.count,
          duration: Date.now() - startTime
        });

        res.json({
          success: true,
          message: `${result.count} notifications marked as read`,
          updatedCount: result.count
        });
      } catch (error) {
        logger.error('Error marking all notifications as read', {
          requestId,
          userId: req.user.id,
          error: error.message,
          stack: error.stack
        });
        res.status(500).json({
          success: false,
          message: 'Error marking notifications as read',
          requestId
        });
      }
    }
  );

  /**
   * @route DELETE /api/notifications/:id
   * @description Dismiss a notification
   * @access Private
   */
  router.delete('/:id',
    authenticateJWT,
    notificationsRateLimit,
    validateNotificationId,
    async (req, res) => {
      const startTime = Date.now();
      const requestId = req.id;

      try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          logger.warn('Invalid notification ID', {
            requestId,
            errors: errors.array()
          });
          return res.status(400).json({ errors: errors.array() });
        }

        // Check if notification exists and belongs to user
        const notification = await prisma.notification.findFirst({
          where: {
            id: req.params.id,
            recipientId: req.user.id
          }
        });

        if (!notification) {
          logger.warn('Notification not found or unauthorized access', {
            requestId,
            userId: req.user.id,
            notificationId: req.params.id
          });
          return res.status(404).json({
            message: 'Notification not found',
            requestId
          });
        }

        // Mark notification as dismissed
        const updated = await prisma.notification.update({
          where: { id: req.params.id },
          data: { dismissed: true }
        });

        logger.info('Notification dismissed', {
          requestId,
          userId: req.user.id,
          notificationId: req.params.id,
          duration: Date.now() - startTime
        });

        res.json(updated);
      } catch (error) {
        logger.error('Error dismissing notification', {
          requestId,
          userId: req.user.id,
          notificationId: req.params.id,
          error: error.message,
          stack: error.stack
        });
        res.status(500).json({
          message: 'Error dismissing notification',
          requestId
        });
      }
    }
  );

  return router;
};
