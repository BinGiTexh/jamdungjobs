import React from 'react';
import { IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ size = 'medium', showTooltip = true }) => {
  const { themeMode: _themeMode, toggleTheme, isDarkMode } = useTheme();
  const muiTheme = useMuiTheme();

  const toggleButton = (
    <IconButton
      onClick={toggleTheme}
      size={size}
      sx={{
        color: isDarkMode ? muiTheme.palette.secondary.main : muiTheme.palette.primary.main,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          backgroundColor: isDarkMode 
            ? 'rgba(255, 215, 0, 0.1)' 
            : 'rgba(0, 150, 57, 0.1)',
          transform: 'rotate(180deg)'
        },
        '&:active': {
          transform: 'rotate(180deg) scale(0.9)'
        }
      }}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? (
        <Brightness7 sx={{ fontSize: size === 'small' ? 20 : size === 'large' ? 32 : 24 }} />
      ) : (
        <Brightness4 sx={{ fontSize: size === 'small' ? 20 : size === 'large' ? 32 : 24 }} />
      )}
    </IconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip 
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        placement="bottom"
        arrow
      >
        {toggleButton}
      </Tooltip>
    );
  }

  return toggleButton;
};

export default ThemeToggle;
