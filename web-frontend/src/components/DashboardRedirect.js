import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress } from '@mui/material';

/**
 * Component that redirects users to their appropriate dashboard based on role
 * Employers go to /employer/dashboard
 * Job seekers go to /candidate/dashboard
 */
const DashboardRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      if (user.role === 'EMPLOYER') {
        navigate('/employer/dashboard', { replace: true });
      } else if (user.role === 'JOBSEEKER') {
        navigate('/candidate/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);
  
  // Show loading while redirecting
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#0A0A0A'
    }}>
      <CircularProgress sx={{ color: '#FFD700', mb: 2 }} />
      <Typography variant="h6" sx={{ color: '#FFD700' }}>
        Redirecting to your dashboard...
      </Typography>
    </Box>
  );
};

export default DashboardRedirect;
