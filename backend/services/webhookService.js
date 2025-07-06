const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

class WebhookService {
  /**
   * Process Stripe webhook events
   */
  async processWebhook(rawBody, signature) {
    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Log webhook event for audit trail
    await this.logWebhookEvent(event);

    try {
      // Process the event based on type
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.created':
          await this.handleInvoiceCreated(event.data.object);
          break;

        case 'charge.dispute.created':
          await this.handleChargeDisputeCreated(event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Mark webhook as processed
      await this.markWebhookProcessed(event.id);

    } catch (error) {
      console.error(`Error processing webhook ${event.type}:`, error);
      await this.markWebhookError(event.id, error.message);
      throw error;
    }
  }

  /**
   * Handle successful payment intent
   */
  async handlePaymentIntentSucceeded(paymentIntent) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentId: paymentIntent.id },
        include: { user: true, job: true }
      });

      if (!payment) {
        console.error(`Payment not found for payment intent: ${paymentIntent.id}`);
        return;
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          processedAt: new Date(),
          stripeReceiptUrl: paymentIntent.charges?.data[0]?.receipt_url || null
        }
      });

      // Handle post-payment processing
      await this.handleSuccessfulPayment(payment);

      console.log(`Payment ${payment.id} marked as succeeded`);
    } catch (error) {
      console.error('Error handling payment intent succeeded:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment intent
   */
  async handlePaymentIntentFailed(paymentIntent) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentId: paymentIntent.id }
      });

      if (!payment) {
        console.error(`Payment not found for payment intent: ${paymentIntent.id}`);
        return;
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          processedAt: new Date()
        }
      });

      // Send failure notification
      await this.sendPaymentFailureNotification(payment);

      console.log(`Payment ${payment.id} marked as failed`);
    } catch (error) {
      console.error('Error handling payment intent failed:', error);
      throw error;
    }
  }

  /**
   * Handle successful invoice payment (subscriptions)
   */
  async handleInvoicePaymentSucceeded(invoice) {
    try {
      if (!invoice.subscription) return;

      const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: invoice.subscription }
      });

      if (!subscription) {
        console.error(`Subscription not found: ${invoice.subscription}`);
        return;
      }

      // Update subscription status
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          currentPeriodStart: new Date(invoice.period_start * 1000),
          currentPeriodEnd: new Date(invoice.period_end * 1000)
        }
      });

      // Create/update invoice record
      await this.createOrUpdateInvoice(invoice, subscription.userId);

      // Handle HEART revenue sharing for subscription payments
      if (invoice.amount_paid > 0) {
        await this.handleSubscriptionRevenueShare(subscription, invoice);
      }

      console.log(`Subscription ${subscription.id} payment succeeded`);
    } catch (error) {
      console.error('Error handling invoice payment succeeded:', error);
      throw error;
    }
  }

  /**
   * Handle failed invoice payment
   */
  async handleInvoicePaymentFailed(invoice) {
    try {
      if (!invoice.subscription) return;

      const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: invoice.subscription }
      });

      if (!subscription) {
        console.error(`Subscription not found: ${invoice.subscription}`);
        return;
      }

      // Update subscription status
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'PAST_DUE'
        }
      });

      // Send payment failure notification
      await this.sendSubscriptionPaymentFailureNotification(subscription);

      console.log(`Subscription ${subscription.id} payment failed`);
    } catch (error) {
      console.error('Error handling invoice payment failed:', error);
      throw error;
    }
  }

  /**
   * Handle subscription creation
   */
  async handleSubscriptionCreated(subscription) {
    try {
      const userId = subscription.metadata?.userId;
      if (!userId) {
        console.error('No userId in subscription metadata');
        return;
      }

      // Subscription should already exist from our API call
      // This webhook confirms it was created successfully
      await prisma.subscription.updateMany({
        where: {
          stripeSubscriptionId: subscription.id,
          userId
        },
        data: {
          status: subscription.status.toUpperCase(),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      });

      console.log(`Subscription created: ${subscription.id}`);
    } catch (error) {
      console.error('Error handling subscription created:', error);
      throw error;
    }
  }

  /**
   * Handle subscription updates
   */
  async handleSubscriptionUpdated(subscription) {
    try {
      const dbSubscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id }
      });

      if (!dbSubscription) {
        console.error(`Subscription not found: ${subscription.id}`);
        return;
      }

      // Update subscription details
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: subscription.status.toUpperCase(),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null
        }
      });

      console.log(`Subscription updated: ${subscription.id}`);
    } catch (error) {
      console.error('Error handling subscription updated:', error);
      throw error;
    }
  }

  /**
   * Handle subscription deletion
   */
  async handleSubscriptionDeleted(subscription) {
    try {
      const dbSubscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id }
      });

      if (!dbSubscription) {
        console.error(`Subscription not found: ${subscription.id}`);
        return;
      }

      // Update subscription status
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'CANCELED',
          canceledAt: new Date()
        }
      });

      console.log(`Subscription canceled: ${subscription.id}`);
    } catch (error) {
      console.error('Error handling subscription deleted:', error);
      throw error;
    }
  }

  /**
   * Handle invoice creation
   */
  async handleInvoiceCreated(invoice) {
    try {
      if (!invoice.subscription) return;

      const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: invoice.subscription }
      });

      if (!subscription) {
        console.error(`Subscription not found: ${invoice.subscription}`);
        return;
      }

      await this.createOrUpdateInvoice(invoice, subscription.userId);

      console.log(`Invoice created: ${invoice.id}`);
    } catch (error) {
      console.error('Error handling invoice created:', error);
      throw error;
    }
  }

  /**
   * Handle charge disputes
   */
  async handleChargeDisputeCreated(dispute) {
    try {
      // Find the payment associated with this charge
      const payment = await prisma.payment.findFirst({
        where: {
          stripePaymentId: dispute.payment_intent
        },
        include: { user: true }
      });

      if (!payment) {
        console.error(`Payment not found for dispute: ${dispute.id}`);
        return;
      }

      // Log the dispute for admin review
      console.log(`Dispute created for payment ${payment.id}: ${dispute.reason}`);

      // Send admin notification about dispute
      await this.sendDisputeNotification(payment, dispute);

    } catch (error) {
      console.error('Error handling charge dispute:', error);
      throw error;
    }
  }

  /**
   * Create or update invoice record
   */
  async createOrUpdateInvoice(stripeInvoice, userId) {
    const invoiceData = {
      stripeInvoiceId: stripeInvoice.id,
      userId,
      subscriptionId: stripeInvoice.subscription ? 
        (await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: stripeInvoice.subscription }
        }))?.id : null,
      invoiceNumber: stripeInvoice.number || `INV-${Date.now()}`,
      amount: stripeInvoice.amount_due,
      currency: stripeInvoice.currency.toUpperCase(),
      status: stripeInvoice.status,
      taxAmount: stripeInvoice.tax || null,
      issueDate: new Date(stripeInvoice.created * 1000),
      dueDate: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000) : new Date(),
      paidAt: stripeInvoice.status_transitions?.paid_at ? 
        new Date(stripeInvoice.status_transitions.paid_at * 1000) : null,
      hostedInvoiceUrl: stripeInvoice.hosted_invoice_url,
      invoicePdf: stripeInvoice.invoice_pdf
    };

    await prisma.invoice.upsert({
      where: { stripeInvoiceId: stripeInvoice.id },
      update: invoiceData,
      create: invoiceData
    });
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

      // Send confirmation notification
      await this.sendPaymentConfirmation(payment);

    } catch (error) {
      console.error('Error in post-payment processing:', error);
    }
  }

  /**
   * Handle subscription revenue sharing
   */
  async handleSubscriptionRevenueShare(subscription, invoice) {
    const heartShare = Math.round(invoice.amount_paid * 0.20); // 20% to HEART
    const platformShare = invoice.amount_paid - heartShare;
    const reportingMonth = new Date().toISOString().slice(0, 7);

    await prisma.heartRevenueShare.create({
      data: {
        paymentId: `subscription-${subscription.id}-${invoice.id}`,
        totalAmount: invoice.amount_paid,
        heartShare,
        platformShare,
        reportingMonth
      }
    });
  }

  /**
   * Create HEART revenue share record
   */
  async createHeartRevenueShare(payment) {
    const heartShare = payment.heartShareAmount;
    const platformShare = payment.amount - heartShare;
    const reportingMonth = new Date().toISOString().slice(0, 7);

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
    
    if (paymentType === 'FEATURED_LISTING' || paymentType === 'PREMIUM_LISTING') {
      updateData.featured = true;
    }

    await prisma.job.update({
      where: { id: jobId },
      data: updateData
    });
  }

  /**
   * Log webhook event for audit trail
   */
  async logWebhookEvent(event) {
    try {
      await prisma.webhookEvent.create({
        data: {
          stripeEventId: event.id,
          eventType: event.type,
          eventData: event
        }
      });
    } catch (error) {
      console.error('Error logging webhook event:', error);
    }
  }

  /**
   * Mark webhook as processed
   */
  async markWebhookProcessed(eventId) {
    try {
      await prisma.webhookEvent.update({
        where: { stripeEventId: eventId },
        data: {
          processed: true,
          processedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error marking webhook as processed:', error);
    }
  }

  /**
   * Mark webhook processing error
   */
  async markWebhookError(eventId, errorMessage) {
    try {
      await prisma.webhookEvent.update({
        where: { stripeEventId: eventId },
        data: {
          processed: false,
          processingError: errorMessage,
          processedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error marking webhook error:', error);
    }
  }

  /**
   * Send payment confirmation notification
   */
  async sendPaymentConfirmation(payment) {
    // Implementation would integrate with notification service
    console.log(`Payment confirmation sent for payment ${payment.id}`);
  }

  /**
   * Send payment failure notification
   */
  async sendPaymentFailureNotification(payment) {
    console.log(`Payment failure notification sent for payment ${payment.id}`);
  }

  /**
   * Send subscription payment failure notification
   */
  async sendSubscriptionPaymentFailureNotification(subscription) {
    console.log(`Subscription payment failure notification sent for subscription ${subscription.id}`);
  }

  /**
   * Send dispute notification to admin
   */
  async sendDisputeNotification(payment, dispute) {
    console.log(`Dispute notification sent for payment ${payment.id}, dispute: ${dispute.id}`);
  }

  /**
   * Check if payment type should calculate HEART share
   */
  shouldCalculateHeartShare(paymentType) {
    return ['JOB_POSTING', 'FEATURED_LISTING', 'PREMIUM_LISTING', 'SUBSCRIPTION'].includes(paymentType);
  }
}

module.exports = new WebhookService();
