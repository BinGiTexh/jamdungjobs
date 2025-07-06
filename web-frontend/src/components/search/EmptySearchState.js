import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  Fade,
  Paper,
  Divider,
  useTheme
} from '@mui/material';
import {
  SearchOff as SearchOffIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  TrendingUp as TrendingIcon,
  Lightbulb as LightbulbIcon,
  NotificationsActive as AlertIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EmailCaptureModal from './EmailCaptureModal';
import useEmailCapture from '../../hooks/useEmailCapture';

/**
 * Enhanced Empty Search State Component
 * Provides helpful alternatives when no jobs are found
 */
const EmptySearchState = ({ 
  searchQuery = '', 
  searchLocation = '', 
  searchFilters = {},
  onNewSearch,
  onEmailSignup: _onEmailSignup 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [alertCreated, setAlertCreated] = useState(false);
  
  // Email capture hook
  const {
    showModal,
    trigger,
    searchContext,
    triggerOnEmptySearch,
    closeModal,
    handleEmailCaptureSuccess
  } = useEmailCapture();

  // Trigger email capture when empty state is shown
  useEffect(() => {
    const searchData = {
      query: searchQuery,
      location: searchLocation,
      jobType: searchFilters?.jobType,
      skills: searchFilters?.skills,
      salaryMin: searchFilters?.salaryMin
    };
    
    // Trigger after a short delay to let user see the empty state first
    const timer = setTimeout(() => {
      triggerOnEmptySearch(searchData);
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchQuery, searchLocation, searchFilters, triggerOnEmptySearch]);

  // Email signup state - now handled by EmailCaptureModal

  // Alternative search suggestions
  const searchSuggestions = [
    { term: 'Customer Service', icon: '💬', count: '45+ jobs' },
    { term: 'Sales Representative', icon: '📈', count: '32+ jobs' },
    { term: 'Administrative Assistant', icon: '📋', count: '28+ jobs' },
    { term: 'Security Guard', icon: '🛡️', count: '25+ jobs' },
    { term: 'Cashier', icon: '💰', count: '22+ jobs' },
    { term: 'Driver', icon: '🚗', count: '18+ jobs' }
  ];

  // Popular locations with job counts
  const locationSuggestions = [
    { name: 'Kingston', count: '150+ jobs' },
    { name: 'Spanish Town', count: '85+ jobs' },
    { name: 'Montego Bay', count: '72+ jobs' },
    { name: 'Portmore', count: '68+ jobs' }
  ];

  // Industry categories
  const industrySuggestions = [
    { name: 'Technology', icon: '💻', color: '#2196F3' },
    { name: 'Healthcare', icon: '🏥', color: '#4CAF50' },
    { name: 'Education', icon: '📚', color: '#FF9800' },
    { name: 'Finance', icon: '💼', color: '#9C27B0' },
    { name: 'Hospitality', icon: '🏨', color: '#F44336' },
    { name: 'Retail', icon: '🛍️', color: '#607D8B' }
  ];

  // Email signup now handled by EmailCaptureModal

  const handleModalSuccess = (data) => {
    handleEmailCaptureSuccess(data);
    setAlertCreated(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setAlertCreated(false);
    }, 5000);
  };

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion) => {
    if (onNewSearch) {
      onNewSearch({ query: suggestion, location: searchLocation });
    } else {
      const params = new URLSearchParams();
      params.append('search', suggestion);
      if (searchLocation) params.append('location', searchLocation);
      navigate(`/jobs?${params.toString()}`);
    }
  };

  const handleLocationClick = (location) => {
    if (onNewSearch) {
      onNewSearch({ query: searchQuery, location });
    } else {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('location', location);
      navigate(`/jobs?${params.toString()}`);
    }
  };

  const handleIndustryClick = (industry) => {
    navigate(`/jobs?industry=${encodeURIComponent(industry)}`);
  };

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, textAlign: 'center' }}>
      {/* Main Empty State Message */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <SearchOffIcon 
            sx={{ 
              fontSize: { xs: 64, md: 80 }, 
              color: 'text.secondary', 
              mb: 2,
              opacity: 0.7
            }} 
          />
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 2, 
              fontWeight: 600,
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}
          >
            No Jobs Found
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary', 
              mb: 1,
              maxWidth: 500,
              mx: 'auto'
            }}
          >
            {searchQuery || searchLocation ? (
              <>
                We couldn't find any jobs matching 
                {searchQuery && <strong> "{searchQuery}"</strong>}
                {searchQuery && searchLocation && ' in '}
                {searchLocation && <strong>{searchLocation}</strong>}
              </>
            ) : (
              'We couldn\'t find any jobs matching your search criteria.'
            )}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            But don't worry! Try these suggestions below or get notified when new jobs are posted.
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={3} sx={{ maxWidth: 1000, mx: 'auto' }}>
        {/* Success Alert */}
        {alertCreated && (
          <Fade in={alertCreated}>
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              icon={<AlertIcon />}
            >
              <Typography variant="body2">
                Job alert created! You'll be notified when new opportunities match your search.
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Email Alert Signup */}
        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, rgba(0, 150, 57, 0.1), rgba(255, 215, 0, 0.1))',
            border: '2px solid rgba(0, 150, 57, 0.2)',
            mb: 4
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <AlertIcon 
              sx={{ 
                fontSize: 48, 
                color: theme.palette.primary.main, 
                mb: 2 
              }} 
            />
            <Typography variant="h6" gutterBottom>
              Never miss a job opportunity
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Get instant alerts when new {searchQuery && `"${searchQuery}"`} jobs 
              {searchLocation && ` in ${searchLocation}`} are posted. Be the first to apply!
            </Typography>
            <Button
              variant="contained"
              onClick={() => triggerOnEmptySearch({
                query: searchQuery,
                location: searchLocation,
                jobType: searchFilters?.jobType,
                skills: searchFilters?.skills,
                salaryMin: searchFilters?.salaryMin
              })}
              startIcon={<AlertIcon />}
              sx={{
                background: 'linear-gradient(45deg, #00A651, #FFD700)',
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(45deg, #00A651, #FFA000)'
                }
              }}
            >
              Create Job Alert
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
              Free • Unsubscribe anytime • No spam
            </Typography>
          </CardContent>
        </Card>

        {/* Search Suggestions */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={1000}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Popular Job Searches
                </Typography>
              </Box>
              <Grid container spacing={1}>
                {searchSuggestions.map((suggestion) => (
                  <Grid item xs={12} key={suggestion.term}>
                    <Chip
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: 8 }}>{suggestion.icon}</span>
                            {suggestion.term}
                          </Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {suggestion.count}
                          </Typography>
                        </Box>
                      }
                      variant="outlined"
                      clickable
                      onClick={() => handleSuggestionClick(suggestion.term)}
                      sx={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        height: 40,
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '& .MuiTypography-root': {
                            color: 'white'
                          }
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Fade>
        </Grid>

        <Grid item xs={12} md={6}>
          <Fade in timeout={1200}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Try Other Locations
                </Typography>
              </Box>
              <Grid container spacing={1}>
                {locationSuggestions.map((location) => (
                  <Grid item xs={12} key={location.name}>
                    <Chip
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                          <span>{location.name}</span>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {location.count}
                          </Typography>
                        </Box>
                      }
                      variant="outlined"
                      clickable
                      onClick={() => handleLocationClick(location.name)}
                      sx={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        height: 40,
                        '&:hover': {
                          backgroundColor: 'secondary.main',
                          color: 'white',
                          '& .MuiTypography-root': {
                            color: 'white'
                          }
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Fade>
        </Grid>

        {/* Industry Categories */}
        <Grid item xs={12}>
          <Fade in timeout={1400}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
                <WorkIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Browse by Industry
                </Typography>
              </Box>
              <Grid container spacing={2} justifyContent="center">
                {industrySuggestions.map((industry) => (
                  <Grid item xs={6} sm={4} md={2} key={industry.name}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        p: 2,
                        transition: 'all 0.3s ease',
                        border: '2px solid transparent',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                          borderColor: industry.color
                        }
                      }}
                      onClick={() => handleIndustryClick(industry.name)}
                    >
                      <Typography 
                        sx={{ 
                          fontSize: '2rem', 
                          mb: 1,
                          filter: `hue-rotate(${industry.color})`
                        }}
                      >
                        {industry.icon}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: industry.color
                        }}
                      >
                        {industry.name}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Fade>
        </Grid>

        {/* Additional Help */}
        <Grid item xs={12}>
          <Fade in timeout={1600}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <LightbulbIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Search Tips
                </Typography>
              </Box>
              <Grid container spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    • Try broader search terms
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    • Check your spelling
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    • Use different keywords
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    • Expand your location search
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/jobs')}
                  sx={{ mr: 2 }}
                >
                  View All Jobs
                </Button>
                {!isAuthenticated && (
                  <Button
                    variant="contained"
                    onClick={() => navigate('/register')}
                  >
                    Create Job Alert
                  </Button>
                )}
              </Box>
            </Box>
          </Fade>
        </Grid>
      </Grid>
      
      {/* Enhanced Email Capture Modal */}
      <EmailCaptureModal
        open={showModal}
        onClose={closeModal}
        searchContext={searchContext}
        trigger={trigger}
        onSuccess={handleModalSuccess}
      />
    </Box>
  );
};

export default EmptySearchState;
