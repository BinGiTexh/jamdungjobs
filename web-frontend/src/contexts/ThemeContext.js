/**
 * Theme Context Provider
 * Manages light/dark mode switching with accessibility features
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createJamaicaTheme } from '../theme/jamaicaTheme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [mode, setMode] = useState(() => {
    // Check localStorage first
    const savedMode = localStorage.getItem('jamaica-theme-mode');
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      return savedMode;
    }
    
    // Fall back to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  // Create theme based on current mode
  const theme = createJamaicaTheme(mode);

  // Toggle between light and dark mode
  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('jamaica-theme-mode', newMode);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      const savedMode = localStorage.getItem('jamaica-theme-mode');
      if (!savedMode) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply CSS custom properties for theme switching
  useEffect(() => {
    const root = document.documentElement;
    const colors = theme.colors;
    
    // Set CSS custom properties
    root.style.setProperty('--color-primary', colors.primary.main);
    root.style.setProperty('--color-secondary', colors.secondary.main);
    root.style.setProperty('--color-accent', colors.accent.main);
    root.style.setProperty('--color-background', colors.background.default);
    root.style.setProperty('--color-surface', colors.background.card);
    root.style.setProperty('--color-text-primary', colors.text.primary);
    root.style.setProperty('--color-text-secondary', colors.text.secondary);
    root.style.setProperty('--color-border', colors.border.light);
    
    // Set theme mode attribute for CSS targeting
    root.setAttribute('data-theme', mode);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colors.primary.main);
    }
  }, [theme, mode]);

  // Accessibility: Respect reduced motion preference
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;
    
    if (prefersReducedMotion) {
      root.style.setProperty('--motion-duration', '0.01ms');
    } else {
      root.style.setProperty('--motion-duration', '0.2s');
    }
  }, []);

  const value = {
    mode,
    theme,
    toggleMode,
    isDark: mode === 'dark',
    isLight: mode === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
