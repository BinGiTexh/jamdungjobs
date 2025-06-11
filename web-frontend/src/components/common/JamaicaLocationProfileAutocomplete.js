import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Autocomplete, 
  Box, 
  Typography, 
  Grid,
  InputAdornment
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { jamaicaLocations, jamaicaParishes } from '../../data/jamaicaLocations';

// Function to log only in development environment
const logDev = (level, ...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console[level](...args);
  }
};

/**
 * Simplified Jamaica-specific location autocomplete component for profile pages
 * Uses local data of Jamaican parishes, cities, towns, and neighborhoods
 * without the filtering options
 */
export const JamaicaLocationProfileAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Location in Jamaica", 
  sx = {}
}) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);

  // Function to search locations based on input
  const searchLocations = (query) => {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    
    // Search through locations and parishes
    const results = jamaicaLocations
      .filter(location => 
        location.name.toLowerCase().includes(lowerQuery) || 
        location.parish.toLowerCase().includes(lowerQuery)
      )
      .map(location => ({
        mainText: location.name,
        secondaryText: `${location.parish}, Jamaica`,
        placeId: `jamaica-${location.parish.toLowerCase().replace(/\\s+/g, '-')}-${location.name.toLowerCase().replace(/\\s+/g, '-')}`,
        name: location.name,
        parish: location.parish,
        type: location.type || 'location',
        formattedAddress: `${location.name}, ${location.parish}, Jamaica`
      }));
      
    // Add parishes as options if they match
    const parishResults = jamaicaParishes
      .filter(parish => parish.toLowerCase().includes(lowerQuery))
      .map(parish => ({
        mainText: parish,
        secondaryText: 'Jamaica',
        placeId: `jamaica-parish-${parish.toLowerCase().replace(/\\s+/g, '-')}`,
        name: parish,
        parish: parish,
        type: 'parish',
        formattedAddress: `${parish}, Jamaica`
      }));
      
    // Merge and deduplicate options by mainText + secondaryText to ensure unique keys
    const merged = [...results, ...parishResults];
    const seen = new Set();
    const unique = [];
    for (const opt of merged) {
      const dedupKey = `${opt.mainText}|${opt.secondaryText}`;
      if (!seen.has(dedupKey)) {
        seen.add(dedupKey);
        unique.push(opt);
      }
    }
    
    return unique.slice(0, 10);
  };

  // Update options when input changes
  useEffect(() => {
    if (inputValue.length >= 2) {
      const results = searchLocations(inputValue);
      logDev('debug', 'Jamaica location search results:', results);
      setOptions(results);
    } else {
      // Show popular locations when input is empty or too short
      const popularLocations = [
        { name: 'Kingston', parish: 'Kingston' },
        { name: 'Montego Bay', parish: 'St. James' },
        { name: 'Ocho Rios', parish: 'St. Ann' },
        { name: 'Negril', parish: 'Westmoreland' },
        { name: 'Mandeville', parish: 'Manchester' },
        ...jamaicaParishes.map(parish => ({ name: parish, parish }))
      ].map(loc => ({
        mainText: loc.name,
        secondaryText: loc.name === loc.parish ? 'Jamaica' : `${loc.parish}, Jamaica`,
        placeId: `jamaica-${loc.parish.toLowerCase().replace(/\\s+/g, '-')}-${loc.name.toLowerCase().replace(/\\s+/g, '-')}`,
        name: loc.name,
        parish: loc.parish,
        type: loc.name === loc.parish ? 'parish' : 'popular',
        formattedAddress: loc.name === loc.parish ? `${loc.name}, Jamaica` : `${loc.name}, ${loc.parish}, Jamaica`
      }));
      
      setOptions(popularLocations);
    }
  }, [inputValue]);

  // Handle input change
  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  // Handle option selection
  const handleOptionSelect = (event, option) => {
    if (option) {
      onChange(option);
    } else {
      onChange(null);
    }
  };

  return (
    <Autocomplete
      id="jamaica-location-profile-autocomplete"
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
  );
};

export default JamaicaLocationProfileAutocomplete;
