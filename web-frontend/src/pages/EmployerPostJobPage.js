import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Alert,
  CircularProgress,
  styled
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SkillsAutocomplete } from '../components/common/SkillsAutocomplete';
import { LocationAutocomplete } from '../components/common/LocationAutocomplete';
import { SalaryRangeAutocomplete } from '../components/common/SalaryRangeAutocomplete';
import axios from 'axios';

// Styled components for Jamaican theme
const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    maxWidth: '1100px',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(20, 20, 20, 0.85)',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(44, 85, 48, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%)',
    opacity: 0.2,
    zIndex: 0,
  },
}));

// Reusable form field styling
const formFieldStyle = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    '& fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.5)',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.8)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#FFD700',
    fontWeight: 500,
  },
  '& .MuiInputBase-input': {
    color: 'white',
  },
  mb: 1,
};

const EmployerPostJobPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    location: null,
    type: 'FULL_TIME',
    skills: [],
    salary: { min: 30000, max: 100000 },
    remote: false,
    applicationDeadline: '',
    applicationEmail: '',
    applicationUrl: '',
    applicationInstructions: ''
  });

  const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'];

  useEffect(() => {
    // If user is logged in but not an employer, redirect to appropriate page
    if (isAuthenticated && user && user.role !== 'EMPLOYER') {
      navigate('/dashboard');
    }
    
    // If user is logged in as employer, pre-fill company info
    if (isAuthenticated && user && user.role === 'EMPLOYER') {
      // Could pre-fill company info here if needed
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (field, value) => {
    setJobData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!isAuthenticated) {
        // Store job data in session storage for after login
        sessionStorage.setItem('pendingJobPost', JSON.stringify(jobData));
        navigate('/login', { state: { from: '/employer/post-job', message: 'Please log in as an employer to post a job' } });
        return;
      }
      
      // Format data for API
      const formattedJobData = {
        ...jobData,
        location: jobData.location ? jobData.location.name : '',
        placeId: jobData.location ? jobData.location.placeId : '',
      };
      
      await axios.post('/api/jobs', formattedJobData);
      setSuccess(true);
      
      // Clear form after successful submission
      setJobData({
        title: '',
        description: '',
        location: null,
        type: 'FULL_TIME',
        skills: [],
        salary: { min: 30000, max: 100000 },
        remote: false,
        applicationDeadline: '',
        applicationEmail: '',
        applicationUrl: '',
        applicationInstructions: ''
      });
      
      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error posting job:', err);
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0A0A0A',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background image with Jamaican styling */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: 'url("/images/generated/jamaican-design-1747273968.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          zIndex: 1,
        }}
      />
      
      <StyledContainer maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Title */}
        <Box sx={{ 
          backgroundColor: 'rgba(44, 85, 48, 0.8)', 
          padding: 2, 
          borderRadius: 2, 
          border: '2px solid #FFD700',
          mb: 4,
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: '#FFD700',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 0,
              textAlign: 'center'
            }}
          >
            POST A JOB
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'white',
              textAlign: 'center',
              fontStyle: 'italic'
            }}
          >
            Find Your Perfect Employee in Jamaica
          </Typography>
        </Box>

        {/* Login Prompt for Non-Authenticated Users */}
        {!isAuthenticated && (
          <StyledPaper sx={{ mb: 4, position: 'relative', zIndex: 2 }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#FFD700' }}>
                Employer Account Required
              </Typography>
              <Typography paragraph sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                You need to be logged in as an employer to post a job. Please log in or register for an employer account.
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login', { state: { from: '/employer/post-job' } })}
                  sx={{
                    background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                    color: '#000',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                    }
                  }}
                >
                  Log In
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/register', { state: { role: 'EMPLOYER', from: '/employer/post-job' } })}
                  sx={{
                    borderColor: '#FFD700',
                    color: '#FFD700',
                    '&:hover': {
                      borderColor: '#2C5530',
                      color: '#2C5530',
                    }
                  }}
                >
                  Register as Employer
                </Button>
              </Box>
            </Box>
          </StyledPaper>
        )}

        {/* Success Message */}
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 4, 
              position: 'relative', 
              zIndex: 2,
              backgroundColor: 'rgba(44, 85, 48, 0.2)',
              color: '#4caf50',
              border: '1px solid #4caf50'
            }}
          >
            Job posted successfully! You can view and manage your job postings from your employer dashboard.
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                color="success" 
                onClick={() => navigate('/employer/dashboard')}
                sx={{ mr: 2 }}
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outlined" 
                color="success" 
                onClick={() => setSuccess(false)}
              >
                Post Another Job
              </Button>
            </Box>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              position: 'relative', 
              zIndex: 2 
            }}
          >
            {error}
          </Alert>
        )}

        {/* Job Posting Form */}
        {(isAuthenticated && user?.role === 'EMPLOYER' && !success) && (
          <StyledPaper sx={{ position: 'relative', zIndex: 2 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ position: 'relative', zIndex: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#FFD700' }}>
                    Job Details
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    value={jobData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    sx={formFieldStyle}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Job Description"
                    value={jobData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    multiline
                    rows={6}
                    sx={formFieldStyle}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <LocationAutocomplete
                    value={jobData.location}
                    onChange={(locationData) => handleInputChange('location', locationData)}
                    placeholder="Job Location"
                    sx={formFieldStyle}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={formFieldStyle}>
                    <InputLabel sx={{ color: '#FFD700', fontWeight: 500 }}>Job Type</InputLabel>
                    <Select
                      value={jobData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      label="Job Type"
                      required
                      sx={{
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        '& .MuiSelect-icon': {
                          color: '#FFD700',
                        }
                      }}
                    >
                      {jobTypes.map(type => (
                        <MenuItem key={type} value={type}>
                          {type.replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <SkillsAutocomplete
                    value={jobData.skills}
                    onChange={(value) => handleInputChange('skills', value)}
                    label="Required Skills"
                    placeholder="Add skills required for this job"
                    helperText="Add skills to help candidates find your job"
                    sx={formFieldStyle}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom sx={{ color: '#FFD700', fontWeight: 500 }}>Salary Range</Typography>
                  <SalaryRangeAutocomplete
                    value={jobData.salary}
                    onChange={(value) => handleInputChange('salary', value)}
                    sx={formFieldStyle}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#FFD700', mt: 2 }}>
                    Application Details
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Application Deadline"
                    type="date"
                    value={jobData.applicationDeadline}
                    onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={formFieldStyle}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Application Email"
                    type="email"
                    value={jobData.applicationEmail}
                    onChange={(e) => handleInputChange('applicationEmail', e.target.value)}
                    sx={formFieldStyle}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Application URL (Optional)"
                    value={jobData.applicationUrl}
                    onChange={(e) => handleInputChange('applicationUrl', e.target.value)}
                    sx={formFieldStyle}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Application Instructions (Optional)"
                    value={jobData.applicationInstructions}
                    onChange={(e) => handleInputChange('applicationInstructions', e.target.value)}
                    multiline
                    rows={3}
                    sx={formFieldStyle}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                      color: '#000',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1, color: '#000' }} />
                        Posting Job...
                      </>
                    ) : 'Post Job'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </StyledPaper>
        )}
      </StyledContainer>
    </Box>
  );
};

export default EmployerPostJobPage;
