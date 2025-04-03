// local-dev/backend-adapter.js
// This script adapts the Lambda functions to work in a local Express environment

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure middleware
app.use(cors());
app.use(bodyParser.json());

// Configure AWS SDK to use LocalStack
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  endpoint: process.env.S3_ENDPOINT || 'http://localstack:4566'
});

// Initialize AWS services
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Configure file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// MongoDB connection
let db;
const mongoURI = process.env.MONGO_URI || 'mongodb://jobboard:jobboard@mongodb:27017/jobboard?authSource=admin';

async function connectToMongo() {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db('jobboard');
    
    // Check if collections exist, create them if not
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
    }
    if (!collectionNames.includes('jobs')) {
      await db.createCollection('jobs');
    }
    if (!collectionNames.includes('applications')) {
      await db.createCollection('applications');
    }
    if (!collectionNames.includes('analytics')) {
      await db.createCollection('analytics');
    }
    
    console.log('Collections checked and created if needed');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Retry after a delay
    setTimeout(connectToMongo, 5000);
  }
}

// Import Lambda handlers
try {
  const lambdaHandlers = require('../index');
  if (lambdaHandlers && typeof lambdaHandlers.handler === 'function') {
    console.log('Lambda handlers imported successfully');
  } else {
    console.log('Lambda handlers found but handler function not available, using adapter');
  }
} catch (error) {
  console.log('Lambda handlers not found, using adapter:', error.message);
}

// Authentication middleware for local development
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    // In local development, we'll use a simple token check
    if (token === 'dev-token') {
      // Mock user object
      req.user = {
        id: 'mock-user-id',
        email: 'dev@example.com',
        role: req.headers['x-user-role'] || 'candidate' // Allow role override through header
      };
      next();
    } else {
      res.status(403).json({ message: 'Invalid token' });
    }
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

// API Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const user = await db.collection('users').findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In production, this would be hashed
      role: role || 'candidate',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('users').insertOne(newUser);
    
    // Return token
    res.status(201).json({
      message: 'User registered successfully',
      token: 'dev-token',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
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
    
    // Find user
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Return token
    res.json({
      message: 'Login successful',
      token: 'dev-token',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// User routes
app.get('/api/users/me', authenticateJWT, async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password
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
    
    // Update user
    const result = await db.collection('users').findOneAndUpdate(
      { id: req.user.id },
      { 
        $set: {
          name,
          phone,
          address,
          bio,
          updatedAt: new Date().toISOString()
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password
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

// Resume upload
app.post('/api/candidates/resume', authenticateJWT, checkRole('candidate'), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded' });
    }
    
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
    // Update user with resume URL
    await db.collection('users').updateOne(
      { id: req.user.id },
      {
        $set: {
          resumeUrl: fileUrl,
          updatedAt: new Date().toISOString()
        }
      }
    );
    
    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl: fileUrl
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Error uploading resume', error: error.message });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Job routes
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
    
    // Get employer info
    const employer = await db.collection('users').findOne({ id: req.user.id });
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
    
    // Create job
    const job = {
      id: Date.now().toString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('jobs').insertOne(job);
    
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
    const { search, location, jobType, limit = 20, lastEvaluatedKey } = req.query;
    
    // Build query
    let query = { status: 'active' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (jobType) {
      query.jobType = jobType;
    }
    
    // Get jobs
    const jobs = await db.collection('jobs')
      .find(query)
      .limit(parseInt(limit))
      .sort({ featured: -1, createdAt: -1 })
      .toArray();
    
    res.json({
      jobs,
      lastEvaluatedKey: null,
      count: jobs.length
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Error fetching job listings', error: error.message });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await db.collection('jobs').findOne({ id });
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
    
    // Check if job exists and belongs to employer
    const job = await db.collection('jobs').findOne({ id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.employerId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to edit this job' });
    }
    
    // Update job
    const result = await db.collection('jobs').findOneAndUpdate(
      { id },
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
          updatedAt: new Date().toISOString()
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
    
    // Check if job exists and belongs to employer
    const job = await db.collection('jobs').findOne({ id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.employerId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this job' });
    }
    
    // Delete job
    await db.collection('jobs').deleteOne({ id });
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Error deleting job listing', error: error.message });
  }
});

// Application routes
app.post('/api/applications', authenticateJWT, checkRole('candidate'), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    
    // Check if job exists
    const job = await db.collection('jobs').findOne({ id: jobId });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user has already applied
    const existingApplication = await db.collection('applications').findOne({
      jobId,
      userId: req.user.id
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    // Get candidate info
    const candidate = await db.collection('users').findOne({ id: req.user.id });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    if (!candidate.resumeUrl) {
      return res.status(400).json({ message: 'Please upload a resume before applying' });
    }
    
    // Create application
    const application = {
      id: Date.now().toString(),
      jobId,
      userId: req.user.id,
      jobTitle: job.title,
      companyName: job.companyName,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      resumeUrl: candidate.resumeUrl,
      coverLetter,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('applications').insertOne(application);
    
    // In a real environment, we would send an email notification here
    
    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

app.get('/api/applications', authenticateJWT, async (req, res) => {
  try {
    let applications = [];
    
    if (req.user.role === 'employer') {
      // Get all jobs for this employer
      const jobs = await db.collection('jobs')
        .find({ employerId: req.user.id })
        .toArray();
      
      const jobIds = jobs.map(job => job.id);
      
      // Get applications for these jobs
      applications = await db.collection('applications')
        .find({ jobId: { $in: jobIds } })
        .toArray();
    } else {
      // Get candidate applications
      applications = await db.collection('applications')
        .find({ userId: req.user.id })
        .toArray();
    }
    
    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

app.get('/api/applications/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await db.collection('applications').findOne({ id });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check permission
    if (req.user.role === 'employer') {
      // Check if employer owns the job
      const job = await db.collection('jobs').findOne({ id: application.jobId });
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
    
    // Check if application exists
    const application = await db.collection('applications').findOne({ id });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if employer owns the job
    const job = await db.collection('jobs').findOne({ id: application.jobId });
    if (!job || job.employerId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this application' });
    }
    
    // Update application
    const result = await db.collection('applications').findOneAndUpdate(
      { id },
      {
        $set: {
          status,
          feedbackNote: feedbackNote || null,
          updatedAt: new Date().toISOString()
        }
      },
      { returnDocument: 'after' }
    );
    
    // In a real environment, we would send an email notification here
    
    res.json({
      message: 'Application status updated successfully',
      application: result.value
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
});

// Analytics routes
app.post('/api/analytics', async (req, res) => {
  try {
    const analyticsData = {
      id: req.body.sessionId || 'anonymous',
      timestamp: Date.now(),
      page: req.body.page || '/',
      type: req.body.type || 'pageview',
      data: req.body,
      ip: req.ip || 'unknown'
    };
    
    await db.collection('analytics').insertOne(analyticsData);
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error processing analytics data', error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectToMongo();
});
