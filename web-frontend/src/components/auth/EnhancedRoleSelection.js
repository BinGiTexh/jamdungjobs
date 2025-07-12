import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  useTheme,
  Fade
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  PostAdd as PostJobIcon,
  Analytics as AnalyticsIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Enhanced Role Selection Component
 * Provides clear value proposition for each user type
 */
const EnhancedRoleSelection = ({
  onRoleSelect,
  showBackButton = true,
  title = 'Welcome to JamDung Jobs! ',
  subtitle = 'Choose your path to get started',
  variant = 'modal' // 'modal', 'page', 'inline'
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);

  // Role configurations with enhanced details
  const roles = {
    jobseeker: {
      title: "I'm Looking for Work",
      subtitle: 'Find your next opportunity in Jamaica',
      icon: PersonIcon,
      color: theme.palette.primary.main,
      gradient: 'linear-gradient(135deg, #009639, #4CAF50)',
      features: [
        { icon: SearchIcon, text: 'Search thousands of jobs' },
        { icon: WorkIcon, text: 'One-click job applications' },
        { icon: AnalyticsIcon, text: 'Track application status' },
        { icon: TrendingUpIcon, text: 'Get personalized recommendations' }
      ],
      stats: [
        { label: 'Active Jobs', value: '2,500+' },
        { label: 'Companies', value: '450+' },
        { label: 'Success Rate', value: '85%' }
      ],
      cta: 'Start Job Search',
      description: 'Join thousands of Jamaicans who have found their dream jobs through our platform.'
    },
    employer: {
      title: "I'm Hiring Talent",
      subtitle: 'Find the best candidates in Jamaica',
      icon: BusinessIcon,
      color: theme.palette.secondary.main,
      gradient: 'linear-gradient(135deg, #FFD700, #FFA000)',
      features: [
        { icon: PostJobIcon, text: 'Post jobs in minutes' },
        { icon: GroupIcon, text: 'Access qualified candidates' },
        { icon: AnalyticsIcon, text: 'Track hiring performance' },
        { icon: TrendingUpIcon, text: 'Employer branding tools' }
      ],
      stats: [
        { label: 'Candidates', value: '15,000+' },
        { label: 'Avg. Time to Hire', value: '12 days' },
        { label: 'Success Rate', value: '92%' }
      ],
      cta: 'Start Hiring',
      description: 'Connect with top talent and build your team with Jamaica\'s leading job platform.'
    }
  };

  const handleRoleSelect = (roleType) => {
    setSelectedRole(roleType);
    // Add slight delay for visual feedback
    setTimeout(() => {
      if (onRoleSelect) {
        onRoleSelect(roleType);
      } else {
        navigate(`/register?type=${roleType}`);
      }
    }, 200);
  };

  const getContainerStyles = () => {
    switch (variant) {
      case 'page':
        return {
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          py: 4
        };
      case 'inline':
        return {
          py: 3
        };
      default: // modal
        return {
          p: { xs: 2, md: 3 }
        };
    }
  };

  return (
    <Box sx={getContainerStyles()}>
      <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
        {/* Header */}
        <Fade in timeout={600}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                background: 'linear-gradient(45deg, #009639, #FFD700)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.75rem', md: '2.25rem' }
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '1rem', md: '1.125rem' }
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        </Fade>

        {/* Role Selection Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Object.entries(roles).map(([roleType, role], index) => {
            const IconComponent = role.icon;
            const isSelected = selectedRole === roleType;
            const isHovered = hoveredRole === roleType;
            
            return (
              <Grid item xs={12} md={6} key={roleType}>
                <Fade in timeout={800 + index * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      border: '3px solid',
                      borderColor: isSelected ? role.color : 'transparent',
                      background: isHovered ? `${role.color}08` : 'background.paper',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                      boxShadow: isHovered ? theme.shadows[12] : theme.shadows[2],
                      '&:hover': {
                        borderColor: role.color
                      }
                    }}
                    onClick={() => handleRoleSelect(roleType)}
                    onMouseEnter={() => setHoveredRole(roleType)}
                    onMouseLeave={() => setHoveredRole(null)}
                  >
                    <CardContent sx={{ p: { xs: 2, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Header */}
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: role.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                            transition: 'transform 0.3s ease'
                          }}
                        >
                          <IconComponent sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                          {role.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {role.subtitle}
                        </Typography>
                      </Box>

                      {/* Features */}
                      <List dense sx={{ mb: 2, flex: 1 }}>
                        {role.features.map((feature, idx) => {
                          const FeatureIcon = feature.icon;
                          return (
                            <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <FeatureIcon sx={{ fontSize: 20, color: role.color }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={feature.text}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  sx: { fontWeight: 500 }
                                }}
                              />
                            </ListItem>
                          );
                        })}
                      </List>

                      {/* Stats */}
                      <Box sx={{ mb: 3 }}>
                        <Grid container spacing={1}>
                          {role.stats.map((stat, idx) => (
                            <Grid item xs={4} key={idx}>
                              <Paper 
                                sx={{ 
                                  p: 1, 
                                  textAlign: 'center',
                                  backgroundColor: `${role.color}10`,
                                  border: `1px solid ${role.color}30`
                                }}
                              >
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    color: role.color,
                                    fontSize: '1rem'
                                  }}
                                >
                                  {stat.value}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: 'text.secondary',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  {stat.label}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>

                      {/* Description */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary', 
                          mb: 3,
                          fontStyle: 'italic',
                          textAlign: 'center'
                        }}
                      >
                        {role.description}
                      </Typography>

                      {/* CTA Button */}
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        endIcon={isSelected ? <CheckIcon /> : <ArrowIcon />}
                        sx={{
                          background: role.gradient,
                          fontWeight: 600,
                          py: 1.5,
                          '&:hover': {
                            background: role.gradient,
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[8]
                          }
                        }}
                        disabled={isSelected}
                      >
                        {isSelected ? 'Selected!' : role.cta}
                      </Button>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>

        {/* Additional Information */}
        <Fade in timeout={1200}>
          <Box sx={{ textAlign: 'center' }}>
            <Paper 
              sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, rgba(0, 150, 57, 0.05), rgba(255, 215, 0, 0.05))',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Why Choose JamDung Jobs?
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      #1
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Job Platform in Jamaica
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                      50K+
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Successful Connections
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      24/7
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Support Available
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Fade>

        {/* Back Button */}
        {showBackButton && variant !== 'inline' && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="text"
              onClick={() => navigate(-1)}
              sx={{ color: 'text.secondary' }}
            >
              ← Back
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EnhancedRoleSelection;
