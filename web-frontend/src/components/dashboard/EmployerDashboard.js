import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const DashboardCard = styled(Card)(() => ({
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
  border: '1px solid rgba(255, 215, 0, 0.2)',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(255, 215, 0, 0.15)',
    borderColor: 'rgba(255, 215, 0, 0.4)'
  }
}));

const ActionButton = styled(Button)(() => ({
  background: 'linear-gradient(90deg, #FFD700, #009639)',
  color: '#000000',
  fontWeight: 600,
  borderRadius: '8px',
  padding: '12px 24px',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(90deg, #009639, #FFD700)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
  },
  transition: 'all 0.3s ease'
}));

const SecondaryButton = styled(Button)(() => ({
  color: '#FFD700',
  borderColor: '#FFD700',
  borderRadius: '8px',
  padding: '12px 24px',
  textTransform: 'none',
  '&:hover': {
    borderColor: '#009639',
    color: '#009639',
    background: 'rgba(255, 215, 0, 0.1)'
  }
}));

const StatsCard = ({ title, value, icon, color = '#FFD700', onClick, subtitle }) => (
  <DashboardCard sx={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" sx={{ color: color, fontWeight: 'bold', mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color: color, opacity: 0.8 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </DashboardCard>
);

const QuickActionCard = ({ title, description, icon, onClick, primary = false }) => (
  <DashboardCard>
    <CardContent sx={{ textAlign: 'center', p: 3 }}>
      <Box sx={{ color: '#FFD700', mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        {description}
      </Typography>
      {primary ? (
        <ActionButton fullWidth onClick={onClick}>
          Get Started
        </ActionButton>
      ) : (
        <SecondaryButton variant="outlined" fullWidth onClick={onClick}>
          Manage
        </SecondaryButton>
      )}
    </CardContent>
  </DashboardCard>
);

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    jobViews: 0,
    companyProfile: 0
  });

  useEffect(() => {
    const fetchEmployerDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch real data from multiple endpoints
        const dataPromises = [
          // Fetch active job listings
          api.get('/api/employer/jobs').catch(() => ({ data: [] })),
          // Fetch applications received for employer's jobs
          api.get('/api/employer/applications').catch(() => ({ data: [] })),
          // Fetch job views analytics (if endpoint exists)
          api.get('/api/employer/analytics/job-views').catch(() => ({ data: { totalViews: 0 } })),
          // Fetch employer profile completion
          api.get('/api/employer/profile').catch(() => ({ data: user }))
        ];
        
        const [jobsResponse, applicationsResponse, analyticsResponse, profileResponse] = await Promise.all(dataPromises);
        
        // Extract real data or default to 0
        const activeJobs = Array.isArray(jobsResponse.data) ? jobsResponse.data.filter(job => job.status === 'ACTIVE' || job.status === 'PUBLISHED').length : 0;
        const allApplications = Array.isArray(applicationsResponse.data) ? applicationsResponse.data : [];
        const totalApplications = allApplications.length;
        
        // Calculate new applications (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newApplications = allApplications.filter(app => 
          app.appliedAt && new Date(app.appliedAt) > oneWeekAgo
        ).length;
        
        // Get job views from analytics
        const jobViews = analyticsResponse.data?.totalViews || analyticsResponse.data?.count || 0;
        
        // Calculate company profile completion (simplified for now)
        const profileCompletion = profileResponse.data?.companyProfile ? 90 : 
          (profileResponse.data?.firstName && profileResponse.data?.lastName && profileResponse.data?.email) ? 60 : 30;
        
        
        setDashboardData({
          activeJobs,
          totalApplications,
          newApplications,
          jobViews,
          companyProfile: profileCompletion
        });
        
      } catch (error) {
        console.error('Error fetching employer dashboard data:', error); // eslint-disable-line no-console
        // Fallback to zeros if all API calls fail
        setDashboardData({
          activeJobs: 0,
          totalApplications: 0,
          newApplications: 0,
          jobViews: 0,
          companyProfile: 30
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployerDashboardData();
  }, [user]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
      >
        <CircularProgress sx={{ color: '#FFD700' }} />
      </Box>
    );
  }

  const isCompanyProfileIncomplete = dashboardData.companyProfile < 90;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0a0a0a', py: 4 }}>
      <Container maxWidth="lg">
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography 
            variant="h3" 
            sx={{ 
              color: '#FFFFFF', 
              fontWeight: 'bold', 
              mb: 1,
              background: 'linear-gradient(90deg, #FFD700, #009639)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Welcome back, {user?.firstName}!
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Find your next great hire with JamDung Jobs
          </Typography>
        </Box>

        {/* Company Profile Alert */}
        {isCompanyProfileIncomplete && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4, 
              backgroundColor: 'rgba(0, 150, 57, 0.1)',
              border: '1px solid rgba(0, 150, 57, 0.3)',
              color: '#009639'
            }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => navigate('/employer/profile')}
                sx={{ color: '#009639' }}
              >
                Complete Now
              </Button>
            }
          >
            Your company profile is {dashboardData.companyProfile}% complete. 
            Complete it to attract better candidates!
          </Alert>
        )}

        {/* Dashboard Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Active Job Listings"
              value={dashboardData.activeJobs}
              icon={<WorkIcon sx={{ fontSize: 40 }} />}
              onClick={() => navigate('/employer/jobs')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="New Applications"
              value={dashboardData.newApplications}
              subtitle="This week"
              icon={<PeopleIcon sx={{ fontSize: 40 }} />}
              color="#009639"
              onClick={() => navigate('/employer/applications')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Applications"
              value={dashboardData.totalApplications}
              subtitle="All time"
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="#4CAF50"
              onClick={() => navigate('/employer/applications')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Job Views"
              value={dashboardData.jobViews}
              subtitle="This month"
              icon={<VisibilityIcon sx={{ fontSize: 40 }} />}
              color="#FF6B35"
              onClick={() => navigate('/employer/analytics')}
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 3, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <QuickActionCard
              title="Post New Job"
              description="Create a job listing to find your next great hire"
              icon={<AddIcon sx={{ fontSize: 48 }} />}
              onClick={() => navigate('/employer/jobs')}
              primary
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <QuickActionCard
              title="Review Applications"
              description="View and manage candidate applications"
              icon={<PeopleIcon sx={{ fontSize: 48 }} />}
              onClick={() => navigate('/employer/applications')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <QuickActionCard
              title="Company Profile"
              description="Update your company information and branding"
              icon={<BusinessIcon sx={{ fontSize: 48 }} />}
              onClick={() => navigate('/employer/profile')}
            />
          </Grid>
        </Grid>

        {/* Additional Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <QuickActionCard
              title="View Analytics"
              description="Track your hiring performance and job post effectiveness"
              icon={<AnalyticsIcon sx={{ fontSize: 48 }} />}
              onClick={() => navigate('/employer/analytics')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <QuickActionCard
              title="Billing & Subscription"
              description="Manage your subscription and billing information"
              icon={<SettingsIcon sx={{ fontSize: 48 }} />}
              onClick={() => navigate('/employer/billing')}
            />
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 3, fontWeight: 600 }}>
          Recent Activity
        </Typography>
        
        <DashboardCard>
          <CardContent>
            <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
              No recent activity. Start by posting your first job or reviewing applications!
            </Typography>
          </CardContent>
        </DashboardCard>
      </Container>
    </Box>
  );
};

export default EmployerDashboard;