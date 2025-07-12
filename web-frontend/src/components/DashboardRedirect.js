import React from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import EmployerDashboard from './dashboard/EmployerDashboard';
import JobSeekerDashboard from './dashboard/JobSeekerDashboard';

/**
 * Component that renders the appropriate dashboard based on user role
 * Employers render EmployerDashboard
 * Candidates render JobSeekerDashboard
 */
const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  console.log('🔄 DashboardRedirect - User info:', {
    role: user?.role,
    email: user?.email,
    loading
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Render the appropriate dashboard based on user role
  if (user.role === 'EMPLOYER') {
    console.log('👔 Rendering Employer Dashboard');
    return <EmployerDashboard />;
  } else if (user.role === 'JOBSEEKER') {
    console.log('👤 Rendering Jobseeker Dashboard');
    return <JobSeekerDashboard />;
  } else {
    console.log('❓ Unknown role, rendering Jobseeker Dashboard as fallback');
    return <JobSeekerDashboard />;
  }
};

export default DashboardRedirect;
