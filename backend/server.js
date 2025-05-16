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

const connectToDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL via Prisma');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

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

// Setup middleware
// Configure helmet with cross-origin image loading
app.use(helmet({
  crossOriginResourcePolicy: {
    policy: 'cross-origin'
  }
}));

// Configure CORS
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(morgan('dev'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    console.log('Received token:', token);
    console.log('Using JWT_SECRET:', process.env.JWT_SECRET || 'local_development_secret');

    jwt.verify(token, process.env.JWT_SECRET || 'local_development_secret', (err, user) => {
      if (err) {
        console.log('JWT verification error:', err);
        return res.status(403).json({ message: 'Invalid or expired token', error: err.message });
      }

      console.log('Decoded JWT user:', user);
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Authorization header missing' });
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
    const { name, phone, address, bio } = req.body;
    const timestamp = new Date().toISOString();

    // Prepare query to find the user
    let query = {};
    try {
      query = { _id: new ObjectId(req.user.id) };
    } catch (e) {
      query = { id: req.user.id };
    }

    // Update user information using MongoDB
    const result = await db.collection('users').findOneAndUpdate(
      query,
      {
        $set: {
          name,
          phone,
          address,
          bio,
          updatedAt: timestamp
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive information
    const { password, ...userWithoutPassword } = result.value;

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
        users: {
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
    const { title, description, location, type, salary, requirements, benefits } = req.body;

    // Get the employer's company
    const employer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });

    if (!employer?.company) {
      return res.status(400).json({ message: 'Company profile required to post jobs' });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        location,
        type,
        salary,
        requirements,
        benefits,
        status: 'ACTIVE',
        company: { connect: { id: employer.company.id } }
      },
      include: {
        company: true,
        applications: true
      }
    });

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
                resumeUrl: true
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

app.put('/api/employer/jobs/:id', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const job = await prisma.job.findFirst({
      where: {
        id,
        company: {
          users: {
            some: { id: req.user.id }
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or access denied' });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updates,
      include: {
        company: true,
        applications: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                resumeUrl: true
              }
            }
          }
        }
      }
    });

    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Error updating job posting', error: error.message });
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
          users: {
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

// Resume upload for candidates
app.post('/api/candidates/resume', authenticateJWT, checkRole('candidate'), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded' });
    }

    const resumeUrl = `/uploads/${req.file.filename}`;
    const timestamp = new Date().toISOString();

    // Update user with resume URL using MongoDB
    let query = {};
    try {
      query = { _id: new ObjectId(req.user.id) };
    } catch (e) {
      query = { id: req.user.id };
    }

    const result = await db.collection('users').findOneAndUpdate(
      query,
      {
        $set: {
          resumeUrl,
          updatedAt: timestamp
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl: result.value.resumeUrl
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Error uploading resume', error: error.message });
  }
});

// Job Routes

// Save/unsave job
app.post('/api/jobs/:jobId/:action', authenticateJWT, checkRole('candidate'), async (req, res) => {
  try {
    const { jobId, action } = req.params;
    if (!['save', 'unsave'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    // Update user's saved jobs
    const update = action === 'save' 
      ? { $addToSet: { savedJobs: jobId } }
      : { $pull: { savedJobs: jobId } };

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      update
    );

    res.json({ message: `Job ${action}d successfully` });
  } catch (error) {
    console.error(`${action} job error:`, error);
    res.status(500).json({ message: `Error ${action}ing job`, error: error.message });
  }
});

// Apply to job
app.post('/api/jobs/:jobId/apply', authenticateJWT, checkRole('candidate'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    
    // Check if already applied
    const existingApplication = await db.collection('applications').findOne({
      jobId,
      userId: req.user.id
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }
    
    const job = await db.collection('jobs').findOne({ _id: new ObjectId(jobId) });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    const application = {
      jobId,
      userId: req.user.id,
      jobTitle: job.title,
      companyName: job.companyName,
      candidateName: req.user.name,
      coverLetter,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };
    
    await db.collection('applications').insertOne(application);
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

// Create job
app.post('/api/jobs', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      jobType,
      salary,
      applicationDeadline,
      featured
    } = req.body;

    const employer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    if (!employer.company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        requirements,
        location,
        jobType,
        salary,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        status: 'ACTIVE',
        featured: featured || false,
        company: {
          connect: { id: employer.company.id }
        }
      }
    });

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Error creating job listing', error: error.message });
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
    
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
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
      where.jobType = jobType;
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

app.put('/api/jobs/:id', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      requirements,
      location,
      jobType,
      salary,
      applicationDeadline,
      status,
      featured
    } = req.body;

    // Verify job exists and belongs to employer
    const job = await prisma.job.findFirst({
      where: {
        id,
        company: {
          users: {
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

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title,
        description,
        requirements,
        location,
        jobType,
        salary,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        status,
        featured
      },
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
      message: 'Job updated successfully',
      job: {
        ...updatedJob,
        companyName: updatedJob.company.name,
        companyLogo: updatedJob.company.logoUrl
      }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Error updating job listing', error: error.message });
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
          users: {
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

app.get('/api/applications', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role === 'EMPLOYER') {
      // Get all applications for jobs from the employer's company
      const applications = await prisma.jobApplication.findMany({
        where: {
          job: {
            company: {
              users: {
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

    // Prepare query to find the application
    let query = {};
    try {
      query = { _id: new ObjectId(id) };
    } catch (e) {
      query = { id };
    }

    const application = await db.collection('applications').findOne(query);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check permission based on role
    if (req.user.role === 'employer') {
      // Employer should own the job
      let jobQuery = {};
      try {
        jobQuery = { _id: new ObjectId(application.jobId) };
      } catch (e) {
        jobQuery = { id: application.jobId };
      }

      const job = await db.collection('jobs').findOne(jobQuery);
      
      if (!job || job.employerId !== req.user.id) {
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

app.put('/api/applications/:id/status', authenticateJWT, checkRole('employer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedbackNote } = req.body;

    // Prepare query to find the application
    let query = {};
    try {
      query = { _id: new ObjectId(id) };
    } catch (e) {
      query = { id };
    }

    // Check if application exists
    const application = await db.collection('applications').findOne(query);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if employer owns the job
    let jobQuery = {};
    try {
      jobQuery = { _id: new ObjectId(application.jobId) };
    } catch (e) {
      jobQuery = { id: application.jobId };
    }

    const job = await db.collection('jobs').findOne(jobQuery);
    
    if (!job || job.employerId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this application' });
    }

    const timestamp = new Date().toISOString();

    // Update application status
    const result = await db.collection('applications').findOneAndUpdate(
      query,
      {
        $set: {
          status,
          feedbackNote,
          updatedAt: timestamp
        }
      },
      { returnDocument: 'after' }
    );

    // Get candidate details for email notification
    const candidate = await db.collection('users').findOne({
      $or: [
        { _id: new ObjectId(application.userId) },
        { id: application.userId }
      ]
    });

    if (candidate) {
      // In development mode, just log the email content
      let emailSubject, emailContent;

      if (status === 'rejected') {
        emailSubject = `Application Status Update: ${job.title}`;
        emailContent = `Dear ${candidate.name},\n\nThank you for your interest in the ${job.title} position at ${job.companyName}.\n\nAfter careful consideration, we have decided to pursue other candidates whose qualifications better match our current needs.\n\n${feedbackNote ? `Additional feedback: ${feedbackNote}\n\n` : ''}We appreciate your interest in our company and wish you the best in your job search.\n\nSincerely,\n${job.companyName} Hiring Team`;
      } else if (status === 'interview') {
        emailSubject = `Interview Request: ${job.title}`;
        emailContent = `Dear ${candidate.name},\n\nWe're pleased to inform you that we would like to schedule an interview for the ${job.title} position at ${job.companyName}.\n\n${feedbackNote ? `${feedbackNote}\n\n` : ''}Please log in to your account to respond to this interview request.\n\nWe look forward to speaking with you!\n\nSincerely,\n${job.companyName} Hiring Team`;
      } else if (status === 'hired') {
        emailSubject = `Congratulations! Job Offer for ${job.title}`;
        emailContent = `Dear ${candidate.name},\n\nCongratulations! We're delighted to offer you the ${job.title} position at ${job.companyName}.\n\n${feedbackNote ? `${feedbackNote}\n\n` : ''}Please log in to your account for more details about the offer.\n\nWe're excited to have you join our team!\n\nSincerely,\n${job.companyName} Hiring Team`;
      }

      if (emailSubject && emailContent) {
        console.log('Email would be sent to:', candidate.email);
        console.log('Subject:', emailSubject);
        console.log('Content:', emailContent);
      }
    }

    res.json({
      message: 'Application status updated successfully',
      application: result.value
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
      totalJobs: jobs.length,
      totalApplications: stats.totalApplications,
      applicationsByStatus,
      applicationsByJob
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

// Start server
const startServer = async () => {
  try {
    await connectToDatabase();
    
    // Serve static files from uploads directory
    app.use('/uploads', express.static(UPLOAD_DIR));

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// environment variables - save as .env file
// JWT_SECRET=your_jwt_secret
// PORT=5000
// MONGO_URI=mongodb://jobboard:jobboard@mongodb:27017/jobboard?authSource=admin

// MongoDB Collections Schema Example

/*
Users Collection:
- _id (ObjectId, automatically generated)
- id (string, legacy identifier)
- name (string)
- email (string, indexed)
- password (string)
- role (string) - 'candidate' or 'employer'
- phone (string, optional)
- address (string, optional)
- bio (string, optional)
- resumeUrl (string, optional) - URL to resume for candidates
- logoUrl (string, optional) - URL to company logo for employers
- createdAt (string) - ISO timestamp
- updatedAt (string) - ISO timestamp

Jobs Collection:
- _id (ObjectId, automatically generated)
- id (string, legacy identifier)
- employerId (string)
- companyName (string)
- companyLogo (string, optional) - URL to company logo
- title (string)
- description (string)
- requirements (string)
- location (string)
- jobType (string) - 'Full-time', 'Part-time', 'Contract', etc.
- salary (string, optional)
- applicationDeadline (string, optional) - ISO timestamp
- status (string) - 'active', 'filled', 'expired'
- featured (boolean)
- createdAt (string) - ISO timestamp
- updatedAt (string) - ISO timestamp

Applications Collection:
- _id (ObjectId, automatically generated)
- id (string, legacy identifier)
- jobId (string)
- userId (string)
- jobTitle (string)
- companyName (string)
- candidateName (string)
- candidateEmail (string)
- resumeUrl (string) - URL to candidate's resume
- coverLetter (string, optional)
- status (string) - 'pending', 'reviewed', 'interview', 'rejected', 'hired'
- feedbackNote (string, optional)
- createdAt (string) - ISO timestamp
- updatedAt (string) - ISO timestamp
*/
