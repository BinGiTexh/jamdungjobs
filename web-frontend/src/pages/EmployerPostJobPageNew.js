import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Work as WorkIcon,
  Preview as PreviewIcon,
  Publish as PublishIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import JobListingForm from '../components/employer/JobListingForm';
import JobDescriptionBuilder from '../components/employer/JobDescriptionBuilder';

const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(4),
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #121212 0%, #2C2C2C 100%)',
  [theme.breakpoints.up('md')]: {
    maxWidth: '1200px'
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)',
  border: '1px solid rgba(255, 215, 0, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  marginBottom: theme.spacing(3)
}));

const ActionButton = styled(Button)(() => ({
  background: 'linear-gradient(90deg, #FFD700, #009639)',
  color: '#000000',
  fontWeight: 600,
  borderRadius: '8px',
  padding: '12px 24px',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(90deg, #009639, #FFD700)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)'
  },
  '&:disabled': {
    background: 'rgba(255, 215, 0, 0.3)',
    color: 'rgba(0, 0, 0, 0.5)'
  },
  transition: 'all 0.2s ease'
}));

const steps = [
  {
    label: 'Job Details',
    description: 'Basic job information and requirements',
    icon: <WorkIcon />
  },
  {
    label: 'Description',
    description: 'Detailed job description and benefits',
    icon: <PreviewIcon />
  },
  {
    label: 'Review & Publish',
    description: 'Review and publish your job listing',
    icon: <PublishIcon />
  }
];

const EmployerPostJobPageNew = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'FULL_TIME',
    salaryMin: '',
    salaryMax: '',
    currency: 'JMD',
    description: '',
    requirements: [],
    benefits: [],
    skills: [],
    experienceLevel: 'MID_LEVEL',
    applicationDeadline: '',
    contactEmail: '',
    isRemote: false,
    department: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleJobDataChange = (newData) => {
    setJobData(prev => ({ ...prev, ...newData }));
    // Clear any existing errors for updated fields
    const updatedErrors = { ...errors };
    Object.keys(newData).forEach(key => {
      if (updatedErrors[key]) {
        delete updatedErrors[key];
      }
    });
    setErrors(updatedErrors);
  };

  const validateCurrentStep = () => {
    const stepErrors = {};
    
    switch (activeStep) {
      case 0: // Job Details
        if (!jobData.title.trim()) stepErrors.title = 'Job title is required';
        if (!jobData.location.trim()) stepErrors.location = 'Location is required';
        if (!jobData.contactEmail.trim()) stepErrors.contactEmail = 'Contact email is required';
        if (jobData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(jobData.contactEmail)) {
          stepErrors.contactEmail = 'Please enter a valid email address';
        }
        break;
      
      case 1: // Description
        if (!jobData.description.trim()) stepErrors.description = 'Job description is required';
        if (jobData.description.length < 100) {
          stepErrors.description = 'Job description should be at least 100 characters';
        }
        break;
      
      default:
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      // Here you would integrate with your job posting API
      console.log('Submitting job:', jobData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page or back to dashboard
      navigate('/employer/dashboard', { 
        state: { 
          message: 'Job posted successfully!',
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Error posting job:', error);
      setErrors({ submit: 'Failed to post job. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <JobListingForm
            jobData={jobData}
            onChange={handleJobDataChange}
            errors={errors}
            showDescriptionField={false}
          />
        );
      
      case 1:
        return (
          <JobDescriptionBuilder
            value={jobData.description}
            onChange={(description) => handleJobDataChange({ description })}
            requirements={jobData.requirements}
            onRequirementsChange={(requirements) => handleJobDataChange({ requirements })}
            benefits={jobData.benefits}
            onBenefitsChange={(benefits) => handleJobDataChange({ benefits })}
            error={errors.description}
          />
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ color: '#FFD700', mb: 3 }}>
              Review Your Job Listing
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 1 }}>
                Job Title
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
                {jobData.title}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 1 }}>
                Location
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
                {jobData.location} {jobData.isRemote && '(Remote)'}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 1 }}>
                Job Type
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
                {jobData.jobType.replace('_', ' ')}
              </Typography>
              
              {(jobData.salaryMin || jobData.salaryMax) && (
                <>
                  <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 1 }}>
                    Salary Range
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
                    {jobData.currency} {jobData.salaryMin} - {jobData.salaryMax}
                  </Typography>
                </>
              )}
              
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 1 }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, whiteSpace: 'pre-wrap' }}>
                {jobData.description}
              </Typography>
            </Box>
            
            {errors.submit && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.submit}
              </Alert>
            )}
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #121212 0%, #2C2C2C 100%)',
      py: 4 
    }}>
      <StyledContainer>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          aria-label="breadcrumb" 
          sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}
          separator={<NavigateNextIcon fontSize="small" />}
        >
          <Link 
            color="inherit" 
            href="/employer/dashboard"
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              '&:hover': { color: '#FFD700' }
            }}
          >
            Dashboard
          </Link>
          <Typography sx={{ color: '#FFD700' }}>
            Post New Job
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <StyledPaper>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <WorkIcon sx={{ color: '#FFD700', fontSize: '2rem', mr: 2 }} />
            <Box>
              <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Post a New Job
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Create a compelling job listing to attract top talent in Jamaica
              </Typography>
            </Box>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel 
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-active': {
                        color: '#FFD700'
                      },
                      '&.Mui-completed': {
                        color: '#4CAF50'
                      }
                    }
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {step.label}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {step.description}
                    </Typography>
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </StyledPaper>

        {/* Step Content */}
        <StyledPaper>
          {renderStepContent(activeStep)}
        </StyledPaper>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<NavigateBeforeIcon />}
            sx={{ color: '#FFD700' }}
          >
            Back
          </Button>
          
          <Box sx={{ flex: 1 }} />
          
          {activeStep === steps.length - 1 ? (
            <ActionButton
              onClick={handleSubmit}
              disabled={isSubmitting}
              endIcon={<PublishIcon />}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Job'}
            </ActionButton>
          ) : (
            <ActionButton
              onClick={handleNext}
              endIcon={<NavigateNextIcon />}
            >
              Next
            </ActionButton>
          )}
        </Box>
      </StyledContainer>
    </Box>
  );
};

export default EmployerPostJobPageNew;