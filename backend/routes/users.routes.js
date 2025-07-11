const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

/**
 * Calculate profile completion percentage and status
 * @param {Object} user - User object with candidateProfile included
 * @returns {Object} Profile completion details
 */
const calculateProfileCompletion = (user) => {
  // Define required fields for different roles
  const requiredFields = {
    JOBSEEKER: ['firstName', 'lastName', 'email', 'phoneNumber', 'location'],
    EMPLOYER: ['firstName', 'lastName', 'email', 'phoneNumber'],
    ADMIN: ['firstName', 'lastName', 'email']
  };

  const fieldsForRole = requiredFields[user.role] || requiredFields.JOBSEEKER;
  
  // Count completed basic fields
  const completedFields = fieldsForRole.filter(field => {
    const value = user[field];
    return value && value.toString().trim() !== '';
  });

  // For job seekers, check additional profile requirements
  let additionalRequirements = {};
  if (user.role === 'JOBSEEKER') {
    const profile = user.candidateProfile;
    additionalRequirements = {
      hasTitle: !!(profile?.title && profile.title.trim()),
      hasResume: !!(profile?.resumeUrl || profile?.resumeFileName),
      hasBio: !!(profile?.bio && profile.bio.trim()),
      hasSkills: !!(profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0)
    };
  }

  // Calculate basic profile completion
  const basicCompletion = {
    completed: completedFields.length === fieldsForRole.length,
    completedFields,
    missingFields: fieldsForRole.filter(field => !completedFields.includes(field)),
    percentage: Math.round((completedFields.length / fieldsForRole.length) * 100)
  };

  // Calculate overall completion including additional requirements
  let totalRequired = fieldsForRole.length;
  let totalCompleted = completedFields.length;

  if (user.role === 'JOBSEEKER') {
    const additionalFieldsCount = Object.keys(additionalRequirements).length;
    const completedAdditionalCount = Object.values(additionalRequirements).filter(Boolean).length;
    
    totalRequired += additionalFieldsCount;
    totalCompleted += completedAdditionalCount;
  }

  const overallCompletion = {
    completed: totalCompleted === totalRequired,
    percentage: Math.round((totalCompleted / totalRequired) * 100),
    totalFields: totalRequired,
    completedFields: totalCompleted
  };

  return {
    basicInfo: basicCompletion,
    additional: additionalRequirements,
    overall: overallCompletion,
    suggestions: generateProfileSuggestions(user, basicCompletion.missingFields, additionalRequirements)
  };
};

/**
 * Generate profile completion suggestions
 */
const generateProfileSuggestions = (user, missingBasicFields, additionalRequirements) => {
  const suggestions = [];

  // Basic field suggestions
  missingBasicFields.forEach(field => {
    const fieldMessages = {
      firstName: 'Add your first name to personalize your profile',
      lastName: 'Add your last name to complete your identity',
      phoneNumber: 'Add your phone number so employers can contact you',
      location: 'Add your location to find jobs near you',
      email: 'Update your email address'
    };
    
    if (fieldMessages[field]) {
      suggestions.push({
        type: 'basic',
        field,
        message: fieldMessages[field],
        priority: 'high'
      });
    }
  });

  // Role-specific suggestions
  if (user.role === 'JOBSEEKER') {
    if (!additionalRequirements.hasTitle) {
      suggestions.push({
        type: 'profile',
        field: 'title',
        message: 'Add your job title to stand out to employers',
        priority: 'high'
      });
    }
    
    if (!additionalRequirements.hasResume) {
      suggestions.push({
        type: 'profile',
        field: 'resume',
        message: 'Upload your resume to apply for jobs',
        priority: 'critical'
      });
    }
    
    if (!additionalRequirements.hasBio) {
      suggestions.push({
        type: 'profile',
        field: 'bio',
        message: 'Add a bio to tell employers about yourself',
        priority: 'medium'
      });
    }
    
    if (!additionalRequirements.hasSkills) {
      suggestions.push({
        type: 'profile',
        field: 'skills',
        message: 'List your skills to match with relevant jobs',
        priority: 'medium'
      });
    }
  }

  return suggestions;
};

// Validation middleware for profile updates
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]{7,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
];

// Validation middleware for email updates
const validateEmailUpdate = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address')
];

const createUsersRouter = (prisma) => {
  /**
   * @route   GET /api/users/me
   * @desc    Get current user profile (works for all user types)
   * @access  Private
   */
  router.get('/me', async (req, res) => {
    try {
      console.log('Getting user profile for:', {
        userId: req.user.id,
        role: req.user.role,
        email: req.user.email
      });

      // Get user with appropriate includes based on role
      const includeOptions = {
        candidateProfile: req.user.role === 'JOBSEEKER',
        company: req.user.role === 'EMPLOYER'
      };

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: includeOptions
      });

      if (!user) {
        console.log('User not found in database:', req.user.id);
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Remove sensitive data
      const { passwordHash, ...userWithoutPassword } = user;

      // Calculate profile completion for better UX synchronization
      const profileCompletion = calculateProfileCompletion(user);

      console.log('User profile retrieved successfully:', {
        userId: user.id,
        role: user.role,
        hasProfile: req.user.role === 'JOBSEEKER' ? !!user.candidateProfile : !!user.company,
        profileCompletion: profileCompletion.overall.percentage
      });

      res.json({
        success: true,
        data: {
          ...userWithoutPassword,
          profileCompletion
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user profile',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  /**
   * @route   PUT /api/users/me
   * @desc    Update current user profile (basic user fields only)
   * @access  Private
   */
  router.put('/me', validateProfileUpdate, async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Profile update validation failed:', {
          userId: req.user.id,
          errors: errors.array()
        });
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            value: err.value
          }))
        });
      }

      const {
        firstName,
        lastName,
        bio,
        location,
        phoneNumber,
        title
      } = req.body;

      console.log('📝 Updating user profile for:', {
        userId: req.user.id,
        role: req.user.role,
        requestBody: req.body,
        updates: Object.keys(req.body)
      });

      // Build update object with only provided, non-empty fields
      const updateData = {};
      
      // Handle string fields - only update if provided and not empty
      if (firstName !== undefined && firstName !== null) {
        const trimmed = String(firstName).trim();
        if (trimmed.length > 0) {
          updateData.firstName = trimmed;
        } else {
          return res.status(400).json({
            success: false,
            message: 'First name cannot be empty',
            code: 'VALIDATION_ERROR',
            errors: [{ field: 'firstName', message: 'First name is required' }]
          });
        }
      }
      
      if (lastName !== undefined && lastName !== null) {
        const trimmed = String(lastName).trim();
        if (trimmed.length > 0) {
          updateData.lastName = trimmed;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Last name cannot be empty',
            code: 'VALIDATION_ERROR',
            errors: [{ field: 'lastName', message: 'Last name is required' }]
          });
        }
      }
      
      // Optional fields can be empty or null
      if (bio !== undefined) updateData.bio = bio ? String(bio).trim() : null;
      if (location !== undefined) updateData.location = location ? String(location).trim() : null;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber ? String(phoneNumber).trim() : null;
      if (title !== undefined) updateData.title = title ? String(title).trim() : null;

      console.log('🔄 Final update data:', {
        userId: req.user.id,
        updateData,
        updateDataKeys: Object.keys(updateData)
      });

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        console.log('ℹ️ No valid updates provided for user:', req.user.id);
        return res.status(400).json({
          success: false,
          message: 'No valid updates provided',
          code: 'NO_UPDATES'
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        include: {
          candidateProfile: req.user.role === 'JOBSEEKER',
          company: req.user.role === 'EMPLOYER'
        }
      });

      // Remove sensitive data
      const { passwordHash, ...userWithoutPassword } = updatedUser;

      // Recalculate profile completion after update
      const profileCompletion = calculateProfileCompletion(updatedUser);

      console.log('✅ User profile updated successfully:', {
        userId: updatedUser.id,
        updatedFields: Object.keys(updateData),
        newProfileCompletion: profileCompletion.overall.percentage,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          ...userWithoutPassword,
          profileCompletion
        }
      });
    } catch (error) {
      console.error('💥 Error updating user profile:', {
        userId: req.user.id,
        error: error.message,
        stack: error.stack,
        requestBody: req.body
      });
      
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          message: 'A user with this information already exists',
          code: 'DUPLICATE_ERROR',
          field: error.meta?.target?.[0] || 'unknown'
        });
      }
      
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error updating user profile',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  /**
   * @route   PUT /api/users/me/email
   * @desc    Update user email with verification
   * @access  Private
   */
  router.put('/me/email', validateEmailUpdate, async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
          code: 'VALIDATION_ERROR',
          errors: errors.array().map(err => ({
            field: err.param,
            message: err.msg
          }))
        });
      }

      const { email } = req.body;

      console.log('📧 Email update request for:', {
        userId: req.user.id,
        currentEmail: req.user.email,
        newEmail: email
      });

      // Check if email is the same as current
      if (email === req.user.email) {
        return res.status(400).json({
          success: false,
          message: 'New email is the same as current email',
          code: 'SAME_EMAIL'
        });
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== req.user.id) {
        console.log('❌ Email already in use:', {
          requestedEmail: email,
          existingUserId: existingUser.id,
          requestingUserId: req.user.id
        });
        return res.status(400).json({
          success: false,
          message: 'This email address is already in use',
          code: 'EMAIL_EXISTS',
          field: 'email'
        });
      }

      // Update email
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { email },
        include: {
          candidateProfile: req.user.role === 'JOBSEEKER',
          company: req.user.role === 'EMPLOYER'
        }
      });

      // Remove sensitive data
      const { passwordHash, ...userWithoutPassword } = updatedUser;

      console.log('✅ Email updated successfully:', {
        userId: updatedUser.id,
        newEmail: email,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Email updated successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('💥 Error updating email:', {
        userId: req.user.id,
        error: error.message,
        stack: error.stack
      });
      
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          message: 'This email address is already in use',
          code: 'EMAIL_EXISTS',
          field: 'email'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error updating email',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  return router;
};

module.exports = createUsersRouter;
