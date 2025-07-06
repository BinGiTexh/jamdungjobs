import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
  Container,
  Skeleton,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
  Business as CompanyIcon,
  AccessTime as TimeIcon,
  AttachMoney as SalaryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../../utils/api';
import { logError, logDev } from '../../utils/loggingUtils';

/**
 * Basic Job Search Component
 * Universal search that works for all user types without authentication barriers
 * Focus on reliability, performance, and consistent functionality
 */
const BasicJobSearch = ({
  initialQuery = '',
  initialLocation = '',
  showTitle = true,
  variant = 'full', // 'full', 'compact', 'embedded'
  onJobSelect,
  maxWidth = 'lg'
}) => {
  const navigate = useNavigate();

  // Search state
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Autocomplete state
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // Results state
  const [jobs, setJobs] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  // Search configuration
  const RESULTS_PER_PAGE = 20;
  const SEARCH_DEBOUNCE_MS = 500; // Longer debounce for better UX
  
  // Enhanced job search terms with categories for better matching
  const JOB_CATEGORIES = {
    'Healthcare': ['Nurse', 'Doctor', 'Medical Assistant', 'Pharmacy Technician', 'Dentist', 'Physiotherapist'],
    'Education': ['Teacher', 'Principal', 'Teaching Assistant', 'Tutor', 'Professor', 'School Administrator'],
    'Transportation': ['Driver', 'Taxi Driver', 'Bus Driver', 'Delivery Driver', 'Courier', 'Pilot'],
    'Security': ['Security Guard', 'Security Officer', 'Bodyguard', 'Security Manager'],
    'Sales & Customer Service': ['Sales Representative', 'Customer Service', 'Sales Associate', 'Sales Manager', 'Call Center Agent'],
    'Administrative': ['Receptionist', 'Secretary', 'Administrative Assistant', 'Data Entry Clerk', 'Office Manager'],
    'Management': ['Manager', 'Supervisor', 'Team Leader', 'Department Head', 'Executive Assistant'],
    'Retail & Food Service': ['Cashier', 'Waiter', 'Waitress', 'Chef', 'Cook', 'Bartender', 'Store Associate'],
    'Skilled Trades': ['Mechanic', 'Electrician', 'Plumber', 'Carpenter', 'Welder', 'Technician'],
    'Finance & Accounting': ['Accountant', 'Bookkeeper', 'Financial Analyst', 'Bank Teller', 'Loan Officer'],
    'Beauty & Personal Care': ['Hairdresser', 'Barber', 'Makeup Artist', 'Nail Technician', 'Beautician'],
    'Tourism & Hospitality': ['Tour Guide', 'Hotel Staff', 'Restaurant Staff', 'Front Desk Agent', 'Concierge'],
    'Construction & Labor': ['Construction Worker', 'Laborer', 'Site Supervisor', 'Heavy Equipment Operator'],
    'Technology': ['Software Developer', 'IT Support', 'Computer Technician', 'Web Designer', 'Data Analyst'],
    'Cleaning & Maintenance': ['Cleaner', 'Janitor', 'Maintenance Worker', 'Housekeeper', 'Groundskeeper']
  };
  
  const ALL_JOB_TERMS = Object.values(JOB_CATEGORIES).flat();
  
  // Common Jamaica locations
  const JAMAICA_LOCATIONS = [
    'Kingston', 'Spanish Town', 'Montego Bay', 'Portmore', 'May Pen',
    'Old Harbour', 'Mandeville', 'Ocho Rios', 'Port Antonio', 'Linstead',
    'Half Way Tree', 'New Kingston', 'Downtown Kingston', 'St. Andrew',
    'St. Catherine', 'Clarendon', 'Manchester', 'St. James', 'St. Ann',
    'Portland', 'Westmoreland', 'Hanover', 'St. Elizabeth', 'St. Mary',
    'St. Thomas', 'Trelawny', 'Remote Work'
  ];

  // Perform search API call
  const performSearch = useCallback(async (searchQuery, searchLocation = '', page = 1) => {
    if (!searchQuery.trim()) {
      setJobs([]);
      setTotalResults(0);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      logDev('Performing basic search:', { query: searchQuery, page });

      const response = await api.get('/api/jobs', {
        params: {
          query: searchQuery.trim(),
          ...(searchLocation.trim() && { location: searchLocation.trim() }),
          page,
          limit: RESULTS_PER_PAGE
        }
      });

      const { jobs: searchResults, pagination } = response.data;
      const total = pagination?.total || 0;
      const responsePage = pagination?.currentPage || page;

      setJobs(searchResults || []);
      setTotalResults(total || 0);
      setCurrentPage(responsePage || page);

      logDev('Search completed:', { 
        query: searchQuery, 
        results: searchResults?.length || 0, 
        total 
      });

    } catch (err) {
      logError('Search failed:', err);
      setError('Unable to search jobs right now. Please try again.');
      setJobs([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) return;

    const timeoutId = setTimeout(() => {
      performSearch(query, location, 1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query, location, performSearch]);

  // Enhanced search suggestions with smart matching
  const getSearchSuggestions = (input) => {
    if (!input || input.length < 1) return [];
    
    const lowercaseInput = input.toLowerCase().trim();
    const suggestions = [];
    
    // Exact matches first
    const exactMatches = ALL_JOB_TERMS.filter(term => 
      term.toLowerCase().startsWith(lowercaseInput)
    );
    
    // Partial matches second
    const partialMatches = ALL_JOB_TERMS.filter(term => 
      term.toLowerCase().includes(lowercaseInput) && 
      !term.toLowerCase().startsWith(lowercaseInput)
    );
    
    // Combine and limit results
    suggestions.push(...exactMatches.slice(0, 4));
    suggestions.push(...partialMatches.slice(0, 3));
    
    return [...new Set(suggestions)].slice(0, 6); // Remove duplicates and limit
  };
  
  // Note: Using HTML datalist for location suggestions for better accessibility
  
  // Handle job title input with suggestions
  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedSuggestionIndex(-1);
    
    if (value.length >= 1) {
      const suggestions = getSearchSuggestions(value);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0 && isInputFocused);
    } else {
      setShowSuggestions(false);
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(searchSuggestions[selectedSuggestionIndex]);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
      default:
        // No default action needed
        break;
    }
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    // Focus back on input
    setTimeout(() => {
      document.querySelector('input[aria-label="Job title search"]')?.focus();
    }, 100);
    // Auto-trigger search when suggestion is selected
    setTimeout(() => performSearch(suggestion, location, 1), 150);
  };
  
  // Handle input focus
  const handleInputFocus = () => {
    setIsInputFocused(true);
    if (query.length >= 1) {
      const suggestions = getSearchSuggestions(query);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    }
  };
  
  // Handle input blur with delay for clicks
  const handleInputBlur = () => {
    setIsInputFocused(false);
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };
  
  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      performSearch(query, location, 1);
    }
  };

  // Handle clear search
  const handleClear = () => {
    setQuery('');
    setLocation('');
    setJobs([]);
    setTotalResults(0);
    setHasSearched(false);
    setError(null);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setSearchSuggestions([]);
    // Focus back on search input
    setTimeout(() => {
      document.querySelector('input[aria-label="Job title search"]')?.focus();
    }, 100);
  };

  // Handle pagination
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    performSearch(query, location, page);
    // Scroll to top of results
    document.getElementById('search-results')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  // Handle job selection
  const handleJobClick = (job) => {
    if (onJobSelect) {
      onJobSelect(job);
    } else {
      navigate(`/jobs/${job.id}`);
    }
  };

  // Format salary display
  const formatSalary = (salary) => {
    if (!salary) return null;
    
    // Handle both number and string formats
    if (typeof salary === 'number') {
      return `JMD ${salary.toLocaleString()}`;
    }
    
    if (typeof salary === 'string') {
      return salary.replace(/JMD\s*/i, 'JMD ');
    }
    
    // Handle object format {min, max}
    if (typeof salary === 'object' && salary.min !== undefined) {
      const min = salary.min?.toLocaleString() || '0';
      const max = salary.max?.toLocaleString() || salary.min?.toLocaleString() || '0';
      return salary.max ? `JMD ${min} - ${max}` : `JMD ${min}+`;
    }
    
    return 'Salary not specified';
  };

  // Format posted date
  const formatPostedDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  // Loading skeleton component
  const JobCardSkeleton = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Skeleton variant="text" width="70%" height={28} />
        <Skeleton variant="text" width="50%" height={20} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Skeleton variant="text" width="30%" height={16} />
          <Skeleton variant="text" width="25%" height={16} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth={maxWidth} sx={{ py: variant === 'embedded' ? 0 : 3 }}>
      {/* Search Header */}
      {showTitle && variant === 'full' && (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              color: '#00A651',
              mb: 2
            }}
          >
            Find Your Next Job
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Search thousands of jobs across Jamaica
          </Typography>
        </Box>
      )}

      {/* Search Input */}
      <Box 
        component="form" 
        onSubmit={handleSearch}
        sx={{ 
          mb: 4,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          flexWrap: { xs: 'wrap', md: 'nowrap' }
        }}
      >
        <Box sx={{ position: 'relative', flex: { xs: '1 1 100%', md: '2 1 0' } }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="What job are you looking for? Start typing..."
            value={query}
            onChange={handleQueryChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoComplete="off"
            inputProps={{
              'aria-label': 'Job title search',
              'aria-describedby': 'job-search-help',
              'aria-expanded': showSuggestions,
              'aria-haspopup': 'listbox',
              'aria-autocomplete': 'list',
              role: 'combobox'
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              endAdornment: query && (
                <IconButton
                  size="small"
                  onClick={handleClear}
                  disabled={loading}
                  sx={{ mr: -1 }}
                  aria-label="Clear search"
                >
                  <ClearIcon />
                </IconButton>
              ),
              sx: {
                backgroundColor: 'background.paper',
                fontSize: '1.1rem',
                transition: 'all 0.2s ease-in-out',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: showSuggestions ? '#00A651' : 'rgba(0, 166, 81, 0.3)',
                  borderWidth: '2px',
                  transition: 'border-color 0.2s ease-in-out'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00A651'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00A651',
                  borderWidth: '2px',
                  boxShadow: '0 0 0 3px rgba(0, 166, 81, 0.1)'
                }
              }
            }}
          />
          
          {/* Enhanced Search Suggestions Dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <Paper
              role="listbox"
              sx={{
                position: 'absolute',
                top: 'calc(100% - 2px)',
                left: 0,
                right: 0,
                zIndex: 1000,
                maxHeight: '280px',
                overflowY: 'auto',
                border: '2px solid #00A651',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                boxShadow: '0 4px 12px rgba(0, 166, 81, 0.15)',
                animation: 'slideDown 0.2s ease-out',
                '@keyframes slideDown': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(-10px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }
              }}
            >
              {searchSuggestions.map((suggestion, index) => (
                <Box
                  key={index}
                  role="option"
                  aria-selected={selectedSuggestionIndex === index}
                  sx={{
                    p: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: selectedSuggestionIndex === index 
                      ? 'rgba(0, 166, 81, 0.15)' 
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: selectedSuggestionIndex === index 
                        ? 'rgba(0, 166, 81, 0.2)' 
                        : 'rgba(0, 166, 81, 0.08)'
                    },
                    borderBottom: index < searchSuggestions.length - 1 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                    transition: 'background-color 0.15s ease-in-out'
                  }}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  <SearchIcon sx={{ 
                    fontSize: 18, 
                    color: selectedSuggestionIndex === index ? '#00A651' : 'text.secondary',
                    transition: 'color 0.15s ease-in-out'
                  }} />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: selectedSuggestionIndex === index ? 500 : 400,
                      color: selectedSuggestionIndex === index ? '#00A651' : 'text.primary',
                      transition: 'all 0.15s ease-in-out'
                    }}
                  >
                    {suggestion}
                  </Typography>
                  {selectedSuggestionIndex === index && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        ml: 'auto', 
                        color: '#00A651',
                        fontSize: '0.75rem',
                        opacity: 0.8
                      }}
                    >
                      Press Enter
                    </Typography>
                  )}
                </Box>
              ))}
              
              {/* Footer with tip */}
              <Box sx={{
                p: '8px 16px',
                backgroundColor: 'rgba(0, 166, 81, 0.05)',
                borderTop: '1px solid rgba(0, 166, 81, 0.1)'
              }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  💡 Use ↑↓ arrow keys to navigate, Enter to select, Esc to close
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
        <TextField
          variant="outlined"
          placeholder="Where? (e.g. Kingston, Montego Bay, Remote)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={loading}
          autoComplete="off"
          sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 0' },
            mt: { xs: 1, md: 0 }
          }}
          inputProps={{
            'aria-label': 'Job location',
            list: 'location-suggestions'
          }}
          InputProps={{
            startAdornment: <LocationIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            sx: {
              backgroundColor: 'background.paper',
              fontSize: '1.1rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 166, 81, 0.3)',
                borderWidth: '2px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00A651'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00A651',
                borderWidth: '2px'
              }
            }
          }}
        />
        
        {/* Location datalist for autocomplete */}
        <datalist id="location-suggestions">
          {JAMAICA_LOCATIONS.map((loc, index) => (
            <option key={index} value={loc} />
          ))}
        </datalist>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !query.trim()}
          sx={{
            minWidth: 120,
            height: 56,
            backgroundColor: '#00A651',
            flex: { xs: '1 1 100%', md: '0 0 auto' },
            mt: { xs: 1, md: 0 },
            '&:hover': {
              backgroundColor: '#008A43'
            }
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Search'
          )}
        </Button>
      </Box>

      {/* Helpful Text for Non-Tech Users */}
      {!hasSearched && !loading && (
        <Box 
          id="job-search-help"
          sx={{ 
            mb: 3, 
            p: 2, 
            backgroundColor: 'rgba(0, 166, 81, 0.05)',
            borderRadius: 2,
            border: '1px solid rgba(0, 166, 81, 0.2)'
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.primary', mb: 1 }}>
            💡 <strong>Search Tips:</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            • Start typing any job title - suggestions will appear automatically<br/>
            • Use arrow keys (↑↓) to navigate suggestions, Enter to select<br/>
            • Add a location to find jobs near you (Kingston, Montego Bay, etc.)<br/>
            • Use simple, everyday job names - no technical terms needed
          </Typography>
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Results Section */}
      <Box id="search-results">
        {/* Results Header */}
        {hasSearched && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              {loading ? 'Searching...' : (
                totalResults > 0 
                  ? `${totalResults} job${totalResults !== 1 ? 's' : ''} found${query ? ` for "${query}"` : ''}`
                  : `No jobs found${query ? ` for "${query}"` : ''}`
              )}
            </Typography>
            {totalResults > RESULTS_PER_PAGE && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Page {currentPage} of {Math.ceil(totalResults / RESULTS_PER_PAGE)}
              </Typography>
            )}
          </Box>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <Box>
            {[...Array(5)].map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </Box>
        )}

        {/* Job Results */}
        {!loading && jobs.length > 0 && (
          <Grid container spacing={2}>
            {jobs.map((job) => (
              <Grid item xs={12} key={job.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => handleJobClick(job)}
                >
                  <CardContent>
                    {/* Job Title */}
                    <Typography 
                      variant="h6" 
                      component="h3"
                      sx={{ 
                        fontWeight: 600,
                        color: '#00A651',
                        mb: 1,
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {job.title}
                    </Typography>

                    {/* Company */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CompanyIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {job.company?.name || 'Company'}
                      </Typography>
                    </Box>

                    {/* Location and Details */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 2, 
                      alignItems: 'center',
                      color: 'text.secondary'
                    }}>
                      {job.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2">{job.location}</Typography>
                        </Box>
                      )}

                      {(job.job_type || job.type) && (
                        <Typography variant="body2">
                          {(job.job_type || job.type)?.replace('_', ' ')}
                        </Typography>
                      )}

                      {job.salary && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SalaryIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2">
                            {formatSalary(job.salary)}
                          </Typography>
                        </Box>
                      )}

                      {(job.posted_date || job.createdAt) && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2">
                            {formatPostedDate(job.posted_date || job.createdAt)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* No Results */}
        {!loading && hasSearched && jobs.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              No jobs found{query && ` for "${query}"`}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Try different keywords or check your spelling
            </Typography>
            <Button
              variant="outlined"
              onClick={handleClear}
              sx={{ 
                borderColor: '#00A651',
                color: '#00A651',
                '&:hover': {
                  borderColor: '#008A43',
                  backgroundColor: 'rgba(0, 166, 81, 0.04)'
                }
              }}
            >
              Clear Search
            </Button>
          </Box>
        )}

        {/* Pagination */}
        {!loading && totalResults > RESULTS_PER_PAGE && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil(totalResults / RESULTS_PER_PAGE)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  '&.Mui-selected': {
                    backgroundColor: '#00A651',
                    '&:hover': {
                      backgroundColor: '#008A43'
                    }
                  }
                }
              }}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default BasicJobSearch;
