/**
 * User Pathways Section
 * Clear, accessible dual pathways for job seekers and employers
 * Positioned after hero section with simplified language
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Avatar,
  Fade,
  useMediaQuery
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const UserPathways = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  const [stats, setStats] = useState({
    jobCount: 1250,
    companyCount: 180
  });
  const [isVisible, setIsVisible] = useState(false);

  // Fetch real statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/homepage');
        if (response.ok) {
          const data = await response.json();
          setStats({
            jobCount: data.totalJobs || 1250,
            companyCount: data.totalCompanies || 180
          });
        }
      } catch (error) {
        // Using fallback stats on API error
      }
    };

    fetchStats();
  }, []);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const sectionStyles = {
    py: { xs: 6, md: 8 },
    backgroundColor: 'var(--color-background)',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: 'linear-gradient(90deg, transparent 0%, var(--color-border) 50%, transparent 100%)',
      opacity: 0.3
    }
  };

  const cardStyles = {
    height: '100%',
    borderRadius: '16px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    transition: prefersReducedMotion ? 'none' : 'all 0.3s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
      transform: prefersReducedMotion ? 'none' : 'translateY(-4px)',
      boxShadow: isDark 
        ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
        : '0 8px 32px rgba(0, 0, 0, 0.12)',
      borderColor: 'var(--color-primary)'
    },
    '&:focus-visible': {
      outline: '2px solid var(--color-primary)',
      outlineOffset: '2px'
    }
  };

  const avatarStyles = (color) => ({
    width: 64,
    height: 64,
    backgroundColor: color,
    mb: 2,
    mx: 'auto'
  });

  const buttonStyles = {
    minHeight: '48px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '1rem',
    px: 4,
    py: 1.5,
    '&:focus-visible': {
      outline: '2px solid var(--color-primary)',
      outlineOffset: '2px'
    }
  };

  const pathways = [
    {
      id: 'job-seeker',
      title: 'Looking for Work?',
      description: 'Discover opportunities across Jamaica\'s growing industries',
      icon: SearchIcon,
      iconColor: 'var(--color-primary)',
      stat: `${stats.jobCount.toLocaleString()}+ jobs available`,
      buttonText: 'Browse Jobs',
      buttonColor: 'primary',
      action: () => navigate('/search'),
      ariaLabel: 'Browse available jobs in Jamaica'
    },
    {
      id: 'employer',
      title: 'Need Great Talent?',
      description: 'Post jobs and connect with skilled Jamaican professionals',
      icon: BusinessIcon,
      iconColor: 'var(--color-secondary)',
      stat: `${stats.companyCount.toLocaleString()}+ companies hiring`,
      buttonText: 'Post a Job',
      buttonColor: 'secondary',
      action: () => navigate('/employer/register'),
      ariaLabel: 'Post a job and find talented candidates'
    }
  ];

  return (
    <Box sx={sectionStyles}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Fade in={isVisible} timeout={600}>
          <Box textAlign="center" mb={6}>
            <Typography 
              variant="h2" 
              component="h2"
              sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '1.75rem', md: '2.25rem' }
              }}
            >
              Your Career Journey Starts Here
            </Typography>
            <Typography 
              variant="body1" 
              sx={{
                color: 'var(--color-text-secondary)',
                maxWidth: '600px',
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.125rem' },
                lineHeight: 1.6
              }}
            >
              Whether you're seeking your next opportunity or looking to hire top talent, 
              we connect Jamaica's workforce with meaningful careers.
            </Typography>
          </Box>
        </Fade>

        {/* Pathway Cards */}
        <Grid container spacing={4} justifyContent="center">
          {pathways.map((pathway, index) => (
            <Grid item xs={12} md={6} key={pathway.id}>
              <Fade 
                in={isVisible} 
                timeout={800} 
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <Card 
                  sx={cardStyles}
                  onClick={pathway.action}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      pathway.action();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={pathway.ariaLabel}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    {/* Icon */}
                    <Avatar sx={avatarStyles(pathway.iconColor)}>
                      <pathway.icon sx={{ fontSize: '2rem', color: 'white' }} />
                    </Avatar>

                    {/* Title */}
                    <Typography 
                      variant="h4" 
                      component="h3"
                      sx={{
                        color: 'var(--color-text-primary)',
                        fontWeight: 600,
                        mb: 2,
                        fontSize: { xs: '1.25rem', md: '1.5rem' }
                      }}
                    >
                      {pathway.title}
                    </Typography>

                    {/* Description */}
                    <Typography 
                      variant="body1" 
                      sx={{
                        color: 'var(--color-text-secondary)',
                        mb: 3,
                        lineHeight: 1.6,
                        fontSize: { xs: '0.95rem', md: '1rem' }
                      }}
                    >
                      {pathway.description}
                    </Typography>

                    {/* Statistics */}
                    <Box 
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        p: 2,
                        backgroundColor: isDark 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.03)',
                        borderRadius: '8px'
                      }}
                    >
                      <TrendingUpIcon 
                        sx={{ 
                          color: 'var(--color-primary)', 
                          mr: 1,
                          fontSize: '1.2rem'
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        sx={{
                          color: 'var(--color-text-primary)',
                          fontWeight: 600,
                          fontSize: '0.95rem'
                        }}
                      >
                        {pathway.stat}
                      </Typography>
                    </Box>

                    {/* Action Button */}
                    <Button
                      variant="contained"
                      color={pathway.buttonColor}
                      size="large"
                      sx={buttonStyles}
                      aria-label={pathway.ariaLabel}
                    >
                      {pathway.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Bottom CTA */}
        <Fade in={isVisible} timeout={1000} style={{ transitionDelay: '600ms' }}>
          <Box textAlign="center" mt={6}>
            <Typography 
              variant="body2" 
              sx={{
                color: 'var(--color-text-secondary)',
                mb: 2,
                fontSize: '0.95rem'
              }}
            >
              Join thousands of Jamaicans building their careers
            </Typography>
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                flexWrap: 'wrap'
              }}
            >
              <PeopleIcon sx={{ color: 'var(--color-primary)', fontSize: '1.2rem' }} />
              <Typography 
                variant="body2" 
                sx={{
                  color: 'var(--color-text-primary)',
                  fontWeight: 600
                }}
              >
                {(stats.jobCount + stats.companyCount * 10).toLocaleString()}+ professionals connected
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default UserPathways;
