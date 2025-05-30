import React from 'react';
import { Box, Typography, Button, Container, styled } from '@mui/material';
import { Link } from 'react-router-dom';

// Styled container for Jamaican theme
const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    maxWidth: '1100px',
  },
}));

const EmployerDashboard = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0A0A0A',
        position: 'relative',
        padding: 3
      }}
    >
      <StyledContainer>
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 600, mb: 2 }}>
            Redirecting to New Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
            The original dashboard has been replaced with an improved version.
          </Typography>
          <Button 
            component={Link} 
            to="/employer/dashboard"
            variant="contained"
            sx={{ 
              backgroundColor: '#2C5530',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1E3D20'
              }
            }}
          >
            Go to New Dashboard
          </Button>
        </Box>
      </StyledContainer>
    </Box>
  );
};

export default EmployerDashboard;
