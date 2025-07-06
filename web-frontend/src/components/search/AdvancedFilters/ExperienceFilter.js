/**
 * Experience Level Filter Component
 * Radio button group with clear visual hierarchy and mobile-optimized touch targets
 */

import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Grid,
  Chip,
  Stack
} from '@mui/material';
import { 
  School, 
  TrendingUp, 
  Star, 
  EmojiEvents,
  WorkOutline 
} from '@mui/icons-material';
import { useTheme } from '../../../context/ThemeContext';

const experienceLevels = [
  {
    value: 'entry',
    label: 'Entry Level',
    description: '0-2 years experience',
    icon: School,
    color: '#4CAF50',
    examples: ['Recent graduate', 'First job', 'Career starter']
  },
  {
    value: 'mid',
    label: 'Mid Level',
    description: '2-5 years experience',
    icon: TrendingUp,
    color: '#FF9800',
    examples: ['Some experience', 'Developing skills', 'Growing career']
  },
  {
    value: 'senior',
    label: 'Senior Level',
    description: '5-10 years experience',
    icon: Star,
    color: '#2196F3',
    examples: ['Experienced professional', 'Team lead', 'Subject expert']
  },
  {
    value: 'executive',
    label: 'Executive',
    description: '10+ years experience',
    icon: EmojiEvents,
    color: '#9C27B0',
    examples: ['Senior management', 'Director level', 'C-suite']
  }
];

const ExperienceFilter = ({ 
  value = '',
  onChange,
  disabled = false,
  showExamples = true,
  compact = false 
}) => {
  const { jamaicanColors } = useTheme();

  /**
   * Handle experience level change
   */
  const handleChange = useCallback((event) => {
    const selectedValue = event.target.value;
    onChange?.(selectedValue);
    console.warn('📊 Experience level selected:', selectedValue);
  }, [onChange]);

  /**
   * Handle quick selection via chip
   */
  const handleChipSelect = useCallback((levelValue) => {
    onChange?.(levelValue);
    console.warn('📊 Experience level selected via chip:', levelValue);
  }, [onChange]);

  /**
   * Clear selection
   */
  const handleClear = useCallback(() => {
    onChange?.('');
    console.warn('📊 Experience filter cleared');
  }, [onChange]);

  if (compact) {
    // Compact chip-based layout for mobile
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WorkOutline sx={{ color: jamaicanColors.green, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Experience Level
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {experienceLevels.map((level) => {
            const IconComponent = level.icon;
            return (
              <Chip
                key={level.value}
                icon={<IconComponent sx={{ fontSize: '1rem' }} />}
                label={level.label}
                onClick={() => handleChipSelect(level.value)}
                variant={value === level.value ? 'filled' : 'outlined'}
                sx={{
                  minHeight: 44, // Touch-friendly
                  px: 2,
                  borderColor: level.color,
                  color: value === level.value ? 'white' : level.color,
                  bgcolor: value === level.value ? level.color : 'transparent',
                  '&:hover': {
                    bgcolor: `${level.color}20`
                  },
                  '& .MuiChip-icon': {
                    color: value === level.value ? 'white' : level.color
                  }
                }}
                disabled={disabled}
              />
            );
          })}
          
          {value && (
            <Chip
              label="Clear"
              onClick={handleClear}
              variant="outlined"
              sx={{
                minHeight: 44,
                borderColor: 'text.secondary',
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
              disabled={disabled}
            />
          )}
        </Stack>
      </Box>
    );
  }

  // Full layout with radio buttons and descriptions
  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <WorkOutline sx={{ color: jamaicanColors.green, mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Experience Level
        </Typography>
      </Box>

      {/* Radio Group */}
      <RadioGroup
        value={value}
        onChange={handleChange}
        sx={{ width: '100%' }}
      >
        <Grid container spacing={2}>
          {experienceLevels.map((level) => {
            const IconComponent = level.icon;
            const isSelected = value === level.value;
            
            return (
              <Grid item xs={12} sm={6} key={level.value}>
                <Paper
                  elevation={isSelected ? 3 : 1}
                  sx={{
                    p: 2,
                    cursor: disabled ? 'default' : 'pointer',
                    border: `2px solid ${isSelected ? level.color : 'transparent'}`,
                    bgcolor: isSelected ? `${level.color}10` : 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': disabled ? {} : {
                      elevation: 2,
                      border: `2px solid ${level.color}50`,
                      bgcolor: `${level.color}05`
                    },
                    minHeight: 120 // Consistent height
                  }}
                  onClick={disabled ? undefined : () => handleChipSelect(level.value)}
                >
                  <FormControlLabel
                    value={level.value}
                    control={
                      <Radio
                        sx={{
                          color: level.color,
                          '&.Mui-checked': {
                            color: level.color
                          }
                        }}
                        disabled={disabled}
                      />
                    }
                    label={
                      <Box sx={{ ml: 1, width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <IconComponent 
                            sx={{ 
                              color: level.color, 
                              mr: 1,
                              fontSize: '1.2rem' 
                            }} 
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {level.label}
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mb: showExamples ? 1 : 0 }}
                        >
                          {level.description}
                        </Typography>
                        
                        {showExamples && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {level.examples.map((example, index) => (
                              <Chip
                                key={index}
                                label={example}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 20,
                                  borderColor: `${level.color}50`,
                                  color: level.color
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                    sx={{ 
                      width: '100%',
                      m: 0,
                      alignItems: 'flex-start'
                    }}
                  />
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </RadioGroup>

      {/* Clear Selection */}
      {value && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Chip
            label="Clear Experience Filter"
            onClick={handleClear}
            variant="outlined"
            sx={{
              borderColor: 'text.secondary',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
            disabled={disabled}
          />
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
          💡 Experience Level Guide
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Don't see your exact experience? Choose the closest level. Many employers 
          are flexible and value skills over years of experience.
        </Typography>
      </Box>
    </Box>
  );
};

export default ExperienceFilter;
