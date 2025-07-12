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
  Search as SearchIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  BookmarkBorder as BookmarkIcon,
  Notifications as NotificationIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { calculateProfileCompletion } from '../../utils/profileCompletion';
import ProfileCompletionPrompt from '../onboarding/ProfileCompletionPrompt';
import OnboardingTour from '../onboarding/OnboardingTour';
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

const StatsCard = ({ title, value, icon, color = '#FFD700', onClick }) => (
  <DashboardCard sx={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" sx={{ color: color, fontWeight: 'bold', mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {title}
          </Typography>
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
          View
        </SecondaryButton>
      )}
    </CardContent>
  </DashboardCard>
);

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    applications: 0,
    savedJobs: 0,
    profileCompletion: 0,
    recommendedJobs: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch real data from multiple endpoints
        const dataPromises = [
          // Fetch profile data for completion calculation
          api.get('/api/jobseeker/profile').catch(() => ({ data: { data: user } })),
          // Fetch applications count
          api.get('/api/jobseeker/applications').catch(() => ({ data: [] })),
          // Fetch saved jobs count (if endpoint exists)
          api.get('/api/jobseeker/saved-jobs').catch(() => ({ data: [] })),
          // Fetch recommended jobs count (if endpoint exists)
          api.get('/api/jobs/recommended').catch(() => ({ data: [] }))
        ];
        
        const [profileResponse, applicationsResponse, savedJobsResponse, recommendedJobsResponse] = await Promise.all(dataPromises);
        
        // Extract the actual profile data from the nested response
        const actualProfileData = profileResponse.data?.data || profileResponse.data;
        
        // Calculate profile completion with real profile data
        const profileCompletionData = calculateProfileCompletion(actualProfileData);
        
        
        // Set real data or default to 0 if not available
        setDashboardData({
          applications: Array.isArray(applicationsResponse.data) ? applicationsResponse.data.length : (applicationsResponse.data?.count || 0),
          savedJobs: Array.isArray(savedJobsResponse.data) ? savedJobsResponse.data.length : (savedJobsResponse.data?.count || 0),
          profileCompletion: profileCompletionData.percentage,
          recommendedJobs: Array.isArray(recommendedJobsResponse.data) ? recommendedJobsResponse.data.length : (recommendedJobsResponse.data?.count || 0)
        });
        
        setProfileData(actualProfileData);
        
        // Check if user should see onboarding
        const hasSeenOnboarding = localStorage.getItem('onboarding_completed');
        if (!hasSeenOnboarding && user) {
          setShowOnboarding(true);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error); // eslint-disable-line no-console
        // Fallback to basic calculation with available user data
        const profileCompletionData = calculateProfileCompletion(user);
        setDashboardData({
          applications: 0,
          savedJobs: 0,
          profileCompletion: profileCompletionData.percentage,
          recommendedJobs: 0
        });
        setProfileData(user);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
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

  const isProfileIncomplete = dashboardData.profileCompletion < 80;

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
            Ready to take the next step in your career journey?
          </Typography>
        </Box>

        {/* Profile Completion Prompt */}
        <ProfileCompletionPrompt 
          profileData={profileData || user}
          onComplete={() => {
            // Profile completion handled automatically
          }}
        />

        {/* Profile Completion Alert */}
        {isProfileIncomplete && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 4, 
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              color: '#FFD700'
            }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => navigate('/profile')}
                sx={{ color: '#FFD700' }}
              >
                Complete Now
              </Button>
            }
          >
            Your profile is {dashboardData.profileCompletion}% complete. 
            Complete your profile to get better job matches!
          </Alert>
        )}

        {/* Dashboard Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Active Applications"
              value={dashboardData.applications}
              icon={<WorkIcon sx={{ fontSize: 40 }} />}
              onClick={() => navigate('/applications')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Saved Jobs"
              value={dashboardData.savedJobs}
              icon={<BookmarkIcon sx={{ fontSize: 40 }} />}
              color="#009639"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Profile Complete"
              value={`${dashboardData.profileCompletion}%`}
              icon={<PersonIcon sx={{ fontSize: 40 }} />}
              color="#FF6B35"
              onClick={() => navigate('/profile')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="New Matches"
              value={dashboardData.recommendedJobs}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="#4CAF50"
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
              title="Browse All Jobs"
              description="Explore thousands of opportunities across Jamaica"
              icon={<SearchIcon sx={{ fontSize: 48 }} />}
              onClick={() => navigate('/jobs')}
              primary
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <QuickActionCard
              title="Update Profile"
              description="Keep your profile current to get better matches"
              icon={<EditIcon sx={{ fontSize: 48 }} />}
              onClick={() => navigate('/profile')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <QuickActionCard
              title="Track Applications"
              description="View status and updates on your job applications"
              icon={<NotificationIcon sx={{ fontSize: 48 }} />}
              onClick={() => navigate('/applications')}
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
              No recent activity. Start by browsing jobs or updating your profile!
            </Typography>
          </CardContent>
        </DashboardCard>
      </Container>
      
      {/* Onboarding Tour */}
      <OnboardingTour
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        userRole={user?.role}
      />
    </Box>
  );
};

export default JobSeekerDashboard;