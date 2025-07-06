import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
  Card,
  CardContent,
  useTheme,
  Fade,
  Slide,
  Chip,
  Avatar,
  Paper
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EnhancedSearchBar from '../search/EnhancedSearchBar';

/**
 * Optimized Hero Section Component
 * Enhanced content hierarchy and user engagement
 */
const OptimizedHeroSection = ({
  onSearch,
  showStats = true,
  showTestimonials = true,
  backgroundVariant = 'gradient' // 'gradient', 'image', 'minimal'
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  // Animation states
  const [animationStep, setAnimationStep] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);

  // Dynamic content
  const [currentJobCount, setCurrentJobCount] = useState(2847);
  const [currentCompanyCount, setCurrentCompanyCount] = useState(456);

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Manager",
      company: "Kingston Digital",
      avatar: "SJ",
      quote: "Found my dream job in just 2 weeks!",
      rating: 5
    },
    {
      name: "Marcus Brown",
      role: "Software Developer",
      company: "Tech Solutions JA",
      avatar: "MB",
      quote: "The best platform for tech jobs in Jamaica.",
      rating: 5
    },
    {
      name: "Lisa Campbell",
      role: "HR Director",
      company: "Caribbean Corp",
      avatar: "LC",
      quote: "We've hired 15+ amazing candidates here.",
      rating: 5
    }
  ];

  // Live stats (mock real-time updates)
  const stats = [
    {
      icon: WorkIcon,
      value: currentJobCount.toLocaleString(),
      label: 'Active Jobs',
      color: theme.palette.primary.main,
      trend: '+12% this week'
    },
    {
      icon: BusinessIcon,
      value: currentCompanyCount.toLocaleString(),
      label: 'Companies Hiring',
      color: theme.palette.secondary.main,
      trend: '+8% this month'
    },
    {
      icon: PersonIcon,
      value: '15,000+',
      label: 'Job Seekers',
      color: theme.palette.success.main,
      trend: '+25% this month'
    },
    {
      icon: TrendingIcon,
      value: '92%',
      label: 'Success Rate',
      color: theme.palette.info.main,
      trend: 'Industry leading'
    }
  ];

  // Animation sequence
  useEffect(() => {
    const sequence = [
      () => setAnimationStep(1), // 500ms
      () => setAnimationStep(2), // 1000ms
      () => setAnimationStep(3), // 1500ms
      () => setStatsVisible(true) // 2000ms
    ];

    sequence.forEach((step, index) => {
      setTimeout(step, (index + 1) * 500);
    });

    // Simulate live stats updates
    const statsInterval = setInterval(() => {
      setCurrentJobCount(prev => prev + Math.floor(Math.random() * 3));
      if (Math.random() > 0.7) {
        setCurrentCompanyCount(prev => prev + 1);
      }
    }, 10000);

    return () => clearInterval(statsInterval);
  }, []);

  // Background styles
  const getBackgroundStyles = () => {
    switch (backgroundVariant) {
      case 'image':
        return {
          background: 'linear-gradient(135deg, rgba(0, 150, 57, 0.9), rgba(255, 215, 0, 0.8)), url("/images/jamaica-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      case 'minimal':
        return {
          background: theme.palette.background.default
        };
      default: // gradient
        return {
          background: 'linear-gradient(135deg, #009639 0%, #4CAF50 50%, #FFD700 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        };
    }
  };

  const handleSearch = (searchParams) => {
    if (onSearch) {
      onSearch(searchParams);
    } else {
      const params = new URLSearchParams();
      if (searchParams.query) params.append('search', searchParams.query);
      if (searchParams.location) params.append('location', searchParams.location);
      navigate(`/jobs?${params.toString()}`);
    }
  };

  const handleRoleSelection = (role) => {
    navigate(`/register?type=${role}`);
  };

  return (
    <Box
      sx={{
        minHeight: { xs: '80vh', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        py: { xs: 4, md: 8 },
        ...getBackgroundStyles()
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Main Content */}
          <Grid item xs={12} md={7}>
            <Box sx={{ color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
              {/* Welcome Message for Authenticated Users */}
              {isAuthenticated && currentUser && (
                <Fade in={animationStep >= 1} timeout={600}>
                  <Box sx={{ mb: 3 }}>
                    <Chip
                      label={`Welcome back, ${currentUser.firstName || currentUser.email}!`}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                    />
                  </Box>
                </Fade>
              )}

              {/* Main Headline */}
              <Fade in timeout={800}>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                    lineHeight: 1.1,
                    mb: 2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  Find Your Dream Job
                  <br />
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(45deg, #FFD700, #FFA000)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: 'none'
                    }}
                  >
                    in Jamaica
                  </Box>
                </Typography>
              </Fade>

              {/* Subtitle */}
              <Slide direction="up" in={animationStep >= 1} timeout={600}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 400,
                    mb: 4,
                    opacity: 0.95,
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    maxWidth: 500,
                    mx: { xs: 'auto', md: 0 }
                  }}
                >
                  Connect with top employers across Jamaica. 
                  Your next career opportunity is just a search away.
                </Typography>
              </Slide>

              {/* Search Bar */}
              <Slide direction="up" in={animationStep >= 2} timeout={600}>
                <Box sx={{ mb: 4 }}>
                  <EnhancedSearchBar
                    onSearch={handleSearch}
                    variant="hero"
                    size="large"
                    placeholder="Search jobs, companies, or skills..."
                  />
                </Box>
              </Slide>

              {/* Quick Action Buttons for Non-Authenticated Users */}
              {!isAuthenticated && (
                <Slide direction="up" in={animationStep >= 3} timeout={600}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2,
                      mb: 4
                    }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => handleRoleSelection('jobseeker')}
                      startIcon={<PersonIcon />}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        py: 1.5,
                        px: 3,
                        '&:hover': {
                          backgroundColor: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[8]
                        }
                      }}
                    >
                      I'm Looking for Work
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => handleRoleSelection('employer')}
                      startIcon={<BusinessIcon />}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.7)',
                        color: 'white',
                        fontWeight: 600,
                        py: 1.5,
                        px: 3,
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      I'm Hiring Talent
                    </Button>
                  </Box>
                </Slide>
              )}

              {/* Trust Indicators */}
              <Fade in={animationStep >= 3} timeout={800}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} sx={{ color: '#FFD700', fontSize: 20 }} />
                    ))}
                    <Typography variant="body2" sx={{ ml: 1, opacity: 0.9 }}>
                      4.9/5 Rating
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    • Trusted by 50,000+ Jamaicans
                  </Typography>
                </Box>
              </Fade>
            </Box>
          </Grid>

          {/* Stats & Testimonials */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Live Stats */}
              {showStats && (
                <Fade in={statsVisible} timeout={1000}>
                  <Paper
                    sx={{
                      p: 3,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                      Live Platform Stats
                    </Typography>
                    <Grid container spacing={2}>
                      {stats.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                          <Grid item xs={6} key={index}>
                            <Box sx={{ textAlign: 'center' }}>
                              <IconComponent sx={{ fontSize: 24, color: stat.color, mb: 1 }} />
                              <Typography variant="h6" sx={{ fontWeight: 700, color: stat.color }}>
                                {stat.value}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {stat.label}
                              </Typography>
                              <Chip
                                label={stat.trend}
                                size="small"
                                sx={{
                                  mt: 0.5,
                                  fontSize: '0.7rem',
                                  backgroundColor: `${stat.color}15`,
                                  color: stat.color
                                }}
                              />
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Paper>
                </Fade>
              )}

              {/* Featured Testimonial */}
              {showTestimonials && (
                <Slide direction="left" in={statsVisible} timeout={1200}>
                  <Card
                    sx={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            mr: 2,
                            width: 48,
                            height: 48
                          }}
                        >
                          {testimonials[0].avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {testimonials[0].name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {testimonials[0].role} at {testimonials[0].company}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                        "{testimonials[0].quote}"
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {[...Array(testimonials[0].rating)].map((_, i) => (
                          <StarIcon key={i} sx={{ color: '#FFD700', fontSize: 16 }} />
                        ))}
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          Verified Review
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Slide>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default OptimizedHeroSection;
