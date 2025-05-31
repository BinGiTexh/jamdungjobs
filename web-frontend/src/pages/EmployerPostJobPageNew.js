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
  styled,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Chip,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import { useAuth } from '../context/AuthContext';
import { SkillsAutocomplete } from '../components/common/SkillsAutocomplete';
import { LocationAutocomplete } from '../components/common/LocationAutocomplete';
import { SalaryRangeAutocomplete } from '../components/common/SalaryRangeAutocomplete';
import JobDescriptionBuilder from '../components/employer/JobDescriptionBuilder';
import axios from 'axios';
import api from '../utils/axiosConfig';

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

const StyledTab = styled(Tab)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: '#FFD700',
  },
  transition: 'all 0.3s ease',
  '&:hover': {
    color: 'rgba(255, 215, 0, 0.9)',
    backgroundColor: 'rgba(44, 85, 48, 0.1)',
  },
}));

const EmployerPostJobPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [descriptionTabValue, setDescriptionTabValue] = useState(0);
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
    applicationInstructions: '',
    requirements: '',
    benefits: ''
  });

  const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'];
  
  // Define steps for the job posting process
  const steps = ['Create Job Posting', 'Preview & Submit'];

  useEffect(() => {
    // If user is logged in but not an employer, redirect to appropriate page
    if (isAuthenticated && user && user.role !== 'EMPLOYER') {
      navigate('/dashboard');
    }
    
    // If user is logged in as employer, pre-fill company info and check for drafts
    if (isAuthenticated && user && user.role === 'EMPLOYER') {
      // Check for saved drafts
      const checkForDrafts = async () => {
        try {
          const response = await axios.get('/api/employer/job-drafts');
          if (response.data && response.data.length > 0) {
            // Ask if they want to load the most recent draft
            const loadDraft = window.confirm('You have a saved draft. Would you like to load it?');
            if (loadDraft) {
              setJobData(response.data[0]);
            }
          }
        } catch (err) {
          console.error('Error checking for drafts:', err);
          // Don't show error for this
        }
      };
      
      checkForDrafts();
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (field, value) => {
    setJobData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDescriptionTabChange = (event, newValue) => {
    setDescriptionTabValue(newValue);
  };

  const handleDescriptionBuilderSave = (builderData) => {
    setJobData(prev => ({
      ...prev,
      description: builderData.formattedDescription,
      requirements: builderData.requirements,
      benefits: builderData.benefits
    }));
    setDescriptionTabValue(0);
  };

  // Handle next step
  const handleNext = () => {
    // Validate current step
    if (activeStep === 0) {
      // Basic validation for required fields
      if (!jobData.title) {
        setError('Job title is required');
        return;
      }
      if (!jobData.description) {
        setError('Job description is required');
        return;
      }
      if (!jobData.location) {
        setError('Job location is required');
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  // Save job posting as draft
  const saveDraft = async () => {
    if (!isAuthenticated) {
      // Store job data in session storage for after login
      sessionStorage.setItem('pendingJobPost', JSON.stringify(jobData));
      navigate('/login', { state: { from: '/employer/post-job', message: 'Please log in as an employer to save a draft' } });
      return;
    }
    
    setSavingDraft(true);
    try {
      // Format data for API
      const formattedJobData = {
        ...jobData,
        location: jobData.location ? jobData.location.name : '',
        placeId: jobData.location ? jobData.location.placeId : '',
        requirements: jobData.requirements || '',
        benefits: jobData.benefits || '',
        isDraft: true
      };
      
      await axios.post('/api/employer/job-drafts', formattedJobData);
      setDraftSaved(true);
      
      // Show draft saved message briefly
      setTimeout(() => {
        setDraftSaved(false);
      }, 3000);
    } catch (err) {
      console.error('Draft saving error:', err);
      setError(err.response?.data?.message || 'Failed to save draft. Please try again.');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
      };
      
      // Use the configured api instance that includes authentication headers
      await api.post('/api/employer/jobs', formattedJobData);
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
        applicationInstructions: '',
        requirements: '',
        benefits: ''
      });
      
      // Reset step
      setActiveStep(0);
    } catch (err) {
      console.error('Job posting error:', err);
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render job preview
  const renderJobPreview = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#FFD700' }}>
        Job Posting Preview
      </Typography>
      
      <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', p: 3, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#FFD700' }}>{jobData.title}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary">Location</Typography>
            <Typography variant="body1">
              {jobData.location ? jobData.location.name : 'Not specified'}
              {jobData.remote && ' (Remote available)'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary">Job Type</Typography>
            <Typography variant="body1">
              {jobData.type.replace('_', ' ')}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="text.secondary">Job Description</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
              {jobData.description}
            </Typography>

            {jobData.requirements && (
              <>
                <Typography variant="subtitle1" color="text.secondary">Requirements</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                  {jobData.requirements}
                </Typography>
              </>
            )}

            {jobData.benefits && (
              <>
                <Typography variant="subtitle1" color="text.secondary">Benefits</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                  {jobData.benefits}
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary">Salary Range</Typography>
            <Typography variant="body1">
              ${jobData.salary.min.toLocaleString()} - ${jobData.salary.max.toLocaleString()} per year
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary">Application Deadline</Typography>
            <Typography variant="body1">
              {jobData.applicationDeadline ? new Date(jobData.applicationDeadline).toLocaleDateString() : 'Not specified'}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="text.secondary">Required Skills</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {jobData.skills.length > 0 ? (
                jobData.skills.map((skill, index) => (
                  <Chip 
                    key={index} 
                    label={skill.name || skill} 
                    variant="outlined"
                    sx={{ 
                      borderColor: 'rgba(255, 215, 0, 0.5)',
                      color: '#FFD700',
                    }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No specific skills listed</Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="text.secondary">Job Description</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {jobData.description}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="text.secondary">How to Apply</Typography>
            <Card variant="outlined" sx={{ bgcolor: 'rgba(44, 85, 48, 0.2)', borderColor: 'rgba(255, 215, 0, 0.3)' }}>
              <CardContent>
                {jobData.applicationEmail && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Email:</strong> {jobData.applicationEmail}
                  </Typography>
                )}
                
                {jobData.applicationUrl && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Application URL:</strong> {jobData.applicationUrl}
                  </Typography>
                )}
                
                {jobData.applicationInstructions && (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Instructions:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {jobData.applicationInstructions}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #121212 0%, #2C2C2C 100%)',
      py: 6,
      position: 'relative',
    }}>
      <StyledContainer>
        {success ? (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 4, 
              py: 2,
              backgroundColor: 'rgba(44, 85, 48, 0.2)',
              color: '#FFD700',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              '& .MuiAlert-icon': {
                color: '#FFD700'
              }
            }}
          >
            <Typography variant="h6" gutterBottom>Job Posted Successfully!</Typography>
            <Typography paragraph>Your job has been posted and is now live on JamDung Jobs.</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained"
                onClick={() => navigate('/employer/dashboard')}
                sx={{
                  background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                  color: '#000',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                  }
                }}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setSuccess(false);
                }}
                sx={{
                  borderColor: '#FFD700',
                  color: '#FFD700',
                  '&:hover': {
                    borderColor: '#2C5530',
                    backgroundColor: 'rgba(44, 85, 48, 0.1)'
                  }
                }}
              >
                Post Another Job
              </Button>
            </Box>
          </Alert>
        ) : (
          <StyledPaper>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Box component="form" onSubmit={(e) => { e.preventDefault(); activeStep === steps.length - 1 ? handleSubmit() : handleNext(); }}>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  fontWeight: 700, 
                  color: '#FFD700',
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
                {activeStep === 0 ? 'Post a New Job' : 'Review Your Job Posting'}
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
              )}
              
              {draftSaved && (
                <Alert severity="success" sx={{ mb: 3 }}>Draft saved successfully!</Alert>
              )}
              
              {activeStep === 0 ? (
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
                    <Box sx={{ 
                      borderBottom: 1, 
                      borderColor: 'rgba(255, 215, 0, 0.3)', 
                      mb: 2,
                      borderRadius: '4px 4px 0 0',
                      background: 'linear-gradient(90deg, rgba(44, 85, 48, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
                    }}>
                      <Tabs 
                        value={descriptionTabValue} 
                        onChange={handleDescriptionTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                          '& .MuiTabs-indicator': {
                            backgroundColor: '#FFD700',
                            height: '3px',
                            borderRadius: '3px 3px 0 0',
                          },
                        }}
                      >
                        <StyledTab label="Manual Input" />
                        <StyledTab label="Description Builder" icon={<BuildIcon />} iconPosition="start" />
                      </Tabs>
                    </Box>
                    
                    {descriptionTabValue === 0 ? (
                      <Box>
                        <TextField
                          fullWidth
                          label="Job Description"
                          value={jobData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          multiline
                          rows={6}
                          required
                          sx={formFieldStyle}
                        />
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            fullWidth
                            label="Requirements"
                            value={jobData.requirements}
                            onChange={(e) => handleInputChange('requirements', e.target.value)}
                            multiline
                            rows={4}
                            sx={formFieldStyle}
                          />
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            fullWidth
                            label="Benefits"
                            value={jobData.benefits}
                            onChange={(e) => handleInputChange('benefits', e.target.value)}
                            multiline
                            rows={4}
                            sx={formFieldStyle}
                          />
                        </Box>
                      </Box>
                    ) : (
                      <JobDescriptionBuilder 
                        initialData={jobData}
                        onSave={handleDescriptionBuilderSave}
                      />
                    )}
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
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={saveDraft}
                        disabled={savingDraft}
                        startIcon={<SaveIcon />}
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
                        {savingDraft ? 'Saving...' : 'Save Draft'}
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          py: 1.5,
                          px: 4,
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
                        Continue to Preview
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <>
                  {renderJobPreview()}
                  
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      startIcon={<ArrowBackIcon />}
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
                      Back to Edit
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
                      ) : 'Publish Job'}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </StyledPaper>
        )}
      </StyledContainer>
    </Box>
  );
};

export default EmployerPostJobPage;
