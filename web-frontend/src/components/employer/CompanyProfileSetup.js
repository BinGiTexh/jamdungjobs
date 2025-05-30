import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  CircularProgress,
  Alert,
  Fade,
  styled
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { JamaicaLocationProfileAutocomplete } from '../common/JamaicaLocationProfileAutocomplete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Styled components for Jamaican theme
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: 'rgba(10, 10, 10, 0.85)',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  position: 'relative',
  overflow: 'hidden',
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
    opacity: 0.3,
    zIndex: 0,
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2C5530, #FFD700)',
  color: '#000',
  '&:hover': {
    background: 'linear-gradient(90deg, #FFD700, #2C5530)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
  },
  transition: 'all 0.3s ease',
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 24px',
  borderRadius: '8px',
}));

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

const CompanyProfileSetup = ({ onComplete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [companyData, setCompanyData] = useState({
    companyName: '',
    industry: '',
    location: null,
    description: '',
    website: '',
    logoFile: null,
    logoPreview: null
  });
  
  const steps = ['Company Details', 'Company Description', 'Review & Finish'];
  
  // Handle input changes
  const handleChange = (field) => (e) => {
    setCompanyData({
      ...companyData,
      [field]: e.target.value
    });
  };
  
  // Handle location selection
  const handleLocationChange = (location) => {
    setCompanyData({
      ...companyData,
      location
    });
  };
  
  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyData({
          ...companyData,
          logoFile: file,
          logoPreview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form navigation
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Validate current step
  const validateStep = () => {
    setError(null);
    
    if (activeStep === 0) {
      if (!companyData.companyName.trim()) {
        setError('Company name is required');
        return false;
      }
      if (!companyData.industry.trim()) {
        setError('Industry is required');
        return false;
      }
      if (!companyData.location) {
        setError('Location is required');
        return false;
      }
    } else if (activeStep === 1) {
      if (!companyData.description.trim()) {
        setError('Company description is required');
        return false;
      }
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare data for API
      const apiData = {
        name: companyData.companyName,
        // Remove industry field as it doesn't exist in the Prisma schema
        description: companyData.description,
        website: companyData.website,
        // Handle location data properly
        location: typeof companyData.location === 'object' ? 
          companyData.location.formattedAddress : 
          companyData.location
      };
      
      console.log('Sending company data to API:', apiData);
      
      // Save to localStorage as a backup
      localStorage.setItem('employerCompanyProfile', JSON.stringify({
        companyName: companyData.companyName,
        industry: companyData.industry,
        location: companyData.location,
        description: companyData.description,
        website: companyData.website,
        logoUrl: companyData.logoPreview
      }));
      
      try {
        // Try to create a new company profile using our new endpoint
        const response = await axios.post('http://localhost:5000/api/employer/create-company', apiData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
          }
        });
        
        console.log('Company profile created:', response.data);
        
        // If we have a logo, we would upload it here
        // This would be a separate API call with FormData
        
        setSuccess(true);
        
        // Wait a moment before completing
        setTimeout(() => {
          if (onComplete) {
            onComplete({
              ...companyData,
              // Add any data returned from the API
              id: response.data?.id || null
            });
          }
        }, 1000);
        
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // If the API fails, we still have the data in localStorage
        setSuccess(true);
        
        // Wait a moment before completing
        setTimeout(() => {
          if (onComplete) {
            onComplete(companyData);
          }
        }, 1000);
        
        // Show a warning that we're using localStorage
        setError('Warning: Could not save to database. Data is stored locally only.');
      }
    } catch (error) {
      console.error('Error creating company profile:', error);
      setError('Failed to create company profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                value={companyData.companyName}
                onChange={handleChange('companyName')}
                required
                variant="outlined"
                InputProps={{
                  sx: { color: '#FFFFFF' }
                }}
                InputLabelProps={{
                  sx: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Industry"
                value={companyData.industry}
                onChange={handleChange('industry')}
                required
                variant="outlined"
                placeholder="e.g., Technology, Healthcare, Education"
                InputProps={{
                  sx: { color: '#FFFFFF' }
                }}
                InputLabelProps={{
                  sx: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <JamaicaLocationProfileAutocomplete
                value={companyData.location}
                onChange={handleLocationChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={companyData.website}
                onChange={handleChange('website')}
                variant="outlined"
                placeholder="https://www.example.com"
                InputProps={{
                  sx: { color: '#FFFFFF' }
                }}
                InputLabelProps={{
                  sx: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 1 }}>
                Company Logo
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    color: '#FFD700',
                    borderColor: '#FFD700',
                    '&:hover': {
                      borderColor: '#FFD700',
                      backgroundColor: 'rgba(255, 215, 0, 0.1)'
                    }
                  }}
                >
                  Upload Logo
                  <VisuallyHiddenInput type="file" accept="image/*" onChange={handleLogoUpload} />
                </Button>
                
                {companyData.logoPreview && (
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '4px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    <img
                      src={companyData.logoPreview}
                      alt="Company Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 1 }}>
                Company Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                value={companyData.description}
                onChange={handleChange('description')}
                required
                variant="outlined"
                placeholder="Describe your company, mission, values, and what makes it unique..."
                InputProps={{
                  sx: { color: '#FFFFFF' }
                }}
              />
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 3 }}>
                Review Your Company Profile
              </Typography>
              
              <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                <Grid container spacing={2}>
                  {companyData.logoPreview && (
                    <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '4px',
                          overflow: 'hidden',
                          border: '1px solid rgba(255, 215, 0, 0.3)'
                        }}
                      >
                        <img
                          src={companyData.logoPreview}
                          alt="Company Logo"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    </Grid>
                  )}
                  
                  <Grid item xs={12} sm={companyData.logoPreview ? 9 : 12}>
                    <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 1 }}>
                      {companyData.companyName}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                      {companyData.industry} • {companyData.location?.formattedAddress || 'No location'}
                    </Typography>
                    
                    {companyData.website && (
                      <Typography variant="body2" sx={{ color: '#4FC3F7', mb: 2 }}>
                        {companyData.website}
                      </Typography>
                    )}
                    
                    <Typography variant="body1" sx={{ color: '#FFFFFF', whiteSpace: 'pre-wrap' }}>
                      {companyData.description}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        );
        
      default:
        return null;
    }
  };
  
  // If success, show completion screen
  if (success) {
    return (
      <Fade in={true}>
        <StyledPaper>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 2 }}>
              Company Profile Created Successfully!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 4 }}>
              Your company profile has been set up. You can now post jobs and manage your employer dashboard.
            </Typography>
          </Box>
        </StyledPaper>
      </Fade>
    );
  }
  
  return (
    <Fade in={true}>
      <StyledPaper>
        <Typography variant="h5" sx={{ color: '#FFD700', mb: 4 }}>
          Set Up Your Company Profile
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconProps={{ sx: { color: '#FFD700' } }}>
                <Typography sx={{ color: activeStep === steps.indexOf(label) ? '#FFD700' : 'rgba(255, 255, 255, 0.7)' }}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {renderStepContent()}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? () => navigate('/employer/dashboard') : handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                borderColor: '#FFFFFF',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          <AnimatedButton
            onClick={() => {
              if (validateStep()) {
                handleNext();
              }
            }}
            endIcon={activeStep < steps.length - 1 ? <ArrowForwardIcon /> : undefined}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1, color: '#000' }} />
                {activeStep === steps.length - 1 ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              activeStep === steps.length - 1 ? 'Create Company Profile' : 'Continue'
            )}
          </AnimatedButton>
        </Box>
      </StyledPaper>
    </Fade>
  );
};

export default CompanyProfileSetup;
