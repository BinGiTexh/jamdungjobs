import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import api from '../../utils/api';
import { _buildApiUrl } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';
import { calculateProfileCompletion } from '../../utils/profileCompletion';

const QuickApplyModal = ({ open, onClose, job, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resumeId: '',
    phoneNumber: '',
    availability: 'IMMEDIATE',
    salary: '',
    additionalInfo: ''
  });
  const [profileCompleteness, setProfileCompleteness] = useState({
    percentage: 0,
    missingFields: []
  });

  // Fetch profile data whenever the modal is opened
  useEffect(() => {
    if (open) {
      fetchProfileData();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset transient UI states whenever the modal is reopened
  useEffect(() => {
    if (open) {
      setError(null);
      setSuccess(false);
      setAlreadyApplied(false);
    }
  }, [open]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch jobseeker profile (uniform with CandidateDashboard)
      const response = await api.get('/api/jobseeker/profile');

      // Backend may return { success, data } wrapper or raw object – normalise it
      const userData = response.data?.data || response.data || {};
      const candidateData = userData.candidateProfile || userData.candidate_profile || {};

      // Normalise resumes – backend currently stores single resumeUrl/resumeFileName, but may use snake_case keys
      let resumes = [];
      if (Array.isArray(candidateData.resumes) && candidateData.resumes.length) {
        resumes = candidateData.resumes;
      } else {
        // support both camelCase and snake_case single-resume fields
        const singleResumeUrl = candidateData.resumeUrl || candidateData.resume_url;
        const singleResumeName = candidateData.resumeFileName || candidateData.resume_file_name;
        if (singleResumeUrl) {
          resumes = [{
            id: 'default',
            name: singleResumeName || 'Resume',
            uploadDate: candidateData.updatedAt || candidateData.updated_at || new Date().toISOString(),
            url: singleResumeUrl
          }];
        }
      }

      // Merge and normalise important fields for completeness check
      const mergedProfile = {
        ...candidateData,
        resumes,
        // Normalised phone number field
        phoneNumber: candidateData.phoneNumber || candidateData.phone_number || userData.phoneNumber || userData.phone_number || '',
        // Normalised experience array – backend may use experience, workExperience, work_experience, experiences
        experience: 
          candidateData.experience || 
          candidateData.experiences || 
          candidateData.workExperience || 
          candidateData.work_experience || 
          userData.experience || 
          userData.workExperience || 
          userData.work_experience || []
      };

      setProfileData(mergedProfile);

      // Pre-fill application data from profile
      setApplicationData(prev => ({
        ...prev,
        phoneNumber: mergedProfile.phoneNumber,
        resumeId: resumes.length > 0 ? resumes[0].id : ''
      }));

      // Calculate profile completeness based on merged profile
      calculateProfileCompleteness(mergedProfile);
      
      // Log normalised profile data in development
      logDev('debug', 'Jobseeker profile fetched for quick apply', {
        resumeCount: resumes.length,
        hasPhone: !!(candidateData.phoneNumber || candidateData.phone_number || userData.phoneNumber || userData.phone_number),
        userId: currentUser?.id
      });
    } catch (error) {
      logError('Error fetching profile data for quick apply', error, {
        module: 'QuickApplyModal',
        function: 'fetchProfileData',
        userId: currentUser?.id,
        status: error.response?.status
      });
      setError('Failed to load your profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompleteness = (profile) => {
    // Use the standardized profile completion utility
    const completionData = calculateProfileCompletion(profile);
    
    setProfileCompleteness({
      percentage: completionData.percentage,
      missingFields: completionData.missingFields
    });
    
    // Log profile completeness in development
    logDev('debug', 'Profile completeness calculated', {
      percentage: completionData.percentage,
      missingFields: completionData.missingFields,
      completedFields: completionData.completedFields,
      userId: currentUser?.id
    });
  };

  const handleChange = (field) => (event) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Log field changes in development
    logDev('debug', 'Application form field changed', {
      field,
      fieldType: typeof event.target.value,
      valueLength: typeof event.target.value === 'string' ? event.target.value.length : 'N/A'
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    
    // Log submission attempt in development
    logDev('debug', 'Validating application before submission', sanitizeForLogging({
      jobId: job?.id,
      resumeProvided: !!applicationData.resumeId,
      phoneProvided: !!applicationData.phoneNumber,
      coverLetterLength: applicationData.coverLetter?.length || 0,
      profileCompleteness: profileCompleteness.percentage
    }));

    try {
      // Check if job is available before proceeding
      if (!job?.id) {
        setError('Job information is not available. Please try again.');
        return;
      }

      // Create application data
      const payload = {
        jobId: job.id,
        coverLetter: applicationData.coverLetter,
        resumeId: applicationData.resumeId,
        phoneNumber: applicationData.phoneNumber,
        availability: applicationData.availability,
        salary: applicationData.salary,
        additionalInfo: applicationData.additionalInfo
      };
      
      // Log application payload in development (sanitized)
      logDev('debug', 'Submitting application', sanitizeForLogging(payload));

      // Submit application to backend
      const response = await api.post(`/api/jobs/${job.id}/apply`, payload);
      
      if (response.status === 201) {
        setSuccess(true);
        
        // Log successful submission
        logDev('info', 'Application submitted successfully', {
          jobId: job?.id,
          applicationId: response.data?.id,
          userId: currentUser?.id
        });
        
        // Call onSuccess after a delay to allow user to see success message
        setTimeout(() => {
          onSuccess(response.data);
        }, 2000);
      }
    } catch (err) {
      // Log submission error with context
      logError('Application submission failed', err, {
        module: 'QuickApplyModal',
        function: 'handleSubmit',
        jobId: job?.id,
        userId: currentUser?.id,
        status: err.response?.status,
        errorMessage: err.response?.data?.message
      });
      
      // Determine specific error type for better user feedback
      let errorMessage = 'Failed to submit application. Please try again.';
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Missing required information for application.';
      } else if (err.response?.status === 409) {
        // User has already applied – show informational dialog instead of error
        setAlreadyApplied(true);
        return; // Skip setting generic error/UI flow
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to apply for this job.';
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const availabilityOptions = [
    { value: 'IMMEDIATE', label: 'Immediately' },
    { value: 'ONE_WEEK', label: 'One week notice' },
    { value: 'TWO_WEEKS', label: 'Two weeks notice' },
    { value: 'ONE_MONTH', label: 'One month notice' },
    { value: 'NEGOTIABLE', label: 'Negotiable' }
  ];

  const formatMissingFieldName = (fieldName) => {
    switch (fieldName) {
      case 'resume':
        return 'Resume';
      case 'phoneNumber':
        return 'Phone Number';
      case 'skills':
        return 'Skills';
      case 'education':
        return 'Education';
      case 'experience':
        return 'Work Experience';
      default:
        return fieldName;
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#2C5530' }} />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (success) {
    return (
      <Dialog 
        open={open} 
        onClose={() => {
          logDev('debug', 'Success dialog closed');
          onClose();
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogContent>
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Thank you for applying!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Thank you for applying, your employer should be getting a notification.
            </Typography>
            <Button
              variant="contained"
              onClick={() => onClose()}
              sx={{
                background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                color: '#000',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FFD700, #2C5530)'
                }
              }}
            >
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // Show dedicated message if the user has already applied for this job
  if (alreadyApplied) {
    return (
      <Dialog
        open={open}
        onClose={() => {
          logDev('debug', 'Already-applied dialog closed');
          onClose();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <InfoIcon sx={{ fontSize: 60, color: '#2196f3', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              You have already applied!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Our records show you already submitted an application for this position. The employer has been notified.
            </Typography>
            <Button
              variant="contained"
              onClick={() => onClose()}
              sx={{
                background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                color: '#000',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FFD700, #2C5530)'
                }
              }}
            >
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={() => {
        logDev('debug', 'Application form closed without submission', {
          jobId: job?.id,
          formState: Object.keys(applicationData).length > 0 ? 'partially_filled' : 'empty' 
        });
        onClose();
      }} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        background: 'linear-gradient(90deg, rgba(44, 85, 48, 0.1), rgba(255, 215, 0, 0.1))'
      }}>
        <Typography variant="h6">Quick Apply: {job?.title || 'Loading...'}</Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {job?.company?.name || 'Company'} • {job?.location || 'Location'}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {profileCompleteness.percentage < 100 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Your profile is {profileCompleteness.percentage}% complete
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={profileCompleteness.percentage} 
              sx={{ 
                mb: 2, 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(255, 215, 0, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: profileCompleteness.percentage < 50 ? '#f44336' : 
                                  profileCompleteness.percentage < 80 ? '#ff9800' : '#4caf50'
                }
              }} 
            />
            <Typography variant="body2">
              Complete these fields in your profile for better application success:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {profileCompleteness.missingFields.map(field => (
                <Chip 
                  key={field}
                  label={formatMissingFieldName(field)}
                  size="small"
                  icon={<WarningIcon />}
                  sx={{ 
                    backgroundColor: 'rgba(255, 152, 0, 0.1)', 
                    borderColor: 'rgba(255, 152, 0, 0.5)',
                    color: '#ff9800'
                  }}
                />
              ))}
            </Box>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Resume Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth error={!applicationData.resumeId}>
              <InputLabel>Select Resume</InputLabel>
              <Select
                value={applicationData.resumeId}
              onChange={(e) => {
                handleChange('resumeId')(e);
                logDev('debug', 'Resume selected', { 
                  resumeId: e.target.value,
                  available: profileData?.resumes?.length || 0
                });
              }}
              label="Select Resume"
            >
                {profileData?.resumes?.length > 0 ? (
                  profileData.resumes.map(resume => (
                    <MenuItem key={resume.id} value={resume.id}>
                      {resume.name || 'Resume'} (Uploaded {new Date(resume.uploadDate).toLocaleDateString()})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No resumes uploaded
                  </MenuItem>
                )}
              </Select>
              {!applicationData.resumeId && (
                <Typography variant="caption" color="error">
                  A resume is required to apply
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Cover Letter */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Cover Letter (Optional)"
              value={applicationData.coverLetter}
              onChange={handleChange('coverLetter')}
              placeholder="Introduce yourself and explain why you're a good fit for this position..."
            />
          </Grid>

          {/* Phone Number */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={applicationData.phoneNumber}
              onChange={handleChange('phoneNumber')}
              placeholder="+1 (876) 123-4567"
            />
          </Grid>

          {/* Availability */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Availability</InputLabel>
              <Select
                value={applicationData.availability}
                onChange={handleChange('availability')}
                label="Availability"
              >
                {availabilityOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Expected Salary */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Expected Salary (Optional)"
              value={applicationData.salary}
              onChange={handleChange('salary')}
              placeholder="e.g., $60,000 - $70,000"
            />
          </Grid>

          {/* Additional Info */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Additional Information (Optional)"
              value={applicationData.additionalInfo}
              onChange={handleChange('additionalInfo')}
              placeholder="Any other information you'd like to share with the employer..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Button 
          onClick={onClose}
          sx={{ color: '#2C5530' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            logDev('debug', 'Submit button clicked', {
              profileCompleteness: profileCompleteness.percentage,
              hasResume: !!applicationData.resumeId,
              hasPhone: !!applicationData.phoneNumber
            });
            handleSubmit();
          }}
          disabled={submitting || !applicationData.resumeId || profileCompleteness.percentage < 50 || !job?.id}
          sx={{
            background: 'linear-gradient(90deg, #2C5530, #FFD700)',
            color: '#000',
            '&:hover': {
              background: 'linear-gradient(90deg, #FFD700, #2C5530)'
            }
          }}
        >
          {submitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: '#000' }} />
              Submitting...
            </>
          ) : 'Submit Application'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickApplyModal;
