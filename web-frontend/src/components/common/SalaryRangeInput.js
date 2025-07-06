import React from 'react';
import { Box, Slider, Typography, TextField, InputAdornment } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

/**
 * A Material-UI based salary range input component
 * Allows users to input minimum and maximum salary values
 */
export const SalaryRangeInput = ({ value, onChange, sx }) => {
  const handleMinChange = (event) => {
    const newMin = Number(event.target.value.replace(/[^0-9]/g, ''));
    onChange({ 
      min: newMin || 0, 
      max: value.max 
    });
  };

  const handleMaxChange = (event) => {
    const newMax = Number(event.target.value.replace(/[^0-9]/g, ''));
    onChange({ 
      min: value.min, 
      max: newMax || 0 
    });
  };

  const handleSliderChange = (event, newValue) => {
    onChange({ 
      min: newValue[0], 
      max: newValue[1] 
    });
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('en-US');
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Minimum"
          value={formatCurrency(value.min)}
          onChange={handleMinChange}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AttachMoneyIcon sx={{ color: '#FFD700' }} />
              </InputAdornment>
            ),
            sx: {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 215, 0, 0.5)',
                borderWidth: '2px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 215, 0, 0.8)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FFD700',
                borderWidth: '2px'
              }
            }
          }}
          InputLabelProps={{
            sx: { color: '#FFD700', fontWeight: 500 }
          }}
        />
        <TextField
          label="Maximum"
          value={formatCurrency(value.max)}
          onChange={handleMaxChange}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AttachMoneyIcon sx={{ color: '#FFD700' }} />
              </InputAdornment>
            ),
            sx: {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 215, 0, 0.5)',
                borderWidth: '2px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 215, 0, 0.8)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FFD700',
                borderWidth: '2px'
              }
            }
          }}
          InputLabelProps={{
            sx: { color: '#FFD700', fontWeight: 500 }
          }}
        />
      </Box>
      
      <Box sx={{ px: 1 }}>
        <Typography id="salary-range-slider" gutterBottom sx={{ color: '#FFD700', fontWeight: 500 }}>
          Salary Range: ${formatCurrency(value.min)} - ${formatCurrency(value.max)}
        </Typography>
        <Slider
          value={[value.min, value.max]}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          valueLabelFormat={(x) => `$${formatCurrency(x)}`}
          min={0}
          max={300000}
          step={5000}
          sx={{
            color: '#FFD700',
            '& .MuiSlider-thumb': {
              backgroundColor: '#FFD700',
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0px 0px 0px 8px rgba(255, 215, 0, 0.16)'
              }
            },
            '& .MuiSlider-track': {
              backgroundColor: '#FFD700'
            },
            '& .MuiSlider-rail': {
              backgroundColor: 'rgba(255, 215, 0, 0.3)'
            },
            '& .MuiSlider-valueLabel': {
              backgroundColor: '#2C5530',
              color: '#FFD700'
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default SalaryRangeInput;
