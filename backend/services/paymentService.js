const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Exchange rates for JMD to USD conversion
const EXCHANGE_RATES = {
  JMD_TO_USD: 0.0065, // Approximate rate, should be updated from external API
  USD_TO_JMD: 154.0
};

// Pricing configuration
const PRICING = {
  JOB_POSTING: {
    BASIC: { USD: 5000, JMD: 7700 }, // $50 USD, $77 JMD
    FEATURED: { USD: 10000, JMD: 15400 }, // $100 USD, $154 JMD
    PREMIUM: { USD: 15000, JMD: 23100 } // $150 USD, $231 JMD
  },
  SUBSCRIPTION: {
    BASIC: { USD: 20000, JMD: 30800 }, // $200 USD, $308 JMD monthly
    PREMIUM: { USD: 50000, JMD: 77000 } // $500 USD, $770 JMD monthly
  }
};

// HEART partnership revenue sharing (20% to HEART)
const HEART_SHARE_PERCENTAGE = 0.20;

class PaymentService {
  /**
   * Create a payment intent for job posting or subscription
   */
  async createPaymentIntent({
    userId,
    amount,
    currency = 'USD',
    paymentType,
    jobId = null,
    subscriptionId = null,
    description = null,
    metadata = {}
  }) {
    try {
      // Convert amount to cents if not already
      const amountInCents = Math.round(amount * 100);
      
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        metadata: {
          userId,
          paymentType,
          jobId: jobId || '',
          subscriptionId: subscriptionId || '',
          ...metadata
        },
        description: description || `JamDung Jobs - ${paymentType}`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Calculate HEART share if applicable
      const heartShareAmount = this.shouldCalculateHeartShare(paymentType) 
        ? Math.round(amountInCents * HEART_SHARE_PERCENTAGE)
        : null;

      // Create payment record in database
      const payment = await prisma.payment.create({
        data: {
          stripePaymentId: paymentIntent.id,
          userId,
          amount: amountInCents,
          currency: currency.toUpperCase(),
          paymentType,
          description,
          jobId,
          subscriptionId,
          stripeClientSecret: paymentIntent.client_secret,
          heartShareAmount,
          metadata: metadata
        }
      });

      return {
        paymentId: payment.id,
        clientSecret: paymentIntent.client_secret,
        amount: amountInCents,
        currency: currency.toUpperCase()
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm payment and update status
   */
  async confirmPayment(paymentIntentId) {
    try {
      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // Find payment in database
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentId: paymentIntentId },
        include: { user: true, job: true }
      });

      if (!payment) {
        throw new Error('Payment not found in database');
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentIntent.status === 'succeeded' ? 'SUCCEEDED' : 'FAILED',
          processedAt: new Date(),
          stripeReceiptUrl: paymentIntent.charges?.data[0]?.receipt_url || null
        }
      });

      // If payment succeeded, handle post-payment actions
      if (paymentIntent.status === 'succeeded') {
        await this.handleSuccessfulPayment(updatedPayment);
      }

      return updatedPayment;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  /**
   * Create subscription for employer
   */
  async createSubscription({
    userId,
    plan,
    currency = 'USD',
    paymentMethodId = null
  }) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get pricing for plan
      const planPricing = PRICING.SUBSCRIPTION[plan.toUpperCase()];
      if (!planPricing) {
        throw new Error('Invalid subscription plan');
      }

      const amount = planPricing[currency.toUpperCase()];

      // Create or retrieve Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: { userId: user.id }
        });
        stripeCustomerId = customer.id;

        // Update user with Stripe customer ID
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId }
        });
      }

      // Create Stripe subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `JamDung Jobs ${plan} Plan`,
              description: `Monthly subscription for ${plan} employer features`
            },
            unit_amount: amount,
            recurring: { interval: 'month' }
          }
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          plan
        }
      });

      // Create subscription record in database
      const dbSubscription = await prisma.subscription.create({
        data: {
          stripeSubscriptionId: subscription.id,
          userId,
          plan: plan.toUpperCase(),
          amount,
          currency: currency.toUpperCase(),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          status: subscription.status.toUpperCase(),
          ...this.getSubscriptionFeatures(plan)
        }
      });

      return {
        subscriptionId: dbSubscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId }
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Cancel in Stripe
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        { cancel_at_period_end: cancelAtPeriodEnd }
      );

      // Update database
      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          cancelAtPeriodEnd,
          canceledAt: cancelAtPeriodEnd ? null : new Date(),
          status: cancelAtPeriodEnd ? 'ACTIVE' : 'CANCELED'
        }
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Process refund
   */
  async processRefund({
    paymentId,
    amount = null,
    reason = 'requested_by_customer',
    processedBy = null,
    adminNotes = null
  }) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'SUCCEEDED') {
        throw new Error('Can only refund successful payments');
      }

      // Create refund in Stripe
      const refundAmount = amount || payment.amount;
      const stripeRefund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentId,
        amount: refundAmount,
        reason,
        metadata: {
          paymentId,
          processedBy: processedBy || 'system'
        }
      });

      // Create refund record in database
      const refund = await prisma.refund.create({
        data: {
          stripeRefundId: stripeRefund.id,
          paymentId,
          amount: refundAmount,
          currency: payment.currency,
          reason,
          status: stripeRefund.status,
          processedBy,
          adminNotes
        }
      });

      // Update payment status if fully refunded
      if (refundAmount === payment.amount) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: 'REFUNDED' }
        });
      }

      return refund;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(userId, { page = 1, limit = 10 } = {}) {
    try {
      const skip = (page - 1) * limit;
      
      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: { userId },
          include: {
            job: { select: { title: true } },
            subscription: { select: { plan: true } },
            refunds: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.payment.count({ where: { userId } })
      ]);

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw new Error(`Failed to get payment history: ${error.message}`);
    }
  }

  /**
   * Handle successful payment post-processing
   */
  async handleSuccessfulPayment(payment) {
    try {
      // Handle HEART revenue sharing
      if (this.shouldCalculateHeartShare(payment.paymentType) && payment.heartShareAmount) {
        await this.createHeartRevenueShare(payment);
      }

      // Handle job posting activation
      if (payment.paymentType === 'JOB_POSTING' && payment.jobId) {
        await this.activateJobPosting(payment.jobId, payment.paymentType);
      }

      // Send confirmation email/notification
      await this.sendPaymentConfirmation(payment);

    } catch (error) {
      console.error('Error in post-payment processing:', error);
      // Don't throw error as payment was successful
    }
  }

  /**
   * Create HEART revenue share record
   */
  async createHeartRevenueShare(payment) {
    const heartShare = payment.heartShareAmount;
    const platformShare = payment.amount - heartShare;
    const reportingMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    await prisma.heartRevenueShare.create({
      data: {
        paymentId: payment.id,
        totalAmount: payment.amount,
        heartShare,
        platformShare,
        reportingMonth
      }
    });
  }

  /**
   * Activate job posting after payment
   */
  async activateJobPosting(jobId, paymentType) {
    const updateData = { status: 'ACTIVE' };
    
    // Set featured flag for premium listings
    if (paymentType === 'FEATURED_LISTING' || paymentType === 'PREMIUM_LISTING') {
      updateData.featured = true;
    }

    await prisma.job.update({
      where: { id: jobId },
      data: updateData
    });
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(payment) {
    // Implementation would integrate with email service
    console.log(`Payment confirmation sent for payment ${payment.id}`);
  }

  /**
   * Check if payment type should calculate HEART share
   */
  shouldCalculateHeartShare(paymentType) {
    return ['JOB_POSTING', 'FEATURED_LISTING', 'PREMIUM_LISTING'].includes(paymentType);
  }

  /**
   * Get subscription features based on plan
   */
  getSubscriptionFeatures(plan) {
    const features = {
      BASIC: {
        jobPostingLimit: 10,
        featuredListings: 2,
        premiumSupport: false,
        analyticsAccess: true
      },
      PREMIUM: {
        jobPostingLimit: 50,
        featuredListings: 10,
        premiumSupport: true,
        analyticsAccess: true
      }
    };

    return features[plan.toUpperCase()] || features.BASIC;
  }

  /**
   * Convert currency amounts
   */
  convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    
    if (fromCurrency === 'JMD' && toCurrency === 'USD') {
      return Math.round(amount * EXCHANGE_RATES.JMD_TO_USD);
    }
    
    if (fromCurrency === 'USD' && toCurrency === 'JMD') {
      return Math.round(amount * EXCHANGE_RATES.USD_TO_JMD);
    }
    
    return amount;
  }

  /**
   * Get current pricing
   */
  getPricing() {
    return PRICING;
  }
}

module.exports = new PaymentService();
