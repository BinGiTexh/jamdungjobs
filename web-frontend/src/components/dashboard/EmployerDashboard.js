import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid
} from '@mui/material';
import {
  Work as WorkIcon,
  PersonAdd as PersonAddIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import WelcomeHeader from './WelcomeHeader';
import StatsCard from './StatsCard';
import RecentApplicationsWidget from './RecentApplicationsWidget';
import JobPostingPerformance from './JobPostingPerformance';
import NotificationsPanel from './NotificationsPanel';
import QuickActions from './QuickActions';
import UpcomingInterviews from './UpcomingInterviews';

const EmployerDashboard = () => {
  const { } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    activeJobs: 0,
    newApplications: 0,
    interviews: 0,
    filled: 0
  });
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('jamdung_auth_token');
        
        // Fetch employer jobs
        const jobsResponse = await fetch('http://localhost:5000/api/employer/jobs', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        let activeJobs = 0;
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          activeJobs = jobsData.jobs?.filter(job => job.status === 'active').length || 0;
        }
        
        // Fetch applications
        const applicationsResponse = await fetch('http://localhost:5000/api/employer/applications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        let newApplications = 0;
        let interviews = 0;
        let filled = 0;
        
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          const applications = applicationsData.applications || [];
          
          // Count applications from last 7 days as "new"
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          newApplications = applications.filter(app => 
            new Date(app.createdAt) > weekAgo
          ).length;
          
          interviews = applications.filter(app => app.status === 'interview').length;
          filled = applications.filter(app => app.status === 'accepted').length;
        } else {
          // Mock data for demo
          activeJobs = Math.floor(Math.random() * 10) + 3;
          newApplications = Math.floor(Math.random() * 25) + 5;
          interviews = Math.floor(Math.random() * 8) + 2;
          filled = Math.floor(Math.random() * 5) + 1;
        }
        
        setDashboardStats({
          activeJobs,
          newApplications,
          interviews,
          filled
        });
        
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Set mock data on error
        setDashboardStats({
          activeJobs: 5,
          newApplications: 12,
          interviews: 3,
          filled: 2
        });
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
          <WelcomeHeader userType="employer" />
        </Grid>
        
        {/* Key Metrics */}
        <Grid item xs={12} md={6} lg={3}>
          <StatsCard 
            title="Active Job Posts" 
            value={dashboardStats.activeJobs} 
            icon={WorkIcon}
            trend="+12%"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatsCard 
            title="New Applications" 
            value={dashboardStats.newApplications} 
            icon={PersonAddIcon}
            trend="+25%"
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatsCard 
            title="Interviews Scheduled" 
            value={dashboardStats.interviews} 
            icon={EventIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatsCard 
            title="Positions Filled" 
            value={dashboardStats.filled} 
            icon={CheckCircleIcon}
            trend="+8%"
            color="warning"
          />
        </Grid>
        
        {/* Main Dashboard Content */}
        <Grid item xs={12} lg={8}>
          <RecentApplicationsWidget />
          <JobPostingPerformance />
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <NotificationsPanel />
          <QuickActions userType="employer" />
          
          <UpcomingInterviews />
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmployerDashboard;
