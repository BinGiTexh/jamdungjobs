import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { buildApiUrl } from '../../config';

// Styled component for the file input
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const JobApplicationForm = ({ jobId, jobTitle, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    resumeFile: null,
    phoneNumber: '',
    availability: 'IMMEDIATE',
    salary: '',
    additionalInfo: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const fileType = file.type;
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!validTypes.includes(fileType)) {
        setError('Please upload a PDF or Word document');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        resumeFile: file
      }));
      setResumeFileName(file.name);
      setError(null);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      resumeFile: null
    }));
    setResumeFileName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.resumeFile) {
      setError('Please upload your resume');
      setLoading(false);
      return;
    }

    try {
      // Create form data for file upload
      const applicationData = new FormData();
      applicationData.append('jobId', jobId);
      applicationData.append('coverLetter', formData.coverLetter);
      applicationData.append('resume', formData.resumeFile);
      applicationData.append('phoneNumber', formData.phoneNumber);
      applicationData.append('availability', formData.availability);
      applicationData.append('salary', formData.salary);
      applicationData.append('additionalInfo', formData.additionalInfo);

      // Submit application
      const response = await axios.post(
        buildApiUrl('/applications'), 
        applicationData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 201) {
        onSuccess(response.data);
      }
    } catch (err) {
      console.error('Application submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availabilityOptions = [
    { value: 'IMMEDIATE', label: 'Immediately' },
    { value: 'ONE_WEEK', label: 'One week notice' },
    { value: 'TWO_WEEKS', label: 'Two weeks notice' },
    { value: 'ONE_MONTH', label: 'One month notice' },
    { value: 'NEGOTIABLE', label: 'Negotiable' }
  ];

  return (
    <Fade in={true} timeout={800}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          borderRadius: 2,
          border: '1px solid rgba(255, 215, 0, 0.1)',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  fontWeight: 700, 
                  color: '#2C5530',
                  mb: 3,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-10px',
                    left: 0,
                    width: '80px',
                    height: '4px',
                    background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                    borderRadius: '2px',
                  }
                }}
              >
                Apply for {jobTitle}
              </Typography>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ mr: 1 }}>Resume</Typography>
                <Tooltip title="PDF or Word document, max 5MB">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                    color: '#000',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                    },
                    textTransform: 'none',
                  }}
                >
                  Upload Resume
                  <VisuallyHiddenInput type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                </Button>
                
                {resumeFileName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <Typography variant="body2" sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {resumeFileName}
                    </Typography>
                    <IconButton size="small" onClick={removeFile} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Cover Letter"
                value={formData.coverLetter}
                onChange={handleChange('coverLetter')}
                placeholder="Introduce yourself and explain why you're a good fit for this position..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange('phoneNumber')}
                placeholder="+1 (876) 123-4567"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  value={formData.availability}
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

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Expected Salary"
                value={formData.salary}
                onChange={handleChange('salary')}
                placeholder="e.g., $60,000 - $70,000"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional Information"
                value={formData.additionalInfo}
                onChange={handleChange('additionalInfo')}
                placeholder="Any other information you'd like to share with the employer..."
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  sx={{
                    borderColor: '#2C5530',
                    color: '#2C5530',
                    '&:hover': {
                      borderColor: '#FFD700',
                      color: '#FFD700',
                      backgroundColor: 'rgba(44, 85, 48, 0.05)'
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    px: 4,
                    background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                    color: '#000',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                    },
                    transition: 'all 0.3s ease',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1, color: '#000' }} />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Fade>
  );
};

export default JobApplicationForm;
