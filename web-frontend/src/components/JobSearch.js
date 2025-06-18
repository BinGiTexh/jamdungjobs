import React, { useState, useEffect } from 'react';
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Slide
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { JobTitleInput } from './common/JobTitleInput';
import { JamaicaLocationAutocomplete } from './common/JamaicaLocationAutocomplete';
import { SkillsAutocomplete } from './common/SkillsAutocomplete';
import { SalaryRangeInput } from './common/SalaryRangeInput';
import { SalaryDisplay } from './common/SalaryDisplay';
import QuickApplyModal from './jobseeker/QuickApplyModal';
import api from '../utils/api';
import { logDev, logError, sanitizeForLogging } from '../utils/loggingUtils';
import Seo from './common/Seo';

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
    salaryMax: 0,
    remote: false
  });
  const [searchState, setSearchState] = useState({
    loading: false,
    showLoadingModal: false,
    error: null,
    resultsCount: 0
  });
  const [quickApplyJob, setQuickApplyJob] = useState(null);
  // Track applied jobs and metadata (date, status)
  const [appliedJobs, setAppliedJobs] = useState(new Map());
  // Normalize IDs to strings to avoid type mismatches (backend may return number or string)
  const appliedJobIds = new Set(Array.from(appliedJobs.keys()).map((id) => String(id)));
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  // Success dialog state
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);

  const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'];

  const handleFilterChange = (field, value) => {
    // Add special handling for location to prevent JSON issues
    if (field === 'location' && (!value || Object.keys(value).length === 0)) {
      // If location is being cleared, set it to null instead of undefined
      setFilters(prev => ({
        ...prev,
        [field]: null
      }));
      return;
    }
    
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

  // Validate and format search parameters
  const DEFAULT_MAX_SALARY = 300000;

  const formatSearchParams = () => {
    const params = {};
    
    try {
      // Format search query - ensure string
      const queryTrim = filters.query?.trim();
      if (queryTrim && typeof queryTrim === 'string') {
        params.query = queryTrim;
      }
      
      // Handle location with more flexible matching
      if (filters.location && typeof filters.location === 'object') {
        const locationInput = filters.location.name;
        
        if (locationInput && typeof locationInput === 'string') {
          // Clean and normalize the location input
          const locationParts = locationInput
            .split(',')
            .map(part => part.trim())
            .filter(Boolean);
          
          // Use only the first part (city/town name) for searching
          if (locationParts.length > 0) {
            // Remove any additional text (like 'City' or 'Town')
            const cleanLocation = locationParts[0]
              .replace(/\s+(city|town|parish|district)$/i, '')
              .trim();
            
            if (cleanLocation) {
              params.location = cleanLocation;
              // Always use partial matching for more flexible results
              params.locationMatchMode = 'partial';
              params.locationSearchType = 'flexible';
            }
          }
        }
      }
      
      // Format job type - only include if explicitly selected
      if (filters.jobType && typeof filters.jobType === 'string' && filters.jobType !== '') {
        const validType = jobTypes.includes(filters.jobType);
        if (validType) {
          params.type = filters.jobType;
        }
      }
      
      // Format salary range - ensure numbers
      const minSalary = parseInt(filters.salaryMin, 10);
      const maxSalary = parseInt(filters.salaryMax, 10);
      
      if (!isNaN(minSalary) && minSalary >= 0) {
        params.minSalary = minSalary;
      }
      
      if (!isNaN(maxSalary) && maxSalary > 0 && maxSalary !== DEFAULT_MAX_SALARY) {
        params.maxSalary = maxSalary;
      }
      
      // Ensure minSalary <= maxSalary
      if (params.minSalary > params.maxSalary && params.maxSalary !== 0) {
        [params.minSalary, params.maxSalary] = [params.maxSalary, params.minSalary];
      }
      
      // Format skills as an array with validation
      if (Array.isArray(filters.skills)) {
        params.skills = filters.skills
          .filter(skill => typeof skill === 'string' && skill.trim().length > 0)
          .map(skill => skill.trim());
      }
      
      // Log the formatted parameters for debugging
      logDev('debug', 'Formatted search parameters', sanitizeForLogging(params));
      
    } catch (error) {
      logError('Error formatting search parameters', error, {
        module: 'JobSearch',
        function: 'formatSearchParams',
        filters: sanitizeForLogging(filters)
      });
      
      // Return default params if formatting fails
      return {
        query: '',
        location: '',
        type: '',
        minSalary: 0,
        maxSalary: 0,
        skills: []
      };
    }
    
    return params;
  };

  // Define searchJobs as a regular function (not useCallback) to avoid dependency issues
  const searchJobs = async () => {
    try {
      setSearchState(prev => ({
        ...prev,
        loading: true,
        showLoadingModal: true,
        error: null
      }));
      
      const searchParams = formatSearchParams();
      
      logDev('debug', 'Initiating job search with formatted params', sanitizeForLogging(searchParams));
      
      
      logDev('debug', 'Searching with Jamaica-specific params:', sanitizeForLogging(searchParams));
      
      // Validate and clean search parameters before sending
      const cleanParams = {};
      
      // Only include non-empty parameters with more flexible validation
      Object.entries(searchParams).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          cleanParams[key] = value;
        } else if (typeof value === 'number' && value > 0) {
          cleanParams[key] = value;
        } else if (typeof value === 'string' && value.trim() !== '') {
          const trimmedValue = value.trim();
          
          switch (key) {
            case 'location':
              // Keep location search flexible
              cleanParams[key] = trimmedValue;
              // Add match mode for backend processing
              cleanParams.locationMatchMode = 'partial';
              break;
              
            case 'query':
              // Keep query matching flexible
              cleanParams[key] = trimmedValue;
              cleanParams.queryMatchMode = 'partial';
              break;
              
            default:
              cleanParams[key] = trimmedValue;
          }
        }
      });
      
      // Add status filter for active jobs
      cleanParams.status = 'ACTIVE';
      
      // Log if searching with minimal filters
      if (Object.keys(cleanParams).length <= 1) { // Only has status filter
        logDev('debug', 'Searching with minimal filters - returning all active jobs');
      }

      // Add artificial delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use the configured API utility instead of axios directly
      const response = await api.get('/api/jobs/search', { 
        params: cleanParams,
        timeout: 15000, // Increased timeout for better reliability
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`;
              }
              return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            })
            .join('&');
        }
      });
      
      let jobResults = response.data.jobs || response.data;
      
      if (!Array.isArray(jobResults)) {
        throw new Error('Invalid response format from the server');
      }
      
      // Calculate skill match score for each job if skills filter is applied
      if (searchParams.skills?.length > 0) {
        jobResults = jobResults.map(job => {
          const skillMatchScore = calculateSkillMatchScore(job.skills, searchParams.skills);
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
        highMatchCount: jobResults.filter(job => job.skillMatchScore > 75).length,
        appliedFilters: Object.keys(searchParams)
      });
      
      setJobs(jobResults);
      setSearchState(prev => ({
        ...prev,
        loading: false,
        showLoadingModal: false,
        error: null,
        resultsCount: jobResults.length
      }));
    } catch (error) {
      logError('Error searching jobs', error, {
        module: 'JobSearch',
        function: 'searchJobs',
        filters: sanitizeForLogging(filters),
        endpoint: '/api/jobs/search'
      });
      
      // Handle specific error cases
      let errorMessage = 'An error occurred while searching for jobs';
      if (error.response) {
        // Server responded with an error
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid search parameters. Please check your filters and try again.';
            break;
          case 404:
            errorMessage = 'The search service is currently unavailable.';
            break;
          case 429:
            errorMessage = 'Too many search requests. Please wait a moment and try again.';
            break;
          case 500:
            errorMessage = 'The search service is experiencing issues. Please try again later.';
            break;
          default:
            errorMessage = `Search error: ${error.response.data?.message || 'Unknown error'}`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'The search request timed out. Please try again.';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your connection and try again.';
      }
      
      setSearchState(prev => ({
        ...prev,
        loading: false,
        showLoadingModal: false,
        error: errorMessage,
        resultsCount: 0
      }));
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleSearch = async () => {
    // Prevent multiple simultaneous searches
    if (searchState.loading) {
      return;
    }

    let searchStartTime = Date.now();
    const MIN_LOADING_TIME = 1000; // Minimum time to show loading state (ms)
    let searchPromise;
    
    try {
      // Show loading modal immediately before any async operations
      setSearchState(prev => ({
        ...prev,
        loading: true,
        showLoadingModal: true,
        error: null,
        resultsCount: 0
      }));
      
      // Start the search in the background
      searchPromise = searchJobs();
      
      // Ensure minimum loading time
      const loadingPromise = new Promise(resolve => 
        setTimeout(resolve, MIN_LOADING_TIME)
      );
      
      // Wait for both search and minimum loading time
      await Promise.all([searchPromise, loadingPromise]);
      
    } catch (error) {
      logDev('error', 'Search failed in handleSearch', { error: error.message });
      // Error handling is done in searchJobs, but we still need to ensure
      // the loading state is cleaned up properly
    } finally {
      // Only clean up loading state if this is the most recent search
      const currentTime = Date.now();
      if (currentTime - searchStartTime >= MIN_LOADING_TIME) {
        setSearchState(prev => ({
          ...prev,
          loading: false,
          showLoadingModal: false,
          // Preserve any error state that might have been set
          error: prev.error
        }));
      }
    }
  };

  // Only search jobs on initial load or when user explicitly clicks search
  // Don't automatically search when filters change
  useEffect(() => {
    // Initial search when component mounts
    setSearchState(prev => ({
      ...prev,
      loading: true,
      showLoadingModal: false, // Don't show modal on initial load
      error: null,
      resultsCount: 0
    }));
    searchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Empty dependency array to only run on mount

  // Fetch existing applications once for jobseeker
  useEffect(() => {
    const fetchApplied = async () => {
      if (!isAuthenticated || !(currentUser && currentUser.role === 'JOBSEEKER')) return;
      try {
        // Use correct prefixed path so we actually retrieve existing applications
        const res = await api.get('/api/jobseeker/applications?limit=1000');
        const rows = res.data?.data || res.data || [];
        const jobMap = new Map();
        rows.forEach((row) => {
          jobMap.set(String(row.jobId), {
            appliedAt: row.createdAt || row.appliedAt || row.updatedAt,
            status: row.status || 'APPLIED'
          });
        });
        setAppliedJobs(jobMap);
      } catch (err) {
        logError('Failed to fetch applied jobs', err, { module: 'JobSearch', function: 'fetchApplied' });
      }
    };
    fetchApplied();
  }, [isAuthenticated, currentUser]);

  const handleQuickApply = (job) => {
    // If the user has already applied, simply exit early (the button is already disabled and labelled)
    if (appliedJobIds.has(String(job.id))) {
      // No need to show an additional snackbar; the UI already reflects applied status
      logDev('info', 'Quick apply attempted on already applied job', { jobId: job.id, userId: currentUser?.id });
      return;
    }

    if (!isAuthenticated) {
      // Redirect unauthenticated users to login
      navigate('/login', { state: { from: `/jobs/${job.id}` } });
      return;
    }

    // Open the quick-apply modal as usual
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

    // Mark this job as applied in local state so UI updates immediately
    if (applicationData?.jobId) {
      setAppliedJobs((prev) => {
        const newMap = new Map(prev);
        newMap.set(String(applicationData.jobId), {
          appliedAt: applicationData.createdAt || new Date().toISOString(),
          status: applicationData.status || 'APPLIED'
        });
        return newMap;
      });
    }
    
    // Show celebratory dialog for clearer UX
    setApplicationDialogOpen(true);
    // Auto-dismiss after 2 seconds
    setTimeout(() => setApplicationDialogOpen(false), 2000);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Seo title="Search Jobs in Jamaica" description="Browse and filter thousands of job opportunities across Jamaica on JamDung Jobs." />
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
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={searchState.loading}
                  fullWidth
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
                  {searchState.loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'black' }} />
                      Searching...
                    </>
                  ) : (
                    'Search Jobs'
                  )}
                </Button>
              </Grid>
            </CardContent>
          </StyledCard>

          {/* Results Count with Loading Indicator */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: '#FFD700', fontWeight: 500 }}>
              {searchState.loading ? 'Searching...' : `${searchState.resultsCount} jobs found`}
            </Typography>
            {searchState.loading && (
              <CircularProgress size={24} sx={{ color: '#FFD700' }} />
            )}
          </Box>
          
          {/* Error Message */}
          {searchState.error && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
              <Typography color="error">
                {searchState.error}
              </Typography>
            </Box>
          )}

          {/* Job Listings with Loading State */}
          <Grid container spacing={3} sx={{ position: 'relative', zIndex: 2 }}>
            {searchState.loading ? (
              // Loading skeleton cards
              Array(3).fill(0).map((_, index) => (
                <Grid item xs={12} key={`skeleton-${index}`}>
                  <StyledCard>
                    <CardContent sx={{ position: 'relative', zIndex: 1, opacity: 0.7 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ width: '70%', height: 28, backgroundColor: 'rgba(255, 215, 0, 0.2)', borderRadius: 1 }} />
                        <Box sx={{ width: '40%', height: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1 }} />
                        <Box sx={{ width: '90%', height: 60, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1 }} />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {Array(3).fill(0).map((_, i) => (
                            <Box key={i} sx={{ width: 60, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 4 }} />
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))
            ) : jobs.length > 0 ? jobs.map(job => (
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
                          {appliedJobIds.has(String(job.id)) ? (
                            <Tooltip title={`Applied on ${new Date(appliedJobs.get(String(job.id))?.appliedAt).toLocaleDateString()}`}
                                      placement="top">
                              <span>
                                <Button
                                  variant="contained"
                                  startIcon={<CheckCircleIcon />}
                                  disabled
                                  sx={{
                                    mt: 1,
                                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                    color: '#4caf50',
                                    '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.2)' }
                                  }}
                                >
                                  Applied
                                </Button>
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip title={!isAuthenticated ? 'Login to apply' : 'Quick Apply'}>
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
                          )}
                        </ButtonGroup>
                      </Grid>
                    </Grid>
                  </CardContent>
                </StyledCard>
              </Grid>
            )) : (
              // No results state
              <Grid item xs={12}>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 5, 
                  backgroundColor: 'rgba(20, 20, 20, 0.85)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: 2
                }}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                    No jobs found matching your criteria
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Try adjusting your search filters or using different keywords
                  </Typography>
                </Box>
              </Grid>
            )}
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
        
        {/* Loading Modal */}
        <Dialog
          open={searchState.loading && searchState.showLoadingModal}
          disableEscapeKeyDown
          disableBackdropClick={searchState.loading}
          keepMounted
          onClose={(event, reason) => {
            // Prevent closing when loading
            if (searchState.loading) {
              return;
            }
            // Allow closing only when not loading
            if (reason !== 'backdropClick') {
              setSearchState(prev => ({
                ...prev,
                showLoadingModal: false
              }));
            }
          }}
          PaperProps={{
            style: {
              backgroundColor: 'rgba(20, 20, 20, 0.95)',
              border: '2px solid #FFD700',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '400px',
              width: '100%'
            }
          }}
        >
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ color: '#FFD700', mb: 3 }} />
            <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
              Searching Jobs
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Finding the perfect opportunities for you in Jamaica...
            </Typography>
          </DialogContent>
        </Dialog>
        
        {/* Application Success Dialog */}
        <Dialog
          open={applicationDialogOpen}
          TransitionComponent={Slide}
          TransitionProps={{ direction: 'down' }}
          keepMounted
          onClose={() => setApplicationDialogOpen(false)}
          aria-describedby="application-success-description"
          PaperProps={{
            sx: { backgroundColor: 'rgba(76,175,80,0.95)', textAlign: 'center', p: 3 }
          }}
        >
          <DialogTitle sx={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 40, mr: 1 }} /> Application Submitted!
          </DialogTitle>
          <DialogContent id="application-success-description" sx={{ color: '#fff' }}>
            You have successfully applied for this job.
          </DialogContent>
        </Dialog>
        
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
    </>
  );
};

export default JobSearch;
