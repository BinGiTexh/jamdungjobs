/**
 * Parish-Based Location Selector Component
 * Dropdown with all 14 Jamaican parishes and town/city autocomplete
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Grid,
  Chip,
  Stack,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  LocationOn,
  MyLocation,
  History,
  Clear,
  TrendingUp
} from '@mui/icons-material';
import { useTheme } from '../../../context/ThemeContext';
import { getParishTowns } from '../utils/distanceCalculator';

const jamaicanParishes = [
  'Kingston',
  'St. Andrew',
  'St. Thomas',
  'Portland',
  'St. Mary',
  'St. Ann',
  'Trelawny',
  'St. James',
  'Hanover',
  'Westmoreland',
  'St. Elizabeth',
  'Manchester',
  'Clarendon',
  'St. Catherine'
];

const LocationSelector = ({ 
  value = { parish: '', town: '' },
  onChange,
  disabled = false,
  showRecentLocations = true,
  onUseGPS,
  recentLocations = [],
  compact = false 
}) => {
  const { jamaicanColors } = useTheme();
  const [parishTowns, setParishTowns] = useState({});
  const [townOptions, setTownOptions] = useState([]);

  // Load parish towns data
  useEffect(() => {
    const towns = getParishTowns();
    setParishTowns(towns);
  }, []);

  // Update town options when parish changes
  useEffect(() => {
    if (value.parish && parishTowns[value.parish]) {
      setTownOptions(parishTowns[value.parish]);
    } else {
      setTownOptions([]);
    }
  }, [value.parish, parishTowns]);

  /**
   * Handle parish selection
   */
  const handleParishChange = useCallback((event) => {
    const selectedParish = event.target.value;
    const newLocation = {
      parish: selectedParish,
      town: '' // Reset town when parish changes
    };
    
    onChange?.(newLocation);
    console.warn('📍 Parish selected:', selectedParish);
  }, [onChange]);

  /**
   * Handle town selection
   */
  const handleTownChange = useCallback((event, newValue) => {
    const newLocation = {
      ...value,
      town: newValue || ''
    };
    
    onChange?.(newLocation);
    console.warn('📍 Town selected:', newValue);
  }, [value, onChange]);

  /**
   * Handle recent location selection
   */
  const handleRecentLocationSelect = useCallback((location) => {
    onChange?.(location);
    console.warn('📍 Recent location selected:', location);
  }, [onChange]);

  /**
   * Clear location selection
   */
  const handleClear = useCallback(() => {
    onChange?.({ parish: '', town: '' });
    console.warn('📍 Location cleared');
  }, [onChange]);

  /**
   * Format location for display
   */
  const formatLocation = useCallback((location) => {
    if (location.town && location.parish) {
      return `${location.town}, ${location.parish}`;
    }
    return location.parish || location.town || '';
  }, []);

  if (compact) {
    // Compact layout for mobile
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ color: jamaicanColors.green, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Location
          </Typography>
          {onUseGPS && (
            <Button
              size="small"
              startIcon={<MyLocation />}
              onClick={onUseGPS}
              sx={{ 
                ml: 'auto',
                color: jamaicanColors.green,
                minWidth: 'auto',
                px: 1
              }}
              disabled={disabled}
            >
              GPS
            </Button>
          )}
        </Box>

        <Stack spacing={2}>
          {/* Parish Selection */}
          <FormControl fullWidth>
            <InputLabel sx={{ '&.Mui-focused': { color: jamaicanColors.green } }}>
              Parish
            </InputLabel>
            <Select
              value={value.parish}
              label="Parish"
              onChange={handleParishChange}
              disabled={disabled}
              sx={{
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: jamaicanColors.green
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: jamaicanColors.green
                }
              }}
            >
              {jamaicanParishes.map((parish) => (
                <MenuItem key={parish} value={parish}>
                  {parish}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Town Selection */}
          {value.parish && (
            <Autocomplete
              value={value.town}
              onChange={handleTownChange}
              options={townOptions}
              disabled={disabled}
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Town/City (Optional)"
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
              )}
            />
          )}
        </Stack>

        {(value.parish || value.town) && (
          <Button
            startIcon={<Clear />}
            onClick={handleClear}
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
            Clear Location
          </Button>
        )}
      </Box>
    );
  }

  // Full layout with recent locations
  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOn sx={{ color: jamaicanColors.green, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Location
          </Typography>
        </Box>

        {/* GPS Button */}
        {onUseGPS && (
          <Button
            startIcon={<MyLocation />}
            onClick={onUseGPS}
            variant="outlined"
            size="small"
            sx={{
              borderColor: jamaicanColors.green,
              color: jamaicanColors.green,
              '&:hover': {
                borderColor: jamaicanColors.green,
                bgcolor: `${jamaicanColors.green}10`
              }
            }}
            disabled={disabled}
          >
            Use My Location
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Location Selection */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Parish Selection */}
            <FormControl fullWidth>
              <InputLabel sx={{ '&.Mui-focused': { color: jamaicanColors.green } }}>
                Select Parish
              </InputLabel>
              <Select
                value={value.parish}
                label="Select Parish"
                onChange={handleParishChange}
                disabled={disabled}
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: jamaicanColors.green
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: jamaicanColors.green
                  }
                }}
              >
                {jamaicanParishes.map((parish) => (
                  <MenuItem key={parish} value={parish}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 1, fontSize: '1rem', color: jamaicanColors.green }} />
                      {parish}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Town Selection */}
            {value.parish && (
              <Autocomplete
                value={value.town}
                onChange={handleTownChange}
                options={townOptions}
                disabled={disabled}
                freeSolo
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={`Town/City in ${value.parish} (Optional)`}
                    placeholder="Type or select a town..."
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
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <LocationOn sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                    {option}
                  </Box>
                )}
              />
            )}

            {/* Current Selection Display */}
            {(value.parish || value.town) && (
              <Paper sx={{ p: 2, bgcolor: `${jamaicanColors.green}10`, border: `1px solid ${jamaicanColors.green}30` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Selected Location:
                </Typography>
                <Chip
                  icon={<LocationOn />}
                  label={formatLocation(value)}
                  onDelete={handleClear}
                  sx={{
                    bgcolor: jamaicanColors.green,
                    color: 'white',
                    '& .MuiChip-deleteIcon': {
                      color: 'white'
                    }
                  }}
                  disabled={disabled}
                />
              </Paper>
            )}
          </Stack>
        </Grid>

        {/* Recent Locations */}
        {showRecentLocations && recentLocations.length > 0 && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <History sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Recent Locations
                </Typography>
              </Box>
              
              <List dense>
                {recentLocations.slice(0, 5).map((location, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleRecentLocationSelect(location)}
                    disabled={disabled}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': {
                        bgcolor: `${jamaicanColors.green}10`
                      }
                    }}
                  >
                    <ListItemIcon>
                      <LocationOn sx={{ fontSize: '1rem', color: jamaicanColors.green }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={formatLocation(location)}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Popular Locations */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUp sx={{ color: jamaicanColors.green, mr: 1 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Popular Job Locations
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {[
            { parish: 'Kingston', town: '' },
            { parish: 'St. Andrew', town: 'Half Way Tree' },
            { parish: 'St. James', town: 'Montego Bay' },
            { parish: 'Manchester', town: 'Mandeville' },
            { parish: 'St. Catherine', town: 'Spanish Town' }
          ].map((location, index) => (
            <Chip
              key={index}
              label={formatLocation(location)}
              onClick={() => handleRecentLocationSelect(location)}
              variant="outlined"
              sx={{
                borderColor: jamaicanColors.green,
                color: jamaicanColors.green,
                '&:hover': {
                  bgcolor: `${jamaicanColors.green}10`
                }
              }}
              disabled={disabled}
            />
          ))}
        </Stack>
      </Box>

      {/* Helpful Info */}
      <Box sx={{ 
        mt: 3, 
        p: 2, 
        bgcolor: `${jamaicanColors.green}10`, 
        borderRadius: 2,
        border: `1px solid ${jamaicanColors.green}30`
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          💡 Location Tips
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Leave town blank to see all jobs in the parish. Use "My Location" to find 
          jobs near you with distance information.
        </Typography>
      </Box>
    </Box>
  );
};

export default LocationSelector;
