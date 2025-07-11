const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { OAuth2Client } = require('google-auth-library');

// Field validation
const validateRegistration = (data) => {
  const errors = [];
  
  if (!data.email || !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid email is required');
  }
  
  if (!data.password || data.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (!data.role || !['JOBSEEKER', 'EMPLOYER'].includes(data.role)) {
    errors.push('Valid role (JOBSEEKER or EMPLOYER) is required');
  }

  // Employer-specific validation
  if (data.role === 'EMPLOYER') {
    if (!data.companyName || data.companyName.trim().length === 0) {
      errors.push('Company name is required for employers');
    }
  }

  return errors;
};

// JWT configuration - NEVER use hardcoded secrets in production
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('🚨 SECURITY ERROR: JWT_SECRET environment variable is required');
  console.error('Set JWT_SECRET in your .env file or environment variables');
  process.exit(1);
}

// Initialize Prisma client - reuse existing instance if available
const prisma = global.prisma || new PrismaClient();
if (!global.prisma) global.prisma = prisma;

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration request received:', {
      email: req.body.email,
      role: req.body.role,
      hasCompanyName: !!req.body.company_name,
      requestBody: JSON.stringify(req.body, null, 2)
    });

    const {
      email,
      password,
      firstName,
      lastName,
      role,
      companyName,
      companyWebsite,
      companyLocation,
      companyDescription,
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
      // Create user first
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          role,
          bio: bio || null
        }
      });

      console.log('✅ User created:', { userId: user.id, role: user.role });

      if (role === 'EMPLOYER' && companyName) {
        console.log('🏢 Creating company for employer...');
        const company = await tx.company.create({
          data: {
            name: companyName,
            website: companyWebsite || null,
            location: companyLocation || null,
            description: companyDescription || null
          }
        });
        
        console.log('✅ Company created:', { companyId: company.id });
        
        // Update user with company reference
        await tx.user.update({
          where: { id: user.id },
          data: { companyId: company.id }
        });
        
        console.log('✅ User linked to company');
      }

      if (role === 'JOBSEEKER') {
        console.log('👤 Creating candidate profile...');
        await tx.candidateProfile.create({
          data: {
            userId: user.id,
            skills: skills || null,
            bio: bio || null
          }
        });
        console.log('✅ Candidate profile created');
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
    console.error('💥 Registration error:', error);
    
    // Handle Prisma specific errors
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
        code: 'DUPLICATE_EMAIL',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reference in data',
        code: 'INVALID_REFERENCE',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        stack: error.stack
      } : undefined
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

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth FedCM authentication
 * @access  Public
 */
router.post('/google', async (req, res) => {
  try {
    const { credential, role = 'JOBSEEKER' } = req.body;

    console.log('🔐 Google OAuth FedCM login attempt:', {
      hasCredential: !!credential,
      role,
      timestamp: new Date().toISOString()
    });

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required',
        code: 'MISSING_CREDENTIAL'
      });
    }

    if (!['JOBSEEKER', 'EMPLOYER'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be JOBSEEKER or EMPLOYER',
        code: 'INVALID_ROLE'
      });
    }

    // Verify Google credential
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
      
      console.log('✅ Google credential verified:', {
        email: payload.email,
        name: `${payload.given_name} ${payload.family_name}`,
        verified: payload.email_verified
      });
    } catch (verifyError) {
      console.error('❌ Google credential verification failed:', verifyError);
      return res.status(401).json({
        success: false,
        message: 'Invalid Google credential',
        code: 'INVALID_GOOGLE_CREDENTIAL',
        details: process.env.NODE_ENV === 'development' ? verifyError.message : undefined
      });
    }

    if (!payload.email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Google email not verified',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: {
        candidateProfile: true,
        company: true
      }
    });

    if (user) {
      console.log('🔄 Existing user login via Google:', {
        userId: user.id,
        email: user.email,
        role: user.role
      });
    } else {
      // Create new user
      console.log('➕ Creating new user from Google OAuth:', {
        email: payload.email,
        role,
        name: `${payload.given_name} ${payload.family_name}`
      });

      user = await prisma.user.create({
        data: {
          email: payload.email,
          firstName: payload.given_name || '',
          lastName: payload.family_name || '',
          role,
          // Generate a random password hash for OAuth users
          passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)
        },
        include: {
          candidateProfile: true,
          company: true
        }
      });

      // Create candidate profile for job seekers
      if (role === 'JOBSEEKER') {
        await prisma.candidateProfile.create({
          data: {
            userId: user.id,
            photoUrl: payload.picture || null
          }
        });
      }

      console.log('✅ New user created successfully:', {
        userId: user.id,
        email: user.email,
        role: user.role
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

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user;

    console.log('🎉 Google OAuth login successful:', {
      userId: user.id,
      role: user.role,
      isNewUser: !user.createdAt || (Date.now() - new Date(user.createdAt).getTime()) < 60000
    });

    res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('💥 Google OAuth error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

