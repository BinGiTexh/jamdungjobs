const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');

const createCompaniesRouter = (prisma) => {
  /**
   * @route   POST /api/companies
   * @desc    Create a new company
   * @access  Private/Employer
   */
  router.post('/', async (req, res) => {
    try {
      const {
        name,
        website,
        location,
        description,
        industry,
        logo_url
      } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Company name is required',
          code: 'MISSING_NAME'
        });
      }

      // Check if employer already has a company
      const existingCompany = await prisma.company.findFirst({
        where: {
          employees: {
            some: {
              id: req.user.id
            }
          }
        }
      });

      if (existingCompany) {
        return res.status(400).json({
          success: false,
          message: 'Employer already has a company',
          code: 'COMPANY_EXISTS'
        });
      }

      // Transaction: create company, link employer, set employer.companyId
      const company = await prisma.$transaction(async (tx) => {
        const comp = await tx.company.create({
          data: {
            name,
            website,
            location,
            description,
            industry,
            logoUrl: logo_url,
            employees: {
              connect: { id: req.user.id }
            }
          }
        });

        await tx.user.update({
          where: { id: req.user.id },
          data: { companyId: comp.id }
        });

        return comp;
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
   * @route   GET /api/companies/:id
   * @desc    Get company details
   * @access  Private
   */
  router.get('/:id', async (req, res) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.params.id },
        include: {
          employees: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true
            }
          }
        }
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found',
          code: 'COMPANY_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching company',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  /**
   * @route   PUT /api/companies/:id
   * @desc    Update company details
   * @access  Private/Employer
   */
  router.put('/:id', async (req, res) => {
    try {
      const {
        name,
        website,
        location,
        description,
        industry,
        logo_url
      } = req.body;

      // Verify company exists and user has access
      const company = await prisma.company.findFirst({
        where: {
          id: req.params.id,
          employees: {
            some: {
              id: req.user.id
            }
          }
        }
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found or access denied',
          code: 'COMPANY_NOT_FOUND'
        });
      }

      // Update company
      const updatedCompany = await prisma.company.update({
        where: { id: req.params.id },
        data: {
          name: name || undefined,
          website: website || undefined,
          location: location || undefined,
          description: description || undefined,
          industry: industry || undefined,
          logoUrl: logo_url || undefined
        }
      });

      res.json({
        success: true,
        message: 'Company updated successfully',
        data: updatedCompany
      });
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating company',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  return router;
};

/**
 * Enhancement: list companies
 * @route GET /api/companies
 * @desc   List companies (optionally filter by name via ?q=)
 * @access Private (mounted behind auth/role check in server.js)
 */
const addListRoute = (prisma, router) => {
  router.get('/', async (req, res) => {
    try {
      const { q } = req.query;
      const where = q
        ? {
            name: {
              contains: q,
              mode: 'insensitive'
            }
          }
        : {};

      const companies = await prisma.company.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      res.json({ success: true, data: companies });
    } catch (error) {
      console.error('Error listing companies:', error);
      res.status(500).json({
        success: false,
        message: 'Error listing companies',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
};

module.exports = (prisma) => {
  const router = createCompaniesRouter(prisma);
  addListRoute(prisma, router);
  return router;
};
