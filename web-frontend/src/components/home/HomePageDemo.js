import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  styled,
  Fade
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import OptimizedHeroSection from './OptimizedHeroSection';
import EnhancedRoleSelection from '../auth/EnhancedRoleSelection';
import MobileOptimizedNav from '../navigation/MobileOptimizedNav';
import Seo from '../common/Seo';

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(6)
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: 16,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main
  }
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(0, 150, 57, 0.1), rgba(255, 215, 0, 0.1))',
  border: '1px solid',
  borderColor: theme.palette.primary.main,
  borderRadius: 12,
  textAlign: 'center',
  padding: theme.spacing(2)
}));

/**
 * Enhanced Homepage Demo
 * Showcases new UI/UX optimizations
 */
const HomePageDemo = () => {
  const navigate = useNavigate();
  
  const [roleSelectionOpen, setRoleSelectionOpen] = useState(false);

  // Mock statistics
  const stats = [
    { label: 'Active Jobs', value: '2,847', icon: <WorkIcon /> },
    { label: 'Companies', value: '1,234', icon: <BusinessIcon /> },
    { label: 'Job Seekers', value: '15,678', icon: <PersonIcon /> },
    { label: 'Success Rate', value: '89%', icon: <TrendingUpIcon /> }
  ];

  // Feature highlights
  const features = [
    {
      title: 'Enhanced Search Experience',
      description: 'Smart autocomplete, search history, and location intelligence make finding jobs effortless.',
      icon: '🔍',
      color: 'primary',
      action: () => navigate('/jobs-demo')
    },
    {
      title: 'Personalized Job Matching',
      description: 'AI-powered recommendations based on your skills, experience, and preferences.',
      icon: '🎯',
      color: 'secondary',
      action: () => navigate('/jobs-demo')
    },
    {
      title: 'Mobile-First Design',
      description: 'Optimized for mobile devices with touch-friendly controls and responsive layouts.',
      icon: '📱',
      color: 'success',
      action: () => navigate('/jobs-demo')
    },
    {
      title: 'Jamaican Cultural Branding',
      description: 'Authentic design that celebrates Jamaican culture while maintaining professional standards.',
      icon: '🇯🇲',
      color: 'warning',
      action: () => navigate('/jobs-demo')
    }
  ];

  const handleSearch = (searchParams) => {
    // Navigate to demo search with parameters
    const queryParams = new URLSearchParams();
    if (searchParams.query) queryParams.set('q', searchParams.query);
    if (searchParams.location) queryParams.set('location', searchParams.location);
    
    navigate(`/jobs-demo?${queryParams.toString()}`);
  };

  const handleRoleSelection = (role) => {
    setRoleSelectionOpen(false);
    if (role === 'JOBSEEKER') {
      navigate('/jobs-demo');
    } else {
      navigate('/employer/jobs');
    }
  };

  return (
    <>
      <Seo 
        title="JamDung Jobs - Enhanced UI/UX Demo"
        description="Experience the future of job searching in Jamaica with our enhanced UI/UX optimizations."
      />

      {/* Enhanced Navigation */}
      <MobileOptimizedNav />

      {/* Optimized Hero Section */}
      <OptimizedHeroSection 
        onSearch={handleSearch}
        onGetStarted={() => setRoleSelectionOpen(true)}
        showStats={true}
        showTestimonials={true}
      />

      <StyledContainer>
        {/* Platform Statistics */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              textAlign: 'center', 
              mb: 4, 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #009639, #FFD700)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Platform Statistics
          </Typography>
          
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Fade in timeout={600 + index * 200}>
                  <StatsCard>
                    <Box sx={{ color: 'primary.main', mb: 1 }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {stat.label}
                    </Typography>
                  </StatsCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* UI/UX Enhancement Features */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              textAlign: 'center', 
              mb: 2, 
              fontWeight: 700 
            }}
          >
            UI/UX Enhancements
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              textAlign: 'center', 
              color: 'text.secondary', 
              mb: 4,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Experience the next generation of job searching with our comprehensive UI/UX optimizations designed for the Jamaican market.
          </Typography>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Fade in timeout={800 + index * 200}>
                  <FeatureCard onClick={feature.action}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Box 
                          sx={{ 
                            fontSize: '2rem', 
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: `${feature.color}.light`,
                            color: `${feature.color}.main`
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                            {feature.description}
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color={feature.color}
                            size="small"
                            onClick={feature.action}
                          >
                            Try It Out
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </FeatureCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box 
          sx={{ 
            textAlign: 'center',
            py: 6,
            px: 3,
            background: 'linear-gradient(135deg, rgba(0, 150, 57, 0.05), rgba(255, 215, 0, 0.05))',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Ready to Experience the Future?
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, maxWidth: 500, mx: 'auto' }}>
            Join thousands of Jamaicans who are already using our enhanced platform to find their dream jobs.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/jobs-demo')}
              sx={{ minWidth: 200 }}
            >
              Try Enhanced Search
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => setRoleSelectionOpen(true)}
              sx={{ minWidth: 200 }}
            >
              Get Started
            </Button>
          </Box>
        </Box>

        {/* Demo Links */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Explore Individual Components
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip 
              label="Enhanced Search" 
              onClick={() => navigate('/jobs-demo')}
              clickable
              color="primary"
            />
            <Chip 
              label="Role Selection" 
              onClick={() => setRoleSelectionOpen(true)}
              clickable
              color="secondary"
            />
            <Chip 
              label="Original Homepage" 
              onClick={() => navigate('/')}
              clickable
              variant="outlined"
            />
            <Chip 
              label="Original Search" 
              onClick={() => navigate('/jobs')}
              clickable
              variant="outlined"
            />
          </Box>
        </Box>
      </StyledContainer>

      {/* Enhanced Role Selection Modal */}
      <EnhancedRoleSelection
        open={roleSelectionOpen}
        onClose={() => setRoleSelectionOpen(false)}
        onRoleSelect={handleRoleSelection}
        variant="modal"
        showStats={true}
        showTestimonials={true}
      />
    </>
  );
};

export default HomePageDemo;
