const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

// Field validation
const validateRegistration = (data) => {
  const errors = [];
  
  if (!data.email || !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid email is required');
  }
  
  if (!data.password || data.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!data.first_name || data.first_name.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!data.last_name || data.last_name.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (!data.role || !['JOBSEEKER', 'EMPLOYER'].includes(data.role)) {
    errors.push('Valid role (JOBSEEKER or EMPLOYER) is required');
  }

  return errors;
};

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || "local_development_secret_32_characters_minimum";

// Initialize Prisma client - reuse existing instance if available
const prisma = global.prisma || new PrismaClient();
if (!global.prisma) global.prisma = prisma;

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      role,
      company_name,
      company_website,
      company_location,
      company_description,
      skills,
      bio
    } = req.body;

    // Validate registration data
    const validationErrors = validateRegistration(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration data',
        code: 'INVALID_INPUT',
        errors: validationErrors
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with related data in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName: first_name,
          lastName: last_name,
          role,
          bio: bio || null
        }
      });

      if (role === 'EMPLOYER' && company_name) {
        await tx.company.create({
          data: {
            name: company_name,
            website: company_website,
            location: company_location,
            description: company_description,
            employees: {
              connect: { id: user.id }
            }
          }
        });
      }

      if (role === 'JOBSEEKER' && skills) {
        await tx.candidateProfile.create({
          data: {
            userId: user.id,
            skills: skills,
            bio: bio || null
          }
        });
      }

      return user;
    });

    // Generate JWT
    const token = jwt.sign(
      { 
        id: result.id,
        email: result.email,
        role: result.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove sensitive data
    const { passwordHash: _, ...userWithoutPassword } = result;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset user password
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, current_password, new_password } = req.body;

    if (!email || !current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
        code: 'INVALID_PASSWORD'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const isValidPassword = await bcrypt.compare(current_password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }

    const newPasswordHash = await bcrypt.hash(new_password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    });

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    } catch (e) {
      // Fallback for legacy passwords
      isValidPassword = password === user.passwordHash;
    }

    if (!isValidPassword) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove sensitive data before sending response
    const { passwordHash, ...userWithoutPassword } = user;

    console.log('Login successful:', {
      userId: user.id,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/auth/validate
 * @desc    Validate JWT token and return user data
 * @access  Public
 */
router.get('/validate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Token validation request');

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing',
        code: 'AUTH_HEADER_MISSING'
      });
    }

    // Extract token
    let token;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = authHeader;
    }

    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
        code: 'INVALID_TOKEN'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user details from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true
        }
      });

      if (!user) {
        console.log('Token validation failed: User not found');
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      console.log('Token validation successful:', {
        userId: user.id,
        role: user.role
      });

      res.json({
        success: true,
        user
      });
    } catch (err) {
      console.error('JWT verification error:', err.name, err.message);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating token',
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

