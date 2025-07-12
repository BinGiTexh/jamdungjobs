/**
 * Job Type Multi-Select Chips Component
 * Chip-based selection with visual feedback and "Clear all" functionality
 */

import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Button,
  Grid,
  Paper
} from '@mui/material';
import { 
  Work,
  Schedule,
  Assignment,
  Home,
  Business,
  AccessTime,
  Clear,
  CheckCircle
} from '@mui/icons-material';
import { useTheme } from '../../../context/ThemeContext';

const jobTypeOptions = [
  {
    value: 'full-time',
    label: 'Full-time',
    icon: Work,
    color: '#4CAF50',
    description: '40+ hours per week',
    popular: true
  },
  {
    value: 'part-time',
    label: 'Part-time',
    icon: Schedule,
    color: '#FF9800',
    description: 'Less than 40 hours',
    popular: true
  },
  {
    value: 'contract',
    label: 'Contract',
    icon: Assignment,
    color: '#2196F3',
    description: 'Fixed-term project',
    popular: true
  },
  {
    value: 'remote',
    label: 'Remote',
    icon: Home,
    color: '#9C27B0',
    description: 'Work from anywhere',
    popular: true
  },
  {
    value: 'hybrid',
    label: 'Hybrid',
    icon: Business,
    color: '#607D8B',
    description: 'Office + remote mix',
    popular: false
  },
  {
    value: 'temporary',
    label: 'Temporary',
    icon: AccessTime,
    color: '#795548',
    description: 'Short-term position',
    popular: false
  }
];

const JobTypeChips = ({ 
  value = [],
  onChange,
  disabled = false,
  maxSelections = 4,
  showDescriptions = true,
  compact = false 
}) => {
  const { jamaicanColors } = useTheme();

  /**
   * Handle job type selection/deselection
   */
  const handleToggle = useCallback((jobType) => {
    if (disabled) return;
    
    let newSelection;
    
    if (value.includes(jobType)) {
      // Remove from selection
      newSelection = value.filter(type => type !== jobType);
    } else {
      // Add to selection (check max limit)
      if (value.length >= maxSelections) {
        console.warn(`Maximum ${maxSelections} job types can be selected`);
        return;
      }
      newSelection = [...value, jobType];
    }
    
    onChange?.(newSelection);
    console.warn('💼 Job types selected:', newSelection);
  }, [value, onChange, disabled, maxSelections]);

  /**
   * Clear all selections
   */
  const handleClearAll = useCallback(() => {
    if (disabled) return;
    
    onChange?.([]);
    console.warn('💼 All job types cleared');
  }, [onChange, disabled]);

  /**
   * Select popular job types
   */
  const handleSelectPopular = useCallback(() => {
    if (disabled) return;
    
    const popularTypes = jobTypeOptions
      .filter(option => option.popular)
      .map(option => option.value)
      .slice(0, maxSelections);
    
    onChange?.(popularTypes);
    console.warn('💼 Popular job types selected:', popularTypes);
  }, [onChange, disabled, maxSelections]);

  if (compact) {
    // Compact layout for mobile
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Work sx={{ color: jamaicanColors.green, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Job Type
          </Typography>
          {value.length > 0 && (
            <Chip
              size="small"
              label={`${value.length} selected`}
              sx={{ ml: 1, bgcolor: jamaicanColors.green, color: 'white' }}
            />
          )}
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {jobTypeOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = value.includes(option.value);
            
            return (
              <Chip
                key={option.value}
                icon={<IconComponent sx={{ fontSize: '1rem' }} />}
                label={option.label}
                onClick={() => handleToggle(option.value)}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{
                  minHeight: 44, // Touch-friendly
                  px: 2,
                  borderColor: option.color,
                  color: isSelected ? 'white' : option.color,
                  bgcolor: isSelected ? option.color : 'transparent',
                  '&:hover': {
                    bgcolor: `${option.color}20`
                  },
                  '& .MuiChip-icon': {
                    color: isSelected ? 'white' : option.color
                  }
                }}
                disabled={disabled}
              />
            );
          })}
        </Stack>

        {value.length > 0 && (
          <Button
            startIcon={<Clear />}
            onClick={handleClearAll}
            size="small"
            sx={{ 
              mt: 2,
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
            disabled={disabled}
          >
            Clear All
          </Button>
        )}
      </Box>
    );
  }

  // Full layout with descriptions
  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Work sx={{ color: jamaicanColors.green, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Job Type
          </Typography>
          {value.length > 0 && (
            <Chip
              size="small"
              label={`${value.length}/${maxSelections} selected`}
              sx={{ 
                ml: 2, 
                bgcolor: jamaicanColors.green, 
                color: 'white',
                fontSize: '0.75rem'
              }}
            />
          )}
        </Box>

        {/* Quick Actions */}
        <Stack direction="row" spacing={1}>
          {value.length === 0 && (
            <Button
              size="small"
              onClick={handleSelectPopular}
              sx={{ 
                color: jamaicanColors.green,
                '&:hover': {
                  bgcolor: `${jamaicanColors.green}10`
                }
              }}
              disabled={disabled}
            >
              Select Popular
            </Button>
          )}
          
          {value.length > 0 && (
            <Button
              startIcon={<Clear />}
              size="small"
              onClick={handleClearAll}
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
              disabled={disabled}
            >
              Clear All
            </Button>
          )}
        </Stack>
      </Box>

      {/* Job Type Options */}
      <Grid container spacing={2}>
        {jobTypeOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = value.includes(option.value);
          const isDisabled = disabled || (!isSelected && value.length >= maxSelections);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={option.value}>
              <Paper
                elevation={isSelected ? 3 : 1}
                sx={{
                  p: 2,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  border: `2px solid ${isSelected ? option.color : 'transparent'}`,
                  bgcolor: isSelected ? `${option.color}10` : 'background.paper',
                  opacity: isDisabled ? 0.6 : 1,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': isDisabled ? {} : {
                    elevation: 2,
                    border: `2px solid ${option.color}50`,
                    bgcolor: `${option.color}05`
                  },
                  minHeight: showDescriptions ? 100 : 80,
                  position: 'relative'
                }}
                onClick={isDisabled ? undefined : () => handleToggle(option.value)}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <CheckCircle
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: option.color,
                      fontSize: '1.2rem'
                    }}
                  />
                )}

                {/* Content */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <IconComponent 
                    sx={{ 
                      color: option.color, 
                      mr: 1,
                      fontSize: '1.5rem' 
                    }} 
                  />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {option.label}
                  </Typography>
                  {option.popular && (
                    <Chip
                      label="Popular"
                      size="small"
                      sx={{
                        ml: 1,
                        height: 16,
                        fontSize: '0.6rem',
                        bgcolor: jamaicanColors.gold,
                        color: 'white'
                      }}
                    />
                  )}
                </Box>
                
                {showDescriptions && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: '0.85rem' }}
                  >
                    {option.description}
                  </Typography>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Selection Limit Warning */}
      {value.length >= maxSelections && (
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          bgcolor: 'warning.light', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'warning.main'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Maximum Selection Reached
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can select up to {maxSelections} job types. Remove some to add others.
          </Typography>
        </Box>
      )}

      {/* Helpful Info */}
      <Box sx={{ 
        mt: 3, 
        p: 2, 
        bgcolor: `${jamaicanColors.green}10`, 
        borderRadius: 2,
        border: `1px solid ${jamaicanColors.green}30`
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          💡 Job Type Tips
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select multiple types to see more opportunities. Many jobs offer flexible 
          arrangements that might fit your needs.
        </Typography>
      </Box>
    </Box>
  );
};

export default JobTypeChips;
