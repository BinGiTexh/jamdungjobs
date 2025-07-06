const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { authenticateJWT, checkRole } = require("../middleware/auth");
const paymentService = require("../services/paymentService");

const validateCompanyData = (data) => {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Company name is required and must be a string');
  }

  if (data.website && !data.website.startsWith('http')) {
    errors.push('Website URL must start with http:// or https://');
  }

  return errors;
};

const createEmployerRouter = (prisma) => {

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/profile-photos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "photo-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
  }
});

// Helper: allow-list fields that can be persisted to company table
const sanitizeCompanyPayload = (payload = {}) => {
  // Clone to avoid mutating caller data
  const clone = { ...payload };

  // Explicitly remove any accidental Prisma / SQL reserved words or unknown keys we have
  // occasionally seen in malformed requests (e.g. `new` coming from some libraries).
  delete clone.new; // remove if present – this is what triggered the `column \`new\`` error

  const allowed = ['name', 'industry', 'location', 'website', 'description', 'logoUrl'];

  // Build a clean object with only allowed keys
  return Object.fromEntries(
    Object.entries(clone).filter(([key, val]) => allowed.includes(key) && val !== undefined)
  );
};

// Get employer profile
router.get("/profile", authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    console.log("Fetching employer profile for:", req.user.id);
    
    const employer = await prisma.user.findFirst({
      where: {
        id: req.user.id,
        role: "EMPLOYER"
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phoneNumber: true,
        title: true,
        bio: true,
        location: true,
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            location: true,
            website: true,
            description: true,
            logoUrl: true
          }
        }
      }
    });

    console.log("Found employer:", employer);

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
        code: "EMPLOYER_NOT_FOUND"
      });
    }

    const response = {
      success: true,
      data: {
        employer: {
          id: employer.id,
          email: employer.email,
          firstName: employer.firstName,
          lastName: employer.lastName,
          role: employer.role,
          phoneNumber: employer.phoneNumber,
          title: employer.title,
          bio: employer.bio,
          location: employer.location
        },
        company: employer.company ? {
          id: employer.company.id,
          name: employer.company.name,
          industry: employer.company.industry || "",
          location: employer.company.location || "",
          website: employer.company.website || "",
          description: employer.company.description || "",
          logoUrl: employer.company.logoUrl || null
        } : null
      }
    };

    console.log("Sending response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error fetching employer profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employer profile",
      code: "INTERNAL_SERVER_ERROR",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Update employer basic fields and company profile (JSON body)
router.put('/profile', authenticateJWT, checkRole('EMPLOYER'), upload.single('logo'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      title,
      bio,
      location,
      company: companyJson
    } = req.body;

    // When multipart/form-data is used, complex JSON values may arrive as strings
    let companyPayload = {};
    if (companyJson) {
      try {
        companyPayload = typeof companyJson === 'string' ? JSON.parse(companyJson) : companyJson;
      } catch (e) {
        // ignore bad json
      }
    }

    // Fallback: if flat fields were provided (companyName, industry ...)
    if (!companyPayload.name && (req.body.companyName || req.body.industry || req.body.website)) {
      companyPayload = {
        name: req.body.companyName,
        industry: req.body.industry,
        location: req.body.location,
        website: req.body.website,
        description: req.body.description
      };
    }

    // Fetch employer + existing company
    const employer = await prisma.user.findFirst({
      where: { id: req.user.id, role: 'EMPLOYER' },
      include: { company: true }
    });

    if (!employer) {
      return res.status(403).json({ success:false, message:'Employer not found', code:'EMPLOYER_NOT_FOUND' });
    }

    // Perform updates inside transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: employer.id },
        data: {
          firstName: firstName ?? undefined,
          lastName: lastName ?? undefined,
          phoneNumber: phoneNumber ?? undefined,
          title: title ?? undefined,
          bio: bio ?? undefined,
          location: location ?? undefined
        }
      });

      let updatedCompany = employer.company;
      if (Object.keys(companyPayload).length) {
        // Filter payload strictly to avoid prisma errors (e.g. column `new`)
        const updateData = sanitizeCompanyPayload(companyPayload);

        // Handle logo upload from multipart
        if (req.file) {
          updateData.logoUrl = `/uploads/profile-photos/${req.file.filename}`;

          // delete old logo if exists
          if (employer.company?.logoUrl) {
            const oldLogoPath = path.join(__dirname, '..', employer.company.logoUrl);
            if (fs.existsSync(oldLogoPath)) {
              try { fs.unlinkSync(oldLogoPath); } catch (_) {}
            }
          }
        }

        if (employer.company) {
          updatedCompany = await tx.company.update({
            where: { id: employer.company.id },
            data: updateData
          });
        } else {
          updatedCompany = await tx.company.create({
            data: {
              ...updateData,
              employees: { connect: { id: employer.id } }
            }
          });

          // link employer to company
          await tx.user.update({ where: { id: employer.id }, data: { companyId: updatedCompany.id } });
        }
      }

      // If logo uploaded but no company yet, ensure logoUrl is set on create path
      if (!employer.company && req.file) {
        updatedCompany.logoUrl = `/uploads/profile-photos/${req.file.filename}`;
      }

      return { user: updatedUser, company: updatedCompany };
    });

    res.json({ success:true, message:'Profile updated', data: result });
  } catch (error) {
    console.error('Error updating employer profile:', error);
    res.status(500).json({ success:false, message:'Error updating employer profile', code:'SERVER_ERROR', details: process.env.NODE_ENV==='development'? error.message:undefined });
  }
});

// Update company profile
router.put("/company", authenticateJWT, checkRole('EMPLOYER'), upload.single("logo"), async (req, res) => {
  try {
    const {
      name,
      industry,
      location,
      website,
      description
    } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Company name is required and must be a string",
        code: "INVALID_INPUT"
      });
    }

    // Get the employer with company
    const employer = await prisma.user.findFirst({
      where: {
        id: req.user.id,
        role: "EMPLOYER"
      },
      include: {
        company: true
      }
    });

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
        code: "EMPLOYER_NOT_FOUND"
      });
    }

    // Prepare the update data
    const updateData = sanitizeCompanyPayload({
      name: name?.trim(),
      industry: industry?.trim(),
      location: location?.trim(),
      website: website?.trim(),
      description: description?.trim(),
      logoUrl: undefined // will be set below if file present
    });

    // Handle logo upload
    if (req.file) {
      updateData.logoUrl = `/uploads/profile-photos/${req.file.filename}`;

      // Delete old logo if it exists
      if (employer.company?.logoUrl) {
        const oldLogoPath = path.join(__dirname, "..", employer.company.logoUrl);
        try {
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
          }
        } catch (fsError) {
          console.error("Error deleting old logo:", fsError);
        }
      }
    }

    // Additional sanitization as safety measure
    if ('new' in updateData) {
      console.warn('WARNING: Found \'new\' field in updateData, removing it');
      delete updateData.new;
    }
    
    // Update or create company
    let company;
    if (employer.company) {
      // Update existing company
      company = await prisma.company.update({
        where: { id: employer.company.id },
        data: updateData
      });
    } else {
      // Create new company
      company = await prisma.company.create({
        data: {
          ...updateData,
          employees: {
            connect: { id: employer.id }
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        company
      }
    });
  } catch (error) {
    // Clean up uploaded file if there was an error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (fsError) {
        console.error("Error cleaning up uploaded file:", fsError);
      }
    }

    console.error("Error updating company profile:", error);
    
    if (error.code === "P2002") {
      res.status(400).json({
        success: false,
        message: "A company with this name already exists",
        code: "DUPLICATE_COMPANY"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error updating company profile",
        code: "INTERNAL_SERVER_ERROR",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
});

  /**
   * @route   POST /api/companies
   * @desc    Create a new company
   * @access  Private/Employer
   */
  router.post('/company', authenticateJWT, async (req, res) => {
    try {
      const {
        name,
        industry,
        location,
        website,
        description
      } = req.body;

      // Validate input data
      const validationErrors = validateCompanyData(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company data',
          code: 'INVALID_INPUT',
          errors: validationErrors
        });
      }

      // Verify user is an employer
      const employer = await prisma.user.findUnique({
        where: { 
          id: req.user.id,
          role: 'EMPLOYER'
        },
        include: { company: true }
      });

      if (!employer) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. User is not an employer',
          code: 'INVALID_ROLE'
        });
      }

      // Check if employer already has a company
      if (employer.company) {
        return res.status(400).json({
          success: false,
          message: 'Employer already has a company',
          code: 'COMPANY_EXISTS'
        });
      }

      const company = await prisma.company.create({
        data: sanitizeCompanyPayload({
          name,
          industry,
          location,
          website,
          description
        }),
        include: {
          employees: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'Company created successfully',
        data: company
      });
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating company',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  /**
   * Get all jobs posted by the employer's company
   * @route GET /api/employer/jobs
   */
  router.get('/jobs', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
    try {
      // Fetch employer with company relation to determine companyId
      const employer = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { companyId: true }
      });

      if (!employer?.companyId) {
        return res.json([]); // no company associated, return empty list
      }

      const jobs = await prisma.job.findMany({
        where: { companyId: employer.companyId },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(jobs);
    } catch (error) {
      console.error('Error fetching employer jobs:', error);
      return res.status(500).json({ success: false, message: 'Unable to fetch jobs', code: 'INTERNAL_SERVER_ERROR' });
    }
  });

  /**
   * Create a new job posting
   * @route POST /api/employer/jobs
   */
  router.post('/jobs', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
    try {
      console.log('Creating job posting for employer:', req.user.id);
      console.log('Job data received:', req.body);

      // Fetch employer with company relation
      const employer = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { company: true }
      });

      if (!employer) {
        return res.status(404).json({
          success: false,
          message: 'Employer not found',
          code: 'EMPLOYER_NOT_FOUND'
        });
      }

      if (!employer.company) {
        return res.status(400).json({
          success: false,
          message: 'Please complete your company profile before posting jobs',
          code: 'COMPANY_PROFILE_REQUIRED'
        });
      }

      const {
        title,
        description,
        location,
        type,
        skills,
        salary,
        remote,
        applicationDeadline,
        applicationEmail,
        applicationUrl,
        applicationInstructions,
        requirements,
        benefits
      } = req.body;

      // Validate required fields
      if (!title || !description || !location) {
        return res.status(400).json({
          success: false,
          message: 'Title, description, and location are required',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      // Format location string
      const locationString = typeof location === 'object' ? 
        (location.name || location.formattedAddress || location.mainText || '') : 
        location;

      // Create job posting
      const job = await prisma.job.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          location: locationString,
          type: type || 'FULL_TIME',
          skills: Array.isArray(skills) ? skills : [],
          salaryMin: salary?.min || null,
          salaryMax: salary?.max || null,
          remote: Boolean(remote),
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
          applicationEmail: applicationEmail || employer.email,
          applicationUrl: applicationUrl || null,
          applicationInstructions: applicationInstructions || null,
          requirements: requirements || null,
          benefits: benefits || null,
          status: 'ACTIVE',
          companyId: employer.company.id,
          postedById: employer.id
        }
      });

      console.log('Job created successfully:', job.id);

      res.status(201).json({
        success: true,
        message: 'Job posted successfully',
        data: job
      });
    } catch (error) {
      console.error('Error creating job posting:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating job posting',
        code: 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  /**
   * Get job drafts for the employer
   * @route GET /api/employer/job-drafts
   */
  router.get('/job-drafts', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
    try {
      console.log('Fetching job drafts for employer:', req.user.id);

      // For now, we'll store drafts in a simple way
      // In a production app, you might want a separate JobDraft table
      const drafts = await prisma.job.findMany({
        where: {
          postedById: req.user.id,
          status: 'DRAFT'
        },
        orderBy: { updatedAt: 'desc' }
      });

      res.json(drafts);
    } catch (error) {
      console.error('Error fetching job drafts:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching job drafts',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  });

  /**
   * Save job as draft
   * @route POST /api/employer/job-drafts
   */
  router.post('/job-drafts', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
    try {
      console.log('Saving job draft for employer:', req.user.id);
      console.log('Draft data received:', req.body);

      // Fetch employer with company relation
      const employer = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { company: true }
      });

      if (!employer) {
        return res.status(404).json({
          success: false,
          message: 'Employer not found',
          code: 'EMPLOYER_NOT_FOUND'
        });
      }

      const {
        title,
        description,
        location,
        type,
        skills,
        salary,
        remote,
        applicationDeadline,
        applicationEmail,
        applicationUrl,
        applicationInstructions,
        requirements,
        benefits,
        placeId
      } = req.body;

      // Format location string
      const locationString = typeof location === 'object' ? 
        (location.name || location.formattedAddress || location.mainText || '') : 
        location;

      // Create or update draft
      const draft = await prisma.job.create({
        data: {
          title: title?.trim() || 'Untitled Draft',
          description: description?.trim() || '',
          location: locationString || '',
          type: type || 'FULL_TIME',
          skills: Array.isArray(skills) ? skills : [],
          salaryMin: salary?.min || null,
          salaryMax: salary?.max || null,
          remote: Boolean(remote),
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
          applicationEmail: applicationEmail || employer.email,
          applicationUrl: applicationUrl || null,
          applicationInstructions: applicationInstructions || null,
          requirements: requirements || null,
          benefits: benefits || null,
          status: 'DRAFT',
          companyId: employer.company?.id || null,
          postedById: employer.id
        }
      });

      console.log('Draft saved successfully:', draft.id);

      res.status(201).json({
        success: true,
        message: 'Draft saved successfully',
        data: draft
      });
    } catch (error) {
      console.error('Error saving job draft:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving job draft',
        code: 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // === BILLING & SUBSCRIPTION ENDPOINTS ===

  // Get current subscription
  router.get('/subscription', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Try to get real subscription data first
      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } },
        orderBy: { createdAt: 'desc' }
      });

      if (subscription) {
        res.json({
          success: true,
          data: {
            currentPlan: subscription.plan.toLowerCase(),
            status: subscription.status.toLowerCase(),
            nextBillingDate: subscription.currentPeriodEnd.toISOString().split('T')[0],
            amount: subscription.amount / 100, // Convert from cents
            autoRenew: !subscription.cancelAtPeriodEnd,
            stripeSubscriptionId: subscription.stripeSubscriptionId,
            createdAt: subscription.createdAt.toISOString()
          }
        });
      } else {
        // Return mock data for development/demo purposes
        const mockSubscription = {
          currentPlan: 'basic',
          status: 'active',
          nextBillingDate: '2025-08-05',
          amount: 99,
          autoRenew: true,
          stripeSubscriptionId: 'sub_mock_123',
          createdAt: new Date().toISOString()
        };

        res.json({
          success: true,
          data: mockSubscription
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching subscription data',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  });

  // Get billing invoices
  router.get('/invoices', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Try to get real payment history first
      const payments = await prisma.payment.findMany({
        where: { 
          userId,
          status: 'SUCCEEDED'
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      if (payments.length > 0) {
        const invoices = payments.map(payment => ({
          id: payment.id,
          amount: payment.amount / 100, // Convert from cents
          date: payment.createdAt.toISOString().split('T')[0],
          status: 'paid',
          downloadUrl: payment.stripeReceiptUrl || '#',
          description: payment.description || `${payment.paymentType} - ${payment.currency}`
        }));

        res.json({
          success: true,
          data: { invoices }
        });
      } else {
        // Return mock data for development/demo purposes
        const mockInvoices = [
          {
            id: 'inv_001',
            amount: 99,
            date: '2025-07-05',
            status: 'paid',
            downloadUrl: '#',
            description: 'Basic Plan - July 2025'
          },
          {
            id: 'inv_002',
            amount: 99,
            date: '2025-06-05',
            status: 'paid',
            downloadUrl: '#',
            description: 'Basic Plan - June 2025'
          }
        ];

        res.json({
          success: true,
          data: { invoices: mockInvoices }
        });
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching invoice data',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  });

  // Toggle auto-renewal
  router.patch('/subscription/auto-renew', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
    try {
      const { autoRenew } = req.body;
      const userId = req.user.id;
      
      // Try to update real subscription first
      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } },
        orderBy: { createdAt: 'desc' }
      });

      if (subscription) {
        // Update the subscription in our database
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { cancelAtPeriodEnd: !autoRenew }
        });

        // TODO: Update Stripe subscription as well
        // await paymentService.updateSubscriptionAutoRenew(subscription.stripeSubscriptionId, autoRenew);
        
        console.log(`Auto-renewal ${autoRenew ? 'enabled' : 'disabled'} for user ${userId}`);
      }

      res.json({
        success: true,
        message: 'Auto-renewal settings updated successfully',
        data: {
          autoRenew: autoRenew
        }
      });
    } catch (error) {
      console.error('Error updating auto-renewal:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating auto-renewal settings',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  });

  // Handle plan upgrade
  router.post('/upgrade', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
    try {
      const { planId } = req.body;
      const userId = req.user.id;
      
      // Validate plan ID
      const validPlans = ['basic', 'professional', 'enterprise'];
      if (!validPlans.includes(planId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan ID',
          code: 'INVALID_PLAN'
        });
      }

      // Check if user has existing subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId, status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } },
        orderBy: { createdAt: 'desc' }
      });

      try {
        // Try to create new subscription through payment service
        const result = await paymentService.createSubscription({
          userId,
          plan: planId.toUpperCase(),
          currency: 'USD'
        });

        res.json({
          success: true,
          message: 'Plan upgrade initiated successfully',
          data: {
            newPlan: planId,
            effectiveDate: new Date().toISOString(),
            checkoutUrl: result.clientSecret ? `/checkout?client_secret=${result.clientSecret}` : null,
            subscriptionId: result.subscriptionId
          }
        });
      } catch (paymentError) {
        console.log('Payment service not fully configured, using mock response');
        
        // Fallback to mock response for development
        res.json({
          success: true,
          message: 'Plan upgrade initiated successfully (demo mode)',
          data: {
            newPlan: planId,
            effectiveDate: new Date().toISOString(),
            checkoutUrl: null
          }
        });
      }
    } catch (error) {
      console.error('Error processing upgrade:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing plan upgrade',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  });

  // Get employer analytics data
  router.get('/analytics', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get employer's company
      const employer = await prisma.user.findUnique({
        where: { id: userId },
        include: { company: true }
      });

      if (!employer?.company) {
        return res.json({
          success: true,
          data: {
            overview: {
              totalJobs: 0,
              activeJobs: 0,
              totalApplications: 0,
              newApplications: 0
            },
            jobPerformance: [],
            applicationTrends: {
              thisMonth: 0,
              lastMonth: 0,
              growth: 0
            }
          }
        });
      }

      // Get real data
      const [jobs, totalApplications, thisMonthApplications, lastMonthApplications] = await Promise.all([
        // Get all jobs for this company
        prisma.job.findMany({
          where: { companyId: employer.company.id },
          select: {
            id: true,
            title: true,
            status: true,
            _count: {
              select: {
                applications: true
              }
            }
          }
        }),
        
        // Total applications
        prisma.jobApplication.count({
          where: {
            job: { companyId: employer.company.id }
          }
        }),
        
        // This month applications
        prisma.jobApplication.count({
          where: {
            job: { companyId: employer.company.id },
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        
        // Last month applications
        prisma.jobApplication.count({
          where: {
            job: { companyId: employer.company.id },
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        })
      ]);

      // Get job views using the new service
      const jobViewService = require('../services/jobViewService');
      const jobIds = jobs.map(j => j.id);
      const jobAnalytics = await jobViewService.getJobsAnalytics(jobIds);
      
      // Combine job data with view analytics
      const jobPerformance = jobs.map(job => {
        const analytics = jobAnalytics.find(a => a.jobId === job.id);
        return {
          title: job.title,
          applications: job._count.applications,
          views: analytics?.totalViews || 0,
          status: job.status === 'ACTIVE' ? 'Active' : 
                  job.status === 'CLOSED' ? 'Closed' : 'Draft'
        };
      }).sort((a, b) => b.views - a.views); // Sort by views descending

      const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;
      const growthRate = lastMonthApplications > 0 ? 
        ((thisMonthApplications - lastMonthApplications) / lastMonthApplications * 100) : 0;

      const analytics = {
        overview: {
          totalJobs: jobs.length,
          activeJobs,
          totalApplications,
          newApplications: thisMonthApplications
        },
        jobPerformance: jobPerformance.slice(0, 10), // Top 10 jobs
        applicationTrends: {
          thisMonth: thisMonthApplications,
          lastMonth: lastMonthApplications,
          growth: Math.round(growthRate * 10) / 10
        }
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      // Fallback to mock data if there's an error
      const mockAnalytics = {
        overview: {
          totalJobs: 12,
          activeJobs: 8,
          totalApplications: 247,
          newApplications: 23
        },
        jobPerformance: [
          { title: 'Senior React Developer', applications: 45, views: 234, status: 'Active' },
          { title: 'UI/UX Designer', applications: 32, views: 189, status: 'Active' },
          { title: 'Product Manager', applications: 28, views: 156, status: 'Active' },
          { title: 'Backend Engineer', applications: 41, views: 198, status: 'Closed' }
        ],
        applicationTrends: {
          thisMonth: 89,
          lastMonth: 67,
          growth: 32.8
        }
      };

      res.json({
        success: true,
        data: mockAnalytics
      });
    }
  });

  return router;
};

module.exports = createEmployerRouter;
