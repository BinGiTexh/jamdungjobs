/**
 * Google OAuth Hook for JamDung Jobs
 * Docker-compatible implementation using Google Identity Services
 */

import { useEffect, useCallback, useState } from 'react';
import { logDev, logError } from '../utils/loggingUtils';

// Google OAuth configuration
const GOOGLE_CONFIG = {
  // This will be set via environment variable for Docker
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
  scope: 'email profile'
};

// Check if Google Client ID is configured
const isGoogleConfigured = () => {
  return GOOGLE_CONFIG.clientId && 
         GOOGLE_CONFIG.clientId !== '' && 
         GOOGLE_CONFIG.clientId !== 'YOUR_GOOGLE_CLIENT_ID';
};

/**
 * Custom hook for Google OAuth integration
 */
export const useGoogleAuth = () => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load Google Identity Services script
  useEffect(() => {
    const loadGoogleScript = () => {
      // Check if script is already loaded
      if (window.google?.accounts) {
        setIsGoogleLoaded(true);
        initializeGoogle();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        logDev('info', 'Google Identity Services script loaded');
        setIsGoogleLoaded(true);
        initializeGoogle();
      };
      
      script.onerror = (error) => {
        logError('Failed to load Google Identity Services', error, {
          module: 'useGoogleAuth',
          function: 'loadGoogleScript'
        });
      };

      document.head.appendChild(script);
    };

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CONFIG.clientId,
          callback: () => {}, // Will be set per component
          auto_select: false,
          cancel_on_tap_outside: true
        });
        logDev('info', 'Google OAuth initialized successfully');
      } catch (error) {
        logError('Failed to initialize Google OAuth', error, {
          module: 'useGoogleAuth',
          function: 'initializeGoogle'
        });
      }
    };

    loadGoogleScript();
  }, []);

  /**
   * Handle Google Sign In with FedCM support
   */
  const signInWithGoogle = useCallback(async (onSuccess, onError) => {
    // Check if Google OAuth is properly configured
    if (!isGoogleConfigured()) {
      const error = new Error('Google OAuth is not configured. Please set REACT_APP_GOOGLE_CLIENT_ID environment variable.');
      logError('Google OAuth not configured', error, {
        module: 'useGoogleAuth',
        function: 'signInWithGoogle',
        hasClientId: !!GOOGLE_CONFIG.clientId,
        clientIdValue: GOOGLE_CONFIG.clientId ? `${GOOGLE_CONFIG.clientId.substring(0, 20)}...` : 'empty'
      });
      onError?.(error);
      return;
    }

    if (!isGoogleLoaded || !window.google?.accounts?.id) {
      const error = new Error('Google OAuth not loaded');
      logError('Google OAuth not available', error, {
        module: 'useGoogleAuth',
        function: 'signInWithGoogle',
        isGoogleLoaded,
        hasGoogleAPI: !!window.google?.accounts
      });
      onError?.(error);
      return;
    }

    setIsLoading(true);

    try {
      // First try FedCM if supported
      if (window.IdentityCredential && navigator.credentials) {
        try {
          logDev('info', 'Attempting FedCM authentication');
          
          const credential = await navigator.credentials.get({
            identity: {
              providers: [{
                configURL: 'https://accounts.google.com/gsi/fedcm.json',
                clientId: GOOGLE_CONFIG.clientId
              }]
            }
          });

          if (credential) {
            logDev('info', 'FedCM authentication successful');
            
            // Decode the JWT token to get user info
            const userInfo = parseGoogleJWT(credential.token);
            
            onSuccess?.({
              googleToken: credential.token,
              userInfo
            });
            setIsLoading(false);
            return;
          }
        } catch (fedcmError) {
          logError('FedCM failed, falling back to popup', fedcmError, {
            module: 'useGoogleAuth',
            function: 'signInWithGoogle.fedcm'
          });
          // Continue to fallback
        }
      }

      // Fallback to traditional popup method
      logDev('info', 'Using traditional Google Sign-In popup');
      
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CONFIG.clientId,
        callback: async (response) => {
          try {
            logDev('info', 'Google OAuth popup response received');
            
            // Decode the JWT token to get user info
            const userInfo = parseGoogleJWT(response.credential);
            
            logDev('info', 'Google OAuth successful', {
              email: userInfo.email,
              name: userInfo.name,
              verified: userInfo.email_verified
            });

            onSuccess?.({
              googleToken: response.credential,
              userInfo
            });
          } catch (error) {
            logError('Failed to process Google OAuth response', error, {
              module: 'useGoogleAuth',
              function: 'signInWithGoogle.callback'
            });
            onError?.(error);
          } finally {
            setIsLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Use popup method
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Show popup manually
          window.google.accounts.id.renderButton(
            document.createElement('div'),
            {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'signin_with',
              shape: 'rectangular'
            }
          );
        }
      });

    } catch (error) {
      logError('Failed to initiate Google sign in', error, {
        module: 'useGoogleAuth',
        function: 'signInWithGoogle'
      });
      onError?.(error);
      setIsLoading(false);
    }
  }, [isGoogleLoaded]);

  /**
   * Parse Google JWT token to extract user information
   */
  const parseGoogleJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      logError('Failed to parse Google JWT', error, {
        module: 'useGoogleAuth',
        function: 'parseGoogleJWT'
      });
      throw new Error('Invalid Google token');
    }
  };

  return {
    isGoogleLoaded,
    isLoading,
    signInWithGoogle
  };
};

export default useGoogleAuth;
