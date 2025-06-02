// server.js - Main server file
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma
const prisma = new PrismaClient();

// Setup file storage for local development
const UPLOAD_DIR = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const fileExtension = path.extname(file.originalname);
    cb(null, `${Date.now().toString()}-${uuidv4()}${fileExtension}`);
  }
});

// File upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 50MB file size limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only certain file types
    const allowedFileTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const extension = path.extname(file.originalname).toLowerCase();
    
    if (allowedFileTypes.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed.'));
    }
  }
});

// Middleware setup
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({limit: '50mb'}));
app.use(morgan('dev'));
app.use('/uploads', express.static(UPLOAD_DIR));

// Database connection function
const connectToDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL via Prisma');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  console.log('Authenticating request to:', req.path);
  const authHeader = req.headers.authorization;

  if (authHeader) {
    console.log('Auth header format:', authHeader.substring(0, 10) + '...');
    
    // Handle different auth header formats
    let token;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('Extracted Bearer token, length:', token.length);
    } else {
      // If no Bearer prefix, use the whole header as token
      token = authHeader;
      console.log('Using full header as token, length:', token.length);
    }
    
    if (!token || token === 'undefined' || token === 'null') {
      console.error('Invalid token format in authorization header');
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const secret = process.env.JWT_SECRET || 'local_development_secret';
    console.log('Using JWT_SECRET:', secret.substring(0, 3) + '...');

    try {
      const decoded = jwt.verify(token, secret);
      console.log('Decoded JWT user:', decoded);
      req.user = decoded;
      return next();
    } catch (err) {
      console.error('JWT verification error:', err.name, err.message);
      return res.status(403).json({ message: 'Invalid or expired token', error: err.message });
    }
  } else {
    console.error('Authorization header missing for path:', req.path);
    return res.status(401).json({ message: 'Authorization header missing' });
  }
};

// Check user role middleware
const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: `Access denied. ${role} role required.` });
    }
  };
};

// Helper function to transform job type from frontend format to backend enum format
const transformJobType = (jobType) => {
  if (!jobType) return null;
  
  const typeMap = {
    'Full-time': 'FULL_TIME',
    'Part-time': 'PART_TIME',
    'Contract': 'CONTRACT',
    'Temporary': 'TEMPORARY',
    'Internship': 'INTERNSHIP',
    // Add fallbacks for direct enum values in case they're already in the correct format
    'FULL_TIME': 'FULL_TIME',
    'PART_TIME': 'PART_TIME',
    'CONTRACT': 'CONTRACT',
    'TEMPORARY': 'TEMPORARY',
    'INTERNSHIP': 'INTERNSHIP'
  };
  
  const transformedType = typeMap[jobType];
  if (!transformedType) {
    throw new Error(`Invalid job type: ${jobType}. Must be one of: FULL_TIME, PART_TIME, CONTRACT, TEMPORARY, INTERNSHIP`);
  }
  
  return transformedType;
};

// Sanitize job data to remove fields that don't exist in the Prisma schema
const sanitizeJobData = (data) => {
  // Create a new object with only valid fields
  const sanitized = { ...data };
  
  // Remove fields that don't exist in the Prisma schema
  const fieldsToRemove = ['requirements', 'benefits', 'jobType', 'salaryMin', 'salaryMax', 'salaryCurrency', 'applicationDeadline', 'remote', 'featured'];
  
  for (const field of fieldsToRemove) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }
  
  return sanitized;
};

// Helper function to create a properly formatted salary object
const formatSalaryObject = (salaryMin, salaryMax, currency = "USD") => {
  if (!salaryMin && !salaryMax) return null;
  
  return {
    min: salaryMin ? parseInt(salaryMin) : null,
    max: salaryMax ? parseInt(salaryMax) : null,
    currency: currency
  };
};

// Routes

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        passwordHash: hashedPassword,
        role: role || 'JOBSEEKER',
      }
    });
    
    // Return token
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: 'User registered successfully',
      token: 'dev-token',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Use Prisma for authentication
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If the password is stored as plain text (for existing accounts)
    let isValidPassword = false;
    
    // Try bcrypt compare first (for new accounts with proper hashing)
    try {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    } catch (e) {
      // If bcrypt compare fails, check if passwords match directly (for existing accounts)
      isValidPassword = password === user.passwordHash;
    }
    
    console.log('Password validation result:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'local_development_secret',
      { expiresIn: '24h' }
    );

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// User Routes
app.get('/api/users/me', authenticateJWT, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password: _, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
});

app.put('/api/users/me', authenticateJWT, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, bio, location, locationData } = req.body;

    // Update user information using Prisma
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone,
        address,
        bio,
        location,
        locationData
      }
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive information
    const { passwordHash, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user data', error: error.message });
  }
});

// Company Profile Routes
app.get('/api/employer/profile', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const employer = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    const company = await prisma.company.findUnique({
      where: { id: employer.companyId }
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      name: company.name,
      industry: company.industry,
      location: company.location,
      description: company.description,
      website: company.website,
      employeeCount: company.employeeCount,
      founded: company.founded,
      socialLinks: company.socialLinks,
      logoUrl: company.logoUrl,
      culture: company.culture
    });
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({ message: 'Error fetching company profile', error: error.message });
  }
});

app.put('/api/employer/profile', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const { 
      name, 
      industry, 
      location, 
      description, 
      website, 
      employeeCount, 
      founded, 
      socialLinks,
      culture
    } = req.body;

    const employer = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    const company = await prisma.company.upsert({
      where: { id: employer.companyId || '' },
      create: {
        name,
        industry,
        location,
        description,
        website,
        employeeCount,
        founded,
        socialLinks,
        culture,
        employees: {
          connect: { id: employer.id }
        }
      },
      update: {
        name,
        industry,
        location,
        description,
        website,
        employeeCount,
        founded,
        socialLinks,
        culture
      }
    });

    // Update employer's companyId if it's a new company
    if (!employer.companyId) {
      await prisma.user.update({
        where: { id: employer.id },
        data: { companyId: company.id }
      });
    }

    res.json({
      message: 'Company profile updated successfully',
      profile: {
        name: company.name,
        industry: company.industry,
        location: company.location,
        description: company.description,
        website: company.website,
        employeeCount: company.employeeCount,
        founded: company.founded,
        socialLinks: company.socialLinks,
        culture: company.culture,
        logoUrl: company.logoUrl
      }
    });
  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({ message: 'Error updating company profile', error: error.message });
  }
});

// New endpoint for company creation that uses the correct field name
app.post('/api/employer/create-company', authenticateJWT, async (req, res) => {
  try {
    // Check if user is an employer
    if (req.user.role !== 'EMPLOYER') {
      return res.status(403).json({ message: 'Only employers can create company profiles' });
    }

    // Extract company data from request
    const { 
      name, 
      description, 
      location, 
      website,
      industry
    } = req.body;

    // Find the employer
    const employer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    // If employer already has a company, update it
    if (employer.companyId) {
      const updatedCompany = await prisma.company.update({
        where: { id: employer.companyId },
        data: {
          name: name || undefined,
          description: description || undefined,
          location: location || undefined,
          website: website || undefined,
          // Remove industry field as it doesn't exist in the Prisma schema
        }
      });
      
      return res.json({
        message: 'Company profile updated successfully',
        profile: updatedCompany
      });
    }
    
    // Otherwise, create a new company
    const newCompany = await prisma.company.create({
      data: {
        name: name || 'My Company',
        description: description || '',
        location: location || '',
        website: website || '',
        // Remove industry field as it doesn't exist in the Prisma schema
        employees: {
          connect: { id: employer.id }
        }
      }
    });
    
    // Update the employer with the new company ID
    await prisma.user.update({
      where: { id: employer.id },
      data: { companyId: newCompany.id }
    });
    
    return res.status(201).json({
      message: 'Company profile created successfully',
      profile: newCompany
    });
  } catch (error) {
    console.error('Create company error:', error);
    return res.status(500).json({ message: 'Failed to create company profile', error: error.message });
  }
});

// Candidate Profile API Endpoints
app.get('/api/candidate/profile', authenticateJWT, checkRole('JOBSEEKER'), async (req, res) => {
  try {
    console.log('Get profile request from user:', req.user.id);
    
    const candidate = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        candidateProfile: true
      }
    });

    if (!candidate) {
      console.log('Candidate not found for user ID:', req.user.id);
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Format the response - ONLY include this user's data
    const profile = {
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      title: candidate.candidateProfile?.title || '',
      bio: candidate.candidateProfile?.bio || '',
      location: candidate.candidateProfile?.location || '',
      skills: candidate.candidateProfile?.skills || [],
      education: candidate.candidateProfile?.education || [],
      // Only include photo and resume if they belong to this user's profile
      photoUrl: candidate.candidateProfile?.photoUrl || '',
      resumeUrl: candidate.candidateProfile?.resumeUrl || '',
      resumeFileName: candidate.candidateProfile?.resumeFileName || ''
    };

    console.log('Sending profile data for user:', req.user.id);
    res.json(profile);
  } catch (error) {
    console.error('Get candidate profile error:', error);
    res.status(500).json({ message: 'Error fetching candidate profile', error: error.message });
  }
});

app.put('/api/candidate/profile', authenticateJWT, checkRole('JOBSEEKER'), upload.fields([
  { name: 'photoFile', maxCount: 1 },
  { name: 'resumeFile', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Profile update request from user:', req.user.id);
    const { 
      firstName, 
      lastName, 
      title, 
      bio, 
      location,
      skills,
      education,
      photoUrl: existingPhotoUrl,
      resumeFileName: existingResumeFileName
    } = req.body;

    // Parse JSON strings if needed
    const parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills || [];
    const parsedEducation = typeof education === 'string' ? JSON.parse(education) : education || [];

    // Process uploaded files
    let photoUrl = existingPhotoUrl;
    let resumeUrl = null;
    let resumeFileName = existingResumeFileName;

    // Handle photo file upload
    if (req.files && req.files.photoFile && req.files.photoFile[0]) {
      const photoFile = req.files.photoFile[0];
      // Read the file and convert to base64
      const photoBuffer = fs.readFileSync(photoFile.path);
      photoUrl = `data:${photoFile.mimetype};base64,${photoBuffer.toString('base64')}`;
      
      // Delete the temporary file
      fs.unlinkSync(photoFile.path);
    }

    // Handle resume file upload
    if (req.files && req.files.resumeFile && req.files.resumeFile[0]) {
      const resumeFile = req.files.resumeFile[0];
      // Read the file and convert to base64
      const resumeBuffer = fs.readFileSync(resumeFile.path);
      resumeUrl = `data:${resumeFile.mimetype};base64,${resumeBuffer.toString('base64')}`;
      resumeFileName = resumeFile.originalname;
      
      // Delete the temporary file
      fs.unlinkSync(resumeFile.path);
    }

    // Update user's basic info
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName
      }
    });

    // Update or create candidate profile
    const candidateProfile = await prisma.candidateProfile.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        title,
        bio,
        location,
        skills: parsedSkills,
        education: parsedEducation,
        photoUrl,
        resumeUrl,
        resumeFileName
      },
      update: {
        title,
        bio,
        location,
        skills: parsedSkills,
        education: parsedEducation,
        photoUrl,
        resumeUrl: resumeUrl || undefined,
        resumeFileName: resumeFileName || undefined
      }
    });

    res.json({
      message: 'Profile updated successfully',
      profile: {
        firstName,
        lastName,
        title,
        bio,
        location,
        skills: parsedSkills,
        education: parsedEducation,
        photoUrl,
        resumeUrl,
        resumeFileName
      }
    });
  } catch (error) {
    console.error('Update candidate profile error:', error);
    res.status(500).json({ message: 'Error updating candidate profile', error: error.message });
  }
});

app.post('/api/candidate/photo', authenticateJWT, checkRole('JOBSEEKER'), upload.single('photo'), async (req, res) => {
  try {
    console.log('Photo upload request from user:', req.user);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No photo file uploaded' });
    }

    // Read the file and convert to base64
    const photoBuffer = fs.readFileSync(req.file.path);
    const photoBase64 = `data:${req.file.mimetype};base64,${photoBuffer.toString('base64')}`;
    
    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    // Update the candidate profile with the photo URL
    await prisma.candidateProfile.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        photoUrl: photoBase64
      },
      update: {
        photoUrl: photoBase64
      }
    });

    res.json({
      message: 'Photo uploaded successfully',
      photoUrl: photoBase64
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ message: 'Error uploading photo', error: error.message });
  }
});

app.post('/api/candidate/resume', authenticateJWT, checkRole('JOBSEEKER'), upload.single('resume'), async (req, res) => {
  try {
    console.log('Resume upload request from user:', req.user.id);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded' });
    }

    console.log('Resume file details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Read the file and convert to base64
    const resumeBuffer = fs.readFileSync(req.file.path);
    
    // Ensure we use the correct MIME type for PDF files
    let mimeType = req.file.mimetype;
    if (req.file.originalname.toLowerCase().endsWith('.pdf') && mimeType !== 'application/pdf') {
      mimeType = 'application/pdf';
      console.log('Corrected MIME type to application/pdf for PDF file');
    }
    
    const resumeBase64 = `data:${mimeType};base64,${resumeBuffer.toString('base64')}`;
    console.log('Resume encoded as base64 with MIME type:', mimeType);
    
    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    // Update the candidate profile with the resume URL and filename
    await prisma.candidateProfile.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        resumeUrl: resumeBase64,
        resumeFileName: req.file.originalname
      },
      update: {
        resumeUrl: resumeBase64,
        resumeFileName: req.file.originalname
      }
    });

    console.log('Resume saved to database for user:', req.user.id);
    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl: resumeBase64,
      resumeFileName: req.file.originalname
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Error uploading resume', error: error.message });
  }
});

// Get candidate resume
app.get('/api/candidate/resume', authenticateJWT, async (req, res) => {
  try {
    // Enhanced logging for debugging authentication issues
    console.log('Resume request received');
    console.log('Auth header:', req.headers.authorization ? 'Present' : 'Missing');
    console.log('User in request:', req.user ? `ID: ${req.user.id}` : 'No user');
    
    if (!req.user || !req.user.id) {
      console.error('Authentication failed - no valid user in request');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log('Resume request from authenticated user:', req.user.id);
    
    // Find the candidate profile
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!candidateProfile) {
      console.log('Candidate profile not found for user:', req.user.id);
      return res.status(404).json({ message: 'Candidate profile not found' });
    }
    
    if (!candidateProfile.resumeUrl) {
      console.log('Resume not found for user:', req.user.id);
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Ensure the resume URL has the correct MIME type for PDF
    let resumeUrl = candidateProfile.resumeUrl;
    
    // Check if it's a base64 string without the PDF MIME type
    if (resumeUrl.startsWith('data:') && !resumeUrl.includes('application/pdf')) {
      // Extract the base64 part (after the comma)
      const base64Part = resumeUrl.split(',')[1];
      // Reconstruct with the correct PDF MIME type
      resumeUrl = `data:application/pdf;base64,${base64Part}`;
      console.log('Fixed resume URL format for PDF');
    }
    
    console.log('Sending resume data with filename:', candidateProfile.resumeFileName);
    
    res.json({
      resumeUrl: resumeUrl,
      resumeFileName: candidateProfile.resumeFileName
    });
  } catch (error) {
    console.error('Error retrieving resume:', error);
    res.status(500).json({ message: 'Error retrieving resume', error: error.message });
  }
});

// Get resume by candidate ID (for employers viewing applications)
app.get('/api/candidate/:candidateId/resume', authenticateJWT, async (req, res) => {
  try {
    const { candidateId } = req.params;
    console.log(`Resume request for candidate ${candidateId} from user:`, req.user.id);
    
    // Check if user is authorized to view this resume
    // If user is an employer, they should only be able to view resumes of candidates who applied to their jobs
    // If user is the candidate, they can view their own resume
    let isAuthorized = false;
    
    if (req.user.role === 'JOBSEEKER') {
      // Candidate can view their own resume
      isAuthorized = req.user.id === candidateId;
    } else if (req.user.role === 'EMPLOYER') {
      // Check if candidate has applied to any of this employer's jobs
      const applications = await prisma.jobApplication.findMany({
        where: {
          candidateId: candidateId,
          job: {
            companyId: req.user.companyId
          }
        }
      });
      
      isAuthorized = applications.length > 0;
    } else if (req.user.role === 'ADMIN') {
      // Admins can view all resumes
      isAuthorized = true;
    }
    
    if (!isAuthorized) {
      console.log('User not authorized to view this resume');
      return res.status(403).json({ message: 'Not authorized to view this resume' });
    }
    
    // Find the candidate profile
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: candidateId }
    });

    if (!candidateProfile || !candidateProfile.resumeUrl) {
      console.log(`Resume not found for candidate: ${candidateId}`);
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Ensure the resume URL has the correct MIME type for PDF
    let resumeUrl = candidateProfile.resumeUrl;
    
    // Check if it's a base64 string without the PDF MIME type
    if (resumeUrl.startsWith('data:') && !resumeUrl.includes('application/pdf')) {
      // Extract the base64 part (after the comma)
      const base64Part = resumeUrl.split(',')[1];
      // Reconstruct with the correct PDF MIME type
      resumeUrl = `data:application/pdf;base64,${base64Part}`;
      console.log('Fixed resume URL format for PDF');
    }
    
    console.log(`Sending resume data for candidate ${candidateId} with filename:`, candidateProfile.resumeFileName);

    res.json({
      resumeUrl: resumeUrl,
      resumeFileName: candidateProfile.resumeFileName
    });
  } catch (error) {
    console.error('Error retrieving resume:', error);
    res.status(500).json({ message: 'Error retrieving resume', error: error.message });
  }
});

app.post('/api/employer/logo', authenticateJWT, checkRole('EMPLOYER'), upload.single('logo'), async (req, res) => {
  try {
    console.log('Logo upload request from user:', req.user);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No logo file uploaded' });
    }

    console.log('Uploaded file:', req.file);

    // Generate logo URL
    const logoUrl = `/uploads/${req.file.filename}`;
    console.log('Generated logo URL:', logoUrl);

    // Get user from database
    const employer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });

    if (!employer) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!employer.company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: employer.company.id },
      data: { logoUrl }
    });

    res.json({
      message: 'Logo uploaded successfully',
      logoUrl
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ message: 'Error uploading logo', error: error.message });
  }
});
// Job Management Endpoints

app.post('/api/employer/jobs', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    console.log('Job creation request received:', req.body.title);
    
    const { 
      title, 
      description, 
      location, 
      type,  // Use type directly
      jobType, // For backward compatibility
      skills,
      experience,
      education,
      salary,
      salaryMin,
      salaryMax,
      salaryCurrency,
      remote,
      applicationDeadline,
      status = 'ACTIVE'
    } = req.body;
    
    // Get the employer's company
    const employer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });

    if (!employer?.company) {
      return res.status(400).json({ message: 'Company profile required to post jobs' });
    }

    // Valid job types as defined in the Prisma schema
    const validTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'];
    
    // Determine the job type to use
    let finalType;
    
    // First try using the type field directly
    if (type && validTypes.includes(type)) {
      finalType = type;
      console.log('Using type directly:', finalType);
    } 
    // Fall back to jobType if provided
    else if (jobType) {
      // If jobType is already a valid enum value, use it directly
      if (validTypes.includes(jobType)) {
        finalType = jobType;
        console.log('Using jobType directly:', finalType);
      } 
      // Otherwise try to transform it
      else {
        try {
          finalType = transformJobType(jobType);
          console.log('Transformed jobType:', finalType);
        } catch (error) {
          return res.status(400).json({ message: error.message });
        }
      }
    } else {
      // Default to FULL_TIME if no type is provided
      finalType = 'FULL_TIME';
      console.log('Using default job type:', finalType);
    }
    
    // Validate we have a valid job type
    if (!finalType || !validTypes.includes(finalType)) {
      return res.status(400).json({ 
        message: `Job type is required and must be one of: ${validTypes.join(', ')}`
      });
    }

    // Handle salary field
    let salaryObject;
    if (salary && typeof salary === 'object') {
      salaryObject = salary;
      console.log('Using provided salary object');
    } else if (salaryMin || salaryMax) {
      salaryObject = formatSalaryObject(salaryMin, salaryMax, salaryCurrency);
      console.log('Created salary object from min/max values');
    }

    console.log('Creating job with type:', finalType);
    
    // Create job with explicitly set type field and sanitized data
    const jobData = {
      title,
      description,
      location: location || (remote ? 'Remote' : ''),
      type: finalType, // IMPORTANT: This must match the Prisma schema field
      skills: skills || [],
      experience: experience || null,
      education: education || null,
      salary: salaryObject,
      status,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      company: {
        connect: { id: employer.company.id }
      }
    };
    
    // Remove any fields that don't exist in the Prisma schema
    const sanitizedData = sanitizeJobData(jobData);
    
    const job = await prisma.job.create({
      data: sanitizedData,
      include: {
        company: true,
        applications: true
      }
    });

    console.log('Job created successfully:', job.id);
    res.json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Error creating job posting', error: error.message });
  }
});

app.get('/api/employer/jobs', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const employer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });

    if (!employer?.company) {
      return res.json([]);
    }

    const jobs = await prisma.job.findMany({
      where: { companyId: employer.company.id },
      include: {
        applications: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                candidateProfile: {
                  select: {
                    resumeUrl: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

app.delete('/api/employer/jobs/:id', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const job = await prisma.job.findFirst({
      where: {
        id,
        company: {
          employees: {
            some: { id: req.user.id }
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or access denied' });
    }

    // Delete all applications first
    await prisma.jobApplication.deleteMany({
      where: { jobId: id }
    });

    // Then delete the job
    await prisma.job.delete({
      where: { id }
    });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Error deleting job posting', error: error.message });
  }
});

// Job Routes

// Save/unsave job
app.post('/api/jobs/:jobId/:action', authenticateJWT, checkRole('JOBSEEKER'), async (req, res) => {
  try {
    const { jobId, action } = req.params;
    if (!['save', 'unsave'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    // Update user's saved jobs using Prisma
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { savedJobs: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (action === 'save') {
      // Save job
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          savedJobs: {
            connect: { id: jobId }
          }
        }
      });
    } else {
      // Unsave job
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          savedJobs: {
            disconnect: { id: jobId }
          }
        }
      });
    }

    res.json({ message: `Job ${action}d successfully` });
  } catch (error) {
    console.error(`${action} job error:`, error);
    res.status(500).json({ message: `Error ${action}ing job`, error: error.message });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    const { 
      search, 
      location, 
      jobType, 
      limit = 20, 
      page = 1,
      sort = 'latest',
      minSalary,
      maxSalary,
      remote
    } = req.query;
    
    // Build query filters
    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (location || req.query.locationData) {
      // Handle Jamaica-specific location search
      try {
        // First check if we have structured location data
        if (req.query.locationData) {
          console.log('Using structured location data');
          const locationData = JSON.parse(req.query.locationData);
          
          // Build OR conditions for parish and location name
          where.OR = where.OR || [];
          
          if (locationData.name) {
            where.OR.push({ location: { contains: locationData.name, mode: 'insensitive' } });
          }
          
          if (locationData.parish) {
            where.OR.push({ location: { contains: locationData.parish, mode: 'insensitive' } });
          }
        } 
        // If we have a location string but no structured data
        else if (location) {
          console.log('Using location string:', location);
          
          // Check if it's a comma-separated format (likely name, parish)
          if (location.includes(',')) {
            const parts = location.split(',').map(part => part.trim());
            where.OR = where.OR || [];
            
            // Add each part as a separate search condition
            parts.forEach(part => {
              if (part) {
                where.OR.push({ location: { contains: part, mode: 'insensitive' } });
              }
            });
          } else {
            // Simple string search
            where.location = { contains: location, mode: 'insensitive' };
          }
        }
      } catch (e) {
        // If parsing fails, just use the location as a string
        console.log('Location parsing error:', e);
        if (location) {
          where.location = { contains: location, mode: 'insensitive' };
        }
      }
    }
    
    if (remote === 'true') {
      where.location = { contains: 'remote', mode: 'insensitive' };
    }
    
    if (minSalary || maxSalary) {
      where.salary = {};
      if (minSalary) where.salary.gte = parseInt(minSalary);
      if (maxSalary) where.salary.lte = parseInt(maxSalary);
    }
    
    if (jobType) {
      try {
        // Valid job types as defined in the Prisma schema
        const validTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'];
        
        // If jobType is already a valid enum value, use it directly
        if (validTypes.includes(jobType)) {
          where.type = jobType;
        } else {
          // Convert jobType to the database enum format using our helper function
          where.type = transformJobType(jobType);
        }
      } catch (error) {
        console.error('Error transforming jobType for query:', error.message);
      }
    }

    // Get total count for pagination
    const total = await prisma.job.count({ where });
    
    // Get paginated results
    const jobs = await prisma.job.findMany({
      where,
      orderBy: [
        sort === 'latest' 
          ? { featured: 'desc' }
          : sort === 'salary'
          ? { salary: 'desc' }
          : { createdAt: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true
          }
        }
      }
    });

    res.json({
      jobs: jobs.map(job => ({
        ...job,
        companyName: job.company.name,
        companyLogo: job.company.logoUrl
      })),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Error fetching job listings', error: error.message });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true
          }
        }
      }
    });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({
      ...job,
      companyName: job.company.name,
      companyLogo: job.company.logoUrl
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Error fetching job details', error: error.message });
  }
});


app.delete('/api/jobs/:id', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify job exists and belongs to employer
    const job = await prisma.job.findFirst({
      where: {
        id,
        company: {
          employees: {
            some: {
              id: req.user.id
            }
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or not authorized' });
    }

    await prisma.job.delete({
      where: { id }
    });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Error deleting job listing', error: error.message });
  }
});

// Application Routes
app.post('/api/jobs/:id/apply', authenticateJWT, checkRole('JOBSEEKER'), upload.single('resume'), async (req, res) => {
  try {
    const { id } = req.params;
    const { coverLetter } = req.body;

    // Find the job
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId: job.id,
        userId: req.user.id
      }
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }

    // Get candidate details
    const candidate = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Process resume upload
    let resumeUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!resumeUrl) {
      return res.status(400).json({ message: 'Resume is required' });
    }

    const application = await prisma.jobApplication.create({
      data: {
        job: {
          connect: { id: job.id }
        },
        user: {
          connect: { id: candidate.id }
        },
        status: 'PENDING',
        resumeUrl,
        coverLetter: coverLetter || null
      },
      include: {
        job: {
          include: {
            company: true
          }
        },
        user: true
      }
    });

    // Find employers associated with the company
    const employers = await prisma.user.findMany({
      where: {
        companyId: job.companyId,
        role: 'EMPLOYER'
      }
    });

    // Create notifications for each employer
    if (employers.length > 0) {
      const notificationContent = JSON.stringify({
        jobId: job.id,
        jobTitle: job.title,
        applicationId: application.id,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        candidateEmail: candidate.email,
        appliedAt: new Date().toISOString()
      });

      const notificationPromises = employers.map(employer => 
        prisma.notification.create({
          data: {
            type: 'APPLICATION',
            status: 'UNREAD',
            content: notificationContent,
            recipient: {
              connect: { id: employer.id }
            },
            jobApplication: {
              connect: { id: application.id }
            }
          }
        })
      );

      await Promise.all(notificationPromises);
      console.log(`Created ${employers.length} notifications for job application`);
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        ...application,
        jobTitle: application.job.title,
        companyName: application.job.company.name,
        candidateName: `${application.user.firstName} ${application.user.lastName}`,
        candidateEmail: application.user.email
      }
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

// Notification Routes
app.get('/api/notifications', authenticateJWT, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        jobApplication: {
          include: {
            job: true,
            user: true
          }
        }
      }
    });

    // Format notifications for frontend
    const formattedNotifications = notifications.map(notification => {
      try {
        const contentObj = JSON.parse(notification.content);
        return {
          ...notification,
          contentObj,
          isRead: notification.status === 'READ'
        };
      } catch (e) {
        return {
          ...notification,
          contentObj: {},
          isRead: notification.status === 'READ'
        };
      }
    });

    res.json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

app.patch('/api/notifications/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify notification belongs to the authenticated user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        recipientId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Update notification status to READ
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { status: 'READ' }
    });

    res.json(updatedNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
});

app.get('/api/notifications/count', authenticateJWT, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        recipientId: req.user.id,
        status: 'UNREAD'
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error counting notifications:', error);
    res.status(500).json({ message: 'Error counting notifications', error: error.message });
  }
});

app.get('/api/applications', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role === 'EMPLOYER') {
      // Get all applications for jobs from the employer's company
      const applications = await prisma.jobApplication.findMany({
        where: {
          job: {
            company: {
              employees: {
                some: { id: req.user.id }
              }
            }
          }
        },
        include: {
          job: {
            include: {
              company: true
            }
          },
          user: true
        }
      });

      res.json({
        applications: applications.map(app => ({
          ...app,
          jobTitle: app.job.title,
          companyName: app.job.company.name,
          candidateName: `${app.user.firstName} ${app.user.lastName}`,
          candidateEmail: app.user.email
        }))
      });
    } else {
      // For jobseekers, get their applications
      const applications = await prisma.jobApplication.findMany({
        where: {
          userId: req.user.id
        },
        include: {
          job: {
            include: {
              company: true
            }
          },
          user: true
        }
      });

      res.json({
        applications: applications.map(app => ({
          ...app,
          jobTitle: app.job.title,
          companyName: app.job.company.name,
          candidateName: `${app.user.firstName} ${app.user.lastName}`,
          candidateEmail: app.user.email
        }))
      });
    }
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

app.get('/api/applications/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the application using Prisma
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: true
          }
        },
        user: true
      }
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check permission based on role
    if (req.user.role === 'EMPLOYER') {
      // Employer should own the job
      const isEmployerOfCompany = application.job.company.employees.some(
        employee => employee.id === req.user.id
      );
      
      if (!isEmployerOfCompany) {
        return res.status(403).json({ message: 'You do not have permission to view this application' });
      }
    } else if (req.user.id !== application.userId) {
      return res.status(403).json({ message: 'You do not have permission to view this application' });
    }

    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Error fetching application details', error: error.message });
  }
});

app.put('/api/applications/:id/status', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedbackNote } = req.body;

    // Check if application exists
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: true
          }
        },
        user: true
      }
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if employer owns the job
    const isEmployerOfCompany = application.job.company.employees.some(
      employee => employee.id === req.user.id
    );
    
    if (!isEmployerOfCompany) {
      return res.status(403).json({ message: 'You do not have permission to update this application' });
    }

    // Update application status using Prisma
    const updatedApplication = await prisma.jobApplication.update({
      where: { id },
      data: {
        status,
        feedbackNote
      },
      include: {
        job: {
          include: {
            company: true
          }
        },
        user: true
      }
    });

    // Get candidate details for email notification
    const candidate = application.user;

    if (candidate) {
      // In development mode, just log the email content
      let emailSubject, emailContent;
      const jobTitle = application.job.title;
      const companyName = application.job.company.name;
      const candidateName = `${candidate.firstName} ${candidate.lastName}`;

      if (status === 'REJECTED') {
        emailSubject = `Application Status Update: ${jobTitle}`;
        emailContent = `Dear ${candidateName},\n\nThank you for your interest in the ${jobTitle} position at ${companyName}.\n\nAfter careful consideration, we have decided to pursue other candidates whose qualifications better match our current needs.\n\n${feedbackNote ? `Additional feedback: ${feedbackNote}\n\n` : ''}We appreciate your interest in our company and wish you the best in your job search.\n\nSincerely,\n${companyName} Hiring Team`;
      } else if (status === 'INTERVIEW') {
        emailSubject = `Interview Request: ${jobTitle}`;
        emailContent = `Dear ${candidateName},\n\nWe're pleased to inform you that we would like to schedule an interview for the ${jobTitle} position at ${companyName}.\n\n${feedbackNote ? `${feedbackNote}\n\n` : ''}Please log in to your account to respond to this interview request.\n\nWe look forward to speaking with you!\n\nSincerely,\n${companyName} Hiring Team`;
      } else if (status === 'HIRED') {
        emailSubject = `Congratulations! Job Offer for ${jobTitle}`;
        emailContent = `Dear ${candidateName},\n\nCongratulations! We're delighted to offer you the ${jobTitle} position at ${companyName}.\n\n${feedbackNote ? `${feedbackNote}\n\n` : ''}Please log in to your account for more details about the offer.\n\nWe're excited to have you join our team!\n\nSincerely,\n${companyName} Hiring Team`;
      }

      if (emailSubject && emailContent) {
        console.log('Email would be sent to:', candidate.email);
        console.log('Subject:', emailSubject);
        console.log('Content:', emailContent);
      }
    }

    res.json({
      message: 'Application status updated successfully',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
});

// Analytics endpoints
app.get('/api/analytics/employer', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const employer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });

    if (!employer || !employer.company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get all jobs and their applications for this employer's company
    const jobs = await prisma.job.findMany({
      where: {
        companyId: employer.company.id
      },
      include: {
        _count: {
          select: { applications: true }
        },
        applications: {
          select: { status: true }
        }
      }
    });

    // Calculate statistics
    const stats = {
      totalJobs: jobs.length,
      totalApplications: jobs.reduce((sum, job) => sum + job._count.applications, 0),
      activeJobs: jobs.filter(job => job.status === 'ACTIVE').length,
      filledJobs: jobs.filter(job => job.status === 'FILLED').length
    };

    // Group applications by status
    const applicationsByStatus = {
      pending: jobs.reduce((sum, job) => sum + job.applications.filter(app => app.status === 'PENDING').length, 0),
      reviewed: jobs.reduce((sum, job) => sum + job.applications.filter(app => app.status === 'REVIEWED').length, 0),
      interview: jobs.reduce((sum, job) => sum + job.applications.filter(app => app.status === 'INTERVIEW').length, 0),
      rejected: jobs.reduce((sum, job) => sum + job.applications.filter(app => app.status === 'REJECTED').length, 0),
      hired: jobs.reduce((sum, job) => sum + job.applications.filter(app => app.status === 'HIRED').length, 0)
    };

    // Group applications by job
    const applicationsByJob = jobs.map(job => ({
      jobId: job.id,
      jobTitle: job.title,
      applicationCount: job._count.applications
    }));

    res.json({
      stats: {
        totalJobs: jobs.length,
        totalApplications: stats.totalApplications,
        activeJobs: jobs.filter(job => job.status === 'ACTIVE').length,
        filledJobs: jobs.filter(job => job.status === 'FILLED').length
      },
      applicationsByStatus,
      applicationsByJob,
      activeJobs: jobs.filter(job => job.status === 'ACTIVE').map(job => ({
        id: job.id,
        title: job.title,
        applicationCount: job._count.applications
      }))
    });
  } catch (error) {
    console.error('Employer analytics error:', error);
    res.status(500).json({ message: 'Error fetching employer analytics', error: error.message });
  }
});

app.get('/api/analytics/candidate', authenticateJWT, checkRole('JOBSEEKER'), async (req, res) => {
  try {
    // Get all applications for this candidate with their associated jobs
    const applications = await prisma.jobApplication.findMany({
      where: {
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
    
    // Initialize status counters
    const applicationsByStatus = {
      pending: applications.filter(app => app.status === 'PENDING').length,
      reviewed: applications.filter(app => app.status === 'REVIEWED').length,
      interview: applications.filter(app => app.status === 'INTERVIEW').length,
      rejected: applications.filter(app => app.status === 'REJECTED').length,
      hired: applications.filter(app => app.status === 'HIRED').length
    };

    // Get recent job views (we'll implement this with a real table later)
    const recentJobViews = [
      {
        jobId: 'job1',
        jobTitle: 'Software Developer',
        companyName: 'Tech Company',
        viewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        jobId: 'job2',
        jobTitle: 'Data Analyst',
        companyName: 'Data Corp',
        viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      totalApplications: applications.length,
      applicationsByStatus,
      recentJobViews,
      recentApplications: applications.slice(0, 5).map(app => ({
        id: app.id,
        jobTitle: app.job.title,
        companyName: app.job.company.name,
        status: app.status,
        appliedAt: app.createdAt
      }))
    });
  } catch (error) {
    console.error('Candidate analytics error:', error);
    res.status(500).json({ message: 'Error fetching candidate analytics', error: error.message });
  }
});

// Add backward compatibility routes to fix 404 errors

// 1. GET /applications/my - Redirects to /api/applications
app.get('/applications/my', authenticateJWT, async (req, res) => {
  try {
    console.log('Redirecting from /applications/my to /api/applications');
    
    // Call the existing applications endpoint logic
    if (req.user.role === 'EMPLOYER') {
      // Get all applications for jobs from the employer's company
      const applications = await prisma.jobApplication.findMany({
        where: {
          job: {
            company: {
              employees: {
                some: {
                  id: req.user.id
                }
              }
            }
          }
        },
        include: {
          job: {
            include: {
              company: true
            }
          },
          user: {
            include: {
              candidateProfile: {
                select: {
                  resumeUrl: true
                }
              }
            }
          }
        }
      });

      res.json({
        applications: applications.map(app => ({
          ...app,
          jobTitle: app.job.title,
          companyName: app.job.company.name,
          candidateName: `${app.user.firstName} ${app.user.lastName}`,
          candidateEmail: app.user.email
        }))
      });
    } else {
      // For jobseekers, get their applications
      const applications = await prisma.jobApplication.findMany({
        where: {
          userId: req.user.id
        },
        include: {
          job: {
            include: {
              company: true
            }
          },
          user: true
        }
      });

      res.json({
        applications: applications.map(app => ({
          ...app,
          jobTitle: app.job.title,
          companyName: app.job.company.name,
          candidateName: `${app.user.firstName} ${app.user.lastName}`,
          candidateEmail: app.user.email
        }))
      });
    }
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// 2. GET /skills - Returns a predefined list of skills
app.get('/skills', async (req, res) => {
  try {
    console.log('Handling request to /skills endpoint');
    
    // Predefined list of skills relevant to job marketplace
    const skills = [
      // Programming Languages
      "JavaScript", "Python", "Java", "C#", "C++", "Ruby", "PHP", "Swift", "TypeScript", "Go",
      // Web Development
      "React", "Angular", "Vue.js", "Node.js", "Express", "Django", "Ruby on Rails", "HTML", "CSS", "Bootstrap",
      // Database
      "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Firebase", "Oracle", "Microsoft SQL Server", 
      // DevOps & Cloud
      "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "CI/CD", "Git", 
      // Mobile Development
      "iOS Development", "Android Development", "React Native", "Flutter", "Xamarin",
      // Data Science & AI
      "Machine Learning", "Deep Learning", "Natural Language Processing", "Data Analysis", "Data Visualization",
      "TensorFlow", "PyTorch", "scikit-learn", "R", "MATLAB",
      // General Business & Professional Skills
      "Project Management", "Agile", "Scrum", "Business Analysis", "Communication", "Leadership", "Teamwork",
      "Customer Service", "Sales", "Marketing", "Content Writing", "SEO", "Social Media Management",
      // Design
      "UI/UX Design", "Graphic Design", "Adobe Photoshop", "Adobe Illustrator", "Figma", "Sketch",
      // Finance & Accounting
      "Accounting", "Financial Analysis", "QuickBooks", "Excel", "Financial Modeling", "Budgeting",
      // Healthcare
      "Nursing", "Medical Coding", "Patient Care", "Electronic Health Records", "Medical Billing",
      // Education
      "Teaching", "Curriculum Development", "E-Learning", "Educational Technology", "Tutoring",
      // Hospitality
      "Customer Service", "Food Service", "Hotel Management", "Event Planning", "Housekeeping"
    ];

    res.json({ skills });
  } catch (error) {
    console.error('Skills endpoint error:', error);
    res.status(500).json({ message: 'Error fetching skills', error: error.message });
  }
});

// 3. GET /api/auth/validate - Validates JWT token and returns user info
app.get('/api/auth/validate', async (req, res) => {
  try {
    console.log('Handling request to /api/auth/validate endpoint');
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    // Extract token
    let token;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = authHeader;
    }

    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const secret = process.env.JWT_SECRET || 'local_development_secret';

    try {
      const decoded = jwt.verify(token, secret);
      
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
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        valid: true,
        user: user
      });
    } catch (err) {
      console.error('JWT verification error:', err.name, err.message);
      return res.status(403).json({ 
        valid: false,
        message: 'Invalid or expired token', 
        error: err.message 
      });
    }
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ message: 'Error validating token', error: error.message });
  }
});

// 4. POST /api/employer/company-profile - Redirects to PUT /api/employer/profile
app.post('/api/employer/company-profile', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    console.log('Redirecting from POST /api/employer/company-profile to PUT /api/employer/profile');
    
    const { 
      name, 
      industry, 
      location, 
      description, 
      website, 
      employeeCount, 
      founded, 
      socialLinks,
      culture
    } = req.body;

    const employer = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    const company = await prisma.company.upsert({
      where: { id: employer.companyId || '' },
      create: {
        name,
        industry,
        location,
        description,
        website,
        employeeCount,
        founded,
        socialLinks,
        culture,
        employees: {
          connect: { id: employer.id }
        }
      },
      update: {
        name,
        industry,
        location,
        description,
        website,
        employeeCount,
        founded,
        socialLinks,
        culture
      }
    });

    // Update employer's companyId if it's a new company
    if (!employer.companyId) {
      await prisma.user.update({
        where: { id: employer.id },
        data: { companyId: company.id }
      });
    }

    res.json({
      message: 'Company profile updated successfully',
      profile: {
        name: company.name,
        industry: company.industry,
        location: company.location,
        description: company.description,
        website: company.website,
        employeeCount: company.employeeCount,
        founded: company.founded,
        socialLinks: company.socialLinks,
        culture: company.culture,
        logoUrl: company.logoUrl
      }
    });
  } catch (error) {
    console.error('Company profile update error:', error);
    res.status(500).json({ message: 'Error updating company profile', error: error.message });
  }
});

// Server initialization
const startServer = async () => {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// environment variables - save as .env file
// JWT_SECRET=your_jwt_secret
// PORT=5000

// Add this endpoint to server.js to fix the job listing issue
app.get('/api/employer/jobs/simple', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const employer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });

    if (!employer?.company) {
      return res.json([]);
    }

    const jobs = await prisma.job.findMany({
      where: { companyId: employer.company.id },
      include: {
        company: true,
        applications: {
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format salary field for frontend display
    const formattedJobs = jobs.map(job => {
      // Convert the type field to a frontend-friendly format
      const typeDisplayMap = {
        'FULL_TIME': 'Full-time',
        'PART_TIME': 'Part-time',
        'CONTRACT': 'Contract',
        'TEMPORARY': 'Temporary',
        'INTERNSHIP': 'Internship'
      };
      
      const jobType = typeDisplayMap[job.type] || job.type;
      
      // Add formatted salary values for easy access in the frontend
      let formattedSalary = {};
      if (job.salary) {
        formattedSalary = {
          salaryMin: job.salary.min,
          salaryMax: job.salary.max,
          salaryCurrency: job.salary.currency,
          salaryDisplay: job.salary.min && job.salary.max 
            ? `${job.salary.currency} ${job.salary.min} - ${job.salary.max}`
            : job.salary.min 
              ? `${job.salary.currency} ${job.salary.min}+` 
              : job.salary.max 
                ? `Up to ${job.salary.currency} ${job.salary.max}` 
                : 'Salary not specified'
        };
      }
      
      return {
        ...job,
        jobType,
        ...formattedSalary
      };
    });

    res.json(formattedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});
app.put('/api/employer/jobs/:id', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      type, // Use type directly
      jobType, // For backward compatibility
      salary,
      salaryMin,
      salaryMax,
      salaryCurrency,
      skills,
      experience,
      education,
      applicationDeadline,
      status,
      featured
    } = req.body;
    
    // Get the employer's company
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });
    
    if (!user || !user.company) {
      return res.status(403).json({ message: 'Access denied - no company associated with user' });
    }
    
    // Now find the job that belongs to the user's company
    const job = await prisma.job.findFirst({
      where: {
        id,
        company: {
          employees: {
            some: { id: req.user.id }
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or access denied' });
    }

    // Valid job types as defined in the Prisma schema
    const validTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'];
    
    // Determine the job type to use
    let finalType = job.type; // Default to current type
    
    // First try using the type field directly if provided
    if (type && validTypes.includes(type)) {
      finalType = type;
      console.log('Using type directly:', finalType);
    } 
    // Fall back to jobType if provided
    else if (jobType) {
      // If jobType is already a valid enum value, use it directly
      if (validTypes.includes(jobType)) {
        finalType = jobType;
        console.log('Using jobType directly:', finalType);
      } 
      // Otherwise try to transform it
      else {
        try {
          finalType = transformJobType(jobType);
          console.log('Transformed jobType:', finalType);
        } catch (error) {
          console.error('Error transforming job type:', error.message);
          // Don't return error, just keep the existing type
        }
      }
    }

    // Format salary object according to schema
    let salaryObject;
    if (salary && typeof salary === 'object') {
      // If salary is already an object, use it
      salaryObject = salary;
    } else if (salaryMin || salaryMax) {
      // Format from min/max values
      salaryObject = formatSalaryObject(salaryMin, salaryMax, salaryCurrency);
    }

    let updateData = {
      title,
      description,
      location,
      type: finalType,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      status,
      featured
    };
    
    // Only include fields that were provided
    if (salaryObject) {
      updateData.salary = salaryObject;
    }
    
    if (skills) {
      updateData.skills = skills;
    }
    
    if (experience !== undefined) {
      updateData.experience = experience;
    }
    
    if (education !== undefined) {
      updateData.education = education;
    }
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    // Sanitize the update data to remove fields that don't exist in the schema
    updateData = sanitizeJobData(updateData);
    
    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true
          }
        }
      }
    });

    // Create a consistent response format with jobType exposed for frontend
    // Convert the DB enum type back to a display format for the frontend
    let displayJobType = updatedJob.type;
    if (updatedJob.type) {
      // Convert enum format back to display format
      const typeDisplayMap = {
        'FULL_TIME': 'Full-time',
        'PART_TIME': 'Part-time',
        'CONTRACT': 'Contract',
        'TEMPORARY': 'Temporary',
        'INTERNSHIP': 'Internship'
      };
      displayJobType = typeDisplayMap[updatedJob.type] || updatedJob.type;
    }
    
    const responseJob = {
      ...updatedJob,
      jobType: displayJobType, // Add jobType field for frontend consumption
      companyName: updatedJob.company.name,
      companyLogo: updatedJob.company.logoUrl
    };

    res.json(responseJob);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Error updating job listing', error: error.message });
  }
});
