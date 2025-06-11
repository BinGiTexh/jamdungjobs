const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { authenticateJWT, checkRole } = require("../middleware/auth");

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
        const updateData = {
          name: companyPayload.name ?? undefined,
          industry: companyPayload.industry ?? undefined,
          location: companyPayload.location ?? undefined,
          website: companyPayload.website ?? undefined,
          description: companyPayload.description ?? undefined,
          logoUrl: companyPayload.logoUrl ?? undefined
        };

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
router.put("/company", upload.single("logo"), async (req, res) => {
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
    const updateData = {
      name: name.trim(),
      industry: industry?.trim(),
      location: location?.trim(),
      website: website?.trim(),
      description: description?.trim()
    };

    // Handle logo upload
    if (req.file) {
      const logoUrl = `/uploads/profile-photos/${req.file.filename}`;
      updateData.logoUrl = logoUrl;

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

    // Update or create company
    const company = await prisma.company.upsert({
      where: {
        id: employer.company?.id || "new"
      },
      update: updateData,
      create: {
        ...updateData,
        employees: {
          connect: { id: employer.id }
        }
      }
    });

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
        data: {
          name,
          industry,
          location,
          website,
          description,
          employees: {
            connect: { id: req.user.id }
          }
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

  return router;
};

module.exports = createEmployerRouter;
