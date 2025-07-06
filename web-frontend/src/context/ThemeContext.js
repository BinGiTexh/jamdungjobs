import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { themeConfig } from '../theme/themeConfig';

// Create Theme Context
const ThemeContext = createContext();

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};

// Theme Context Provider Component
export const ThemeContextProvider = ({ children }) => {
  // Initialize theme mode from localStorage or default to 'light'
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('jamDungJobsTheme');
      if (savedTheme) {
        return savedTheme;
      }
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  // Get current theme object
  const currentTheme = themeConfig[themeMode];

  // Toggle theme function
  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  // Set specific theme mode
  const setTheme = (mode) => {
    if (mode === 'light' || mode === 'dark') {
      setThemeMode(mode);
    }
  };

  // Save theme preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jamDungJobsTheme', themeMode);
    }
  }, [themeMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        // Only auto-switch if user hasn't manually set a preference
        const savedTheme = localStorage.getItem('jamDungJobsTheme');
        if (!savedTheme) {
          setThemeMode(e.matches ? 'dark' : 'light');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Context value
  const contextValue = {
    themeMode,
    currentTheme,
    toggleTheme,
    setTheme,
    isDarkMode: themeMode === 'dark',
    isLightMode: themeMode === 'light',
    jamaicanColors: themeConfig.jamaicanColors
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={currentTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
