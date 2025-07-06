/**
 * Salary Range Filter Component
 * JMD currency slider with min/max inputs and validation
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Chip,
  Stack,
  InputAdornment
} from '@mui/material';
import { AttachMoney, TrendingUp } from '@mui/icons-material';
import { useTheme } from '../../../context/ThemeContext';
import { 
  formatJMD, 
  parseJMD, 
  getSalaryPresets, 
  validateSalaryRange 
} from '../utils/currencyFormatter';

const SalaryRangeFilter = ({ 
  value = { min: 30000, max: 1000000, showUnspecified: false },
  onChange,
  disabled = false 
}) => {
  const { jamaicanColors } = useTheme();
  const [localValue, setLocalValue] = useState(value);
  const [validationError, setValidationError] = useState(null);
  const [minInput, setMinInput] = useState(formatJMD(value.min, false));
  const [maxInput, setMaxInput] = useState(formatJMD(value.max, false));

  // Salary presets for quick selection
  const salaryPresets = getSalaryPresets();

  // Update local state when prop changes
  useEffect(() => {
    setLocalValue(value);
    setMinInput(formatJMD(value.min, false));
    setMaxInput(formatJMD(value.max, false));
  }, [value]);

  /**
   * Handle slider change
   */
  const handleSliderChange = useCallback((event, newValue) => {
    const [min, max] = newValue;
    const newSalaryRange = {
      ...localValue,
      min,
      max,
      showUnspecified: false // Clear unspecified when using slider
    };
    
    setLocalValue(newSalaryRange);
    setMinInput(formatJMD(min, false));
    setMaxInput(formatJMD(max, false));
    
    // Validate and update parent
    const validation = validateSalaryRange(min, max);
    if (validation.isValid) {
      setValidationError(null);
      onChange?.(newSalaryRange);
    } else {
      setValidationError(validation.error);
    }
  }, [localValue, onChange]);

  /**
   * Handle min input change
   */
  const handleMinInputChange = useCallback((event) => {
    const inputValue = event.target.value;
    setMinInput(inputValue);
    
    const parsedMin = parseJMD(inputValue);
    if (parsedMin > 0) {
      const newSalaryRange = {
        ...localValue,
        min: parsedMin,
        showUnspecified: false
      };
      
      const validation = validateSalaryRange(parsedMin, localValue.max);
      if (validation.isValid) {
        setValidationError(null);
        setLocalValue(newSalaryRange);
        onChange?.(newSalaryRange);
      } else {
        setValidationError(validation.error);
      }
    }
  }, [localValue, onChange]);

  /**
   * Handle max input change
   */
  const handleMaxInputChange = useCallback((event) => {
    const inputValue = event.target.value;
    setMaxInput(inputValue);
    
    const parsedMax = parseJMD(inputValue);
    if (parsedMax > 0) {
      const newSalaryRange = {
        ...localValue,
        max: parsedMax,
        showUnspecified: false
      };
      
      const validation = validateSalaryRange(localValue.min, parsedMax);
      if (validation.isValid) {
        setValidationError(null);
        setLocalValue(newSalaryRange);
        onChange?.(newSalaryRange);
      } else {
        setValidationError(validation.error);
      }
    }
  }, [localValue, onChange]);

  /**
   * Handle "salary not specified" checkbox
   */
  const handleUnspecifiedChange = useCallback((event) => {
    const showUnspecified = event.target.checked;
    const newSalaryRange = {
      ...localValue,
      showUnspecified
    };
    
    setLocalValue(newSalaryRange);
    setValidationError(null);
    onChange?.(newSalaryRange);
  }, [localValue, onChange]);

  /**
   * Handle preset selection
   */
  const handlePresetSelect = useCallback((preset) => {
    const newSalaryRange = {
      min: preset.min,
      max: preset.max,
      showUnspecified: false
    };
    
    setLocalValue(newSalaryRange);
    setMinInput(formatJMD(preset.min, false));
    setMaxInput(formatJMD(preset.max, false));
    setValidationError(null);
    onChange?.(newSalaryRange);
  }, [onChange]);

  // Slider marks for better UX
  const sliderMarks = [
    { value: 30000, label: '30K' },
    { value: 100000, label: '100K' },
    { value: 300000, label: '300K' },
    { value: 500000, label: '500K' },
    { value: 1000000, label: '1M+' }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AttachMoney sx={{ color: jamaicanColors.green, mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Salary Range
        </Typography>
      </Box>

      {/* Quick Presets */}
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
        {salaryPresets.map((preset) => (
          <Chip
            key={preset.label}
            label={preset.label}
            onClick={() => handlePresetSelect(preset)}
            variant={
              localValue.min === preset.min && localValue.max === preset.max
                ? 'filled'
                : 'outlined'
            }
            sx={{
              borderColor: jamaicanColors.green,
              color: localValue.min === preset.min && localValue.max === preset.max
                ? 'white'
                : jamaicanColors.green,
              bgcolor: localValue.min === preset.min && localValue.max === preset.max
                ? jamaicanColors.green
                : 'transparent',
              '&:hover': {
                bgcolor: `${jamaicanColors.green}20`
              }
            }}
            disabled={disabled}
          />
        ))}
      </Stack>

      {/* Salary Range Slider */}
      {!localValue.showUnspecified && (
        <Box sx={{ px: 2, mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {formatJMD(localValue.min)} - {formatJMD(localValue.max)}
          </Typography>
          
          <Slider
            value={[localValue.min, localValue.max]}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatJMD(value)}
            min={30000}
            max={1000000}
            step={10000}
            marks={sliderMarks}
            disabled={disabled}
            sx={{
              color: jamaicanColors.green,
              '& .MuiSlider-thumb': {
                backgroundColor: jamaicanColors.green
              },
              '& .MuiSlider-track': {
                backgroundColor: jamaicanColors.green
              },
              '& .MuiSlider-rail': {
                backgroundColor: `${jamaicanColors.green}30`
              },
              '& .MuiSlider-mark': {
                backgroundColor: `${jamaicanColors.green}50`
              },
              '& .MuiSlider-markLabel': {
                fontSize: '0.75rem',
                color: 'text.secondary'
              }
            }}
          />
        </Box>
      )}

      {/* Min/Max Input Fields */}
      {!localValue.showUnspecified && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField
              label="Minimum Salary"
              value={minInput}
              onChange={handleMinInputChange}
              disabled={disabled}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">JMD</InputAdornment>
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
          
          <Grid item xs={6}>
            <TextField
              label="Maximum Salary"
              value={maxInput}
              onChange={handleMaxInputChange}
              disabled={disabled}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">JMD</InputAdornment>
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
        </Grid>
      )}

      {/* Salary Not Specified Option */}
      <FormControlLabel
        control={
          <Checkbox
            checked={localValue.showUnspecified}
            onChange={handleUnspecifiedChange}
            disabled={disabled}
            sx={{
              color: jamaicanColors.green,
              '&.Mui-checked': {
                color: jamaicanColors.green
              }
            }}
          />
        }
        label="Include jobs with salary not specified"
        sx={{ mb: 1 }}
      />

      {/* Validation Error */}
      {validationError && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {validationError}
        </Typography>
      )}

      {/* Helpful Info */}
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        bgcolor: `${jamaicanColors.green}10`, 
        borderRadius: 2,
        border: `1px solid ${jamaicanColors.green}30`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TrendingUp sx={{ color: jamaicanColors.green, mr: 1, fontSize: '1rem' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Salary Insights
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Average salaries in Jamaica: Entry level JMD 50,000-80,000 • 
          Mid level JMD 100,000-250,000 • Senior level JMD 300,000+
        </Typography>
      </Box>
    </Box>
  );
};

export default SalaryRangeFilter;
