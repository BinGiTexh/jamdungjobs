/**
 * Google OAuth Hook for JamDung Jobs
 * Docker-compatible implementation using Google Identity Services
 */

import { useEffect, useCallback, useState } from 'react';
import { logDev, logError } from '../utils/loggingUtils';

// Google OAuth configuration
const GOOGLE_CONFIG = {
  // This will be set via environment variable for Docker
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  scope: 'email profile'
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
   * Handle Google Sign In
   */
  const signInWithGoogle = useCallback((onSuccess, onError) => {
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
      // Configure the callback for this specific sign-in
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CONFIG.clientId,
        callback: async (response) => {
          try {
            logDev('info', 'Google OAuth response received');
            
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
        auto_select: false
      });

      // Prompt the user to sign in
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup if prompt doesn't work
          window.google.accounts.id.renderButton(
            document.createElement('div'),
            {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'continue_with',
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
