import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  styled,
  CircularProgress,
  Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import { useAuth } from '../context/AuthContext';
import { logDev, logError } from '../utils/loggingUtils';
import EnhancedSearchBar from './search/EnhancedSearchBar';
import EmptySearchState from './search/EmptySearchState';
import { SalaryDisplay } from './common/SalaryDisplay';
import QuickApplyModal from './jobseeker/QuickApplyModal';
import Seo from './common/Seo';

// Styled components for enhanced UI
const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    maxWidth: '1200px',
    padding: theme.spacing(4)
  }
}));



const JobCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  border: '2px solid transparent',
  borderRadius: 12,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main
  }
}));

const SearchHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(0, 150, 57, 0.05), rgba(255, 215, 0, 0.05))',
  borderRadius: 16,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  border: '1px solid',
  borderColor: theme.palette.divider
}));

/**
 * Enhanced Job Search Demo Component
 * Showcases new UI/UX optimizations
 */
const JobSearchDemo = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [quickApplyJob, setQuickApplyJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // Mock job data for demonstration
  const mockJobs = [
    {
      id: 1,
      title: 'Software Developer',
      company: 'Tech Solutions JA',
      location: 'Kingston',
      type: 'FULL_TIME',
      salary: { min: 80000, max: 120000, currency: 'JMD' },
      skills: ['JavaScript', 'React', 'Node.js'],
      description: 'Join our dynamic team building innovative solutions for Jamaican businesses.',
      postedDate: '2024-12-01',
      isUrgent: false,
      matchScore: 85
    },
    {
      id: 2,
      title: 'Marketing Manager',
      company: 'Caribbean Marketing Co.',
      location: 'Spanish Town',
      type: 'FULL_TIME',
      salary: { min: 70000, max: 100000, currency: 'JMD' },
      skills: ['Digital Marketing', 'Social Media', 'Analytics'],
      description: 'Lead marketing initiatives for top Caribbean brands.',
      postedDate: '2024-12-02',
      isUrgent: true,
      matchScore: 72
    },
    {
      id: 3,
      title: 'Customer Service Representative',
      company: 'Jamaica Call Center',
      location: 'Montego Bay',
      type: 'FULL_TIME',
      salary: { min: 45000, max: 60000, currency: 'JMD' },
      skills: ['Communication', 'Problem Solving', 'Customer Service'],
      description: 'Provide excellent customer support for international clients.',
      postedDate: '2024-12-03',
      isUrgent: false,
      matchScore: 90
    }
  ];

  // Search functionality
  const handleSearch = async (searchParams) => {
    setLoading(true);
    setSearchQuery(searchParams.query || '');
    setSearchLocation(searchParams.location || '');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Filter mock jobs based on search
      let filteredJobs = mockJobs;
      
      if (searchParams.query) {
        filteredJobs = filteredJobs.filter(job =>
          job.title.toLowerCase().includes(searchParams.query.toLowerCase()) ||
          job.company.toLowerCase().includes(searchParams.query.toLowerCase()) ||
          job.skills.some(skill => skill.toLowerCase().includes(searchParams.query.toLowerCase()))
        );
      }

      if (searchParams.location) {
        filteredJobs = filteredJobs.filter(job =>
          job.location.toLowerCase().includes(searchParams.location.toLowerCase())
        );
      }

      setJobs(filteredJobs);
      
      logDev('info', 'Search completed', {
        query: searchParams.query,
        location: searchParams.location,
        resultsCount: filteredJobs.length
      });

    } catch (error) {
      logError('Search failed', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Quick apply functionality
  const handleQuickApply = (job) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setQuickApplyJob(job);
  };

  const handleApplicationSuccess = (jobId) => {
    setAppliedJobs(prev => new Set([...prev, jobId]));
    setQuickApplyJob(null);
  };

  // Email signup for job alerts
  const handleEmailSignup = async (email, searchContext) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      logDev('info', 'Email signup successful', { email, searchContext });
      return true;
    } catch (error) {
      logError('Email signup failed', error);
      return false;
    }
  };

  // Load initial jobs
  useEffect(() => {
    handleSearch({ query: '', location: '' });
  }, []);

  const formatJobType = (type) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'default';
  };

  return (
    <>
      <Seo 
        title="Find Jobs in Jamaica - JamDung Jobs"
        description="Search thousands of job opportunities across Jamaica. Find your perfect job match with our enhanced search experience."
      />
      
      <StyledContainer>
        {/* Enhanced Search Header */}
        <SearchHeader>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              textAlign: 'center',
              background: 'linear-gradient(45deg, #009639, #FFD700)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Find Your Dream Job in Jamaica
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              textAlign: 'center', 
              color: 'text.secondary', 
              mb: 3,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Experience our enhanced search with smart suggestions, location intelligence, and personalized recommendations.
          </Typography>

          {/* Enhanced Search Bar */}
          <EnhancedSearchBar
            onSearch={handleSearch}
            variant="hero"
            size="large"
            placeholder="Try 'Software Developer', 'Marketing', or 'Customer Service'..."
            showSuggestions={true}
          />
        </SearchHeader>

        {/* Search Results */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : jobs.length > 0 ? (
          <Fade in timeout={600}>
            <Box>
              {/* Results Header */}
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {jobs.length} Job{jobs.length !== 1 ? 's' : ''} Found
                  {searchQuery && ` for "${searchQuery}"`}
                  {searchLocation && ` in ${searchLocation}`}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {searchQuery && (
                    <Chip 
                      label={`Search: ${searchQuery}`} 
                      onDelete={() => handleSearch({ query: '', location: searchLocation })}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {searchLocation && (
                    <Chip 
                      label={`Location: ${searchLocation}`} 
                      onDelete={() => handleSearch({ query: searchQuery, location: '' })}
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>

              {/* Job Cards Grid */}
              <Grid container spacing={3}>
                {jobs.map((job) => (
                  <Grid item xs={12} md={6} lg={4} key={job.id}>
                    <JobCard>
                      <CardContent sx={{ p: 3 }}>
                        {/* Job Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {job.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                              {job.company?.name || 'Company'}
                            </Typography>
                          </Box>
                          
                          {job.isUrgent && (
                            <Chip 
                              label="Urgent" 
                              color="error" 
                              size="small"
                              icon={<FlashOnIcon />}
                            />
                          )}
                        </Box>

                        {/* Job Details */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {job.location}
                            </Typography>
                            <Chip 
                              label={formatJobType(job.type)} 
                              size="small" 
                              sx={{ ml: 1 }}
                            />
                          </Box>
                          
                          <SalaryDisplay 
                            salary={job.salary}
                            variant="compact"
                          />
                        </Box>

                        {/* Skills */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {job.skills.slice(0, 3).map((skill) => (
                              <Chip 
                                key={skill} 
                                label={skill} 
                                size="small" 
                                variant="outlined"
                              />
                            ))}
                            {job.skills.length > 3 && (
                              <Chip 
                                label={`+${job.skills.length - 3} more`} 
                                size="small" 
                                variant="outlined"
                                color="primary"
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Match Score */}
                        {isAuthenticated && job.matchScore && (
                          <Box sx={{ mb: 2 }}>
                            <Chip
                              label={`${job.matchScore}% Match`}
                              color={getMatchScoreColor(job.matchScore)}
                              size="small"
                              icon={<CheckCircleIcon />}
                            />
                          </Box>
                        )}

                        {/* Description */}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary', 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {job.description}
                        </Typography>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => handleQuickApply(job)}
                            disabled={appliedJobs.has(job.id)}
                            startIcon={appliedJobs.has(job.id) ? <CheckCircleIcon /> : <WorkIcon />}
                          >
                            {appliedJobs.has(job.id) ? 'Applied' : 'Quick Apply'}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </JobCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade>
        ) : (
          /* Enhanced Empty State */
          <EmptySearchState
            searchQuery={searchQuery}
            searchLocation={searchLocation}
            onNewSearch={handleSearch}
            onEmailSignup={handleEmailSignup}
            showEmailCapture={true}
            showSuggestions={true}
          />
        )}

        {/* Quick Apply Modal */}
        {quickApplyJob && (
          <QuickApplyModal
            job={quickApplyJob}
            open={Boolean(quickApplyJob)}
            onClose={() => setQuickApplyJob(null)}
            onSuccess={() => handleApplicationSuccess(quickApplyJob.id)}
          />
        )}
      </StyledContainer>
    </>
  );
};

export default JobSearchDemo;
