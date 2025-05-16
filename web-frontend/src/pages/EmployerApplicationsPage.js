import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import ApplicationsReview from '../components/employer/ApplicationsReview';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const EmployerApplicationsPage = () => {
  const { currentUser } = useAuth();

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: '/employer/applications' }} />;
  }

  // Redirect to dashboard if user is a job seeker
  if (currentUser.role === 'JOBSEEKER') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <ApplicationsReview />
      </Box>
    </Container>
  );
};

export default EmployerApplicationsPage;
