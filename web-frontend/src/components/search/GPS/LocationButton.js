/**
 * GPS Location Button Component
 * Floating action button for "Jobs Near Me" with permission handling
 */

import React, { useState } from 'react';
import {
  Fab,
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  MyLocation,
  LocationOff,
  LocationSearching,
  GpsFixed
} from '@mui/icons-material';
import { useTheme } from '../../../context/ThemeContext';
import useGeolocation from './useGeolocation';

const LocationButton = ({ 
  onLocationFound,
  onLocationError,
  disabled = false,
  showDistance = false,
  jobCount = 0,
  size = 'large',
  position = 'fixed' // 'fixed', 'relative', 'absolute'
}) => {
  const { jamaicanColors } = useTheme();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const {
    location,
    loading,
    error,
    permission,
    isSupported,
    requestLocation,
    clearLocation
  } = useGeolocation();

  /**
   * Handle location button click
   */
  const handleLocationClick = async () => {
    if (!isSupported) {
      showSnackbar('Location services are not supported by your browser', 'error');
      onLocationError?.('Location not supported');
      return;
    }

    if (location) {
      // Clear existing location
      clearLocation();
      onLocationFound?.(null);
      showSnackbar('Location cleared', 'info');
      return;
    }

    // Request new location
    try {
      await requestLocation();
    } catch (err) {
      console.error('Location request failed:', err);
    }
  };

  /**
   * Show snackbar message
   */
  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  /**
   * Handle location updates
   */
  React.useEffect(() => {
    if (location && !error) {
      onLocationFound?.(location);
      showSnackbar(
        `Location found! ${location.isApproximate ? 'Approximate location' : 'GPS location'} set.`,
        'success'
      );
    }
  }, [location, error, onLocationFound]);

  /**
   * Handle location errors
   */
  React.useEffect(() => {
    if (error) {
      onLocationError?.(error);
      
      let errorMessage = error;
      let severity = 'error';
      
      if (error.includes('denied')) {
        errorMessage = 'Location access denied. Enable location in browser settings to find nearby jobs.';
        severity = 'warning';
      } else if (error.includes('unavailable')) {
        errorMessage = 'Location unavailable. Check your internet connection and GPS settings.';
      } else if (error.includes('timeout')) {
        errorMessage = 'Location request timed out. Try again or check your GPS signal.';
      }
      
      showSnackbar(errorMessage, severity);
    }
  }, [error, onLocationError]);

  /**
   * Get button icon based on state
   */
  const getButtonIcon = () => {
    if (loading) {
      return <LocationSearching />;
    }
    
    if (location) {
      return <GpsFixed />;
    }
    
    if (permission === 'denied' || error) {
      return <LocationOff />;
    }
    
    return <MyLocation />;
  };

  /**
   * Get button color based on state
   */
  const getButtonColor = () => {
    if (location) {
      return jamaicanColors.green;
    }
    
    if (permission === 'denied' || error) {
      return '#f44336'; // Red for error
    }
    
    return jamaicanColors.green;
  };

  /**
   * Get tooltip text
   */
  const getTooltipText = () => {
    if (loading) {
      return 'Getting your location...';
    }
    
    if (location) {
      return `Location found! Click to clear${showDistance && jobCount > 0 ? ` (${jobCount} jobs nearby)` : ''}`;
    }
    
    if (permission === 'denied') {
      return 'Location access denied. Enable in browser settings.';
    }
    
    if (error) {
      return 'Location unavailable. Click to try again.';
    }
    
    return 'Find jobs near me';
  };

  const buttonSx = {
    bgcolor: getButtonColor(),
    color: 'white',
    '&:hover': {
      bgcolor: getButtonColor(),
      opacity: 0.9,
      transform: 'scale(1.05)'
    },
    '&:active': {
      transform: 'scale(0.95)'
    },
    transition: 'all 0.2s ease-in-out',
    boxShadow: location ? '0 4px 20px rgba(0,150,57,0.4)' : '0 2px 10px rgba(0,0,0,0.2)',
    ...(position === 'fixed' && {
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 1000
    })
  };

  const fabContent = loading ? (
    <CircularProgress size={24} sx={{ color: 'white' }} />
  ) : (
    getButtonIcon()
  );

  const fab = (
    <Fab
      size={size}
      onClick={handleLocationClick}
      disabled={disabled || loading}
      sx={buttonSx}
    >
      {fabContent}
    </Fab>
  );

  return (
    <Box>
      {/* Location Button */}
      {showDistance && jobCount > 0 ? (
        <Badge
          badgeContent={jobCount}
          color="secondary"
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: jamaicanColors.gold,
              color: 'white',
              fontWeight: 600
            }
          }}
        >
          <Tooltip title={getTooltipText()} placement="left">
            {fab}
          </Tooltip>
        </Badge>
      ) : (
        <Tooltip title={getTooltipText()} placement="left">
          {fab}
        </Tooltip>
      )}

      {/* Status Display for Relative Position */}
      {position !== 'fixed' && location && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            📍 Location: {location.isApproximate ? 'Approximate' : 'GPS'} 
            {location.city && ` • ${location.city}`}
          </Typography>
          {location.accuracy && (
            <Typography variant="caption" color="text.secondary">
              Accuracy: ±{Math.round(location.accuracy)}m
            </Typography>
          )}
        </Box>
      )}

      {/* Snackbar for Messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LocationButton;
