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

  if (data.phone_number && !data.phone_number.match(/^\+?[\d\s-()]+$/)) {
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

      // Remove sensitive data
      const { passwordHash, ...userWithoutPassword } = profile;

      res.json({
        success: true,
        data: userWithoutPassword
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
        first_name,
        last_name,
        bio,
        location,
        phone_number,
        title,
        skills,
        education,
        experience,
        resume_url,
        photo_url,
        resume_file_name
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
      if (first_name) userUpdateData.firstName = first_name;
      if (last_name) userUpdateData.lastName = last_name;
      if (bio !== undefined && bio !== '') userUpdateData.bio = bio;
      if (location !== undefined && location !== '') userUpdateData.location = location;
      if (phone_number) userUpdateData.phoneNumber = phone_number;
      if (title !== undefined && title !== '') userUpdateData.title = title;

      const candidateUpdateData = {};
      if (Array.isArray(skills) && skills.length) candidateUpdateData.skills = skills;
      if (Array.isArray(education) && education.length) candidateUpdateData.education = education;
      if (Array.isArray(experience) && experience.length) candidateUpdateData.experience = experience;
      if (bio !== undefined && bio !== '') candidateUpdateData.bio = bio;
      if (resume_url) candidateUpdateData.resumeUrl = resume_url;
      if (photo_url) candidateUpdateData.photoUrl = photo_url;
      if (resume_file_name) candidateUpdateData.resumeFileName = resume_file_name;

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

  // Configure multer storage for photo uploads (reuse same directory as other uploads)
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
      cb(null, uniqueName);
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

  // POST /api/jobseeker/profile/photo – upload profile picture
  router.post('/profile/photo', authenticateJWT, upload.single('photo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      // Build relative URL to serve the image
      const photoUrl = `/uploads/${req.file.filename}`;

      // Update candidateProfile photoUrl
      await prisma.candidateProfile.upsert({
        where: { userId: req.user.id },
        create: { userId: req.user.id, photoUrl },
        update: { photoUrl }
      });

      return res.json({ success: true, photoUrl });
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      return res.status(500).json({ success: false, message: 'Error uploading photo' });
    }
  });

  /**
   * @route   POST /api/jobseeker/profile/resume
   * @desc    Upload / replace resume (PDF, DOC, DOCX - max 5 MB)
   * @access  Private – Jobseeker
   * Front-end expects fields: resumeUrl, resumeFileName
   */
  router.post('/profile/resume', authenticateJWT, upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      // Validate MIME type (accept PDF, DOC, DOCX)
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        // Remove uploaded invalid file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Only PDF, DOC, and DOCX files are allowed' });
      }

      const resumeUrl = `/uploads/${req.file.filename}`;
      const resumeFileName = req.file.originalname;

      // Update or create candidate profile with resume info
      await prisma.candidateProfile.upsert({
        where: { userId: req.user.id },
        create: { userId: req.user.id, resumeUrl, resumeFileName },
        update: { resumeUrl, resumeFileName }
      });

      return res.json({ success: true, resumeUrl, resumeFileName });
    } catch (error) {
      console.error('Error uploading resume:', error);
      return res.status(500).json({ success: false, message: 'Error uploading resume' });
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
