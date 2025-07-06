import React, { useState } from 'react';
import {
  Box, Container, Paper, TextField, Button, Typography,
  FormControl, InputLabel, Select, MenuItem, Grid,
  useMediaQuery, useTheme as useMuiTheme
} from '@mui/material';
import { Search, LocationOn, Work, Clear } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import PageTemplate from '../layout/PageTemplate';

// Jamaican-Specific Data - Phase 1 Essentials
const jamaicanIndustries = [
  'Tourism & Hospitality',
  'Banking & Finance', 
  'Information Technology',
  'Healthcare',
  'Education',
  'Government',
  'Other'
];

const jobTypes = [
  { value: 'all', label: 'All Job Types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' }
];

const experienceLevels = [
  { value: 'all', label: 'All Experience Levels' },
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (2-5 years)' },
  { value: 'senior', label: 'Senior Level (5+ years)' }
];

// Cultural messaging
const culturalMessaging = {
  title: 'Find Your Dream Job in Jamaica 🇯🇲',
  subtitle: 'Where your next opportunity soon come',
  searchButton: 'Search Jobs Now',
  clearButton: 'Start Over'
};

const placeholders = {
  keywords: 'Teacher, Driver, Nurse, IT Support...',
  location: 'Kingston, Spanish Town, Montego Bay...'
};

// API endpoints ready for Phase 2 (removed unused variable for Phase 1)

const SmartJobDiscovery = ({ onSearch, onClearFilters, initialKeywords = '' }) => {
  // Use existing theme patterns from HomePage.js
  const { isDarkMode, jamaicanColors } = useTheme();
  const { user } = useAuth();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Simplified State Structure - Phase 1
  const [searchState, setSearchState] = useState({
    keywords: initialKeywords,
    location: '',
    industry: '',
    jobType: 'all',
    experienceLevel: 'all'
  });

  // Handle input changes
  const handleInputChange = (field, value) => {
    setSearchState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Basic search handler with console logging for Phase 1 debugging
  const handleSearch = () => {
    console.warn('🔍 JamDung Jobs Search:', searchState);
    console.warn('🐳 Docker Environment:', process.env.NODE_ENV);
    console.warn('👤 User:', user ? 'Logged in' : 'Guest');
    
    // Phase 1: Just log the search
    if (onSearch) {
      onSearch(searchState);
    }
  };

  // Clear filters handler
  const handleClearFilters = () => {
    const clearedState = {
      keywords: '',
      location: '',
      industry: '',
      jobType: 'all',
      experienceLevel: 'all'
    };
    setSearchState(clearedState);
    console.warn('🧹 Filters cleared');
    
    if (onClearFilters) {
      onClearFilters();
    }
  };

  // Match existing HomePage.js styling patterns
  const searchPaperSx = {
    p: 4,
    borderRadius: 3,
    border: `2px solid ${jamaicanColors.green}20`,
    background: isDarkMode ? 'rgba(0,0,0,0.8)' : 'white',
    backdropFilter: 'blur(10px)',
    mb: 4
  };

  const searchButtonSx = {
    py: 1.5,
    px: 4,
    fontSize: '1.1rem',
    fontWeight: 600,
    bgcolor: jamaicanColors.green,
    color: 'white',
    borderRadius: 2,
    '&:hover': {
      bgcolor: jamaicanColors.green,
      opacity: 0.9
    }
  };

  const clearButtonSx = {
    py: 1.5,
    px: 3,
    fontSize: '1rem',
    fontWeight: 500,
    color: jamaicanColors.green,
    borderColor: jamaicanColors.green,
    borderRadius: 2,
    '&:hover': {
      borderColor: jamaicanColors.green,
      bgcolor: `${jamaicanColors.green}10`
    }
  };

  return (
    <PageTemplate
      title={culturalMessaging.title}
      subtitle={culturalMessaging.subtitle}
      showHero={true}
      maxWidth="lg"
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Search Interface */}
        <Paper elevation={3} sx={searchPaperSx}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 3, 
              color: jamaicanColors.green,
              fontWeight: 600,
              textAlign: isMobile ? 'center' : 'left'
            }}
          >
            🔍 Search for Jobs
          </Typography>

          <Grid container spacing={3}>
            {/* Keywords Search */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Job Title or Keywords"
                placeholder={placeholders.keywords}
                value={searchState.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                InputProps={{
                  startAdornment: <Work sx={{ mr: 1, color: jamaicanColors.green }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: jamaicanColors.green
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: jamaicanColors.green
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: jamaicanColors.green
                  }
                }}
              />
            </Grid>

            {/* Location Search */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                placeholder={placeholders.location}
                value={searchState.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: jamaicanColors.green }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: jamaicanColors.green
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: jamaicanColors.green
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: jamaicanColors.green
                  }
                }}
              />
            </Grid>

            {/* Industry Filter */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel 
                  sx={{
                    '&.Mui-focused': {
                      color: jamaicanColors.green
                    }
                  }}
                >
                  Industry
                </InputLabel>
                <Select
                  value={searchState.industry}
                  label="Industry"
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: jamaicanColors.green
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: jamaicanColors.green
                    }
                  }}
                >
                  <MenuItem value="">All Industries</MenuItem>
                  {jamaicanIndustries.map((industry) => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Job Type Filter */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel 
                  sx={{
                    '&.Mui-focused': {
                      color: jamaicanColors.green
                    }
                  }}
                >
                  Job Type
                </InputLabel>
                <Select
                  value={searchState.jobType}
                  label="Job Type"
                  onChange={(e) => handleInputChange('jobType', e.target.value)}
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: jamaicanColors.green
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: jamaicanColors.green
                    }
                  }}
                >
                  {jobTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Experience Level Filter */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel 
                  sx={{
                    '&.Mui-focused': {
                      color: jamaicanColors.green
                    }
                  }}
                >
                  Experience Level
                </InputLabel>
                <Select
                  value={searchState.experienceLevel}
                  label="Experience Level"
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: jamaicanColors.green
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: jamaicanColors.green
                    }
                  }}
                >
                  {experienceLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box 
            sx={{ 
              mt: 4, 
              display: 'flex', 
              gap: 2, 
              justifyContent: isMobile ? 'center' : 'flex-start',
              flexDirection: isMobile ? 'column' : 'row'
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<Search />}
              onClick={handleSearch}
              sx={searchButtonSx}
              fullWidth={isMobile}
            >
              {culturalMessaging.searchButton}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<Clear />}
              onClick={handleClearFilters}
              sx={clearButtonSx}
              fullWidth={isMobile}
            >
              {culturalMessaging.clearButton}
            </Button>
          </Box>
        </Paper>
        
        {/* Results Placeholder */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 3,
            border: `1px solid ${jamaicanColors.green}10`
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            🎯 Search results will appear here...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phase 1: Basic search functionality ready for testing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Check browser console for search logs 🐳
          </Typography>
        </Paper>
      </Container>
    </PageTemplate>
  );
};

export default SmartJobDiscovery;
