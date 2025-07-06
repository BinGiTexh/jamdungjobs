import React, { useState, useEffect } from 'react';
import { Box, Slider, Typography } from '@mui/material';

/**
 * Salary range selector using a dual-thumb MUI Slider.
 * Accepts a value object { min: number, max: number } and emits the same shape via onChange.
 */
export const SalaryRangeAutocomplete = ({ value = { min: 30000, max: 100000 }, onChange, sx = {} }) => {
  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  // Convert incoming object into slider array [min, max]
  const [range, setRange] = useState([
    clamp(value?.min ?? 0, 0, 200000),
    clamp(value?.max ?? 200000, 0, 200000)
  ]);

  // Keep local state in sync with external changes
  useEffect(() => {
    setRange([
      clamp(value?.min ?? 0, 0, 200000),
      clamp(value?.max ?? 200000, 0, 200000)
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.min, value?.max]);

  const formatCurrency = (num) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);

  const handleSliderChange = (event, newValue) => {
    setRange(newValue);
  };

  const handleSliderCommitted = (event, newValue) => {
    onChange({ min: newValue[0], max: newValue[1] });
  };

  return (
    <Box sx={{ px: 2, py: 1, ...sx }}>
      <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 500, mb: 1 }}>
        {`${formatCurrency(range[0])} – ${formatCurrency(range[1])}`}
      </Typography>
      <Slider
        value={range}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderCommitted}
        valueLabelDisplay="auto"
        getAriaLabel={() => 'Salary range'}
        valueLabelFormat={formatCurrency}
        step={5000}
        min={0}
        max={200000}
        marks={[
          { value: 0, label: '$0' },
          { value: 50000, label: '$50k' },
          { value: 100000, label: '$100k' },
          { value: 150000, label: '$150k' },
          { value: 200000, label: '$200k+' }
        ]}
        sx={{
          color: '#FFD700',
          '& .MuiSlider-thumb': {
            backgroundColor: '#FFD700',
            border: '2px solid #2C5530'
          },
          '& .MuiSlider-track': {
            backgroundColor: '#FFD700'
          },
          '& .MuiSlider-rail': {
            backgroundColor: 'rgba(255, 215, 0, 0.3)'
          }
        }}
      />
    </Box>
  );
};
