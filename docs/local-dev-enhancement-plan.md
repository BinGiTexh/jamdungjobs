# JamDung Jobs - Local Development Enhancement Plan

This document outlines our iterative enhancement workflow: develop locally → test thoroughly → deploy to staging → validate.

## 🔄 Iterative Development Workflow

### **Phase 1: Local Development Setup Enhancement**

#### 1. **Improve Local Development Environment**
```bash
# Start local environment
cd local-dev
docker-compose up -d

# Run comprehensive testing
cd ../testing
TEST_ENV=local node comprehensive-qa-test.js
```

#### 2. **Fix Critical Issues Found in QA**
Based on current test results, priority fixes:

**A. API Endpoint Consistency**
- Fix job listings endpoint routing
- Ensure all CRUD operations work properly
- Add proper error handling

**B. File Upload System**
- Implement resume upload functionality
- Add profile photo upload
- Validate file types and sizes
- Test image serving and security

**C. Frontend-Backend Integration**
- Fix any broken API connections
- Ensure proper error handling in UI
- Test all user flows end-to-end

### **Phase 2: Feature Enhancements (Week 1)**

#### **Enhancement 1: Complete File Upload System**

**Backend Changes:**
```javascript
// routes/upload.routes.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === 'resume' ? 
      './uploads/resumes' : './uploads/profile-photos';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    // Allow PDF, DOC, DOCX
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes'), false);
    }
  } else if (file.fieldname === 'profilePhoto') {
    // Allow JPEG, PNG, GIF
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile photos'), false);
    }
  } else {
    cb(new Error('Invalid field name'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add upload endpoints
router.post('/upload/resume', authenticateJWT, upload.single('resume'), uploadResume);
router.post('/upload/photo', authenticateJWT, upload.single('profilePhoto'), uploadPhoto);
```

**Frontend Changes:**
```jsx
// components/FileUpload.jsx
import React, { useState } from 'react';

const FileUpload = ({ type, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await fetch(`/api/upload/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        onUploadSuccess(result.filePath);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Upload failed');
      }
    } catch (err) {
      setError('Network error during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        accept={type === 'resume' ? '.pdf,.doc,.docx' : 'image/*'}
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default FileUpload;
```

**Testing Script:**
```javascript
// testing/file-upload-test.js
const FormData = require('form-data');
const fs = require('fs');

async function testFileUploads() {
  // Test resume upload
  const resumeForm = new FormData();
  resumeForm.append('resume', fs.createReadStream('./test_resume.pdf'));
  
  const resumeResponse = await makeRequest('POST', '/upload/resume', resumeForm, {
    'Authorization': `Bearer ${token}`,
    ...resumeForm.getHeaders()
  });
  
  // Test profile photo upload
  const photoForm = new FormData();
  photoForm.append('profilePhoto', fs.createReadStream('./test_image.jpg'));
  
  const photoResponse = await makeRequest('POST', '/upload/photo', photoForm, {
    'Authorization': `Bearer ${token}`,
    ...photoForm.getHeaders()
  });
}
```

#### **Enhancement 2: Advanced Job Search & Filtering**

**Backend Changes:**
```javascript
// routes/jobs.routes.js - Enhanced search
router.get('/jobs', async (req, res) => {
  const {
    search,
    location,
    type,
    salaryMin,
    salaryMax,
    experience,
    skills,
    datePosted,
    page = 1,
    limit = 10
  } = req.query;

  const filters = {};
  
  if (search) {
    filters.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (location) {
    filters.location = { contains: location, mode: 'insensitive' };
  }
  
  if (type) {
    filters.type = type;
  }
  
  if (salaryMin || salaryMax) {
    filters.salary = {};
    if (salaryMin) filters.salary.min = { gte: parseInt(salaryMin) };
    if (salaryMax) filters.salary.max = { lte: parseInt(salaryMax) };
  }
  
  if (skills) {
    const skillsArray = skills.split(',');
    filters.skills = { hasSome: skillsArray };
  }
  
  if (datePosted) {
    const days = parseInt(datePosted);
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    filters.createdAt = { gte: dateThreshold };
  }

  const jobs = await prisma.job.findMany({
    where: filters,
    include: { company: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: parseInt(limit)
  });

  const total = await prisma.job.count({ where: filters });

  res.json({
    jobs,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit)
    }
  });
});
```

**Frontend Changes:**
```jsx
// components/JobSearch.jsx
import React, { useState, useEffect } from 'react';

const JobSearch = ({ onResults }) => {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    salaryMin: '',
    salaryMax: '',
    experience: '',
    skills: '',
    datePosted: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/jobs?${queryParams}`);
      const data = await response.json();
      onResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-search">
      <div className="search-form">
        <input
          type="text"
          placeholder="Search jobs..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />
        
        <select
          value={filters.location}
          onChange={(e) => setFilters({...filters, location: e.target.value})}
        >
          <option value="">All Locations</option>
          <option value="Kingston">Kingston</option>
          <option value="Montego Bay">Montego Bay</option>
          <option value="Spanish Town">Spanish Town</option>
          <option value="Mandeville">Mandeville</option>
        </select>
        
        <select
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
        >
          <option value="">All Types</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="REMOTE">Remote</option>
        </select>
        
        <input
          type="number"
          placeholder="Min Salary"
          value={filters.salaryMin}
          onChange={(e) => setFilters({...filters, salaryMin: e.target.value})}
        />
        
        <input
          type="number"
          placeholder="Max Salary"
          value={filters.salaryMax}
          onChange={(e) => setFilters({...filters, salaryMax: e.target.value})}
        />
        
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search Jobs'}
        </button>
      </div>
    </div>
  );
};

export default JobSearch;
```

#### **Enhancement 3: Complete Application Flow**

**Backend Changes:**
```javascript
// routes/applications.routes.js
router.post('/applications', authenticateJWT, async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    const userId = req.user.id;

    // Check if user already applied
    const existingApplication = await prisma.application.findFirst({
      where: { jobId, userId }
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        userId,
        coverLetter,
        status: 'PENDING'
      },
      include: {
        job: { include: { company: true } },
        user: true
      }
    });

    // Create notification for employer
    await prisma.notification.create({
      data: {
        userId: application.job.company.userId,
        type: 'NEW_APPLICATION',
        title: 'New Job Application',
        message: `${application.user.firstName} ${application.user.lastName} applied for ${application.job.title}`,
        data: { applicationId: application.id }
      }
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit application', error: error.message });
  }
});

router.get('/applications/my', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        job: { include: { company: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
});

router.put('/applications/:id/status', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    // Verify employer owns this application's job
    const application = await prisma.application.findFirst({
      where: { 
        id,
        job: { company: { userId } }
      },
      include: { user: true, job: true }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status, notes },
      include: {
        job: { include: { company: true } },
        user: true
      }
    });

    // Create notification for job seeker
    await prisma.notification.create({
      data: {
        userId: application.userId,
        type: 'APPLICATION_UPDATE',
        title: 'Application Status Update',
        message: `Your application for ${application.job.title} has been updated to ${status}`,
        data: { applicationId: id, status }
      }
    });

    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update application', error: error.message });
  }
});
```

### **Phase 3: Testing & Validation**

#### **Local Testing Protocol**
```bash
# 1. Start fresh local environment
cd local-dev
docker-compose down -v
docker-compose up -d --build

# 2. Wait for services to start
sleep 30

# 3. Run comprehensive QA tests
cd ../testing
TEST_ENV=local node comprehensive-qa-test.js

# 4. Run specific feature tests
node file-upload-test.js
node application-flow-test.js
node search-functionality-test.js

# 5. Manual testing checklist
# - Register new users (job seeker & employer)
# - Upload resume and profile photo
# - Post a job (employer)
# - Search and filter jobs
# - Apply to jobs
# - Check application status
# - Test notifications
```

#### **Performance Testing**
```javascript
// testing/performance-test.js
const axios = require('axios');

async function performanceTest() {
  const tests = [
    { name: 'Job Listings', endpoint: '/jobs' },
    { name: 'Job Search', endpoint: '/jobs?search=developer' },
    { name: 'Job Filter', endpoint: '/jobs?location=Kingston&type=FULL_TIME' }
  ];

  for (const test of tests) {
    const startTime = Date.now();
    await axios.get(`http://localhost:5000/api${test.endpoint}`);
    const duration = Date.now() - startTime;
    
    console.log(`${test.name}: ${duration}ms`);
    
    if (duration > 1000) {
      console.warn(`⚠️ ${test.name} is slow (${duration}ms)`);
    }
  }
}
```

### **Phase 4: Deployment to Staging**

#### **Pre-Deployment Checklist**
- [ ] All local tests passing
- [ ] No security vulnerabilities detected
- [ ] Performance benchmarks met
- [ ] File uploads working properly
- [ ] Database migrations ready
- [ ] Environment variables configured

#### **Deployment Process**
```bash
# 1. Commit changes
git add .
git commit -m "feat: implement file uploads and enhanced search"

# 2. Push to main branch (triggers GitHub Actions)
git push origin main

# 3. Monitor deployment
# Check GitHub Actions logs
# Verify staging site functionality

# 4. Run staging tests
TEST_ENV=staging node comprehensive-qa-test.js

# 5. Validate specific features
curl -X GET "https://staging-jobs.bingitech.io/api/jobs?search=developer"
```

#### **Post-Deployment Validation**
- [ ] All API endpoints responding correctly
- [ ] File uploads working on staging
- [ ] Frontend-backend integration intact
- [ ] No broken links or images
- [ ] Performance within acceptable limits
- [ ] Security tests passing

### **Phase 5: Monitoring & Iteration**

#### **Continuous Monitoring**
```javascript
// scripts/health-monitor.js
setInterval(async () => {
  try {
    const response = await axios.get('https://staging-jobs.bingitech.io/api/health');
    if (response.status !== 200) {
      console.error('Health check failed:', response.status);
      // Send alert
    }
  } catch (error) {
    console.error('Health check error:', error.message);
    // Send alert
  }
}, 300000); // Check every 5 minutes
```

#### **User Feedback Collection**
- Implement basic analytics
- Add feedback forms
- Monitor error logs
- Track user behavior

#### **Next Enhancement Cycle**
Based on monitoring and feedback:
1. Identify next priority features
2. Design improvements
3. Implement in local environment
4. Test thoroughly
5. Deploy to staging
6. Repeat cycle

## 🎯 Success Metrics

### **Technical Metrics**
- API response time < 500ms
- Frontend load time < 3 seconds
- Zero critical security vulnerabilities
- 95% uptime
- Error rate < 1%

### **User Experience Metrics**
- Job application completion rate > 80%
- User registration conversion > 50%
- Search result relevance score > 4/5
- Mobile responsiveness score > 90%

### **Business Metrics**
- Active job postings > 50
- Monthly applications > 200
- User retention rate > 60%
- Employer satisfaction > 4/5

## 🚧 Implementation Timeline

### **Week 1: Core Functionality**
- Days 1-2: File upload system
- Days 3-4: Enhanced search & filtering
- Days 5-7: Application flow completion

### **Week 2: Testing & Polish**
- Days 1-3: Comprehensive testing and bug fixes
- Days 4-5: Performance optimization
- Days 6-7: Security hardening

### **Week 3: Deployment & Validation**
- Days 1-2: Staging deployment and testing
- Days 3-4: Bug fixes and improvements
- Days 5-7: Final validation and documentation

### **Week 4: Production Preparation**
- Days 1-3: Production environment setup
- Days 4-5: Final testing and optimization
- Days 6-7: Go-live preparation

This iterative approach ensures we maintain high quality while continuously improving the platform. Each enhancement cycle builds on the previous one, gradually evolving JamDung Jobs into a world-class job board platform.
