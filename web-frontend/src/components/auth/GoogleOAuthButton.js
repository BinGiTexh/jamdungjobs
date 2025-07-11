/**
 * Google OAuth Button Component
 * Styled for JamDung Jobs with consistent theming
 */

import React from 'react';
import { Button, Box, CircularProgress } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../utils/responsive';
import useGoogleAuth from '../../hooks/useGoogleAuth';

// Google Logo SVG Component
const GoogleIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const GoogleOAuthButton = ({
  onSuccess,
  onError,
  disabled = false,
  variant = 'outlined', // 'outlined' | 'contained'
  fullWidth = true,
  text = 'Continue with Google',
  ...props
}) => {
  const { isDarkMode, jamaicanColors } = useTheme();
  const { isMobile } = useResponsive();
  const { isGoogleLoaded, isLoading, signInWithGoogle } = useGoogleAuth();

  const handleGoogleSignIn = () => {
    signInWithGoogle(onSuccess, onError);
  };

  const getButtonStyles = () => {
    const baseStyles = {
      py: { xs: 2, sm: 1.5 },
      px: 3,
      fontSize: { xs: '1rem', sm: '0.95rem' },
      fontWeight: 600,
      textTransform: 'none',
      borderRadius: 2,
      transition: 'all 0.3s ease-in-out',
      position: 'relative',
      overflow: 'hidden',
      '&:disabled': {
        opacity: 0.6,
        cursor: 'not-allowed'
      }
    };

    if (variant === 'outlined') {
      return {
        ...baseStyles,
        border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
        color: isDarkMode ? 'white' : '#1f1f1f',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          border: `2px solid ${jamaicanColors.gold}`,
          backgroundColor: isDarkMode ? 'rgba(255,215,0,0.1)' : 'rgba(255,215,0,0.05)',
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(255,215,0,0.2)'
        },
        '&:active': {
          transform: 'translateY(0px)'
        }
      };
    }

    // Contained variant
    return {
      ...baseStyles,
      backgroundColor: isDarkMode ? '#4285F4' : '#ffffff',
      color: isDarkMode ? 'white' : '#1f1f1f',
      border: `2px solid ${isDarkMode ? '#4285F4' : '#dadce0'}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      '&:hover': {
        backgroundColor: isDarkMode ? '#3367D6' : '#f8f9fa',
        border: `2px solid ${isDarkMode ? '#3367D6' : '#dadce0'}`,
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(66,133,244,0.3)'
      },
      '&:active': {
        transform: 'translateY(0px)'
      }
    };
  };

  const isButtonDisabled = disabled || !isGoogleLoaded || isLoading;
  
  // Check if Google OAuth is configured
  const isGoogleConfigured = process.env.REACT_APP_GOOGLE_CLIENT_ID && 
                           process.env.REACT_APP_GOOGLE_CLIENT_ID !== '';

  return (
    <Button
      fullWidth={fullWidth}
      disabled={isButtonDisabled}
      onClick={handleGoogleSignIn}
      startIcon={
        isLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <GoogleIcon size={isMobile ? 22 : 20} />
        )
      }
      sx={getButtonStyles()}
      {...props}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isLoading ? 'Signing in...' : 
         !isGoogleConfigured ? 'Google OAuth Not Configured' : 
         text}
      </Box>
    </Button>
  );
};

export default GoogleOAuthButton;
