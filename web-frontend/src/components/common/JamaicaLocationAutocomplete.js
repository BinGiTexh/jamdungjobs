import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Autocomplete, 
  Box, 
  Typography, 
  Grid,
  Slider,
  InputAdornment,
  Chip
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { searchLocations, jamaicaParishes } from '../../data/jamaicaLocations';

/**
 * Jamaica-specific location autocomplete component
 * Uses local data of Jamaican parishes, cities, towns, and neighborhoods
 */
export const JamaicaLocationAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Location in Jamaica", 
  radius = 10, 
  onRadiusChange,
  sx = {}
}) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [searchRadius, setSearchRadius] = useState(radius);
  const [selectedParishes, setSelectedParishes] = useState([]);

  // Update options when input changes
  useEffect(() => {
    if (inputValue.length >= 2) {
      const results = searchLocations(inputValue);
      console.log('Jamaica location search results:', results);
      
      // Filter by selected parishes if any
      const filteredResults = selectedParishes.length > 0 
        ? results.filter(option => selectedParishes.includes(option.parish))
        : results;
      
      // Always show at least top parishes if no results
      if (filteredResults.length === 0 && inputValue.length >= 2) {
        // Find parishes that match the input
        const matchingParishes = jamaicaParishes
          .filter(parish => parish.toLowerCase().includes(inputValue.toLowerCase()))
          .slice(0, 3);
          
        if (matchingParishes.length > 0) {
          const parishResults = matchingParishes.map(parish => ({
            mainText: parish,
            secondaryText: 'Jamaica',
            placeId: `jamaica-parish-${parish.toLowerCase().replace(/\s+/g, '-')}`,
            name: parish,
            parish: parish,
            type: 'parish',
            formattedAddress: `${parish}, Jamaica`
          }));
          
          setOptions(parishResults);
          return;
        }
      }
        
      setOptions(filteredResults);
    } else {
      // Show popular locations when input is empty or too short
      const popularLocations = [
        { name: 'Kingston', parish: 'Kingston' },
        { name: 'Montego Bay', parish: 'St. James' },
        { name: 'Ocho Rios', parish: 'St. Ann' },
        { name: 'Negril', parish: 'Westmoreland' },
        { name: 'Mandeville', parish: 'Manchester' }
      ].map(loc => ({
        mainText: loc.name,
        secondaryText: `${loc.parish}, Jamaica`,
        placeId: `jamaica-${loc.parish.toLowerCase().replace(/\s+/g, '-')}-${loc.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: loc.name,
        parish: loc.parish,
        type: 'popular',
        formattedAddress: `${loc.name}, ${loc.parish}, Jamaica`
      }));
      
      setOptions(popularLocations);
    }
  }, [inputValue, selectedParishes]);

  // Handle input change
  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  // Handle option selection
  const handleOptionSelect = (event, option) => {
    if (option) {
      // Add radius to the selected location
      const locationWithRadius = {
        ...option,
        radius: searchRadius
      };
      onChange(locationWithRadius);
    } else {
      onChange(null);
    }
  };

  // Handle radius change
  const handleRadiusChange = (event, newValue) => {
    setSearchRadius(newValue);
    
    // If there's a selected location, update its radius
    if (value) {
      const updatedLocation = {
        ...value,
        radius: newValue
      };
      onChange(updatedLocation);
    }
    
    // Call the parent's radius change handler if provided
    if (onRadiusChange) {
      onRadiusChange(newValue);
    }
  };

  // Handle parish filter selection
  const handleParishSelect = (parish) => {
    setSelectedParishes(prev => {
      if (prev.includes(parish)) {
        return prev.filter(p => p !== parish);
      } else {
        return [...prev, parish];
      }
    });
  };

  return (
    <Box>
      <Autocomplete
        id="jamaica-location-autocomplete"
        options={options}
        getOptionLabel={(option) => typeof option === 'string' ? option : option.mainText}
        filterOptions={(x) => x} // Disable built-in filtering
        autoComplete
        includeInputInList
        filterSelectedOptions
        value={value && typeof value === 'object' ? value : null}
        onChange={handleOptionSelect}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        noOptionsText={inputValue.length < 2 ? "Type at least 2 characters" : "No locations found"}
        renderInput={(params) => (
          <TextField
            {...params}
            label={placeholder}
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon sx={{ color: '#FFD700' }} />
                </InputAdornment>
              ),
              sx: {
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 215, 0, 0.5)',
                  borderWidth: '2px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 215, 0, 0.8)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFD700',
                  borderWidth: '2px',
                },
                ...sx
              }
            }}
            InputLabelProps={{
              sx: { color: '#FFD700', fontWeight: 500 },
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <Grid container alignItems="center">
              <Grid item>
                <Box
                  component={LocationOnIcon}
                  sx={{ color: '#FFD700', mr: 2 }}
                />
              </Grid>
              <Grid item xs>
                <Typography variant="body1" color="text.primary">
                  {option.mainText}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.secondaryText}
                </Typography>
              </Grid>
            </Grid>
          </li>
        )}
      />
      
      {/* Parish filters */}
      <Box sx={{ mt: 1, mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#FFD700', mb: 1, fontWeight: 500 }}>
          Filter by Parish:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {jamaicaParishes.map((parish) => (
            <Chip
              key={parish}
              label={parish}
              size="small"
              onClick={() => handleParishSelect(parish)}
              color={selectedParishes.includes(parish) ? "primary" : "default"}
              sx={{
                backgroundColor: selectedParishes.includes(parish) 
                  ? 'rgba(44, 85, 48, 0.8)' 
                  : 'rgba(255, 255, 255, 0.08)',
                color: selectedParishes.includes(parish) ? '#FFD700' : 'white',
                borderColor: selectedParishes.includes(parish) ? '#FFD700' : 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: selectedParishes.includes(parish) 
                    ? 'rgba(44, 85, 48, 0.9)' 
                    : 'rgba(255, 255, 255, 0.15)',
                }
              }}
            />
          ))}
        </Box>
      </Box>
      
      {/* Radius slider */}
      <Box sx={{ mt: 2 }}>
        <Typography id="radius-slider" gutterBottom sx={{ color: '#FFD700', fontWeight: 500 }}>
          Search Radius: {searchRadius} km
        </Typography>
        <Slider
          value={searchRadius}
          onChange={handleRadiusChange}
          aria-labelledby="radius-slider"
          valueLabelDisplay="auto"
          step={5}
          marks
          min={5}
          max={50}
          sx={{
            color: '#FFD700',
            '& .MuiSlider-thumb': {
              backgroundColor: '#FFD700',
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0px 0px 0px 8px rgba(255, 215, 0, 0.16)',
              },
            },
            '& .MuiSlider-track': {
              backgroundColor: '#FFD700',
            },
            '& .MuiSlider-rail': {
              backgroundColor: 'rgba(255, 215, 0, 0.3)',
            },
            '& .MuiSlider-mark': {
              backgroundColor: 'rgba(255, 215, 0, 0.5)',
            },
            '& .MuiSlider-valueLabel': {
              backgroundColor: '#2C5530',
              color: '#FFD700',
            },
          }}
        />
      </Box>
    </Box>
  );
};
