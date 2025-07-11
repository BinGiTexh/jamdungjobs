import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  Fade,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Person as ProfileIcon,
  Work as ApplicationsIcon,
  Dashboard as DashboardIcon,
  KeyboardArrowLeft as BackIcon,
  KeyboardArrowRight as NextIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';

const TourDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%)',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    borderRadius: '16px',
    maxWidth: '500px',
    margin: theme.spacing(2)
  }
}));

const ActionButton = styled(Button)(() => ({
  background: 'linear-gradient(90deg, #FFD700, #009639)',
  color: '#000000',
  fontWeight: 600,
  borderRadius: '8px',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(90deg, #009639, #FFD700)',
    transform: 'translateY(-1px)'
  }
}));

const FeatureCard = styled(Card)(() => ({
  background: 'rgba(45, 45, 45, 0.6)',
  border: '1px solid rgba(255, 215, 0, 0.1)',
  borderRadius: '12px',
  marginBottom: '16px'
}));

const OnboardingTour = ({ open, onClose, userRole = 'JOBSEEKER' }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);

  const jobseekerSteps = [
    {
      label: 'Welcome to JamDung Jobs',
      title: `Welcome, ${user?.firstName}! 🇯🇲`,
      content: (
        <Box>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
            Welcome to Jamaica's premier job search platform! Let's take a quick tour to help you get started.
          </Typography>
          <FeatureCard>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                Find Your Dream Job
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Search thousands of jobs across Jamaica, from Kingston to Montego Bay
              </Typography>
            </CardContent>
          </FeatureCard>
        </Box>
      ),
      icon: <DashboardIcon />
    },
    {
      label: 'Complete Your Profile',
      title: 'Build Your Professional Profile',
      content: (
        <Box>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
            A complete profile increases your chances of getting hired by up to 5x!
          </Typography>
          <FeatureCard>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                What to Include:
              </Typography>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, paddingLeft: '20px' }}>
                <li>Upload your resume (PDF, DOC, DOCX)</li>
                <li>Add your skills and expertise</li>
                <li>Include education and work experience</li>
                <li>Complete contact information</li>
              </ul>
            </CardContent>
          </FeatureCard>
        </Box>
      ),
      icon: <ProfileIcon />
    },
    {
      label: 'Search for Jobs',
      title: 'Find Jobs That Match You',
      content: (
        <Box>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
            Use our powerful search to find jobs that match your skills and preferences.
          </Typography>
          <FeatureCard>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                Search Features:
              </Typography>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, paddingLeft: '20px' }}>
                <li>Filter by location, salary, and job type</li>
                <li>Save jobs for later</li>
                <li>Get personalized recommendations</li>
                <li>Set up job alerts</li>
              </ul>
            </CardContent>
          </FeatureCard>
        </Box>
      ),
      icon: <SearchIcon />
    },
    {
      label: 'Apply and Track',
      title: 'Apply with Confidence',
      content: (
        <Box>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
            Apply to jobs with one click and track your application status in real-time.
          </Typography>
          <FeatureCard>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                Application Benefits:
              </Typography>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, paddingLeft: '20px' }}>
                <li>Quick apply with your saved profile</li>
                <li>Track application status</li>
                <li>Communicate directly with employers</li>
                <li>Get feedback on applications</li>
              </ul>
            </CardContent>
          </FeatureCard>
        </Box>
      ),
      icon: <ApplicationsIcon />
    }
  ];

  const employerSteps = [
    {
      label: 'Welcome to JamDung Jobs',
      title: `Welcome, ${user?.firstName}! 🇯🇲`,
      content: (
        <Box>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
            Welcome to Jamaica's premier talent marketplace! Let's help you find the best candidates.
          </Typography>
          <FeatureCard>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                Find Top Talent
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Access Jamaica's largest pool of qualified job seekers
              </Typography>
            </CardContent>
          </FeatureCard>
        </Box>
      ),
      icon: <DashboardIcon />
    },
    {
      label: 'Post Your First Job',
      title: 'Create Compelling Job Posts',
      content: (
        <Box>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
            Create detailed job posts that attract the right candidates.
          </Typography>
          <FeatureCard>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                Best Practices:
              </Typography>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, paddingLeft: '20px' }}>
                <li>Write clear job descriptions</li>
                <li>Include salary ranges</li>
                <li>Specify required skills</li>
                <li>Add company benefits</li>
              </ul>
            </CardContent>
          </FeatureCard>
        </Box>
      ),
      icon: <SearchIcon />
    },
    {
      label: 'Manage Applications',
      title: 'Review and Hire',
      content: (
        <Box>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
            Efficiently review applications and communicate with candidates.
          </Typography>
          <FeatureCard>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                Management Tools:
              </Typography>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, paddingLeft: '20px' }}>
                <li>Review resumes and profiles</li>
                <li>Filter and sort applications</li>
                <li>Schedule interviews</li>
                <li>Track hiring progress</li>
              </ul>
            </CardContent>
          </FeatureCard>
        </Box>
      ),
      icon: <ApplicationsIcon />
    }
  ];

  const steps = userRole === 'EMPLOYER' ? employerSteps : jobseekerSteps;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFinish = () => {
    // Mark onboarding as completed
    localStorage.setItem('onboarding_completed', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onClose();
  };

  return (
    <TourDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 600 }}>
            Getting Started
          </Typography>
          <IconButton 
            onClick={onClose}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            aria-label="Close onboarding tour"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel sx={{
                '& .MuiStepLabel-label': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-active': {
                    color: '#FFD700'
                  },
                  '&.Mui-completed': {
                    color: '#4CAF50'
                  }
                }
              }}>
                {!isMobile && step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Fade in key={activeStep}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {React.cloneElement(steps[activeStep].icon, {
                sx: { color: '#FFD700', mr: 2, fontSize: '2rem' }
              })}
              <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                {steps[activeStep].title}
              </Typography>
            </Box>
            {steps[activeStep].content}
          </Box>
        </Fade>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleSkip}
          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          Skip Tour
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<BackIcon />}
          sx={{ color: '#FFD700', mr: 1 }}
        >
          Back
        </Button>
        
        {activeStep === steps.length - 1 ? (
          <ActionButton onClick={handleFinish}>
            Get Started!
          </ActionButton>
        ) : (
          <ActionButton onClick={handleNext} endIcon={<NextIcon />}>
            Next
          </ActionButton>
        )}
      </DialogActions>
    </TourDialog>
  );
};

export default OnboardingTour;