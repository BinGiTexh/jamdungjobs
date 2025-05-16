import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import ApplicationsList from '../components/jobseeker/ApplicationsList';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// Background component for Jamaican theme
const BackgroundImage = styled('div')`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('/images/generated/jamaican-design-1747273968.png');
  background-size: cover;
  background-position: center;
  opacity: 0.15;
  z-index: 0;
`;

const ApplicationsPage = () => {
  const { user } = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: '/applications' }} />;
  }

  // Redirect to dashboard if user is an employer
  if (user.role === 'EMPLOYER') {
    return <Navigate to="/employer/dashboard" />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0A0A0A',
        position: 'relative',
        pt: 4,
        pb: 8
      }}
    >
      <BackgroundImage />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in={showContent} timeout={800}>
          <Box>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                mb: 4,
                backgroundColor: 'rgba(20, 20, 20, 0.85)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Card background gradient */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(44, 85, 48, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%)',
                  opacity: 0.3,
                }}
              />
              
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h4" component="h1" sx={{ 
                  mb: 4, 
                  color: '#FFD700',
                  fontWeight: 600,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}>
                  My Applications
                </Typography>
                
                <ApplicationsList />
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default ApplicationsPage;
