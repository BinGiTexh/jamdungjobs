import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Chip,
  IconButton,
  InputAdornment,
  Autocomplete,
  Fade,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Enhanced Search Bar Component
 * Optimized for job search with improved UX patterns
 */
const EnhancedSearchBar = ({
  onSearch,
  initialQuery = '',
  initialLocation = '',
  showSuggestions = true,
  size = 'large', // 'small', 'medium', 'large'
  variant = 'hero', // 'hero', 'compact', 'inline'
  placeholder = 'Search for jobs, companies, or skills...',
  sx = {}
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // Search state
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Popular searches and trending keywords
  const popularSearches = [
    'Software Developer',
    'Marketing Manager',
    'Customer Service',
    'Sales Representative',
    'Graphic Designer',
    'Accountant',
    'Teacher',
    'Nurse'
  ];

  const jamaicaLocations = [
    'Kingston',
    'Spanish Town',
    'Montego Bay',
    'Portmore',
    'May Pen',
    'Mandeville',
    'Old Harbour',
    'Savanna-la-Mar'
  ];

  // Load search history from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('jamdung_search_history') || '[]');
    setSearchHistory(history.slice(0, 5)); // Keep only last 5 searches
  }, []);

  // Generate search suggestions based on input
  useEffect(() => {
    if (query.length > 1) {
      const filtered = popularSearches.filter(search =>
        search.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [query, popularSearches]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle search execution
  const handleSearch = async () => {
    if (!query.trim()) {
      // Focus search input if empty
      searchInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    
    // Save to search history
    const newHistory = [
      { query: query.trim(), location: location.trim(), timestamp: Date.now() },
      ...searchHistory.filter(h => h.query !== query.trim())
    ].slice(0, 5);
    
    setSearchHistory(newHistory);
    localStorage.setItem('jamdung_search_history', JSON.stringify(newHistory));

    // Execute search
    if (onSearch) {
      await onSearch({ query: query.trim(), location: location.trim() });
    } else {
      // Default navigation
      const params = new URLSearchParams();
      if (query.trim()) params.append('search', query.trim());
      if (location.trim()) params.append('location', location.trim());
      navigate(`/jobs?${params.toString()}`);
    }

    setIsLoading(false);
    setShowDropdown(false);
  };

  // Handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setLocation('');
    searchInputRef.current?.focus();
  };

  // Use suggestion
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowDropdown(false);
    // Auto-search when suggestion is selected
    setTimeout(() => handleSearch(), 100);
  };

  // Use search history
  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem.query);
    setLocation(historyItem.location);
    setShowDropdown(false);
  };

  // Size configurations
  const sizeConfig = {
    small: {
      height: 48,
      fontSize: '0.875rem',
      buttonSize: 'medium'
    },
    medium: {
      height: 56,
      fontSize: '1rem',
      buttonSize: 'large'
    },
    large: {
      height: 64,
      fontSize: '1.125rem',
      buttonSize: 'large'
    }
  };

  const config = sizeConfig[size];

  // Variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'hero':
        return {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '2px solid rgba(255, 215, 0, 0.3)',
          '&:hover': {
            border: '2px solid rgba(255, 215, 0, 0.6)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
          }
        };
      case 'compact':
        return {
          background: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[2]
        };
      default:
        return {
          background: theme.palette.background.paper,
          borderRadius: 3,
          boxShadow: theme.shadows[3]
        };
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', ...sx }}>
      {/* Main Search Container */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          ...getVariantStyles()
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1.5, sm: 1 },
            alignItems: 'stretch'
          }}
        >
          {/* Job Search Input */}
          <TextField
            ref={searchInputRef}
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => query.length > 1 && setShowDropdown(true)}
            placeholder={placeholder}
            variant="outlined"
            size={size === 'large' ? 'medium' : 'small'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'primary.main' }} />
                </InputAdornment>
              ),
              endAdornment: query && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClear}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                height: config.height,
                fontSize: config.fontSize,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.12)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                  borderWidth: 2
                }
              }
            }}
            sx={{ flex: 2 }}
          />

          {/* Location Input */}
          <Autocomplete
            value={location}
            onChange={(event, newValue) => setLocation(newValue || '')}
            onInputChange={(event, newInputValue) => setLocation(newInputValue)}
            options={jamaicaLocations}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Location in Jamaica"
                variant="outlined"
                size={size === 'large' ? 'medium' : 'small'}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    height: config.height,
                    fontSize: config.fontSize
                  }
                }}
              />
            )}
            sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}
          />

          {/* Search Button */}
          <Button
            variant="contained"
            size={config.buttonSize}
            onClick={handleSearch}
            disabled={isLoading}
            sx={{
              minWidth: { xs: '100%', sm: 120 },
              height: config.height,
              fontSize: config.fontSize,
              fontWeight: 600,
              background: 'linear-gradient(45deg, #009639, #FFD700)',
              '&:hover': {
                background: 'linear-gradient(45deg, #006D2C, #FFA000)',
                transform: 'translateY(-1px)',
                boxShadow: theme.shadows[6]
              },
              '&:active': {
                transform: 'translateY(0)'
              }
            }}
          >
            {isLoading ? 'Searching...' : 'Find Jobs'}
          </Button>
        </Box>

        {/* Quick Search Chips */}
        {variant === 'hero' && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1, alignSelf: 'center' }}>
              Popular:
            </Typography>
            {popularSearches.slice(0, 4).map((search) => (
              <Chip
                key={search}
                label={search}
                size="small"
                variant="outlined"
                clickable
                onClick={() => handleSuggestionClick(search)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white'
                  }
                }}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && showDropdown && (
        <Fade in={showDropdown}>
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1300,
              mt: 1,
              maxHeight: 300,
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            {/* Search History */}
            {searchHistory.length > 0 && (
              <Box sx={{ p: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', px: 1, display: 'flex', alignItems: 'center' }}>
                  <HistoryIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  Recent Searches
                </Typography>
                {searchHistory.map((item, index) => (
                  <Box
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <Typography variant="body2">{item.query}</Typography>
                    {item.location && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        in {item.location}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Box sx={{ p: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', px: 1, display: 'flex', alignItems: 'center' }}>
                  <TrendingIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  Suggestions
                </Typography>
                {suggestions.map((suggestion) => (
                  <Box
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <Typography variant="body2">{suggestion}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default EnhancedSearchBar;
