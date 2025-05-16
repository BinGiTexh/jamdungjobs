import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  TextField, 
  Autocomplete, 
  Box, 
  Typography, 
  Grid,
  Slider,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export const LocationAutocomplete = ({ value, onChange, placeholder = "Location", radius, onRadiusChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchRadius, setSearchRadius] = useState(radius || 10); // Default 10 km
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Check if script is already loaded
    if (window.google?.maps?.places) {
      console.log('Google Maps already loaded');
      setIsLoaded(true);
      initAutocomplete();
      return;
    }

    // Load Google Places API script
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      console.log('Script tag exists, waiting for load');
      return;
    }

    console.log('Creating new script tag');
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    console.log('API Key status:', apiKey ? 'Present' : 'Missing');
    
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      console.log('If you see "This API project is not authorized to use this API", please enable the Places API in the Google Cloud Console.');
    };
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      setIsLoaded(true);
      initAutocomplete();
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove the script on unmount as other components might need it
    };
  }, []);

  const initAutocomplete = () => {
    console.log('Initializing autocomplete service');
    try {
      autocompleteRef.current = new window.google.maps.places.AutocompleteService();
      console.log('Autocomplete service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize autocomplete service:', error);
    }
  };

  const debouncedPredictions = useCallback(
    (() => {
      let timeoutId;
      return (input) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        return new Promise((resolve) => {
          timeoutId = setTimeout(() => {
            if (!autocompleteRef.current) {
              console.error('Autocomplete service not initialized');
              resolve([]);
              return;
            }

            console.log('Requesting predictions for:', input);
            try {
              setLoading(true);
              autocompleteRef.current.getPlacePredictions(
                {
                  input,
                  types: ['(cities)', 'locality', 'sublocality', 'neighborhood'],
                  // Allow locations in Jamaica by default, but don't restrict to only Jamaica
                  // componentRestrictions: { country: 'jm' }
                },
                (predictions, status) => {
                  setLoading(false);
                  resolve({ predictions, status });
                }
              );
            } catch (error) {
              console.error('Error getting predictions:', error);
              setLoading(false);
              resolve({ predictions: [], status: 'ERROR' });
            }
          }, 300); // 300ms delay
        });
      };
    })(),
    []
  );

  const handleInputChange = async (event, newInputValue) => {
    setInputValue(newInputValue);

    if (newInputValue.length >= 2) {
      const { predictions, status } = await debouncedPredictions(newInputValue);
      handleAutocompleteResults(predictions, status);
    } else {
      setOptions([]);
    }
  };

  const handleAutocompleteResults = (predictions, status) => {
    console.log('Got autocomplete results:', { status, predictionsCount: predictions?.length });
    
    // Check for specific API activation error
    if (status === 'REQUEST_DENIED') {
      console.error('Google Places API request was denied. Please check if the Places API is enabled in your Google Cloud Console.');
      console.log('Steps to enable the API:');
      console.log('1. Go to https://console.cloud.google.com');
      console.log('2. Select your project');
      console.log('3. Go to "APIs & Services" > "Library"');
      console.log('4. Search for "Places API"');
      console.log('5. Click "Enable"');
      return;
    }

    try {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        const mappedOptions = predictions.map(p => ({
          id: p.place_id,
          description: p.description,
          mainText: p.structured_formatting.main_text,
          secondaryText: p.structured_formatting.secondary_text
        }));
        console.log('Mapped options:', mappedOptions);
        setOptions(mappedOptions);
      } else {
        console.log('No valid predictions received, status:', status);
        setOptions([]);
      }
    } catch (error) {
      console.error('Error processing predictions:', error);
      setOptions([]);
    }
  };

  const handleOptionSelect = (event, option) => {
    if (option) {
      // Pass both the location name and the place_id to the parent component
      onChange({
        name: option.mainText,
        placeId: option.id,
        radius: searchRadius
      });
    } else {
      onChange(null);
    }
  };
  
  const handleRadiusChange = (event, newValue) => {
    setSearchRadius(newValue);
    
    // If we have a selected location, update the parent component with the new radius
    if (value && typeof value === 'object' && value.name) {
      onChange({
        ...value,
        radius: newValue
      });
    }
    
    // If onRadiusChange callback is provided, call it
    if (onRadiusChange) {
      onRadiusChange(newValue);
    }
  };

  // Initialize inputValue from value prop if it exists
  useEffect(() => {
    if (value && typeof value === 'object' && value.name) {
      setInputValue(value.name);
      if (value.radius) {
        setSearchRadius(value.radius);
      }
    } else if (typeof value === 'string') {
      setInputValue(value);
    }
  }, [value]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Autocomplete
          id="location-autocomplete"
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
          loading={loading}
          noOptionsText="No locations found"
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
                endAdornment: (
                  <React.Fragment>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
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
                    sx={{ color: 'text.secondary', mr: 2 }}
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
      </Grid>
      
      {/* Radius slider */}
      <Grid item xs={12}>
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
      </Grid>
    </Grid>
  );
};
