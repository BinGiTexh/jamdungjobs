const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const paymentService = require('../services/paymentService');
const webhookService = require('../services/webhookService');
const { authenticateToken, requireRole } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for payment endpoints
const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 payment requests per windowMs
  message: 'Too many payment requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const webhookRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Allow more webhook requests
  message: 'Too many webhook requests',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * @route POST /api/payments/create-payment-intent
 * @desc Create a payment intent for job posting or subscription
 * @access Private (Employer)
 */
router.post('/create-payment-intent',
  paymentRateLimit,
  authenticateToken,
  requireRole(['EMPLOYER', 'ADMIN']),
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('currency').isIn(['USD', 'JMD']).withMessage('Currency must be USD or JMD'),
    body('paymentType').isIn(['JOB_POSTING', 'FEATURED_LISTING', 'PREMIUM_LISTING', 'SUBSCRIPTION'])
      .withMessage('Invalid payment type'),
    body('jobId').optional().isUUID().withMessage('Invalid job ID'),
    body('subscriptionId').optional().isUUID().withMessage('Invalid subscription ID'),
    body('description').optional().isString().trim().isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const {
        amount,
        currency,
        paymentType,
        jobId,
        subscriptionId,
        description,
        metadata = {}
      } = req.body;

      const result = await paymentService.createPaymentIntent({
        userId: req.user.id,
        amount,
        currency,
        paymentType,
        jobId,
        subscriptionId,
        description,
        metadata
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment intent',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route POST /api/payments/confirm-payment
 * @desc Confirm a payment intent
 * @access Private
 */
router.post('/confirm-payment',
  paymentRateLimit,
  authenticateToken,
  [
    body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { paymentIntentId } = req.body;

      const payment = await paymentService.confirmPayment(paymentIntentId);

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to confirm payment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route GET /api/payments/history
 * @desc Get payment history for authenticated user
 * @access Private
 */
router.get('/history',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await paymentService.getPaymentHistory(req.user.id, { page, limit });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting payment history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route GET /api/payments/pricing
 * @desc Get current pricing information
 * @access Public
 */
router.get('/pricing', (req, res) => {
  try {
    const pricing = paymentService.getPricing();
    res.json({
      success: true,
      data: pricing
    });
  } catch (error) {
    console.error('Error getting pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pricing information'
    });
  }
});

/**
 * @route POST /api/subscriptions/create
 * @desc Create a subscription for employer
 * @access Private (Employer)
 */
router.post('/subscriptions/create',
  paymentRateLimit,
  authenticateToken,
  requireRole(['EMPLOYER', 'ADMIN']),
  [
    body('plan').isIn(['BASIC', 'PREMIUM']).withMessage('Plan must be BASIC or PREMIUM'),
    body('currency').optional().isIn(['USD', 'JMD']).withMessage('Currency must be USD or JMD'),
    body('paymentMethodId').optional().isString().withMessage('Invalid payment method ID')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { plan, currency = 'USD', paymentMethodId } = req.body;

      const result = await paymentService.createSubscription({
        userId: req.user.id,
        plan,
        currency,
        paymentMethodId
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create subscription',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route PUT /api/subscriptions/:id/update
 * @desc Update subscription
 * @access Private (Employer)
 */
router.put('/subscriptions/:id/update',
  authenticateToken,
  requireRole(['EMPLOYER', 'ADMIN']),
  [
    param('id').isUUID().withMessage('Invalid subscription ID'),
    body('plan').optional().isIn(['BASIC', 'PREMIUM']).withMessage('Plan must be BASIC or PREMIUM')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { plan } = req.body;

      // Implementation for updating subscription plan
      // This would involve Stripe API calls to modify the subscription

      res.json({
        success: true,
        message: 'Subscription update functionality coming soon'
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update subscription'
      });
    }
  }
);

/**
 * @route DELETE /api/subscriptions/:id/cancel
 * @desc Cancel subscription
 * @access Private (Employer)
 */
router.delete('/subscriptions/:id/cancel',
  authenticateToken,
  requireRole(['EMPLOYER', 'ADMIN']),
  [
    param('id').isUUID().withMessage('Invalid subscription ID'),
    body('cancelAtPeriodEnd').optional().isBoolean().withMessage('cancelAtPeriodEnd must be boolean')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { cancelAtPeriodEnd = true } = req.body;

      const result = await paymentService.cancelSubscription(id, cancelAtPeriodEnd);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route POST /api/payments/refund
 * @desc Process refund (Admin only)
 * @access Private (Admin)
 */
router.post('/refund',
  authenticateToken,
  requireRole(['ADMIN']),
  [
    body('paymentId').isUUID().withMessage('Invalid payment ID'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('reason').optional().isIn(['duplicate', 'fraudulent', 'requested_by_customer'])
      .withMessage('Invalid refund reason'),
    body('adminNotes').optional().isString().trim().isLength({ max: 1000 })
      .withMessage('Admin notes must be less than 1000 characters')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { paymentId, amount, reason, adminNotes } = req.body;

      const result = await paymentService.processRefund({
        paymentId,
        amount,
        reason,
        processedBy: req.user.id,
        adminNotes
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route POST /api/webhooks/stripe
 * @desc Handle Stripe webhooks
 * @access Public (but verified by Stripe signature)
 */
router.post('/webhooks/stripe',
  webhookRateLimit,
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];

    try {
      await webhookService.processWebhook(req.body, signature);
      
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook processing failed:', error);
      res.status(400).json({
        success: false,
        message: 'Webhook processing failed',
        error: error.message
      });
    }
  }
);

/**
 * @route GET /api/payments/analytics
 * @desc Get payment analytics (Admin only)
 * @access Private (Admin)
 */
router.get('/analytics',
  authenticateToken,
  requireRole(['ADMIN']),
  [
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
    query('currency').optional().isIn(['USD', 'JMD', 'ALL']).withMessage('Invalid currency filter')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { startDate, endDate, currency } = req.query;
      
      // Implementation for payment analytics
      // This would aggregate payment data for admin dashboard
      
      res.json({
        success: true,
        message: 'Payment analytics functionality coming soon'
      });
    } catch (error) {
      console.error('Error getting payment analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment analytics'
      });
    }
  }
);

/**
 * @route GET /api/payments/heart-revenue
 * @desc Get HEART revenue sharing data (Admin only)
 * @access Private (Admin)
 */
router.get('/heart-revenue',
  authenticateToken,
  requireRole(['ADMIN']),
  [
    query('month').optional().matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
    query('status').optional().isIn(['PENDING', 'COMPLETED', 'FAILED']).withMessage('Invalid status')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { month, status } = req.query;
      
      // Implementation for HEART revenue sharing data
      // This would show revenue sharing calculations and transfer status
      
      res.json({
        success: true,
        message: 'HEART revenue sharing data functionality coming soon'
      });
    } catch (error) {
      console.error('Error getting HEART revenue data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get HEART revenue data'
      });
    }
  }
);

module.exports = router;
