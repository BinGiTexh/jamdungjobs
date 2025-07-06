import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box
} from '@mui/material';
import {
  Send as SendIcon,
  Event as EventIcon,
  Visibility as VisibilityIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import WelcomeHeader from './WelcomeHeader';
import StatsCard from './StatsCard';
import ApplicationStatusOverview from './ApplicationStatusOverview';
import RecommendedJobs from './RecommendedJobs';
import SavedJobsSection from './SavedJobsSection';
import ProfileCompletionWidget from './ProfileCompletionWidget';
import RecentActivity from './RecentActivity';

const JobseekerDashboard = () => {
  const { } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    applications: 0,
    interviews: 0,
    profileViews: 0,
    jobMatches: 0
  });
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('jamdung_auth_token');
        
        // Fetch applications count
        const applicationsResponse = await fetch('http://localhost:5000/api/applications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        let applicationsCount = 0;
        let interviewsCount = 0;
        
        if (applicationsResponse.ok) {
          const applications = await applicationsResponse.json();
          applicationsCount = applications.length;
          interviewsCount = applications.filter(app => app.status === 'interview').length;
        }
        
        // Mock data for profile views and job matches (would come from analytics API)
        const profileViews = Math.floor(Math.random() * 50) + 10;
        const jobMatches = Math.floor(Math.random() * 20) + 5;
        
        setDashboardStats({
          applications: applicationsCount,
          interviews: interviewsCount,
          profileViews,
          jobMatches
        });
        
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Welcome Header */}
        <Grid item xs={12}>
          <WelcomeHeader userType="jobseeker" />
        </Grid>
        
        {/* Quick Stats Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <StatsCard 
            title="Applications Submitted" 
            value={dashboardStats.applications} 
            icon={SendIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatsCard 
            title="Interviews Scheduled" 
            value={dashboardStats.interviews} 
            icon={EventIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatsCard 
            title="Profile Views" 
            value={dashboardStats.profileViews} 
            icon={VisibilityIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatsCard 
            title="Job Matches" 
            value={dashboardStats.jobMatches} 
            icon={WorkIcon}
            color="warning"
          />
        </Grid>
        
        {/* Main Content Areas */}
        <Grid item xs={12} lg={8}>
          <ApplicationStatusOverview />
          <Box sx={{ mb: 3 }}>
            <SavedJobsSection />
          </Box>
          <RecommendedJobs />
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <ProfileCompletionWidget />
          
          {/* Recent Activity */}
          <Box sx={{ mb: 3 }}>
            <RecentActivity />
          </Box>
          
          {/* Upcoming Interviews Placeholder */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Upcoming Interviews
            </Typography>
            <Typography variant="body2" color="textSecondary">
              No upcoming interviews scheduled.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default JobseekerDashboard;
