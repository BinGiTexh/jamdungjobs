/**
 * Header Component with Theme Toggle
 * Enhanced header that includes the theme toggle functionality
 */

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';

const HeaderWithTheme = () => {
  const navigate = useNavigate();
  const { user, isAuth } = useAuth();

  const handleLogoClick = () => {
    navigate('/home/new');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleDashboard = () => {
    if (user?.role === 'EMPLOYER') {
      navigate('/employer/jobs');
    } else {
      navigate('/jobs');
    }
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={1}
      sx={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        color: 'var(--color-text-primary)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo */}
          <Typography
            variant="h5"
            component="button"
            onClick={handleLogoClick}
            sx={{
              fontWeight: 700,
              color: 'var(--color-primary)',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              '&:hover': {
                opacity: 0.8
              },
              '&:focus-visible': {
                outline: '2px solid var(--color-primary)',
                outlineOffset: '2px',
                borderRadius: '4px'
              }
            }}
            aria-label="JamDung Jobs - Go to homepage"
          >
            JamDung Jobs
          </Typography>

          {/* Navigation Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Authentication Actions */}
            {isAuth ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'var(--color-text-secondary)',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Welcome, {user?.firstName || 'User'}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleDashboard}
                  sx={{
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-primary)',
                    '&:hover': {
                      backgroundColor: 'var(--color-primary)',
                      color: 'white'
                    }
                  }}
                >
                  Dashboard
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleLogin}
                  sx={{
                    color: 'var(--color-text-primary)',
                    '&:hover': {
                      backgroundColor: 'var(--color-primary-light)'
                    }
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleRegister}
                  sx={{
                    backgroundColor: 'var(--color-primary)',
                    '&:hover': {
                      backgroundColor: 'var(--color-primary-dark)'
                    }
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default HeaderWithTheme;
