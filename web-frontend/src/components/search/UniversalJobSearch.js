import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { logDev, logError } from '../../utils/loggingUtils';
// Import reusable components
import EnhancedSearchBar from './EnhancedSearchBar';
import SearchFilters from './SearchFilters';
import JobCard from './JobCard';
import EmptySearchState from './EmptySearchState';

/**
 * Universal Job Search Component
 * Works for all user types: anonymous visitors, job seekers, employers
 * Provides comprehensive search functionality with advanced filtering
 */
const UniversalJobSearch = ({
  initialQuery = '',
  initialLocation = '',
  initialFilters = {},
  showFilters = true,
  variant = 'full', // 'full', 'compact', 'embedded'
  onJobSelect,
  maxResults = 50 // eslint-disable-line no-unused-vars
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useAuth();

  // Search state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchLocation, setSearchLocation] = useState(initialLocation);
  const [filters, setFilters] = useState({
    jobType: [],
    parish: '',
    salaryMin: 0,
    salaryMax: 0,
    experienceLevel: '',
    industry: [],
    skills: [],
    remote: false,
    companySize: '',
    postedWithin: '',
    ...initialFilters
  });

  // Results state
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // UI state
  const [showFiltersPanel, setShowFiltersPanel] = useState(!isMobile);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [sortBy, setSortBy] = useState('relevance'); // relevance, date, salary
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Search analytics
  const [searchStartTime, setSearchStartTime] = useState(null);

  // Load saved jobs from backend
  const loadSavedJobs = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/api/jobseeker/saved-jobs');
      const savedJobIds = new Set(response.data.savedJobs?.map(job => job.id.toString()) || []);
      setSavedJobs(savedJobIds);
    } catch (error) {
      logError('Failed to load saved jobs:', error);
    }
  }, [isAuthenticated]);

  // Load saved jobs for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      loadSavedJobs();
    }
  }, [isAuthenticated, loadSavedJobs]);

  // Perform initial search if query provided
  useEffect(() => {
    if (initialQuery || initialLocation || Object.keys(initialFilters).length > 0) {
      performSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Main search function
  const performSearch = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError(null);
    setSearchStartTime(Date.now());

    try {
      // Build search parameters
      const searchParams = {
        query: searchQuery.trim(),
        location: searchLocation.trim(),
        page,
        limit: 20,
        sortBy,
        ...filters
      };

      // Remove empty filters
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === '' || 
            (Array.isArray(searchParams[key]) && searchParams[key].length === 0) ||
            searchParams[key] === 0) {
          delete searchParams[key];
        }
      });

      logDev('Performing search with params:', searchParams);

      const response = await api.get('/api/search/jobs', { params: searchParams });
      const { jobs: searchResults, totalCount, hasMore: moreResults } = response.data;

      // Update results
      if (append) {
        setJobs(prev => [...prev, ...searchResults]);
      } else {
        setJobs(searchResults);
        setCurrentPage(1);
      }

      setTotalResults(totalCount);
      setHasMore(moreResults);

      // Track search analytics
      const searchTime = Date.now() - searchStartTime;
      trackSearchAnalytics({
        query: searchQuery,
        location: searchLocation,
        filters,
        resultsCount: totalCount,
        searchTime,
        userType: isAuthenticated ? user?.role : 'anonymous'
      });

      // Show success message for specific searches
      if (searchQuery && totalCount > 0) {
        setSnackbar({
          open: true,
          message: `Found ${totalCount} jobs matching "${searchQuery}"`,
          severity: 'success'
        });
      }

    } catch (error) {
      logError('Search failed:', error);
      
      // Set a more helpful error message
      let errorMessage = 'We couldn\'t find jobs matching your search';
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid search parameters';
            break;
          case 404:
            errorMessage = 'Search service unavailable';
            break;
          case 500:
            errorMessage = 'Search service experiencing issues';
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection';
      }
      
      setError(errorMessage);
      // Don't show snackbar since we have enhanced error display
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchLocation, filters, sortBy, isAuthenticated, user, searchStartTime]);

  // Handle search from search bar
  const handleSearch = ({ query, location }) => {
    setSearchQuery(query);
    setSearchLocation(location);
    setCurrentPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('location', location);
    
    // Add filters to URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0) {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (!Array.isArray(value)) {
          params.set(key, value.toString());
        }
      }
    });

    navigate(`/jobs?${params.toString()}`, { replace: true });
    performSearch(1, false);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    performSearch(1, false);
  };

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
    performSearch(1, false);
  };

  // Load more results
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      performSearch(nextPage, true);
    }
  };

  // Save/unsave job
  const handleSaveJob = async (jobId) => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          returnTo: `/jobs/${jobId}`,
          message: 'Please log in to save jobs'
        }
      });
      return;
    }

    try {
      const jobIdStr = jobId.toString();
      const isSaved = savedJobs.has(jobIdStr);

      if (isSaved) {
        await api.delete(`/api/jobseeker/saved-jobs/${jobId}`);
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobIdStr);
          return newSet;
        });
        setSnackbar({
          open: true,
          message: 'Job removed from saved jobs',
          severity: 'info'
        });
      } else {
        await api.post('/api/jobseeker/saved-jobs', { jobId });
        setSavedJobs(prev => new Set([...prev, jobIdStr]));
        setSnackbar({
          open: true,
          message: 'Job saved successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      logError('Failed to save/unsave job:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save job. Please try again.',
        severity: 'error'
      });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      jobType: [],
      parish: '',
      salaryMin: 0,
      salaryMax: 0,
      experienceLevel: '',
      industry: [],
      skills: [],
      remote: false,
      companySize: '',
      postedWithin: ''
    });
    setCurrentPage(1);
    performSearch(1, false);
  };

  // Track search analytics
  const trackSearchAnalytics = async (analyticsData) => {
    try {
      await api.post('/api/analytics/search', analyticsData);
    } catch (error) {
      logError('Failed to track search analytics:', error);
    }
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([_key, value]) => {
      if (value && value !== '' && value !== 0) {
        if (Array.isArray(value) && value.length > 0) count++;
        else if (!Array.isArray(value)) count++;
      }
    });
    return count;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#0A0A0A',
      color: 'white'
    }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Search Header */}
        <Box sx={{ mb: 3 }}>
          <EnhancedSearchBar
            onSearch={handleSearch}
            initialQuery={searchQuery}
            initialLocation={searchLocation}
            variant={variant === 'compact' ? 'compact' : 'hero'}
            size={isMobile ? 'medium' : 'large'}
          />
        </Box>

        {/* Search Controls */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          {/* Results Count */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ color: '#FFD700' }}>
              {loading ? 'Searching...' : `${totalResults} jobs found`}
            </Typography>
            {searchQuery && (
              <Chip 
                label={`"${searchQuery}"`}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#FFD700',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}
              />
            )}
          </Box>

          {/* Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Filter Toggle */}
            {showFilters && (
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                sx={{
                  borderColor: 'rgba(255, 215, 0, 0.5)',
                  color: '#FFD700',
                  '&:hover': {
                    borderColor: '#FFD700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)'
                  }
                }}
              >
                Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </Button>
            )}

            {/* Clear Filters */}
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="text"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                Clear
              </Button>
            )}

            {/* Sort Options */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['relevance', 'date', 'salary'].map((sort) => (
                <Chip
                  key={sort}
                  label={sort.charAt(0).toUpperCase() + sort.slice(1)}
                  clickable
                  variant={sortBy === sort ? 'filled' : 'outlined'}
                  onClick={() => handleSortChange(sort)}
                  sx={{
                    backgroundColor: sortBy === sort ? theme.palette.primary.main : 'transparent',
                    color: sortBy === sort ? theme.palette.primary.contrastText : theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: sortBy === sort ? theme.palette.primary.dark : `${theme.palette.primary.main}20`
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Filters Panel */}
          {showFilters && showFiltersPanel && (
            <Grid item xs={12} md={3}>
              <SearchFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={clearFilters}
              />
            </Grid>
          )}

          {/* Results Panel */}
          <Grid item xs={12} md={showFilters && showFiltersPanel ? 9 : 12}>
            {/* Loading State */}
            {loading && jobs.length === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: theme.palette.primary.main }} size={60} />
              </Box>
            )}

            {/* Enhanced Error State */}
            {error && (
              <Box sx={{ 
                mb: 3, 
                p: 3, 
                bgcolor: 'rgba(255, 215, 0, 0.1)', 
                borderRadius: 2,
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                    🔍 Let's find you the perfect job!
                  </Typography>
                </Box>
                
                <Typography variant="body1" sx={{ mb: 2, color: 'text.primary' }}>
                  We couldn't find jobs matching your exact search. Here are some suggestions:
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    • Try broader search terms (e.g., "Developer" instead of "Software Developer")
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    • Check different locations or try "Remote" jobs
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    • Browse all available positions below
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setSearchQuery('Developer');
                      setCurrentPage(1);
                    }}
                    sx={{
                      bgcolor: '#009639',
                      color: 'white',
                      '&:hover': { bgcolor: '#007a2e' }
                    }}
                  >
                    Search "Developer"
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchLocation('');
                      setCurrentPage(1);
                    }}
                    sx={{
                      borderColor: '#FFD700',
                      color: '#FFD700',
                      '&:hover': { borderColor: '#009639', color: '#009639' }
                    }}
                  >
                    View All Jobs
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => setError(null)}
                    sx={{ color: 'text.secondary' }}
                  >
                    Dismiss
                  </Button>
                </Box>
              </Box>
            )}

            {/* Empty State */}
            {!loading && jobs.length === 0 && !error && (
              <EmptySearchState
                query={searchQuery}
                location={searchLocation}
                onNewSearch={handleSearch}
              />
            )}

            {/* Job Results */}
            {jobs.length > 0 && (
              <Box>
                <Grid container spacing={2}>
                  {jobs.map((job) => (
                    <Grid item xs={12} key={job.id}>
                      <JobCard
                        job={job}
                        isSaved={savedJobs.has(job.id.toString())}
                        onSave={() => handleSaveJob(job.id)}
                        onSelect={onJobSelect}
                        showSkillMatch={isAuthenticated && user?.skills?.length > 0}
                        userSkills={user?.skills || []}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Load More Button */}
                {hasMore && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={loadMore}
                      disabled={loading}
                      sx={{
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        '&:hover': {
                          borderColor: theme.palette.primary.dark,
                          backgroundColor: `${theme.palette.primary.main}20`
                        }
                      }}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Load More Jobs'}
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UniversalJobSearch;
