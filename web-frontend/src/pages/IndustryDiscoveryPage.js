import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Paper,
  Fade,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Search as SearchIcon,
  Insights as InsightsIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import IndustryCard from '../components/industries/IndustryCard';
import { industryGrowthData, getIndustriesByPriority } from '../data/industryStats';

const IndustryDiscoveryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'growth_desc');
  const [filterPriority, setFilterPriority] = useState(searchParams.get('priority') || 'all');
  const [viewMode, setViewMode] = useState('grid');

  // Filter and sort industries
  const filteredAndSortedIndustries = useMemo(() => {
    let industries = Object.values(industryGrowthData);

    // Apply search filter
    if (searchTerm) {
      industries = industries.filter(industry =>
        industry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        industry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        industry.jobTypes.some(job => job.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      industries = industries.filter(industry => industry.priority === filterPriority);
    }

    // Apply sorting
    switch (sortBy) {
      case 'growth_desc':
        industries.sort((a, b) => b.growth - a.growth);
        break;
      case 'growth_asc':
        industries.sort((a, b) => a.growth - b.growth);
        break;
      case 'name_asc':
        industries.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        industries.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        industries.sort((a, b) => b.growth - a.growth);
    }

    return industries;
  }, [searchTerm, sortBy, filterPriority]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    updateSearchParams({ search: value || undefined });
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    setSortBy(value);
    updateSearchParams({ sort: value });
  };

  const handlePriorityFilter = (priority) => {
    setFilterPriority(priority);
    updateSearchParams({ priority: priority === 'all' ? undefined : priority });
  };

  const updateSearchParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('growth_desc');
    setFilterPriority('all');
    setSearchParams({});
  };

  const hotIndustries = getIndustriesByPriority('hot');
  const growingIndustries = getIndustriesByPriority('growing');
  const stableIndustries = getIndustriesByPriority('stable');

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Page Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <InsightsIcon 
                sx={{ 
                  fontSize: 48, 
                  color: '#FFD700',
                  mr: 2,
                  filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))'
                }} 
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #007E1B 30%, #FFD700 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.5rem', md: '3rem' }
                }}
              >
                Industry Discovery
              </Typography>
            </Box>
            
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                mb: 4, 
                maxWidth: 800, 
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Explore Jamaica's economic landscape and discover career opportunities 
              in the nation's fastest-growing industries.
            </Typography>

            {/* Quick Stats */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#ff6b35', fontWeight: 700 }}>
                  {hotIndustries.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hot Industries
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#28a745', fontWeight: 700 }}>
                  {growingIndustries.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Growing Sectors
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#007bff', fontWeight: 700 }}>
                  {stableIndustries.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stable Industries
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Filters and Search */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(40, 40, 40, 0.9) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              borderRadius: 3
            }}
          >
            <Grid container spacing={3} alignItems="center">
              {/* Search */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search industries, jobs, or keywords..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#FFD700' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 215, 0, 0.3)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 215, 0, 0.5)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFD700'
                      }
                    }
                  }}
                />
              </Grid>

              {/* Sort */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    label="Sort By"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 215, 0, 0.3)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 215, 0, 0.5)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFD700'
                      }
                    }}
                  >
                    <MenuItem value="growth_desc">Growth Rate (High to Low)</MenuItem>
                    <MenuItem value="growth_asc">Growth Rate (Low to High)</MenuItem>
                    <MenuItem value="name_asc">Name (A to Z)</MenuItem>
                    <MenuItem value="name_desc">Name (Z to A)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* View Mode */}
              <Grid item xs={12} sm={6} md={2}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  sx={{ width: '100%' }}
                >
                  <ToggleButton 
                    value="grid" 
                    sx={{ 
                      flex: 1,
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-selected': { 
                        backgroundColor: 'rgba(255, 215, 0, 0.2)',
                        color: '#FFD700'
                      }
                    }}
                  >
                    <GridViewIcon />
                  </ToggleButton>
                  <ToggleButton 
                    value="list"
                    sx={{ 
                      flex: 1,
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-selected': { 
                        backgroundColor: 'rgba(255, 215, 0, 0.2)',
                        color: '#FFD700'
                      }
                    }}
                  >
                    <ListViewIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              {/* Clear Filters */}
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={clearFilters}
                  sx={{
                    borderColor: 'rgba(255, 215, 0, 0.5)',
                    color: '#FFD700',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      borderColor: '#FFD700'
                    }
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>

            {/* Priority Filter Chips */}
            <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="All Industries"
                onClick={() => handlePriorityFilter('all')}
                variant={filterPriority === 'all' ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: filterPriority === 'all' ? '#FFD700' : 'transparent',
                  color: filterPriority === 'all' ? 'black' : '#FFD700',
                  borderColor: '#FFD700',
                  '&:hover': {
                    backgroundColor: filterPriority === 'all' ? '#FFD700' : 'rgba(255, 215, 0, 0.1)'
                  }
                }}
              />
              <Chip
                label="🔥 Hot Industries"
                onClick={() => handlePriorityFilter('hot')}
                variant={filterPriority === 'hot' ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: filterPriority === 'hot' ? '#ff6b35' : 'transparent',
                  color: filterPriority === 'hot' ? 'white' : '#ff6b35',
                  borderColor: '#ff6b35',
                  '&:hover': {
                    backgroundColor: filterPriority === 'hot' ? '#ff6b35' : 'rgba(255, 107, 53, 0.1)'
                  }
                }}
              />
              <Chip
                label="📈 Growing"
                onClick={() => handlePriorityFilter('growing')}
                variant={filterPriority === 'growing' ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: filterPriority === 'growing' ? '#28a745' : 'transparent',
                  color: filterPriority === 'growing' ? 'white' : '#28a745',
                  borderColor: '#28a745',
                  '&:hover': {
                    backgroundColor: filterPriority === 'growing' ? '#28a745' : 'rgba(40, 167, 69, 0.1)'
                  }
                }}
              />
              <Chip
                label="➡️ Stable"
                onClick={() => handlePriorityFilter('stable')}
                variant={filterPriority === 'stable' ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: filterPriority === 'stable' ? '#007bff' : 'transparent',
                  color: filterPriority === 'stable' ? 'white' : '#007bff',
                  borderColor: '#007bff',
                  '&:hover': {
                    backgroundColor: filterPriority === 'stable' ? '#007bff' : 'rgba(0, 123, 255, 0.1)'
                  }
                }}
              />
            </Box>
          </Paper>

          {/* Results Count */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" color="text.secondary">
              {filteredAndSortedIndustries.length} {filteredAndSortedIndustries.length === 1 ? 'industry' : 'industries'} found
            </Typography>
            {searchTerm && (
              <Typography variant="body2" color="text.secondary">
                Results for "{searchTerm}"
              </Typography>
            )}
          </Box>

          {/* Industry Grid/List */}
          {filteredAndSortedIndustries.length > 0 ? (
            <Grid container spacing={3}>
              {filteredAndSortedIndustries.map((industry, index) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={viewMode === 'grid' ? 6 : 12} 
                  lg={viewMode === 'grid' ? 4 : 12} 
                  key={industry.id}
                >
                  <Fade in timeout={600 + index * 100}>
                    <Box>
                      <IndustryCard 
                        industry={industry} 
                        showJobCount={true}
                        compact={viewMode === 'list'}
                      />
                    </Box>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(40, 40, 40, 0.9) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: 3
              }}
            >
              <SearchIcon sx={{ fontSize: 64, color: 'rgba(255, 215, 0, 0.5)', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
                No industries found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your search terms or filters to find what you're looking for.
              </Typography>
              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{
                  borderColor: '#FFD700',
                  color: '#FFD700',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderColor: '#FFD700'
                  }
                }}
              >
                Clear All Filters
              </Button>
            </Paper>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default IndustryDiscoveryPage;
