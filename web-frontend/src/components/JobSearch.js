import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  styled,
  CircularProgress,
  ButtonGroup,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { JobTitleInput } from './common/JobTitleInput';
import { JamaicaLocationAutocomplete } from './common/JamaicaLocationAutocomplete';
import { SkillsAutocomplete } from './common/SkillsAutocomplete';
import { SalaryRangeInput } from './common/SalaryRangeInput';
import { SalaryDisplay } from './common/SalaryDisplay';
import QuickApplyModal from './jobseeker/QuickApplyModal';
import axios from 'axios';
import { logDev, logError, sanitizeForLogging } from '../utils/loggingUtils';

// Styled components for Jamaican theme
const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    maxWidth: '1100px',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(20, 20, 20, 0.85)',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(44, 85, 48, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%)',
    opacity: 0.2,
    zIndex: 0,
  },
}));

// Reusable form field styling
const formFieldStyle = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    '& fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.5)',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.8)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#FFD700',
    fontWeight: 500,
  },
  '& .MuiInputBase-input': {
    color: 'white',
  },
  mb: 1,
};

const JobSearch = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    query: '',
    location: null, // Changed to null to store location object
    locationRadius: 10, // Default 10 km radius
    jobType: '',
    skills: [],
    salaryMin: 0,
    salaryMax: 300000,
    remote: false
  });
  const [loading, setLoading] = useState(false);
  const [resultsCount, setResultsCount] = useState(0);
  const [quickApplyJob, setQuickApplyJob] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'];

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Log filter changes in development
    logDev('debug', 'Search filter changed', {
      field,
      valueType: typeof value,
      isArray: Array.isArray(value),
      arrayLength: Array.isArray(value) ? value.length : null
    });
  };

  const calculateSkillMatchScore = (jobSkills, userSkills) => {
    if (!jobSkills || !userSkills || jobSkills.length === 0 || userSkills.length === 0) {
      logDev('debug', 'Skill match calculation skipped - missing skills', {
        hasJobSkills: !!jobSkills && jobSkills.length > 0,
        hasUserSkills: !!userSkills && userSkills.length > 0
      });
      return 0;
    }
    
    const matchedSkills = jobSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    
    const matchScore = (matchedSkills.length / jobSkills.length) * 100;
    
    // Log skill match calculation in development
    logDev('debug', 'Skill match calculated', {
      matchScore,
      matchedSkillsCount: matchedSkills.length,
      totalJobSkillsCount: jobSkills.length,
      totalUserSkillsCount: userSkills.length
    });
    
    return matchScore;
  };

  const searchJobs = useCallback(async () => {
    try {
      setLoading(true);
      
      logDev('debug', 'Initiating job search', sanitizeForLogging({
        query: filters.query,
        location: filters.location ? `${filters.location.name}, ${filters.location.parish || ''}` : null,
        radius: filters.locationRadius,
        jobType: filters.jobType,
        skillsCount: filters.skills.length,
        salaryRange: `${filters.salaryMin}-${filters.salaryMax}`,
        remote: filters.remote
      }));
      
      // Prepare search params
      let searchParams = { ...filters };
      
      // Format Jamaica-specific location data for the API
      if (filters.location) {
        // Convert the location object to a string for the API
        // The backend will parse this back into an object
        const locationString = filters.location.name || '';
        const parishString = filters.location.parish ? `, ${filters.location.parish}` : '';
        
        searchParams.location = `${locationString}${parishString}`;
        searchParams.locationRadius = filters.location.radius || filters.locationRadius;
        
        // Also include the structured data for the backend to use if it can parse JSON
        searchParams.locationData = JSON.stringify({
          name: filters.location.name,
          parish: filters.location.parish,
          placeId: filters.location.placeId,
          radius: filters.location.radius || filters.locationRadius
        });
      }
      
      logDev('debug', 'Searching with Jamaica-specific params:', sanitizeForLogging(searchParams));
      
      const response = await axios.get('/api/jobs/search', { params: searchParams });
      let jobResults = response.data.jobs || response.data;
      
      // Calculate skill match score for each job if skills filter is applied
      if (filters.skills && filters.skills.length > 0) {
        jobResults = jobResults.map(job => {
          const skillMatchScore = calculateSkillMatchScore(job.skills, filters.skills);
          return {
            ...job,
            skillMatchScore
          };
        });
        
        // Sort jobs by skill match score (highest first)
        jobResults.sort((a, b) => b.skillMatchScore - a.skillMatchScore);
      }
      
      logDev('info', 'Job search results processed', {
        resultCount: jobResults.length,
        resultsWithSkillMatch: jobResults.filter(job => job.skillMatchScore !== undefined).length,
        highMatchCount: jobResults.filter(job => job.skillMatchScore > 75).length
      });
      
      setJobs(jobResults);
      setResultsCount(jobResults.length);
    } catch (error) {
      logError('Error searching jobs', error, {
        module: 'JobSearch',
        function: 'searchJobs',
        filters: sanitizeForLogging(filters),
        endpoint: '/api/jobs/search'
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    searchJobs();
  }, [searchJobs]);

  const handleQuickApply = (job) => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login', { state: { from: `/jobs/${job.id}/apply` } });
      return;
    }
    
    if (currentUser && currentUser.role === 'EMPLOYER') {
      setSnackbar({
        open: true,
        message: 'Employers cannot apply for jobs. Please login as a job seeker.',
        severity: 'warning'
      });
      return;
    }
    
    // Open quick apply modal
    setQuickApplyJob(job);
    
    logDev('debug', 'Quick apply initiated', {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company?.name,
      userId: currentUser?.id
    });
  };
  
  const handleApplicationSuccess = (applicationData) => {
    logDev('info', 'Application submitted successfully', {
      jobId: quickApplyJob?.id,
      applicationId: applicationData?.id,
      userId: currentUser?.id
    });
    
    setQuickApplyJob(null);
    setSnackbar({
      open: true,
      message: 'Your application was submitted successfully!',
      severity: 'success'
    });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0A0A0A',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background image with Jamaican styling */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: 'url("/images/generated/jamaican-design-1747273968.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          zIndex: 1,
        }}
      />
      
      <StyledContainer maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Title */}
        <Box sx={{ 
          backgroundColor: 'rgba(44, 85, 48, 0.8)', 
          padding: 2, 
          borderRadius: 2, 
          border: '2px solid #FFD700',
          mb: 4,
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: '#FFD700',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 0,
              textAlign: 'center'
            }}
          >
            JAMAICAN JOB SEARCH
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'white',
              textAlign: 'center',
              fontStyle: 'italic'
            }}
          >
            Find Your Perfect Career in Jamaica
          </Typography>
        </Box>

        {/* Search Filters */}
        <StyledCard sx={{ mb: 4 }}>
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <JobTitleInput
                  value={filters.query}
                  onChange={(value) => handleFilterChange('query', value)}
                  sx={formFieldStyle}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <JamaicaLocationAutocomplete
                  value={filters.location}
                  onChange={(locationData) => {
                    handleFilterChange('location', locationData);
                    // If radius is included in the location data, update the locationRadius filter
                    if (locationData && locationData.radius) {
                      handleFilterChange('locationRadius', locationData.radius);
                    }
                  }}
                  radius={filters.locationRadius}
                  onRadiusChange={(radius) => handleFilterChange('locationRadius', radius)}
                  placeholder="Location in Jamaica"
                  sx={formFieldStyle}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#FFD700', fontWeight: 500 }}>Job Type</InputLabel>
                  <Select
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    label="Job Type"
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 215, 0, 0.5)',
                        borderWidth: '2px',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 215, 0, 0.8)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFD700',
                        borderWidth: '2px',
                      },
                      '& .MuiSelect-icon': {
                        color: '#FFD700',
                      }
                    }}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {jobTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <SkillsAutocomplete
                  value={filters.skills}
                  onChange={(value) => handleFilterChange('skills', value)}
                  label="Skills"
                  placeholder="Add skills that match your expertise"
                  helperText="Add skills to improve job matching accuracy"
                  sx={formFieldStyle}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom sx={{ color: '#FFD700', fontWeight: 500 }}>Salary Range</Typography>
                <SalaryRangeInput
                  value={{ min: filters.salaryMin, max: filters.salaryMax }}
                  onChange={(value) => {
                    handleFilterChange('salaryMin', value.min);
                    handleFilterChange('salaryMax', value.max);
                  }}
                  sx={formFieldStyle}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={searchJobs}
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    mt: 2,
                    background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                    color: '#000',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1, color: '#000' }} />
                      Searching...
                    </>
                  ) : 'Search Jobs'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Results Count */}
        <Typography variant="subtitle1" gutterBottom sx={{ color: '#FFD700', fontWeight: 500, mb: 2 }}>
          {resultsCount} jobs found
        </Typography>

        {/* Job Listings */}
        <Grid container spacing={3} sx={{ position: 'relative', zIndex: 2 }}>
          {jobs.map(job => (
            <Grid item xs={12} key={job.id}>
              <StyledCard>
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" component="h2" sx={{ color: '#FFD700' }}>
                        {job.title}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }} gutterBottom>
                        {job.company.name} • {job.location}
                      </Typography>
                      
                      {/* Show skill match score if available */}
                      {job.skillMatchScore !== undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }}>Skill Match:</Typography>
                          <Box
                            sx={{
                              width: '100px',
                              height: '8px',
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              borderRadius: '4px',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                height: '100%',
                                width: `${job.skillMatchScore}%`,
                                background: job.skillMatchScore > 75 
                                  ? 'linear-gradient(90deg, #2C5530, #4caf50)' 
                                  : job.skillMatchScore > 50 
                                    ? 'linear-gradient(90deg, #ff9800, #FFD700)' 
                                    : 'linear-gradient(90deg, #f44336, #ff9800)',
                                borderRadius: '4px'
                              }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold', color: '#FFD700' }}>
                            {Math.round(job.skillMatchScore)}%
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ mt: 1 }}>
                        {job.skills.map(skill => {
                          // Check if this skill is in the user's selected skills
                          const isMatch = filters.skills && filters.skills.some(
                            userSkill => userSkill.toLowerCase() === skill.toLowerCase()
                          );
                          
                          return (
                            <Chip
                              key={skill}
                              label={skill}
                              size="small"
                              sx={{
                                mr: 0.5,
                                mb: 0.5,
                                backgroundColor: isMatch ? 'rgba(44, 85, 48, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                                color: isMatch ? '#FFD700' : 'rgba(255, 255, 255, 0.7)',
                                fontWeight: isMatch ? 'bold' : undefined,
                                border: isMatch ? '1px solid rgba(255, 215, 0, 0.3)' : undefined,
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                      <SalaryDisplay salary={job.salary} />
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        {job.type.replace('_', ' ')}
                      </Typography>
                      <ButtonGroup
                        orientation="vertical"
                        fullWidth
                        sx={{ mt: 1 }}
                      >
                        <Button
                          variant="contained"
                          sx={{ 
                            background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                            color: '#000',
                            fontWeight: 600,
                            '&:hover': {
                              background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                            },
                            transition: 'all 0.3s ease',
                          }}
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          View Job
                        </Button>
                        
                        <Tooltip title={!isAuthenticated ? "Login to apply" : "Apply with your profile"}>
                          <span>
                            <Button
                              variant="outlined"
                              startIcon={<FlashOnIcon />}
                              onClick={() => handleQuickApply(job)}
                              disabled={!isAuthenticated || (currentUser && currentUser.role === 'EMPLOYER')}
                              sx={{ 
                                mt: 1,
                                borderColor: '#FFD700',
                                color: '#FFD700',
                                '&:hover': {
                                  borderColor: '#2C5530',
                                  color: '#2C5530',
                                  backgroundColor: 'rgba(255, 215, 0, 0.1)'
                                },
                              }}
                            >
                              Quick Apply
                            </Button>
                          </span>
                        </Tooltip>
                      </ButtonGroup>
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </StyledContainer>
      
      {/* Quick Apply Modal */}
      {quickApplyJob && (
        <QuickApplyModal
          open={Boolean(quickApplyJob)}
          onClose={() => setQuickApplyJob(null)}
          job={quickApplyJob}
          onSuccess={handleApplicationSuccess}
        />
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JobSearch;
