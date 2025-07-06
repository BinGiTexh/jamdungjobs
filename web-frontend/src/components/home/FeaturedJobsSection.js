import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Skeleton,
  Alert
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Business as CompanyIcon,
  AttachMoney as SalaryIcon,
  AccessTime as TimeIcon,
  Star as FeaturedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { jamaicaColors } from '../../theme/jamaicaTheme';
import api from '../../utils/api';
import { logDev, logError } from '../../utils/loggingUtils';

/**
 * Featured Jobs Section Component
 * Displays highlighted job opportunities with Jamaican styling
 */
const FeaturedJobsSection = () => {
  const navigate = useNavigate();
  
  // State management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load featured jobs
  useEffect(() => {
    const loadFeaturedJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get jobs from API
        const response = await api.get('/api/jobs', {
          params: {
            limit: 8,
            page: 1
          }
        });

        const jobsData = response.data?.jobs || [];
        
        // Take first 6-8 jobs as "featured"
        const featuredJobs = jobsData.slice(0, 6).map(job => ({
          ...job,
          featured: true
        }));

        setJobs(featuredJobs);
        logDev('Featured jobs loaded:', featuredJobs.length);

      } catch (err) {
        logError('Failed to load featured jobs:', err);
        setError('Unable to load featured jobs. Please try again later.');
        
        // Fallback to mock data for demo
        setJobs([
          {
            id: 'demo-1',
            title: 'Software Developer',
            company: { name: 'TechCorp Jamaica' },
            location: 'Kingston, Jamaica',
            salary: 'JMD 1,200,000 - 1,800,000',
            type: 'FULL_TIME',
            posted_date: new Date().toISOString(),
            featured: true
          },
          {
            id: 'demo-2',
            title: 'Marketing Manager',
            company: { name: 'Caribbean Marketing Ltd' },
            location: 'Montego Bay, Jamaica',
            salary: 'JMD 900,000 - 1,400,000',
            type: 'FULL_TIME',
            posted_date: new Date(Date.now() - 86400000).toISOString(),
            featured: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedJobs();
  }, []);

  // Format salary display
  const formatSalary = (salary) => {
    if (!salary) return null;
    return salary.replace(/JMD\s*/i, 'JMD ');
  };

  // Format posted date
  const formatPostedDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently posted';
    }
  };

  // Handle job click
  const handleJobClick = (job) => {
    navigate(`/jobs/${job.id}`);
  };

  // Handle view all jobs
  const handleViewAllJobs = () => {
    navigate('/search/basic');
  };

  // Loading skeleton
  const JobCardSkeleton = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={20} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="text" width="30%" height={16} />
          <Skeleton variant="text" width="25%" height={16} />
        </Box>
        <Skeleton variant="rectangular" width="100%" height={36} />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: jamaicaColors.background.paper }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              color: jamaicaColors.text.primary,
              mb: 2,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 4,
                backgroundColor: jamaicaColors.primary.main,
                borderRadius: 2
              }
            }}
          >
            Featured Opportunities
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: jamaicaColors.text.secondary,
              maxWidth: 600,
              mx: 'auto',
              mt: 3
            }}
          >
            Discover hand-picked job opportunities from Jamaica's top employers
          </Typography>
        </Box>

        {/* Error Display */}
        {error && !loading && (
          <Alert 
            severity="warning" 
            sx={{ mb: 4 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Jobs Grid */}
        <Grid container spacing={3}>
          {loading ? (
            // Loading skeletons
            [...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} lg={4} key={index}>
                <JobCardSkeleton />
              </Grid>
            ))
          ) : (
            // Job cards
            jobs.map((job) => (
              <Grid item xs={12} sm={6} lg={4} key={job.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: `1px solid ${jamaicaColors.primary.main}20`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 150, 57, 0.15)',
                      borderColor: jamaicaColors.primary.main
                    }
                  }}
                  onClick={() => handleJobClick(job)}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Featured Badge */}
                    {job.featured && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                        <Chip
                          icon={<FeaturedIcon sx={{ fontSize: 16 }} />}
                          label="Featured"
                          size="small"
                          sx={{
                            backgroundColor: jamaicaColors.secondary.main,
                            color: jamaicaColors.text.primary,
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              color: jamaicaColors.text.primary
                            }
                          }}
                        />
                      </Box>
                    )}

                    {/* Job Title */}
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        color: jamaicaColors.primary.main,
                        mb: 1,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {job.title}
                    </Typography>

                    {/* Company */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CompanyIcon sx={{ fontSize: 18, color: jamaicaColors.text.secondary, mr: 1 }} />
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: jamaicaColors.text.primary
                        }}
                      >
                        {job.company?.name || 'Company Name'}
                      </Typography>
                    </Box>

                    {/* Job Details */}
                    <Box sx={{ flex: 1, mb: 3 }}>
                      {/* Location */}
                      {job.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationIcon sx={{ fontSize: 16, color: jamaicaColors.text.secondary, mr: 1 }} />
                          <Typography variant="body2" sx={{ color: jamaicaColors.text.secondary }}>
                            {job.location}
                          </Typography>
                        </Box>
                      )}

                      {/* Salary */}
                      {job.salary && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SalaryIcon sx={{ fontSize: 16, color: jamaicaColors.text.secondary, mr: 1 }} />
                          <Typography variant="body2" sx={{ color: jamaicaColors.text.secondary }}>
                            {formatSalary(job.salary)}
                          </Typography>
                        </Box>
                      )}

                      {/* Posted Date */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TimeIcon sx={{ fontSize: 16, color: jamaicaColors.text.secondary, mr: 1 }} />
                        <Typography variant="body2" sx={{ color: jamaicaColors.text.secondary }}>
                          {formatPostedDate(job.posted_date)}
                        </Typography>
                      </Box>

                      {/* Job Type */}
                      {job.type && (
                        <Chip
                          label={job.type.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: jamaicaColors.primary.main,
                            color: jamaicaColors.primary.main,
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </Box>

                    {/* Apply Button */}
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: jamaicaColors.primary.main,
                        py: 1.5,
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: jamaicaColors.primary.dark
                        }
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* View All Jobs CTA */}
        {!loading && jobs.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleViewAllJobs}
              sx={{
                borderColor: jamaicaColors.primary.main,
                color: jamaicaColors.primary.main,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  borderColor: jamaicaColors.primary.dark,
                  backgroundColor: `${jamaicaColors.primary.main}08`
                }
              }}
            >
              View All Jobs
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default FeaturedJobsSection;
