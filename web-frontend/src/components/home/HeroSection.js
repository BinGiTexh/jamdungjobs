import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const underlineExpand = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;

const HeroContainer = styled(Box)(() => ({
  minHeight: '70vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  backgroundColor: '#1A1A1A',
  background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("/images/generated/jamaican-design-1747273968.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.3,
    zIndex: 1
  }
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  textAlign: 'center',
  padding: theme.spacing(8, 2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(12, 2)
  }
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #FFD700, #009639)',
  color: '#000000',
  fontSize: '1.1rem',
  fontWeight: 600,
  padding: '16px 32px',
  borderRadius: '8px',
  textTransform: 'none',
  minWidth: '200px',
  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
  '&:hover': {
    background: 'linear-gradient(90deg, #009639, #FFD700)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)'
  },
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('sm')]: {
    minWidth: '100%',
    marginBottom: theme.spacing(2)
  }
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  color: '#FFD700',
  borderColor: '#FFD700',
  borderWidth: '2px',
  fontSize: '1.1rem',
  fontWeight: 500,
  padding: '16px 32px',
  borderRadius: '8px',
  textTransform: 'none',
  minWidth: '200px',
  '&:hover': {
    borderColor: '#009639',
    color: '#009639',
    background: 'rgba(255, 215, 0, 0.1)',
    borderWidth: '2px'
  },
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('sm')]: {
    minWidth: '100%'
  }
}));

const HeroSection = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleJobSeekerAction = () => {
    if (user) {
      navigate(user.role === 'JOBSEEKER' ? '/candidate/dashboard' : '/jobs');
    } else {
      navigate('/jobs');
    }
  };

  const handleEmployerAction = () => {
    if (user) {
      navigate(user.role === 'EMPLOYER' ? '/employer/dashboard' : '/employer/post-job');
    } else {
      navigate('/login', { state: { employerRedirect: true } });
    }
  };

  return (
    <HeroContainer>
      <ContentWrapper maxWidth="lg">
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
            fontWeight: 900,
            mb: 3,
            color: '#FFFFFF',
            textShadow: '0 2px 30px rgba(255, 215, 0, 0.3)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '4px',
              background: 'linear-gradient(90deg, #FFD700, #009639)',
              borderRadius: '2px',
              animation: `${underlineExpand} 1.5s ease-out forwards`,
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
            }
          }}
        >
          Find Your Dream Job in Jamaica
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: '#FFFFFF',
            opacity: 0.9,
            mb: 2,
            fontWeight: 400,
            fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' }
          }}
        >
          Where Opportunities Flow Like Island Rhythms
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: '#FFFFFF',
            opacity: 0.8,
            mb: 6,
            maxWidth: '600px',
            mx: 'auto',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            lineHeight: 1.6
          }}
        >
          Connect with top employers and discover exciting career opportunities across Jamaica's growing industries
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <PrimaryButton
              onClick={handleJobSeekerAction}
              fullWidth={isMobile}
              aria-label="Find jobs - navigate to job search page"
            >
              Find Jobs
            </PrimaryButton>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SecondaryButton
              variant="outlined"
              onClick={handleEmployerAction}
              fullWidth={isMobile}
              aria-label="Post a job - navigate to employer section"
            >
              Post a Job
            </SecondaryButton>
          </Grid>
        </Grid>
      </ContentWrapper>
    </HeroContainer>
  );
};

export default HeroSection;
