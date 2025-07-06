import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  PersonAdd as RegisterIcon,
  Search as SearchIcon,
  Work as ApplyIcon,
  Business as PostIcon,
  People as ReviewIcon,
  HandshakeOutlined as HireIcon
} from '@mui/icons-material';

const SectionContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#1A1A1A',
  padding: theme.spacing(8, 0),
  position: 'relative'
}));

const ProcessCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 215, 0, 0.15)',
  borderRadius: '16px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
    boxShadow: '0 8px 25px rgba(255, 215, 0, 0.1)',
    '& .step-icon': {
      transform: 'scale(1.1)',
      backgroundColor: '#FFD700'
    },
    '& .step-number': {
      color: '#000000'
    }
  }
}));

const StepIcon = styled(Box)(() => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 215, 0, 0.15)',
  border: '2px solid #FFD700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px',
  transition: 'all 0.3s ease-in-out',
  position: 'relative'
}));

const StepNumber = styled(Typography)(() => ({
  position: 'absolute',
  top: -8,
  right: -8,
  width: 28,
  height: 28,
  borderRadius: '50%',
  backgroundColor: '#009639',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.9rem',
  fontWeight: 700,
  transition: 'all 0.3s ease-in-out'
}));

const HowItWorks = () => {

  const jobSeekerSteps = [
    {
      icon: RegisterIcon,
      title: 'Create Your Profile',
      description: 'Sign up and build your professional profile with your skills, experience, and career goals.'
    },
    {
      icon: SearchIcon,
      title: 'Find Perfect Jobs',
      description: 'Browse thousands of job opportunities or use our smart filters to find roles that match your interests.'
    },
    {
      icon: ApplyIcon,
      title: 'Apply & Get Hired',
      description: 'Submit applications with one click and connect directly with employers who want to meet you.'
    }
  ];

  const employerSteps = [
    {
      icon: PostIcon,
      title: 'Post Your Job',
      description: 'Create detailed job listings that attract the right candidates for your open positions.'
    },
    {
      icon: ReviewIcon,
      title: 'Review Applications',
      description: 'Use our tools to filter and review qualified candidates who match your requirements.'
    },
    {
      icon: HireIcon,
      title: 'Hire Top Talent',
      description: 'Connect with your ideal candidates and build your dream team with Jamaica\'s best professionals.'
    }
  ];

  const ProcessSection = ({ title, steps, accentColor }) => (
    <Box sx={{ mb: 8 }}>
      <Typography
        variant="h3"
        sx={{
          fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
          fontWeight: 700,
          mb: 5,
          color: accentColor,
          textAlign: 'center'
        }}
      >
        {title}
      </Typography>
      
      <Grid container spacing={4}>
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <Grid item xs={12} md={4} key={index}>
              <ProcessCard>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <StepIcon className="step-icon">
                    <IconComponent
                      sx={{
                        fontSize: '2rem',
                        color: '#FFD700',
                        transition: 'color 0.3s ease-in-out'
                      }}
                    />
                    <StepNumber className="step-number">
                      {index + 1}
                    </StepNumber>
                  </StepIcon>
                  
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#FFFFFF',
                      fontWeight: 600,
                      mb: 2,
                      fontSize: { xs: '1.3rem', sm: '1.5rem' }
                    }}
                  >
                    {step.title}
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#FFFFFF',
                      opacity: 0.8,
                      fontSize: '1rem',
                      lineHeight: 1.6
                    }}
                  >
                    {step.description}
                  </Typography>
                </CardContent>
              </ProcessCard>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  return (
    <SectionContainer>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 700,
            mb: 2,
            color: '#FFD700',
            textAlign: 'center'
          }}
        >
          How It Works
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            color: '#FFFFFF',
            opacity: 0.8,
            mb: 8,
            textAlign: 'center',
            maxWidth: '600px',
            mx: 'auto',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            lineHeight: 1.6
          }}
        >
          Getting started on JamDung Jobs is simple. Choose your path and follow these easy steps.
        </Typography>

        <ProcessSection
          title="For Job Seekers"
          steps={jobSeekerSteps}
          accentColor="#009639"
        />
        
        <ProcessSection
          title="For Employers"
          steps={employerSteps}
          accentColor="#FFD700"
        />

        <Box
          sx={{
            textAlign: 'center',
            mt: 6,
            p: 4,
            backgroundColor: 'rgba(255, 215, 0, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 215, 0, 0.15)'
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: '#FFD700',
              fontWeight: 600,
              mb: 2
            }}
          >
            Ready to Get Started?
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              color: '#FFFFFF',
              opacity: 0.8,
              mb: 3,
              maxWidth: '500px',
              mx: 'auto'
            }}
          >
            Join thousands of professionals and employers who have found success through JamDung Jobs. Your next opportunity is just a few clicks away.
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Box
              component="button"
              sx={{
                background: 'linear-gradient(90deg, #FFD700, #009639)',
                color: '#000000',
                fontSize: '1rem',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: '8px',
                textTransform: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '140px',
                '&:hover': {
                  background: 'linear-gradient(90deg, #009639, #FFD700)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                }
              }}
            >
              Find Jobs
            </Box>
            
            <Box
              component="button"
              sx={{
                backgroundColor: 'transparent',
                color: '#FFD700',
                fontSize: '1rem',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: '8px',
                textTransform: 'none',
                border: '2px solid #FFD700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '140px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Post Jobs
            </Box>
          </Box>
        </Box>
      </Container>
    </SectionContainer>
  );
};

export default HowItWorks;