import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  styled
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Styled components for Jamaican theme
const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    maxWidth: '1100px'
  }
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
    zIndex: 0
  }
}));

// This component has been replaced with EmployerPostJobPageNew
const EmployerPostJobPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #121212 0%, #2C2C2C 100%)',
      py: 6,
      position: 'relative'
    }}>
      <StyledContainer>
        <StyledPaper>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            This component has been deprecated. Please use EmployerPostJobPageNew instead.
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            This component has been replaced with an improved version that includes a multi-step form with job preview and draft saving functionality.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/employer/dashboard')}
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
              Go to Dashboard
            </Button>
          </Box>
        </StyledPaper>
      </StyledContainer>
    </Box>
  );
};

export default EmployerPostJobPage;
