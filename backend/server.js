// server.js - Main server file
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://jobboard:jobboard@mongodb:27017/jobboard?authSource=admin';
let db;

const connectToMongoDB = async () => {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db('jobboard');

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('jobs').createIndex({ employerId: 1 });
    await db.collection('applications').createIndex({ jobId: 1 });
    await db.collection('applications').createIndex({ userId: 1 });
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
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
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User with that email already exists' });
    }

    // Create new user
    const timestamp = new Date().toISOString();
    const newUser = {
      name,
      email,
      password, // In production, hash this password!
      role: role || 'candidate', // Default to candidate if role not specified
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const result = await db.collection('users').insertOne(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.insertedId.toString(), // Use MongoDB's ObjectId
        email,
        role: role || 'candidate',
        name 
      },
      process.env.JWT_SECRET || 'local_development_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertedId.toString(),
        name,
        email,
        role: role || 'candidate'
      }
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

    // Use MongoDB for authentication
    const user = await db.collection('users').findOne({ email });
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET || 'local_development_secret',
      { expiresIn: '7d' }
    );

    console.log('Login successful for:', email);
    
    // Send response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error during login', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// User Routes
app.get('/api/users/me', authenticateJWT, async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ 
      $or: [
        { _id: req.user.id },
        { id: req.user.id }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user;

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
app.get('/api/employer/profile', authenticateJWT, checkRole('employer'), async (req, res) => {
  try {
    // Use MongoDB to fetch employer profile
    // Always convert to ObjectId for consistency
    let query;
    try {
      query = { _id: new ObjectId(req.user.id) };
    } catch (e) {
      console.error('Invalid ObjectId format:', e);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const employer = await db.collection('users').findOne(query);
    
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    // Return only company-related fields
    const companyProfile = {
      name: employer.name,
      industry: employer.industry || '',
      location: employer.location || '',
      description: employer.description || '',
      logoUrl: employer.logoUrl || null,
      website: employer.website || '',
      employeeCount: employer.employeeCount || '',
      founded: employer.founded || '',
      socialLinks: employer.socialLinks || {
        linkedin: '',
        twitter: '',
        facebook: ''
      },
      culture: employer.culture || ''
    };

    res.json(companyProfile);
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({ message: 'Error fetching company profile', error: error.message });
  }
});

app.put('/api/employer/profile', authenticateJWT, checkRole('employer'), async (req, res) => {
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
    const timestamp = new Date().toISOString();

    // Prepare query to find the user
    // Always convert to ObjectId for consistency
    let query;
    try {
      query = { _id: new ObjectId(req.user.id) };
    } catch (e) {
      console.error('Invalid ObjectId format:', e);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Update employer profile in MongoDB
    const result = await db.collection('users').findOneAndUpdate(
      query,
      {
        $set: {
          name,
          industry,
          location,
          description,
          website,
          employeeCount,
          founded,
          socialLinks,
          culture,
          updatedAt: timestamp
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    res.json({
      message: 'Company profile updated successfully',
      profile: {
        name: result.name,
        industry: result.industry,
        location: result.location,
        description: result.description,
        website: result.website,
        employeeCount: result.employeeCount,
        founded: result.founded,
        socialLinks: result.socialLinks,
        culture: result.culture,
        logoUrl: result.logoUrl
      }
    });
  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({ message: 'Error updating company profile', error: error.message });
  }
});

app.post('/api/employer/logo', authenticateJWT, checkRole('employer'), upload.single('logo'), async (req, res) => {
  try {
    console.log('Logo upload request from user:', req.user);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No logo file uploaded' });
    }

    console.log('Uploaded file:', req.file);
    console.log('Upload directory:', UPLOAD_DIR);
    
    // Verify file exists
    const filePath = path.join(UPLOAD_DIR, req.file.filename);
    const fileExists = fs.existsSync(filePath);
    console.log('File exists at', filePath, ':', fileExists);

    const logoUrl = `/uploads/${req.file.filename}`;
    const timestamp = new Date().toISOString();

    console.log('Attempting to find employer with ID:', req.user.id);
    let query;
    try {
      query = { _id: new ObjectId(req.user.id) };
      console.log('Using ObjectId query:', query);
    } catch (e) {
      console.error('Error converting to ObjectId:', e);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // First, verify the user exists
    const user = await db.collection('users').findOne(query);
    console.log('Found user:', user ? 'Yes' : 'No', user ? `(role: ${user.role})` : '');

    if (!user) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    if (user.role !== 'employer') {
      return res.status(403).json({ message: 'User is not an employer' });
    }

    console.log('About to update user with query:', query);
    console.log('Setting logoUrl to:', logoUrl);
    
    let updatedUser;
    try {
      updatedUser = await db.collection('users').findOneAndUpdate(
        query,
        {
          $set: {
            logoUrl,
            updatedAt: timestamp
          }
        },
        { returnDocument: 'after' }
      );

      console.log('Update result:', updatedUser);

      // In MongoDB 6.0+, the updated document is directly in the result
      if (!updatedUser) {
        console.error('Update failed - no document returned');
        return res.status(500).json({ message: 'Failed to update employer profile' });
      }
    } catch (error) {
      console.error('MongoDB update error:', error);
      return res.status(500).json({ message: 'Database error during profile update' });
    }

    res.json({
      message: 'Logo uploaded successfully',
      logoUrl: updatedUser.logoUrl
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ message: 'Error uploading logo', error: error.message });
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
app.post('/api/jobs', authenticateJWT, checkRole('employer'), async (req, res) => {
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

    const timestamp = new Date().toISOString();
    
    // Get employer information using MongoDB
    let query = {};
    try {
      query = { _id: new ObjectId(req.user.id) };
    } catch (e) {
      query = { id: req.user.id };
    }
    
    const employer = await db.collection('users').findOne(query);
    
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    // Create job listing using MongoDB
    const jobDoc = {
      id: uuidv4(),
      employerId: req.user.id,
      companyName: employer.name,
      companyLogo: employer.logoUrl || null,
      title,
      description,
      requirements,
      location,
      jobType,
      salary,
      applicationDeadline,
      status: 'active',
      featured: featured || false,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const result = await db.collection('jobs').insertOne(jobDoc);

    res.status(201).json({
      message: 'Job created successfully',
      job: { ...jobDoc, _id: result.insertedId }
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
    let filter = { status: 'active' };
    
    // Add salary range filter if provided
    if (minSalary || maxSalary) {
      filter.salary = {};
      if (minSalary) filter.salary.$gte = parseInt(minSalary);
      if (maxSalary) filter.salary.$lte = parseInt(maxSalary);
    }

    // Add remote filter
    if (remote === 'true') {
      filter.remote = true;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (jobType) {
      filter.jobType = jobType;
    }

    // Get total count for pagination
    const total = await db.collection('jobs').countDocuments(filter);
    
    // Get paginated results
    const jobs = await db.collection('jobs')
      .find(filter)
      .sort(sort === 'latest' 
        ? { featured: -1, createdAt: -1 }
        : sort === 'salary' 
        ? { featured: -1, salary: -1, createdAt: -1 }
        : { featured: -1, score: { $meta: 'textScore' } })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .toArray();

    res.json({
      jobs,
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
    
    let query = {};
    try {
      query = { _id: new ObjectId(id) };
    } catch (e) {
      query = { id };
    }

    const job = await db.collection('jobs').findOne(query);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Error fetching job details', error: error.message });
  }
});

app.put('/api/jobs/:id', authenticateJWT, checkRole('employer'), async (req, res) => {
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

    let query = {};
    try {
      query = { _id: new ObjectId(id) };
    } catch (e) {
      query = { id };
    }

    // Check if job exists and belongs to the employer
    const job = await db.collection('jobs').findOne(query);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to edit this job' });
    }

    const timestamp = new Date().toISOString();

    // Update job listing
    const result = await db.collection('jobs').findOneAndUpdate(
      query,
      {
        $set: {
          title,
          description,
          requirements,
          location,
          jobType,
          salary,
          applicationDeadline,
          status,
          featured,
          updatedAt: timestamp
        }
      },
      { returnDocument: 'after' }
    );

    res.json({
      message: 'Job updated successfully',
      job: result.value
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Error updating job listing', error: error.message });
  }
});

app.delete('/api/jobs/:id', authenticateJWT, checkRole('employer'), async (req, res) => {
  try {
    const { id } = req.params;

    let query = {};
    try {
      query = { _id: new ObjectId(id) };
    } catch (e) {
      query = { id };
    }

    // Check if job exists and belongs to the employer
    const job = await db.collection('jobs').findOne(query);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this job' });
    }

    // Delete job listing
    await db.collection('jobs').deleteOne(query);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Error deleting job listing', error: error.message });
  }
});

// Application Routes
// Job application endpoint will be added here
app.post('/api/jobs/:id/apply', authenticateJWT, checkRole('candidate'), upload.single('resume'), async (req, res) => {
  try {
    const { id } = req.params;
    const { coverLetter } = req.body;

    // Find the job
    let jobQuery = {};
    try {
      jobQuery = { _id: new ObjectId(id) };
    } catch (e) {
      jobQuery = { id };
    }

    const job = await db.collection('jobs').findOne(jobQuery);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get the candidate information
    let userQuery = {};
    try {
      userQuery = { _id: new ObjectId(req.user.id) };
    } catch (e) {
      userQuery = { id: req.user.id };
    }

    const candidate = await db.collection('users').findOne(userQuery);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Create the application
    const timestamp = new Date().toISOString();
    
    // Use uploaded resume if available, otherwise use candidate's stored resume
    const resumeUrl = req.file 
      ? `/uploads/${req.file.filename}` 
      : candidate.resumeUrl;

    const applicationDoc = {
      id: uuidv4(),
      jobId: job._id ? job._id.toString() : job.id,
      userId: req.user.id,
      jobTitle: job.title,
      companyName: job.companyName,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      resumeUrl,
      coverLetter: coverLetter || '',
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const result = await db.collection('applications').insertOne(applicationDoc);

    // Find the employer to send them an email notification
    let employerQuery = {};
    try {
      employerQuery = { _id: new ObjectId(job.employerId) };
    } catch (e) {
      employerQuery = { id: job.employerId };
    }

    const employer = await db.collection('users').findOne(employerQuery);
    
    if (employer) {
      // In development mode, just log the email notification
      console.log('Email would be sent to:', employer.email);
      console.log('Subject:', `New Application for ${job.title}`);
      console.log('Content:', `You have received a new application from ${candidate.name} for the ${job.title} position. Log in to view the application details.`);
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application: { ...applicationDoc, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

app.get('/api/applications', authenticateJWT, async (req, res) => {
  try {
    // Different queries based on user role
    if (req.user.role === 'employer') {
      // Get all jobs for this employer
      const jobs = await db.collection('jobs')
        .find({ employerId: req.user.id })
        .toArray();

      if (!jobs || jobs.length === 0) {
        return res.json({ applications: [] });
      }

      // Get job IDs - handle both string IDs and ObjectIds
      const jobIds = jobs.map(job => {
        return job._id ? job._id.toString() : job.id;
      });

      // Get applications for these jobs
      const applications = await db.collection('applications')
        .find({ jobId: { $in: jobIds } })
        .toArray();

      res.json({ applications });
    } else {
      // For candidates, get their applications
      const applications = await db.collection('applications')
        .find({ userId: req.user.id })
        .toArray();

      res.json({ applications });
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
app.get('/api/analytics/employer', authenticateJWT, checkRole('employer'), async (req, res) => {
  try {
    // Get all jobs for this employer
    const jobs = await db.collection('jobs')
      .find({ employerId: req.user.id })
      .toArray();

    if (!jobs || jobs.length === 0) {
      return res.json({
        totalJobs: 0,
        totalApplications: 0,
        applicationsByStatus: {},
        applicationsByJob: []
      });
    }

    const jobIds = jobs.map(job => job._id ? job._id.toString() : job.id);

    // Get applications stats using MongoDB aggregation
    const applicationStats = await db.collection('applications')
      .aggregate([
        {
          $match: { jobId: { $in: jobIds } }
        },
        {
          $group: {
            _id: null,
            totalApplications: { $sum: 1 },
            byStatus: {
              $push: '$status'
            }
          }
        }
      ]).toArray();

    const stats = applicationStats[0] || { totalApplications: 0, byStatus: [] };
    
    // Count applications by status
    const applicationsByStatus = stats.byStatus.reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {
      pending: 0,
      reviewed: 0,
      interview: 0,
      rejected: 0,
      hired: 0
    });

    // Get applications count by job
    const applicationsByJob = await Promise.all(jobs.map(async (job) => {
      const jobId = job._id ? job._id.toString() : job.id;
      const count = await db.collection('applications')
        .countDocuments({ jobId });
      
      return {
        jobId,
        jobTitle: job.title,
        applicationCount: count
      };
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

app.get('/api/analytics/candidate', authenticateJWT, checkRole('candidate'), async (req, res) => {
  try {
    // Get all applications for this candidate using MongoDB
    const applications = await db.collection('applications')
      .find({ userId: req.user.id })
      .toArray();
    
    // Initialize status counters
    const applicationsByStatus = {
      pending: 0,
      reviewed: 0,
      interview: 0,
      rejected: 0,
      hired: 0
    };
    
    // Count applications by status
    applications.forEach(app => {
      if (applicationsByStatus[app.status] !== undefined) {
        applicationsByStatus[app.status]++;
      }
    });

    // Get recent job view history (mock data - would be implemented with a separate table)
    // This could be implemented with a real collection in MongoDB later
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
      recentJobViews
    });
  } catch (error) {
    console.error('Candidate analytics error:', error);
    res.status(500).json({ message: 'Error fetching candidate analytics', error: error.message });
  }
});

// Start server
const startServer = async () => {
  try {
    await connectToMongoDB();
    
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
