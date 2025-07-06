import React from 'react';
import { Navigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import ApplicationsReview from '../components/employer/ApplicationsReview';
import { useAuth } from '../context/AuthContext';

const EmployerApplicationsPage = () => {
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: '/employer/applications' }} />;
  }

  // Redirect to dashboard if user is a job seeker
  if (user.role === 'JOBSEEKER') {
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
