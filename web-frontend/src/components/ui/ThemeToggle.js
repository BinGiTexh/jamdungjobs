/**
 * Theme Toggle Component
 * Accessible light/dark mode switcher with proper ARIA labels
 */

import React from 'react';
import { IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ size = 'medium', showTooltip = true }) => {
  const { toggleMode, isDark } = useTheme();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const handleToggle = () => {
    toggleMode();
    
    // Announce theme change to screen readers
    const announcement = isDark 
      ? 'Switched to light mode' 
      : 'Switched to dark mode';
    
    // Create temporary announcement element
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    
    document.body.appendChild(announcer);
    announcer.textContent = announcement;
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  };

  const buttonStyles = {
    minWidth: '44px',
    minHeight: '44px',
    borderRadius: '8px',
    transition: prefersReducedMotion ? 'none' : 'all 0.2s ease-in-out',
    '&:focus-visible': {
      outline: '2px solid var(--color-primary)',
      outlineOffset: '2px'
    },
    '&:hover': {
      backgroundColor: isDark 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.04)',
      transform: prefersReducedMotion ? 'none' : 'scale(1.05)'
    }
  };

  const iconStyles = {
    fontSize: size === 'small' ? '1.2rem' : size === 'large' ? '1.8rem' : '1.5rem',
    color: 'var(--color-text-primary)',
    transition: prefersReducedMotion ? 'none' : 'transform 0.2s ease-in-out'
  };

  const button = (
    <IconButton
      onClick={handleToggle}
      sx={buttonStyles}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        role="switch"
      size={size}
    >
      {isDark ? (
        <Brightness7 sx={iconStyles} />
      ) : (
        <Brightness4 sx={iconStyles} />
      )}
    </IconButton>
  );

  if (!showTooltip) {
    return button;
  }

  return (
    <Tooltip 
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      placement="bottom"
      arrow
      enterDelay={500}
      leaveDelay={200}
    >
      {button}
    </Tooltip>
  );
};

export default ThemeToggle;
