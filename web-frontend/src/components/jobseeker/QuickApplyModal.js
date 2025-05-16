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
  Divider,
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
import axios from 'axios';
import { buildApiUrl } from '../../config';
import { useAuth } from '../../context/AuthContext';

const QuickApplyModal = ({ open, onClose, job, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
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

  // Fetch user profile data when modal opens
  useEffect(() => {
    if (open && currentUser) {
      fetchProfileData();
    }
  }, [open, currentUser]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(buildApiUrl('/candidate/profile'));
      setProfileData(response.data);
      
      // Pre-fill application data from profile
      setApplicationData(prev => ({
        ...prev,
        phoneNumber: response.data.phoneNumber || '',
        resumeId: response.data.resumes && response.data.resumes.length > 0 
          ? response.data.resumes[0].id 
          : '',
      }));

      // Calculate profile completeness
      calculateProfileCompleteness(response.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to load your profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompleteness = (profile) => {
    const missingFields = [];
    let completedFields = 0;
    let totalFields = 0;

    // Check required fields
    const requiredFields = [
      { name: 'resume', value: profile.resumes && profile.resumes.length > 0 },
      { name: 'phoneNumber', value: profile.phoneNumber },
      { name: 'skills', value: profile.skills && profile.skills.length > 0 },
      { name: 'education', value: profile.education && profile.education.length > 0 },
      { name: 'experience', value: profile.experience && profile.experience.length > 0 }
    ];

    requiredFields.forEach(field => {
      totalFields++;
      if (field.value) {
        completedFields++;
      } else {
        missingFields.push(field.name);
      }
    });

    const percentage = Math.round((completedFields / totalFields) * 100);
    setProfileCompleteness({
      percentage,
      missingFields
    });
  };

  const handleChange = (field) => (event) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
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

      // Submit application
      const response = await axios.post(buildApiUrl('/applications/quick-apply'), payload);

      if (response.status === 201) {
        setSuccess(true);
        // Call onSuccess after a delay to allow user to see success message
        setTimeout(() => {
          onSuccess(response.data);
        }, 2000);
      }
    } catch (err) {
      console.error('Quick application submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
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
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Application Submitted!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Your application for <strong>{job.title}</strong> has been successfully submitted.
            </Typography>
            <Button
              variant="contained"
              onClick={() => onClose()}
              sx={{
                background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                color: '#000',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FFD700, #2C5530)',
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        background: 'linear-gradient(90deg, rgba(44, 85, 48, 0.1), rgba(255, 215, 0, 0.1))'
      }}>
        <Typography variant="h6">Quick Apply: {job.title}</Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {job.company?.name} • {job.location}
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
                onChange={handleChange('resumeId')}
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
          onClick={handleSubmit}
          disabled={submitting || !applicationData.resumeId || profileCompleteness.percentage < 50}
          sx={{
            background: 'linear-gradient(90deg, #2C5530, #FFD700)',
            color: '#000',
            '&:hover': {
              background: 'linear-gradient(90deg, #FFD700, #2C5530)',
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
