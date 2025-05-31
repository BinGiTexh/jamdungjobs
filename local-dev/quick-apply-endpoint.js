// Quick Apply endpoint for one-click applications
app.post('/api/applications/quick-apply', authenticateJWT, async (req, res) => {
  try {
    const { jobId, coverLetter, resumeId, phoneNumber, availability, salary, additionalInfo } = req.body;
    
    // Validate job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Get resume URL from user's saved resumes
    let resumeUrl = null;
    if (resumeId) {
      const userResume = await prisma.resume.findFirst({
        where: {
          id: resumeId,
          userId: req.user.id
        }
      });
      
      if (userResume) {
        resumeUrl = userResume.fileUrl;
      } else {
        return res.status(404).json({ message: 'Resume not found' });
      }
    } else {
      // If no resumeId provided, try to get the user's default resume
      const defaultResume = await prisma.resume.findFirst({
        where: {
          userId: req.user.id,
          isDefault: true
        }
      });
      
      if (defaultResume) {
        resumeUrl = defaultResume.fileUrl;
      } else {
        // Try to get any resume
        const anyResume = await prisma.resume.findFirst({
          where: {
            userId: req.user.id
          }
        });
        
        if (anyResume) {
          resumeUrl = anyResume.fileUrl;
        } else {
          return res.status(400).json({ message: 'No resume available for quick apply' });
        }
      }
    }
    
    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        userId: req.user.id,
        status: 'APPLIED',
        coverLetter: coverLetter || '',
        resumeUrl,
        phoneNumber: phoneNumber || '',
        availability: availability || 'IMMEDIATE',
        salary: salary || '',
        additionalInfo: additionalInfo || '',
        appliedVia: 'QUICK_APPLY'
      }
    });
    
    // For demo purposes, create a mock resume record if it doesn't exist in the database
    if (!resumeUrl) {
      console.log('Creating mock resume for quick apply demo');
      resumeUrl = '/uploads/mock-resume.pdf';
      
      // Update the application with the mock resume
      await prisma.jobApplication.update({
        where: { id: application.id },
        data: { resumeUrl }
      });
    }
    
    // In a real app, we would also:
    // 1. Send email notification to employer
    // 2. Update application statistics
    // 3. Add to candidate's recent activity
    
    res.status(201).json({
      message: 'Application submitted successfully via Quick Apply',
      applicationId: application.id,
      trackingCode: `JDJ-${application.id.substring(0, 8).toUpperCase()}`
    });
  } catch (error) {
    console.error('Quick apply error:', error);
    res.status(500).json({ message: 'Error submitting quick application', error: error.message });
  }
});
