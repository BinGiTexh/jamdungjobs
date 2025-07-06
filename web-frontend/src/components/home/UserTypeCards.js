import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SectionContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#1A1A1A',
  padding: theme.spacing(8, 0),
  position: 'relative'
}));

const UserTypeCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 215, 0, 0.2)',
  borderRadius: '16px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 215, 0, 0.4)',
    boxShadow: '0 12px 30px rgba(255, 215, 0, 0.15)',
    '& .card-icon': {
      transform: 'scale(1.1)',
      color: '#FFD700'
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(0, 150, 57, 0.05) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
    zIndex: 0
  },
  '&:hover::before': {
    opacity: 1
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #FFD700, #009639)',
  color: '#000000',
  fontSize: '1.1rem',
  fontWeight: 600,
  padding: '14px 28px',
  borderRadius: '8px',
  textTransform: 'none',
  width: '100%',
  marginTop: theme.spacing(2),
  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)',
  '&:hover': {
    background: 'linear-gradient(90deg, #009639, #FFD700)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(255, 215, 0, 0.3)'
  },
  transition: 'all 0.3s ease'
}));

const UserTypeCards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleJobSeekerAction = () => {
    if (user) {
      navigate(user.role === 'JOBSEEKER' ? '/candidate/dashboard' : '/jobs');
    } else {
      navigate('/register');
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
          Choose Your Path
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            color: '#FFFFFF',
            opacity: 0.8,
            mb: 6,
            textAlign: 'center',
            maxWidth: '600px',
            mx: 'auto',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
          }}
        >
          Whether you're seeking your next opportunity or looking to build your dream team
        </Typography>

        <Grid container spacing={4}>
          {/* Job Seekers Card */}
          <Grid item xs={12} md={6}>
            <UserTypeCard>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                    gap: 2
                  }}
                >
                  <WorkIcon
                    className="card-icon"
                    sx={{
                      fontSize: '3rem',
                      color: '#009639',
                      transition: 'all 0.3s ease-in-out'
                    }}
                  />
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#FFD700',
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
                    }}
                  >
                    Job Seekers
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    color: '#FFFFFF',
                    opacity: 0.9,
                    mb: 3,
                    fontSize: '1.1rem',
                    lineHeight: 1.6
                  }}
                >
                  Discover exciting career opportunities across Jamaica's thriving industries. From tech startups to established corporations, find your perfect match.
                </Typography>

                <List sx={{ mb: 3 }}>
                  {[
                    'Browse hundreds of job listings',
                    'Apply with one click',
                    'Get matched with top employers',
                    'Build your professional profile'
                  ].map((text, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon sx={{ color: '#009639', fontSize: '1.2rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={text}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: '#FFFFFF',
                            opacity: 0.85,
                            fontSize: '1rem'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                <ActionButton
                  onClick={handleJobSeekerAction}
                  aria-label="Get started as job seeker"
                >
                  {user && user.role === 'JOBSEEKER' ? 'Go to Dashboard' : 'Start Job Search'}
                </ActionButton>
              </CardContent>
            </UserTypeCard>
          </Grid>

          {/* Employers Card */}
          <Grid item xs={12} md={6}>
            <UserTypeCard>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                    gap: 2
                  }}
                >
                  <BusinessIcon
                    className="card-icon"
                    sx={{
                      fontSize: '3rem',
                      color: '#009639',
                      transition: 'all 0.3s ease-in-out'
                    }}
                  />
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#FFD700',
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
                    }}
                  >
                    Employers
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    color: '#FFFFFF',
                    opacity: 0.9,
                    mb: 3,
                    fontSize: '1.1rem',
                    lineHeight: 1.6
                  }}
                >
                  Connect with Jamaica's top talent pool. Post jobs, review applications, and build your dream team with skilled professionals.
                </Typography>

                <List sx={{ mb: 3 }}>
                  {[
                    'Post unlimited job listings',
                    'Access qualified candidates',
                    'Advanced applicant filtering',
                    'Company branding tools'
                  ].map((text, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon sx={{ color: '#FFD700', fontSize: '1.2rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={text}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: '#FFFFFF',
                            opacity: 0.85,
                            fontSize: '1rem'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                <ActionButton
                  onClick={handleEmployerAction}
                  aria-label="Get started as employer"
                >
                  {user && user.role === 'EMPLOYER' ? 'Go to Dashboard' : 'Start Hiring'}
                </ActionButton>
              </CardContent>
            </UserTypeCard>
          </Grid>
        </Grid>
      </Container>
    </SectionContainer>
  );
};

export default UserTypeCards;