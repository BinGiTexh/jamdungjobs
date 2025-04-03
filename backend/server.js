// server.js - Main server file
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Initialize AWS services
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const ses = new AWS.SES({ apiVersion: '2010-12-01' });

// Setup middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// File upload configuration
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET || 'bingitech-job-board-files',
    acl: 'private',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileExtension = path.extname(file.originalname);
      cb(null, `${Date.now().toString()}-${uuidv4()}${fileExtension}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
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

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

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
    const checkParams = {
      TableName: 'Users',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    };

    const checkResult = await dynamoDB.query(checkParams).promise();
    
    if (checkResult.Items && checkResult.Items.length > 0) {
      return res.status(400).json({ message: 'User with that email already exists' });
    }

    // Create new user
    const userId = uuidv4();
    const timestamp = new Date().toISOString();

    const params = {
      TableName: 'Users',
      Item: {
        id: userId,
        name,
        email,
        password, // In production, hash this password!
        role: role || 'candidate', // Default to candidate if role not specified
        createdAt: timestamp,
        updatedAt: timestamp
      }
    };

    await dynamoDB.put(params).promise();

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, role: role || 'candidate' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
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

    // Find user by email
    const params = {
      TableName: 'Users',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    };

    const result = await dynamoDB.query(params).promise();
    
    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.Items[0];

    // Check password (in production, compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
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

// User Routes
app.get('/api/users/me', authenticateJWT, async (req, res) => {
  try {
    const params = {
      TableName: 'Users',
      Key: {
        id: req.user.id
      }
    };

    const result = await dynamoDB.get(params).promise();
    
    if (!result.Item) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = result.Item;

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

    // Update user information
    const params = {
      TableName: 'Users',
      Key: {
        id: req.user.id
      },
      UpdateExpression: 'set #name = :name, phone = :phone, address = :address, bio = :bio, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#name': 'name' // 'name' is a reserved word in DynamoDB
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':phone': phone,
        ':address': address,
        ':bio': bio,
        ':updatedAt': timestamp
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDB.update(params).promise();
    
    // Remove sensitive information
    const { password, ...userWithoutPassword } = result.Attributes;

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user data', error: error.message });
  }
});

// Resume upload for candidates
app.post('/api/candidates/resume', authenticateJWT, checkRole('candidate'), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded' });
    }

    const fileUrl = req.file.location;
    const timestamp = new Date().toISOString();

    // Update user with resume information
    const params = {
      TableName: 'Users',
      Key: {
        id: req.user.id
      },
      UpdateExpression: 'set resumeUrl = :resumeUrl, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':resumeUrl': fileUrl,
        ':updatedAt': timestamp
      },
      ReturnValues: 'ALL_NEW'
    };

    await dynamoDB.update(params).promise();

    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl: fileUrl
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Error uploading resume', error: error.message });
  }
});

// Job Routes
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

    const jobId = uuidv4();
    const timestamp = new Date().toISOString();

    // Get employer information
    const employerParams = {
      TableName: 'Users',
      Key: {
        id: req.user.id
      }
    };

    const employerResult = await dynamoDB.get(employerParams).promise();
    
    if (!employerResult.Item) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    // Create job listing
    const jobParams = {
      TableName: 'Jobs',
      Item: {
        id: jobId,
        employerId: req.user.id,
        companyName: employerResult.Item.name,
        companyLogo: employerResult.Item.logoUrl || null,
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
      }
    };

    await dynamoDB.put(jobParams).promise();

    res.status(201).json({
      message: 'Job created successfully',
      job: jobParams.Item
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Error creating job listing', error: error.message });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    const { search, location, jobType, limit, lastEvaluatedKey } = req.query;
    
    // Base scan parameters
    let params = {
      TableName: 'Jobs',
      FilterExpression: 'status = :status',
      ExpressionAttributeValues: {
        ':status': 'active'
      },
      Limit: parseInt(limit) || 20
    };

    // Add last evaluated key for pagination if provided
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = JSON.parse(lastEvaluatedKey);
    }

    // Add search filters if provided
    if (search || location || jobType) {
      let filterExpressions = ['status = :status'];
      
      if (search) {
        filterExpressions.push('contains(title, :search) OR contains(description, :search) OR contains(companyName, :search)');
        params.ExpressionAttributeValues[':search'] = search;
      }
      
      if (location) {
        filterExpressions.push('contains(location, :location)');
        params.ExpressionAttributeValues[':location'] = location;
      }
      
      if (jobType) {
        filterExpressions.push('jobType = :jobType');
        params.ExpressionAttributeValues[':jobType'] = jobType;
      }
      
      params.FilterExpression = filterExpressions.join(' AND ');
    }

    const result = await dynamoDB.scan(params).promise();

    // Sort results by featured status and creation date
    const sortedJobs = result.Items.sort((a, b) => {
      // First, sort by featured status (featured jobs first)
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // Then, sort by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      jobs: sortedJobs,
      lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
      count: result.Count
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Error fetching job listings', error: error.message });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const params = {
      TableName: 'Jobs',
      Key: {
        id
      }
    };

    const result = await dynamoDB.get(params).promise();
    
    if (!result.Item) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(result.Item);
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

    // Check if job exists and belongs to the employer
    const getParams = {
      TableName: 'Jobs',
      Key: {
        id
      }
    };

    const getResult = await dynamoDB.get(getParams).promise();
    
    if (!getResult.Item) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (getResult.Item.employerId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to edit this job' });
    }

    const timestamp = new Date().toISOString();

    // Update job listing
    const updateParams = {
      TableName: 'Jobs',
      Key: {
        id
      },
      UpdateExpression: 'set title = :title, description = :description, requirements = :requirements, ' +
                        'location = :location, jobType = :jobType, salary = :salary, ' +
                        'applicationDeadline = :applicationDeadline, status = :status, ' +
                        'featured = :featured, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':title': title,
        ':description': description,
        ':requirements': requirements,
        ':location': location,
        ':jobType': jobType,
        ':salary': salary,
        ':applicationDeadline': applicationDeadline,
        ':status': status,
        ':featured': featured,
        ':updatedAt': timestamp
      },
      ReturnValues: 'ALL_NEW'
    };

    const updateResult = await dynamoDB.update(updateParams).promise();

    res.json({
      message: 'Job updated successfully',
      job: updateResult.Attributes
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Error updating job listing', error: error.message });
  }
});

app.delete('/api/jobs/:id', authenticateJWT, checkRole('employer'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if job exists and belongs to the employer
    const getParams = {
      TableName: 'Jobs',
      Key: {
        id
      }
    };

    const getResult = await dynamoDB.get(getParams).promise();
    
    if (!getResult.Item) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (getResult.Item.employerId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this job' });
    }

    // Delete job listing
    const deleteParams = {
      TableName: 'Jobs',
      Key: {
        id
      }
    };

    await dynamoDB.delete(deleteParams).promise();

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Error deleting job listing', error: error.message });
  }
});

// Application Routes
app.post('/api/applications', authenticateJWT, checkRole('candidate'), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Check if job exists
    const jobParams = {
      TableName: 'Jobs',
      Key: {
        id: jobId
      }
    };

    const jobResult = await dynamoDB.get(jobParams).promise();
    
    if (!jobResult.Item) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user has already applied for this job
    const checkParams = {
      TableName: 'Applications',
      IndexName: 'JobUserIndex',
      KeyConditionExpression: 'jobId = :jobId AND userId = :userId',
      ExpressionAttributeValues: {
        ':jobId': jobId,
        ':userId': req.user.id
      }
    };

    const checkResult = await dynamoDB.query(checkParams).promise();
    
    if (checkResult.Items && checkResult.Items.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Get candidate information
    const candidateParams = {
      TableName: 'Users',
      Key: {
        id: req.user.id
      }
    };

    const candidateResult = await dynamoDB.get(candidateParams).promise();
    
    if (!candidateResult.Item) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    if (!candidateResult.Item.resumeUrl) {
      return res.status(400).json({ message: 'Please upload a resume before applying' });
    }

    const applicationId = uuidv4();
    const timestamp = new Date().toISOString();

    // Create application
    const applicationParams = {
      TableName: 'Applications',
      Item: {
        id: applicationId,
        jobId,
        userId: req.user.id,
        jobTitle: jobResult.Item.title,
        companyName: jobResult.Item.companyName,
        candidateName: candidateResult.Item.name,
        candidateEmail: candidateResult.Item.email,
        resumeUrl: candidateResult.Item.resumeUrl,
        coverLetter,
        status: 'pending',
        createdAt: timestamp,
        updatedAt: timestamp
      }
    };

    await dynamoDB.put(applicationParams).promise();

    // Send email notification to employer
    const employerParams = {
      TableName: 'Users',
      Key: {
        id: jobResult.Item.employerId
      }
    };

    const employerResult = await dynamoDB.get(employerParams).promise();
    
    if (employerResult.Item) {
      const emailParams = {
        Source: process.env.SES_EMAIL_FROM || 'noreply@bingitech.com',
        Destination: {
          ToAddresses: [employerResult.Item.email]
        },
        Message: {
          Subject: {
            Data: `New Application for ${jobResult.Item.title}`
          },
          Body: {
            Text: {
              Data: `You have received a new application from ${candidateResult.Item.name} for the ${jobResult.Item.title} position. Log in to view the application details.`
            }
          }
        }
      };

      await ses.sendEmail(emailParams).promise();
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application: applicationParams.Item
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

app.get('/api/applications', authenticateJWT, async (req, res) => {
  try {
    let params;

    // Different queries based on user role
    if (req.user.role === 'employer') {
      // Get all jobs for this employer
      const jobsParams = {
        TableName: 'Jobs',
        IndexName: 'EmployerIndex',
        KeyConditionExpression: 'employerId = :employerId',
        ExpressionAttributeValues: {
          ':employerId': req.user.id
        }
      };

      const jobsResult = await dynamoDB.query(jobsParams).promise();
      
      if (!jobsResult.Items || jobsResult.Items.length === 0) {
        return res.json({ applications: [] });
      }

      const jobIds = jobsResult.Items.map(job => job.id);

      // Build batch get for applications for these jobs
      const applicationKeys = [];
      
      for (const jobId of jobIds) {
        // Query applications for each job
        const appParams = {
          TableName: 'Applications',
          IndexName: 'JobIndex',
          KeyConditionExpression: 'jobId = :jobId',
          ExpressionAttributeValues: {
            ':jobId': jobId
          }
        };

        const appResult = await dynamoDB.query(appParams).promise();
        
        if (appResult.Items && appResult.Items.length > 0) {
          const jobApplications = appResult.Items;
          res.json({ applications: jobApplications });
          return;
        }
      }

      res.json({ applications: [] });
    } else {
      // For candidates, get their applications
      params = {
        TableName: 'Applications',
        IndexName: 'UserIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': req.user.id
        }
      };

      const result = await dynamoDB.query(params).promise();
      
      res.json({ applications: result.Items || [] });
    }
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

app.get('/api/applications/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const params = {
      TableName: 'Applications',
      Key: {
        id
      }
    };

    const result = await dynamoDB.get(params).promise();
    
    if (!result.Item) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check permission based on role
    if (req.user.role === 'employer') {
      // Employer should own the job
      const jobParams = {
        TableName: 'Jobs',
        Key: {
          id: result.Item.jobId
        }
      };

      const jobResult = await dynamoDB.get(jobParams).promise();
      
      if (!jobResult.Item || jobResult.Item.employerId !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to view this application' });
      }
    } else if (req.user.id !== result.Item.userId) {
      return res.status(403).json({ message: 'You do not have permission to view this application' });
    }

    res.json(result.Item);
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
    const getParams = {
      TableName: 'Applications',
      Key: {
        id
      }
    };

    const getResult = await dynamoDB.get(getParams).promise();
    
    if (!getResult.Item) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if employer owns the job
    const jobParams = {
      TableName: 'Jobs',
      Key: {
        id: getResult.Item.jobId
      }
    };

    const jobResult = await dynamoDB.get(jobParams).promise();
    
    if (!jobResult.Item || jobResult.Item.employerId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this application' });
    }

    const timestamp = new Date().toISOString();

    // Update application status
    const updateParams = {
      TableName: 'Applications',
      Key: {
        id
      },
      UpdateExpression: 'set #status = :status, feedbackNote = :feedbackNote, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status' // 'status' is a reserved word in DynamoDB
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':feedbackNote': feedbackNote || null,
        ':updatedAt': timestamp
      },
      ReturnValues: 'ALL_NEW'
    };

    const updateResult = await dynamoDB.update(updateParams).promise();

    // Send email notification to candidate
    const candidateParams = {
      TableName: 'Users',
      Key: {
        id: getResult.Item.userId
      }
    };

    const candidateResult = await dynamoDB.get(candidateParams).promise();
    
    if (candidateResult.Item) {
      let emailSubject, emailContent;

      if (status === 'rejected') {
        emailSubject = `Application Status Update: ${jobResult.Item.title}`;
        emailContent = `Dear ${candidateResult.Item.name},\n\nThank you for your interest in the ${jobResult.Item.title} position at ${jobResult.Item.companyName}.\n\nAfter careful consideration, we have decided to pursue other candidates whose qualifications better match our current needs.\n\n${feedbackNote ? `Additional feedback: ${feedbackNote}\n\n` : ''}We appreciate your interest in our company and wish you the best in your job search.\n\nSincerely,\n${jobResult.Item.companyName} Hiring Team`;
      } else if (status === 'interview') {
        emailSubject = `Interview Request: ${jobResult.Item.title}`;
        emailContent = `Dear ${candidateResult.Item.name},\n\nWe're pleased to inform you that we would like to schedule an interview for the ${jobResult.Item.title} position at ${jobResult.Item.companyName}.\n\n${feedbackNote ? `${feedbackNote}\n\n` : ''}Please log in to your account to respond to this interview request.\n\nWe look forward to speaking with you!\n\nSincerely,\n${jobResult.Item.companyName} Hiring Team`;
      } else if (status === 'hired') {
        emailSubject = `Congratulations! Job Offer for ${jobResult.Item.title}`;
        emailContent = `Dear ${candidateResult.Item.name},\n\nCongratulations! We're delighted to offer you the ${jobResult.Item.title} position at ${jobResult.Item.companyName}.\n\n${feedbackNote ? `${feedbackNote}\n\n` : ''}Please log in to your account for more details about the offer.\n\nWe're excited to have you join our team!\n\nSincerely,\n${jobResult.Item.companyName} Hiring Team`;
      }

      if (emailSubject && emailContent) {
        const emailParams = {
          Source: process.env.SES_EMAIL_FROM || 'noreply@bingitech.com',
          Destination: {
            ToAddresses: [candidateResult.Item.email]
          },
          Message: {
            Subject: {
              Data: emailSubject
            },
            Body: {
              Text: {
                Data: emailContent
              }
            }
          }
        };

        await ses.sendEmail(emailParams).promise();
      }
    }

    res.json({
      message: 'Application status updated successfully',
      application: updateResult.Attributes
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
    const jobsParams = {
      TableName: 'Jobs',
      IndexName: 'EmployerIndex',
      KeyConditionExpression: 'employerId = :employerId',
      ExpressionAttributeValues: {
        ':employerId': req.user.id
      }
    };

    const jobsResult = await dynamoDB.query(jobsParams).promise();
    
    if (!jobsResult.Items || jobsResult.Items.length === 0) {
      return res.json({
        totalJobs: 0,
        totalApplications: 0,
        applicationsByStatus: {},
        applicationsByJob: []
      });
    }

    const jobIds = jobsResult.Items.map(job => job.id);
    let totalApplications = 0;
    const applicationsByStatus = {
      pending: 0,
      reviewed: 0,
      interview: 0,
      rejected: 0,
      hired: 0
    };
    const applicationsByJob = [];

    // Get applications for each job
    for (const job of jobsResult.Items) {
      const appParams = {
        TableName: 'Applications',
        IndexName: 'JobIndex',
        KeyConditionExpression: 'jobId = :jobId',
        ExpressionAttributeValues: {
          ':jobId': job.id
        }
      };

      const appResult = await dynamoDB.query(appParams).promise();
      
      const jobApplications = appResult.Items || [];
      totalApplications += jobApplications.length;
      
      // Count applications by status
      jobApplications.forEach(app => {
        if (applicationsByStatus[app.status] !== undefined) {
          applicationsByStatus[app.status]++;
        }
      });
      
      applicationsByJob.push({
        jobId: job.id,
        jobTitle: job.title,
        applicationCount: jobApplications.length
      });
    }

    res.json({
      totalJobs: jobsResult.Items.length,
      totalApplications,
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
    // Get all applications for this candidate
    const applicationsParams = {
      TableName: 'Applications',
      IndexName: 'UserIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': req.user.id
      }
    };

    const applicationsResult = await dynamoDB.query(applicationsParams).promise();
    
    const applications = applicationsResult.Items || [];
    
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// environment variables - save as .env file
// AWS_REGION=us-east-1
// AWS_ACCESS_KEY_ID=your_access_key_id
// AWS_SECRET_ACCESS_KEY=your_secret_access_key
// S3_BUCKET=bingitech-job-board-files
// JWT_SECRET=your_jwt_secret
// SES_EMAIL_FROM=noreply@bingitech.com
// PORT=5000

// DynamoDB table schemas

/*
Users Table:
- id (string, hash key)
- name (string)
- email (string)
- password (string)
- role (string) - 'candidate' or 'employer'
- phone (string, optional)
- address (string, optional)
- bio (string, optional)
- resumeUrl (string, optional) - S3 URL to resume for candidates
- logoUrl (string, optional) - S3 URL to company logo for employers
- createdAt (string) - ISO timestamp
- updatedAt (string) - ISO timestamp

Global Secondary Indexes:
- EmailIndex: email (hash key)

Jobs Table:
- id (string, hash key)
- employerId (string)
- companyName (string)
- companyLogo (string, optional) - S3 URL to company logo
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

Global Secondary Indexes:
- EmployerIndex: employerId (hash key), createdAt (range key)
- StatusIndex: status (hash key), createdAt (range key)

Applications Table:
- id (string, hash key)
- jobId (string)
- userId (string)
- jobTitle (string)
- companyName (string)
- candidateName (string)
- candidateEmail (string)
- resumeUrl (string) - S3 URL to candidate's resume
- coverLetter (string, optional)
- status (string) - 'pending', 'reviewed', 'interview', 'rejected', 'hired'
- feedbackNote (string, optional)
- createdAt (string) - ISO timestamp
- updatedAt (string) - ISO timestamp

Global Secondary Indexes:
- JobIndex: jobId (hash key), createdAt (range key)
- UserIndex: userId (hash key), createdAt (range key)
- JobUserIndex: jobId (hash key), userId (range key)
*/
