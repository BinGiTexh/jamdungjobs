import React from 'react';
import {
  Box,
  Button,
  Grid,
  useTheme as useMuiTheme,
  useMediaQuery
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  Business,
  TrendingUp
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const QuickActionsBar = ({ onQuickAction, userLocation }) => {
  const muiTheme = useMuiTheme();
  const { jamaicanColors } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  // Use theme-aware colors for better visibility
  const isDarkMode = muiTheme.palette.mode === 'dark';

  const quickActions = [
    { 
      icon: LocationOn, 
      label: userLocation ? `Jobs in ${userLocation}` : 'Jobs Near Me', 
      action: 'location',
      color: jamaicanColors.green
    },
    { 
      icon: Schedule, 
      label: 'Part Time', 
      action: 'part-time',
      color: jamaicanColors.gold
    },
    { 
      icon: Business, 
      label: 'Remote Work', 
      action: 'remote',
      color: jamaicanColors.green
    },
    { 
      icon: TrendingUp, 
      label: 'Latest Jobs', 
      action: 'latest',
      color: jamaicanColors.gold
    }
  ];

  const handleActionClick = (action) => {
    console.warn('🚀 Quick Action:', action);
    if (onQuickAction) {
      onQuickAction(action);
    }
  };

  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Grid container spacing={2}>
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Grid item xs={6} sm={3} key={index}>
              <Button
                fullWidth
                variant="outlined"
                size={isMobile ? 'medium' : 'large'}
                startIcon={<IconComponent />}
                onClick={() => handleActionClick(action.action)}
                sx={{
                  minHeight: 44, // Touch-friendly minimum
                  py: isMobile ? 1.5 : 2,
                  px: 1,
                  borderColor: action.color,
                  color: muiTheme.palette.text.primary, // Use theme-aware text color
                  fontWeight: 600,
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  borderRadius: 2,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  // Enhanced focus indicator for accessibility
                  '&:focus': {
                    outline: `2px solid ${action.color}`,
                    outlineOffset: '2px',
                    backgroundColor: muiTheme.palette.action.focus
                  },
                  '&:hover': {
                    borderColor: action.color,
                    backgroundColor: muiTheme.palette.action.hover,
                    color: isDarkMode ? action.color : muiTheme.palette.text.primary,
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkMode 
                      ? '0 4px 12px rgba(76, 175, 80, 0.3)' 
                      : `0 4px 12px ${action.color}20`
                  },
                  '&:active': {
                    transform: 'translateY(0px)'
                  },
                  // Ensure proper contrast in both themes
                  border: `2px solid ${action.color}`,
                  '&.Mui-disabled': {
                    color: muiTheme.palette.text.disabled,
                    borderColor: muiTheme.palette.text.disabled
                  }
                }}
              >
                {action.label}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default QuickActionsBar;
