const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Validation functions
const validateProfileUpdate = (data) => {
  const errors = [];

  if (data.skills && !Array.isArray(data.skills)) {
    errors.push('Skills must be an array');
  }

  if (data.education && !Array.isArray(data.education)) {
    errors.push('Education must be an array');
  }

  if (data.experience && !Array.isArray(data.experience)) {
    errors.push('Experience must be an array');
  }

  if (data.phoneNumber && !data.phoneNumber.match(/^\+?[\d\s-()]+$/)) {
    errors.push('Invalid phone number format');
  }

  return errors;
};

const createJobseekerRouter = (prisma) => {
  /**
   * @route   GET /api/jobseeker/profile
   * @desc    Get jobseeker profile
   * @access  Private
   */
  router.get('/profile', authenticateJWT, async (req, res) => {
    try {
      const profile = await prisma.user.findFirst({
        where: {
          id: req.user.id,
          role: 'JOBSEEKER'
        },
        include: {
          candidateProfile: true
        }
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found',
          code: 'PROFILE_NOT_FOUND'
        });
      }

      // Remove sensitive data and normalize field names
      const { passwordHash, ...userWithoutPassword } = profile;
      
      // Normalize field names for frontend compatibility
      const normalizedProfile = {
        ...userWithoutPassword,
        firstName: userWithoutPassword.first_name,
        lastName: userWithoutPassword.last_name,
        phoneNumber: userWithoutPassword.phone_number,
        // Keep original field names for backward compatibility
        first_name: userWithoutPassword.first_name,
        last_name: userWithoutPassword.last_name,
        phone_number: userWithoutPassword.phone_number
      };

      res.json({
        success: true,
        data: normalizedProfile
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching profile',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  /**
   * @route   PUT /api/jobseeker/profile
   * @desc    Update jobseeker profile
   * @access  Private
   */
  router.put('/profile', authenticateJWT, async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        bio,
        location,
        phoneNumber,
        title,
        skills,
        education,
        experience,
        resumeUrl,
        photoUrl,
        resumeFileName
      } = req.body;

      // Validate update data
      const validationErrors = validateProfileUpdate(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profile data',
          code: 'INVALID_INPUT',
          errors: validationErrors
        });
      }

      // Verify user is a jobseeker
      const user = await prisma.user.findFirst({
        where: {
          id: req.user.id,
          role: 'JOBSEEKER'
        },
        include: {
          candidateProfile: true
        }
      });

      if (!user) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. User is not a jobseeker',
          code: 'INVALID_ROLE'
        });
      }

      // Build dynamic update objects only with provided non-empty values
      const userUpdateData = {};
      if (firstName) userUpdateData.firstName = firstName;
      if (lastName) userUpdateData.lastName = lastName;
      if (bio !== undefined && bio !== '') userUpdateData.bio = bio;
      if (location !== undefined && location !== '') userUpdateData.location = location;
      if (phoneNumber) userUpdateData.phoneNumber = phoneNumber;
      if (title !== undefined && title !== '') userUpdateData.title = title;

      const candidateUpdateData = {};
      if (Array.isArray(skills) && skills.length) candidateUpdateData.skills = skills;
      if (Array.isArray(education) && education.length) candidateUpdateData.education = education;
      if (Array.isArray(experience) && experience.length) candidateUpdateData.experience = experience;
      if (bio !== undefined && bio !== '') candidateUpdateData.bio = bio;
      if (resumeUrl !== undefined && resumeUrl !== '') candidateUpdateData.resumeUrl = resumeUrl;
      if (photoUrl !== undefined && photoUrl !== '') candidateUpdateData.photoUrl = photoUrl;
      if (resumeFileName !== undefined && resumeFileName !== '') candidateUpdateData.resumeFileName = resumeFileName;

      // Update profile using transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update user data
        const updatedUser = await tx.user.update({
          where: { id: req.user.id },
          data: userUpdateData
        });

        // Update or create candidate profile
        const updatedProfile = await tx.candidateProfile.upsert({
          where: {
            userId: req.user.id
          },
          create: {
            userId: req.user.id,
            ...candidateUpdateData
          },
          update: candidateUpdateData
        });

        return {
          ...updatedUser,
          candidateProfile: updatedProfile
        };
      });

      // Remove sensitive data
      const { passwordHash, ...userWithoutPassword } = result;

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating profile',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Configure multer storage for photo uploads with enhanced error handling
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      // Sanitize filename more thoroughly
      const ext = path.extname(file.originalname).toLowerCase();
      const name = path.basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 50); // Limit length
      const uniqueName = `${Date.now()}-${name}${ext}`;
      cb(null, uniqueName);
    }
  });

  const upload = multer({
    storage,
    limits: { 
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: 1 // Only allow single file
    },
    fileFilter: function (req, file, cb) {
      // Log upload attempt for debugging
      console.log('📄 File upload attempt:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
      cb(null, true); // Accept all files here, validate per endpoint
    }
  });

  // POST /api/jobseeker/profile/photo – upload profile picture
  router.post('/profile/photo', authenticateJWT, (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.',
            code: 'FILE_TOO_LARGE'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files. Only one file allowed.',
            code: 'TOO_MANY_FILES'
          });
        }
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          code: 'UPLOAD_ERROR',
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error during upload',
          code: 'SERVER_ERROR'
        });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please select a photo to upload.',
          code: 'NO_FILE'
        });
      }

      // Validate image file type
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const fileExt = path.extname(req.file.originalname).toLowerCase();

      if (!allowedMimeTypes.includes(req.file.mimetype) || !allowedExtensions.includes(fileExt)) {
        // Remove uploaded invalid file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only JPEG, PNG, and GIF images are allowed.',
          code: 'INVALID_FILE_TYPE'
        });
      }

      console.log('✅ Valid photo uploaded:', {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      // Build relative URL to serve the image
      const photoUrl = `/uploads/${req.file.filename}`;

      // Update candidateProfile photoUrl
      await prisma.candidateProfile.upsert({
        where: { userId: req.user.id },
        create: { userId: req.user.id, photoUrl },
        update: { photoUrl }
      });

      res.json({
        success: true,
        message: 'Photo uploaded successfully',
        photoUrl,
        filename: req.file.filename
      });
    } catch (error) {
      console.error('💥 Error uploading profile photo:', error);
      
      // Clean up uploaded file if database operation failed
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: 'Error uploading photo',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  /**
   * @route   POST /api/jobseeker/profile/resume
   * @desc    Upload / replace resume (PDF, DOC, DOCX - max 5 MB)
   * @access  Private – Jobseeker
   * Front-end expects fields: resumeUrl, resumeFileName
   */
  router.post('/profile/resume', authenticateJWT, (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Resume upload multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Resume file too large. Maximum size is 5MB.',
            code: 'FILE_TOO_LARGE'
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Resume upload error',
          code: 'UPLOAD_ERROR',
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
      if (err) {
        console.error('Resume upload error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error during resume upload',
          code: 'SERVER_ERROR'
        });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No resume file uploaded. Please select a PDF, DOC, or DOCX file.',
          code: 'NO_FILE'
        });
      }

      console.log('📄 Resume upload attempt:', {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      // Validate MIME type (accept PDF, DOC, DOCX)
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      
      if (!allowedMimeTypes.includes(req.file.mimetype) || !allowedExtensions.includes(fileExt)) {
        // Remove uploaded invalid file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed for resumes.',
          code: 'INVALID_FILE_TYPE',
          allowedTypes: ['PDF', 'DOC', 'DOCX']
        });
      }

      console.log('✅ Valid resume uploaded:', {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      const resumeUrl = `/uploads/${req.file.filename}`;
      const resumeFileName = req.file.originalname;

      // Update or create candidate profile with resume info
      await prisma.candidateProfile.upsert({
        where: { userId: req.user.id },
        create: { userId: req.user.id, resumeUrl, resumeFileName },
        update: { resumeUrl, resumeFileName }
      });

      res.json({
        success: true,
        message: 'Resume uploaded successfully',
        resumeUrl,
        resumeFileName,
        fileSize: req.file.size
      });
    } catch (error) {
      console.error('💥 Error uploading resume:', error);
      
      // Clean up uploaded file if database operation failed
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: 'Error uploading resume',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  /**
   * @route   GET /api/jobseeker/saved-jobs
   * @desc    Get user's saved jobs
   * @access  Private
   */
  router.get('/saved-jobs', authenticateJWT, async (req, res) => {
    try {
      const savedJobs = await prisma.savedJob.findMany({
        where: {
          userId: req.user.id
        },
        include: {
          job: {
            include: {
              company: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        savedJobs: savedJobs.map(saved => saved.job)
      });
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching saved jobs',
        code: 'SERVER_ERROR'
      });
    }
  });

  /**
   * @route   POST /api/jobseeker/saved-jobs
   * @desc    Save a job
   * @access  Private
   */
  router.post('/saved-jobs', authenticateJWT, async (req, res) => {
    try {
      const { jobId } = req.body;

      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'Job ID is required',
          code: 'MISSING_JOB_ID'
        });
      }

      // Check if job exists
      const job = await prisma.job.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found',
          code: 'JOB_NOT_FOUND'
        });
      }

      // Check if already saved
      const existingSave = await prisma.savedJob.findUnique({
        where: {
          jobId_userId: {
            jobId: jobId,
            userId: req.user.id
          }
        }
      });

      if (existingSave) {
        return res.status(409).json({
          success: false,
          message: 'Job already saved',
          code: 'ALREADY_SAVED'
        });
      }

      // Save the job
      const savedJob = await prisma.savedJob.create({
        data: {
          jobId: jobId,
          userId: req.user.id
        },
        include: {
          job: {
            include: {
              company: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Job saved successfully',
        savedJob: savedJob.job
      });
    } catch (error) {
      console.error('Error saving job:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving job',
        code: 'SERVER_ERROR'
      });
    }
  });

  /**
   * @route   DELETE /api/jobseeker/saved-jobs/:jobId
   * @desc    Remove a saved job
   * @access  Private
   */
  router.delete('/saved-jobs/:jobId', authenticateJWT, async (req, res) => {
    try {
      const { jobId } = req.params;

      // Check if the saved job exists
      const savedJob = await prisma.savedJob.findUnique({
        where: {
          jobId_userId: {
            jobId: jobId,
            userId: req.user.id
          }
        }
      });

      if (!savedJob) {
        return res.status(404).json({
          success: false,
          message: 'Saved job not found',
          code: 'SAVED_JOB_NOT_FOUND'
        });
      }

      // Remove the saved job
      await prisma.savedJob.delete({
        where: {
          jobId_userId: {
            jobId: jobId,
            userId: req.user.id
          }
        }
      });

      res.json({
        success: true,
        message: 'Job removed from saved jobs'
      });
    } catch (error) {
      console.error('Error removing saved job:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing saved job',
        code: 'SERVER_ERROR'
      });
    }
  });

  return router;
};

module.exports = createJobseekerRouter;
