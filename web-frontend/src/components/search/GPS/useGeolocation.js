/**
 * Custom hook for GPS geolocation functionality
 * Handles browser geolocation API with proper error handling and permissions
 */

import { useState, useEffect, useCallback } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'

  // Check if geolocation is supported
  const isSupported = 'geolocation' in navigator;

  /**
   * Get current position
   */
  const getCurrentPosition = useCallback(() => {
    if (!isSupported) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000 // 5 minutes cache
    };

    const onSuccess = (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      
      setLocation({
        lat: latitude,
        lng: longitude,
        accuracy: accuracy,
        timestamp: new Date().toISOString()
      });
      
      setPermission('granted');
      setLoading(false);
      setError(null);
      
      console.warn('📍 Location obtained:', { lat: latitude, lng: longitude, accuracy });
    };

    const onError = (error) => {
      setLoading(false);
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setError('Location access denied by user');
          setPermission('denied');
          break;
        case error.POSITION_UNAVAILABLE:
          setError('Location information is unavailable');
          break;
        case error.TIMEOUT:
          setError('Location request timed out');
          break;
        default:
          setError('An unknown error occurred while retrieving location');
          break;
      }
      
      console.warn('🚫 Geolocation error:', error.message);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  }, [isSupported]);

  /**
   * Watch position for continuous updates
   */
  const watchPosition = useCallback(() => {
    if (!isSupported) {
      setError('Geolocation is not supported by this browser');
      return null;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute cache for watching
    };

    const onSuccess = (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      
      setLocation({
        lat: latitude,
        lng: longitude,
        accuracy: accuracy,
        timestamp: new Date().toISOString()
      });
      
      setPermission('granted');
      setError(null);
    };

    const onError = (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setError('Location access denied by user');
          setPermission('denied');
          break;
        case error.POSITION_UNAVAILABLE:
          setError('Location information is unavailable');
          break;
        case error.TIMEOUT:
          setError('Location request timed out');
          break;
        default:
          setError('An unknown error occurred while retrieving location');
          break;
      }
    };

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, options);
    
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isSupported]);

  /**
   * Clear current location
   */
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    console.warn('📍 Location cleared');
  }, []);

  /**
   * Check permission status (for supported browsers)
   */
  const checkPermission = useCallback(async () => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermission(result.state);
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          setPermission(result.state);
        });
        
        return result.state;
      } catch (error) {
        console.warn('Could not check geolocation permission:', error);
        return 'prompt';
      }
    }
    
    return 'prompt';
  }, []);

  /**
   * Get location with user-friendly error handling
   */
  const requestLocation = useCallback(async () => {
    // Check permission first if supported
    if ('permissions' in navigator) {
      const permissionStatus = await checkPermission();
      
      if (permissionStatus === 'denied') {
        setError('Location access is blocked. Please enable location access in your browser settings.');
        return;
      }
    }
    
    getCurrentPosition();
  }, [getCurrentPosition, checkPermission]);

  /**
   * Get approximate location based on IP (fallback)
   * This would typically use a service like ipapi.co
   */
  const getApproximateLocation = useCallback(async () => {
    try {
      setLoading(true);
      
      // For demo purposes, return Kingston coordinates
      // In production, you'd call an IP geolocation service
      const approximateLocation = {
        lat: 17.9970,
        lng: -76.7936,
        accuracy: 50000, // Very low accuracy for IP-based location
        timestamp: new Date().toISOString(),
        isApproximate: true,
        city: 'Kingston',
        parish: 'Kingston'
      };
      
      setLocation(approximateLocation);
      setLoading(false);
      
      console.warn('📍 Approximate location set:', approximateLocation);
    } catch (error) {
      setError('Could not determine approximate location');
      setLoading(false);
    }
  }, []);

  // Initialize permission check on mount
  useEffect(() => {
    if (isSupported) {
      checkPermission();
    }
  }, [checkPermission, isSupported]);

  return {
    location,
    loading,
    error,
    permission,
    isSupported,
    getCurrentPosition,
    watchPosition,
    clearLocation,
    requestLocation,
    getApproximateLocation,
    checkPermission
  };
};

export default useGeolocation;
