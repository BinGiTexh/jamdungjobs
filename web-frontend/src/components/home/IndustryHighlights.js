/**
 * Industry Highlights Component
 * Showcases Jamaica's growing industries with simplified language
 * Positioned after user pathways section
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
  Computer as TechIcon,
  Hotel as TourismIcon,
  AccountBalance as FinanceIcon,
  LocalHospital as HealthIcon,
  School as EducationIcon,
  Factory as ManufacturingIcon,
  TrendingUp as GrowthIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Industry Highlights Section
 * Showcases key industries in Jamaica with job opportunities
 */
const IndustryHighlights = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Simplified industry data with plain language
  const industries = [
    {
      id: 'technology',
      name: 'Technology & Communications', 
      description: 'Computer jobs, IT support, and digital services',
      icon: TechIcon,
      color: 'var(--color-primary)',
      jobCount: 245,
      growth: '+15%',
      searchTerm: 'technology'
    },
    {
      id: 'tourism',
      name: 'Tourism & Hospitality', 
      description: 'Hotels, restaurants, and travel services',
      icon: TourismIcon,
      color: 'var(--color-secondary)',
      jobCount: 380,
      growth: '+12%',
      searchTerm: 'hospitality'
    },
    {
      id: 'finance',
      name: 'Banking & Finance', 
      description: 'Banks, insurance companies, and money services',
      icon: FinanceIcon,
      color: 'var(--color-accent)',
      jobCount: 195,
      growth: '+18%',
      searchTerm: 'finance'
    },
    {
      id: 'healthcare',
      name: 'Healthcare & Medicine', 
      description: 'Hospitals, clinics, nursing, and medical services',
      icon: HealthIcon,
      color: '#2E7D32', 
      jobCount: 165,
      growth: '+22%',
      searchTerm: 'healthcare'
    },
    {
      id: 'education',
      name: 'Education & Training', 
      description: 'Schools, colleges, and training programs',
      icon: EducationIcon,
      color: '#7B1FA2', 
      jobCount: 125,
      growth: '+8%',
      searchTerm: 'education'
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing & Production', 
      description: 'Factories, production lines, and quality control',
      icon: ManufacturingIcon,
      color: '#F57C00', 
      jobCount: 210,
      growth: '+10%',
      searchTerm: 'manufacturing'
    }
  ];

  const handleViewJobs = (industry) => {
    navigate(`/search?q=${industry.searchTerm}`);
  };

  const handleBrowseAll = () => {
    navigate('/search');
  };

  const sectionStyles = {
    py: { xs: 6, md: 8 },
    backgroundColor: isDark 
      ? 'rgba(255, 255, 255, 0.02)' 
      : 'rgba(0, 0, 0, 0.02)',
    position: 'relative'
  };

  const cardStyles = {
    height: '100%',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    transition: prefersReducedMotion ? 'none' : 'all 0.3s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
      transform: prefersReducedMotion ? 'none' : 'translateY(-2px)',
      boxShadow: isDark 
        ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
        : '0 8px 24px rgba(0, 0, 0, 0.1)',
      borderColor: 'var(--color-primary)'
    },
    '&:focus-visible': {
      outline: '2px solid var(--color-primary)',
      outlineOffset: '2px'
    }
  };

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
              Jamaica's Growing Industries
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
              Find jobs in the industries that are growing and creating new opportunities across Jamaica
            </Typography>
          </Box>
        </Fade>

        {/* Industries Grid */}
        <Grid container spacing={3}>
          {industries.map((industry, index) => (
            <Grid item xs={12} sm={6} md={4} key={industry.id}>
              <Fade 
                in={isVisible} 
                timeout={800} 
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card 
                  sx={cardStyles}
                  onClick={() => handleViewJobs(industry)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleViewJobs(industry);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${industry.name} jobs`}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    {/* Industry Icon */}
                    <Avatar 
                      sx={{
                        width: 56,
                        height: 56,
                        backgroundColor: industry.color,
                        mb: 2,
                        mx: 'auto'
                      }}
                    >
                      <industry.icon sx={{ fontSize: '1.8rem', color: 'white' }} />
                    </Avatar>
                    
                    {/* Industry Name */}
                    <Typography 
                      variant="h6" 
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        color: 'var(--color-text-primary)',
                        fontSize: { xs: '1.1rem', md: '1.25rem' }
                      }}
                    >
                      {industry.name}
                    </Typography>
                    
                    {/* Description */}
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: 'var(--color-text-secondary)',
                        mb: 2,
                        lineHeight: 1.5,
                        fontSize: '0.95rem'
                      }}
                    >
                      {industry.description}
                    </Typography>
                    
                    {/* Stats Box */}
                    <Box 
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                        p: 1.5,
                        backgroundColor: isDark 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.03)',
                        borderRadius: '8px'
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                          fontSize: '0.9rem'
                        }}
                      >
                        {industry.jobCount} jobs
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <GrowthIcon 
                          sx={{ 
                            fontSize: '1rem', 
                            color: '#4CAF50' 
                          }} 
                        />
                        <Typography 
                          variant="body2" 
                          sx={{
                            color: '#4CAF50',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}
                        >
                          {industry.growth}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* View Jobs Button */}
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        minHeight: '40px',
                        borderColor: industry.color,
                        color: industry.color,
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: industry.color,
                          color: 'white'
                        },
                        '&:focus-visible': {
                          outline: '2px solid var(--color-primary)',
                          outlineOffset: '2px'
                        }
                      }}
                      aria-label={`View all ${industry.name} jobs`}
                    >
                      View Jobs
                    </Button>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Browse All CTA */}
        <Fade in={isVisible} timeout={1000} style={{ transitionDelay: '800ms' }}>
          <Box textAlign="center" mt={6}>
            <Typography 
              variant="body2" 
              sx={{
                color: 'var(--color-text-secondary)',
                mb: 2,
                fontSize: '0.95rem'
              }}
            >
              Don't see your industry? We have jobs in many other fields too.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleBrowseAll}
              sx={{
                backgroundColor: 'var(--color-primary)',
                minHeight: '48px',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                '&:focus-visible': {
                  outline: '2px solid var(--color-primary)',
                  outlineOffset: '2px'
                }
              }}
              aria-label="Browse all available jobs"
            >
              Browse All Jobs
            </Button>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default IndustryHighlights;
