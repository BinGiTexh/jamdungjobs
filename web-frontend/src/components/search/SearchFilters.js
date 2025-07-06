import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  Chip,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  TextField,
  Autocomplete
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  School as EducationIcon,
  Schedule as TimeIcon,
  AttachMoney as SalaryIcon
} from '@mui/icons-material';

/**
 * Advanced Search Filters Component
 * Jamaica-specific filtering options for job search
 */
const SearchFilters = ({ filters, onFilterChange, onClear }) => {


  // Jamaica parishes for location filtering
  const jamaicaParishes = [
    'Kingston',
    'St. Andrew',
    'St. Catherine',
    'Clarendon',
    'Manchester',
    'St. Elizabeth',
    'Westmoreland',
    'Hanover',
    'St. James',
    'Trelawny',
    'St. Ann',
    'St. Mary',
    'Portland',
    'St. Thomas'
  ];

  // Job types
  const jobTypes = [
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'PART_TIME', label: 'Part-time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'TEMPORARY', label: 'Temporary' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'FREELANCE', label: 'Freelance' }
  ];

  // Experience levels
  const experienceLevels = [
    { value: 'ENTRY', label: 'Entry Level (0-2 years)' },
    { value: 'MID', label: 'Mid Level (3-5 years)' },
    { value: 'SENIOR', label: 'Senior Level (6-10 years)' },
    { value: 'EXECUTIVE', label: 'Executive (10+ years)' }
  ];

  // Industries based on Jamaica GDP sectors
  const industries = [
    { value: 'information_communication', label: 'Information & Communication' },
    { value: 'agriculture_forestry_fishing', label: 'Agriculture, Forestry & Fishing' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'transportation_storage', label: 'Transportation & Storage' },
    { value: 'financial_insurance', label: 'Financial & Insurance' },
    { value: 'construction', label: 'Construction' },
    { value: 'public_administration', label: 'Public Administration' },
    { value: 'accommodation_food', label: 'Accommodation & Food Service' },
    { value: 'real_estate_business', label: 'Real Estate & Business Services' },
    { value: 'education', label: 'Education' },
    { value: 'health_social_work', label: 'Health & Social Work' },
    { value: 'arts_entertainment', label: 'Arts & Entertainment' },
    { value: 'retail_wholesale', label: 'Retail & Wholesale' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'mining_quarrying', label: 'Mining & Quarrying' }
  ];

  // Company sizes
  const companySizes = [
    { value: 'STARTUP', label: 'Startup (1-10 employees)' },
    { value: 'SMALL', label: 'Small (11-50 employees)' },
    { value: 'MEDIUM', label: 'Medium (51-200 employees)' },
    { value: 'LARGE', label: 'Large (201-1000 employees)' },
    { value: 'ENTERPRISE', label: 'Enterprise (1000+ employees)' }
  ];

  // Posted within options
  const postedWithinOptions = [
    { value: '1', label: 'Last 24 hours' },
    { value: '3', label: 'Last 3 days' },
    { value: '7', label: 'Last week' },
    { value: '14', label: 'Last 2 weeks' },
    { value: '30', label: 'Last month' }
  ];

  // Popular skills for autocomplete
  const popularSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'HTML/CSS',
    'Customer Service', 'Sales', 'Marketing', 'Project Management', 'Excel',
    'Communication', 'Leadership', 'Problem Solving', 'Time Management',
    'Data Analysis', 'Digital Marketing', 'Social Media', 'Accounting',
    'Microsoft Office', 'Teamwork', 'Organization', 'Attention to Detail'
  ];

  // Salary ranges in JMD
  const salaryMarks = [
    { value: 0, label: '0' },
    { value: 500000, label: '500K' },
    { value: 1000000, label: '1M' },
    { value: 2000000, label: '2M' },
    { value: 3000000, label: '3M' },
    { value: 5000000, label: '5M+' }
  ];

  // Local state for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    jobType: true,
    salary: false,
    experience: false,
    industry: false,
    company: false,
    posted: false
  });

  // Handle filter updates
  const updateFilter = (key, value) => {
    onFilterChange({ [key]: value });
  };

  // Handle multi-select filters
  const handleMultiSelect = (key, value, checked) => {
    const currentValues = filters[key] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    updateFilter(key, newValues);
  };

  // Handle accordion expansion
  const handleAccordionChange = (section) => (event, isExpanded) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: isExpanded
    }));
  };

  // Format salary value for display
  const formatSalary = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  // Count active filters
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
    <Card sx={{
      backgroundColor: 'rgba(20, 20, 20, 0.9)',
      border: '1px solid rgba(255, 215, 0, 0.3)',
      borderRadius: 2
    }}>
      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 600 }}>
            Filter Jobs
          </Typography>
          {getActiveFiltersCount() > 0 && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={onClear}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { color: '#FFD700' }
              }}
            >
              Clear ({getActiveFiltersCount()})
            </Button>
          )}
        </Box>

        {/* Location Filter */}
        <Accordion 
          expanded={expandedSections.location}
          onChange={handleAccordionChange('location')}
          sx={{ 
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon sx={{ color: '#FFD700' }} />}
            sx={{ px: 0, minHeight: 'auto' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon sx={{ color: '#FFD700', fontSize: 20 }} />
              <Typography sx={{ color: 'white', fontWeight: 500 }}>
                Location
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#FFD700' }}>Parish/Region</InputLabel>
              <Select
                value={filters.parish || ''}
                onChange={(e) => updateFilter('parish', e.target.value)}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 215, 0, 0.5)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700'
                  }
                }}
              >
                <MenuItem value="">All Parishes</MenuItem>
                {jamaicaParishes.map(parish => (
                  <MenuItem key={parish} value={parish}>{parish}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={filters.remote || false}
                  onChange={(e) => updateFilter('remote', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#FFD700'
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#FFD700'
                    }
                  }}
                />
              }
              label={
                <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
                  Remote Work
                </Typography>
              }
            />
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 1, borderColor: 'rgba(255, 215, 0, 0.2)' }} />

        {/* Job Type Filter */}
        <Accordion 
          expanded={expandedSections.jobType}
          onChange={handleAccordionChange('jobType')}
          sx={{ 
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon sx={{ color: '#FFD700' }} />}
            sx={{ px: 0, minHeight: 'auto' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon sx={{ color: '#FFD700', fontSize: 20 }} />
              <Typography sx={{ color: 'white', fontWeight: 500 }}>
                Job Type
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <FormGroup>
              {jobTypes.map(type => (
                <FormControlLabel
                  key={type.value}
                  control={
                    <Checkbox
                      checked={(filters.jobType || []).includes(type.value)}
                      onChange={(e) => handleMultiSelect('jobType', type.value, e.target.checked)}
                      sx={{
                        color: 'rgba(255, 215, 0, 0.5)',
                        '&.Mui-checked': { color: '#FFD700' }
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
                      {type.label}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 1, borderColor: 'rgba(255, 215, 0, 0.2)' }} />

        {/* Salary Filter */}
        <Accordion 
          expanded={expandedSections.salary}
          onChange={handleAccordionChange('salary')}
          sx={{ 
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon sx={{ color: '#FFD700' }} />}
            sx={{ px: 0, minHeight: 'auto' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SalaryIcon sx={{ color: '#FFD700', fontSize: 20 }} />
              <Typography sx={{ color: 'white', fontWeight: 500 }}>
                Salary Range (JMD)
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <Box sx={{ px: 1, pb: 2 }}>
              <Slider
                value={[filters.salaryMin || 0, filters.salaryMax || 5000000]}
                onChange={(e, newValue) => {
                  updateFilter('salaryMin', newValue[0]);
                  updateFilter('salaryMax', newValue[1]);
                }}
                valueLabelDisplay="auto"
                valueLabelFormat={formatSalary}
                min={0}
                max={5000000}
                step={100000}
                marks={salaryMarks}
                sx={{
                  color: '#FFD700',
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#FFD700'
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: '#FFD700'
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(255, 215, 0, 0.3)'
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {formatSalary(filters.salaryMin || 0)} - {formatSalary(filters.salaryMax || 5000000)}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 1, borderColor: 'rgba(255, 215, 0, 0.2)' }} />

        {/* Experience Level Filter */}
        <Accordion 
          expanded={expandedSections.experience}
          onChange={handleAccordionChange('experience')}
          sx={{ 
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon sx={{ color: '#FFD700' }} />}
            sx={{ px: 0, minHeight: 'auto' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EducationIcon sx={{ color: '#FFD700', fontSize: 20 }} />
              <Typography sx={{ color: 'white', fontWeight: 500 }}>
                Experience Level
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <FormControl fullWidth size="small">
              <Select
                value={filters.experienceLevel || ''}
                onChange={(e) => updateFilter('experienceLevel', e.target.value)}
                displayEmpty
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 215, 0, 0.5)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700'
                  }
                }}
              >
                <MenuItem value="">All Experience Levels</MenuItem>
                {experienceLevels.map(level => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 1, borderColor: 'rgba(255, 215, 0, 0.2)' }} />

        {/* Industry Filter */}
        <Accordion 
          expanded={expandedSections.industry}
          onChange={handleAccordionChange('industry')}
          sx={{ 
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon sx={{ color: '#FFD700' }} />}
            sx={{ px: 0, minHeight: 'auto' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon sx={{ color: '#FFD700', fontSize: 20 }} />
              <Typography sx={{ color: 'white', fontWeight: 500 }}>
                Industry
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              <FormGroup>
                {industries.map(industry => (
                  <FormControlLabel
                    key={industry.value}
                    control={
                      <Checkbox
                        checked={(filters.industry || []).includes(industry.value)}
                        onChange={(e) => handleMultiSelect('industry', industry.value, e.target.checked)}
                        sx={{
                          color: 'rgba(255, 215, 0, 0.5)',
                          '&.Mui-checked': { color: '#FFD700' }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
                        {industry.label}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 1, borderColor: 'rgba(255, 215, 0, 0.2)' }} />

        {/* Skills Filter */}
        <Accordion 
          expanded={expandedSections.skills}
          onChange={handleAccordionChange('skills')}
          sx={{ 
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon sx={{ color: '#FFD700' }} />}
            sx={{ px: 0, minHeight: 'auto' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon sx={{ color: '#FFD700', fontSize: 20 }} />
              <Typography sx={{ color: 'white', fontWeight: 500 }}>
                Skills
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <Autocomplete
              multiple
              options={popularSkills}
              value={filters.skills || []}
              onChange={(e, newValue) => updateFilter('skills', newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    sx={{
                      borderColor: '#FFD700',
                      color: '#FFD700',
                      '& .MuiChip-deleteIcon': {
                        color: '#FFD700'
                      }
                    }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Add skills..."
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 215, 0, 0.5)'
                      },
                      '&:hover fieldset': {
                        borderColor: '#FFD700'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#FFD700'
                      }
                    }
                  }}
                />
              )}
            />
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 1, borderColor: 'rgba(255, 215, 0, 0.2)' }} />

        {/* Company Size Filter */}
        <Accordion 
          expanded={expandedSections.company}
          onChange={handleAccordionChange('company')}
          sx={{ 
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon sx={{ color: '#FFD700' }} />}
            sx={{ px: 0, minHeight: 'auto' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon sx={{ color: '#FFD700', fontSize: 20 }} />
              <Typography sx={{ color: 'white', fontWeight: 500 }}>
                Company Size
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <FormControl fullWidth size="small">
              <Select
                value={filters.companySize || ''}
                onChange={(e) => updateFilter('companySize', e.target.value)}
                displayEmpty
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 215, 0, 0.5)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700'
                  }
                }}
              >
                <MenuItem value="">All Company Sizes</MenuItem>
                {companySizes.map(size => (
                  <MenuItem key={size.value} value={size.value}>
                    {size.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 1, borderColor: 'rgba(255, 215, 0, 0.2)' }} />

        {/* Posted Within Filter */}
        <Accordion 
          expanded={expandedSections.posted}
          onChange={handleAccordionChange('posted')}
          sx={{ 
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon sx={{ color: '#FFD700' }} />}
            sx={{ px: 0, minHeight: 'auto' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon sx={{ color: '#FFD700', fontSize: 20 }} />
              <Typography sx={{ color: 'white', fontWeight: 500 }}>
                Posted Within
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <FormControl fullWidth size="small">
              <Select
                value={filters.postedWithin || ''}
                onChange={(e) => updateFilter('postedWithin', e.target.value)}
                displayEmpty
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 215, 0, 0.5)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700'
                  }
                }}
              >
                <MenuItem value="">Any Time</MenuItem>
                {postedWithinOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
