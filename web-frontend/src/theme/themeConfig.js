import { createTheme } from '@mui/material/styles';

// Jamaican Brand Colors - Consistent across light and dark modes
const jamaicanColors = {
  green: '#009639',
  gold: '#FFD700',
  black: '#000000',
  lightGreen: '#4CAF50',
  darkGreen: '#006D2C',
  goldDark: '#FFA000',
  goldLight: '#FFEB3B'
};

// Enhanced Semantic Color System for WCAG 2.1 AA Compliance
const semanticColors = {
  light: {
    // Primary text colors with proper contrast ratios
    primaryText: '#1a1a1a',        // 4.5:1 contrast on white
    secondaryText: '#4a4a4a',      // 4.5:1 contrast on light backgrounds
    mutedText: '#6b6b6b',          // 3:1 contrast for large text
    disabledText: '#9e9e9e',       // Disabled state
    
    // Interactive element colors
    linkText: '#006D2C',           // High contrast green for links
    linkHover: '#004d20',          // Darker on hover
    buttonText: '#ffffff',         // White text on colored buttons
    
    // Background variations
    surfaceElevated: '#f8f9fa',    // Slightly elevated surfaces
    surfaceHover: '#f1f3f4',       // Hover states
    surfaceSelected: '#e8f5e8',    // Selected states with green tint
    
    // Border and divider colors
    borderLight: '#e0e0e0',        // Light borders
    borderMedium: '#bdbdbd',       // Medium emphasis borders
    borderStrong: '#757575',       // Strong emphasis borders
    
    // Status colors with proper contrast
    successText: '#1b5e20',        // Dark green for success text
    warningText: '#e65100',        // Orange for warning text
    errorText: '#c62828',          // Red for error text
    infoText: '#1565c0'            // Blue for info text
  },
  dark: {
    // Primary text colors optimized for dark backgrounds
    primaryText: '#ffffff',        // Pure white for maximum contrast
    secondaryText: '#e0e0e0',      // Light gray with good contrast
    mutedText: '#b0b0b0',          // Muted but still readable
    disabledText: '#6b6b6b',       // Disabled state
    
    // Interactive element colors
    linkText: '#81c784',           // Light green for links in dark mode
    linkHover: '#a5d6a7',          // Lighter on hover
    buttonText: '#000000',         // Black text on gold buttons
    
    // Background variations
    surfaceElevated: '#2a2a2a',    // Elevated surfaces
    surfaceHover: '#3a3a3a',       // Hover states
    surfaceSelected: '#1a3d1a',    // Selected states with dark green tint
    
    // Border and divider colors
    borderLight: '#404040',        // Light borders for dark mode
    borderMedium: '#606060',       // Medium emphasis borders
    borderStrong: '#808080',       // Strong emphasis borders
    
    // Status colors optimized for dark backgrounds
    successText: '#81c784',        // Light green for success text
    warningText: '#ffb74d',        // Light orange for warning text
    errorText: '#e57373',          // Light red for error text
    infoText: '#64b5f6'            // Light blue for info text
  }
};



// Base theme configuration shared between light and dark modes
const baseTheme = {
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.2rem',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      '@media (min-width:600px)': {
        fontSize: '3rem'
      },
      '@media (min-width:960px)': {
        fontSize: '3.5rem'
      }
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      '@media (min-width:600px)': {
        fontSize: '2.2rem'
      },
      '@media (min-width:960px)': {
        fontSize: '2.8rem'
      }
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      '@media (min-width:600px)': {
        fontSize: '1.8rem'
      }
    },
    h4: {
      fontSize: '1.3rem',
      fontWeight: 600,
      '@media (min-width:600px)': {
        fontSize: '1.5rem'
      }
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      '@media (min-width:600px)': {
        fontSize: '1.25rem'
      }
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      '@media (min-width:600px)': {
        fontSize: '1.125rem'
      }
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      letterSpacing: '0.01em',
      '@media (min-width:600px)': {
        fontSize: '1.1rem'
      }
    },
    body2: {
      fontSize: '0.9rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
      '@media (min-width:600px)': {
        fontSize: '1rem'
      }
    },
    button: {
      fontSize: '1rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em'
    },
    tagline: {
      fontSize: '1.1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      fontStyle: 'italic',
      '@media (min-width:600px)': {
        fontSize: '1.3rem'
      },
      '@media (min-width:960px)': {
        fontSize: '1.5rem'
      }
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 768,
      lg: 1024,
      xl: 1200
    }
  },
  shape: {
    borderRadius: 8
  },
  spacing: 8
};

// Light theme palette with enhanced semantic colors
const lightPalette = {
  mode: 'light',
  primary: {
    main: jamaicanColors.green,
    light: jamaicanColors.lightGreen,
    dark: jamaicanColors.darkGreen,
    contrastText: jamaicanColors.black
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff'
  },
  warning: {
    main: jamaicanColors.goldDark,
    light: jamaicanColors.goldLight,
    dark: '#f57c00',
    contrastText: jamaicanColors.black
  },
  info: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff'
  },
  success: {
    main: jamaicanColors.lightGreen,
    light: '#81c784',
    dark: jamaicanColors.darkGreen,
    contrastText: '#ffffff'
  },
  background: {
    default: '#ffffff',
    paper: '#ffffff',
    elevated: semanticColors.light.surfaceElevated,
    hover: semanticColors.light.surfaceHover,
    selected: semanticColors.light.surfaceSelected
  },
  text: {
    primary: semanticColors.light.primaryText,
    secondary: semanticColors.light.secondaryText,
    disabled: semanticColors.light.disabledText,
    muted: semanticColors.light.mutedText,
    link: semanticColors.light.linkText,
    linkHover: semanticColors.light.linkHover,
    success: semanticColors.light.successText,
    warning: semanticColors.light.warningText,
    error: semanticColors.light.errorText,
    info: semanticColors.light.infoText
  },
  divider: semanticColors.light.borderLight,
  border: {
    light: semanticColors.light.borderLight,
    medium: semanticColors.light.borderMedium,
    strong: semanticColors.light.borderStrong
  },
  action: {
    hover: 'rgba(0, 150, 57, 0.04)',
    selected: 'rgba(0, 150, 57, 0.08)',
    disabled: semanticColors.light.disabledText,
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    focus: 'rgba(0, 150, 57, 0.12)'
  },
  jamaican: jamaicanColors,
  semantic: semanticColors.light
};

// Dark theme palette
const darkPalette = {
  mode: 'dark',
  primary: {
    main: jamaicanColors.lightGreen,
    light: '#81C784',
    dark: jamaicanColors.darkGreen,
    contrastText: '#ffffff'
  },
  secondary: {
    main: jamaicanColors.gold,
    light: jamaicanColors.goldLight,
    dark: jamaicanColors.goldDark,
    contrastText: jamaicanColors.black
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f'
  },
  warning: {
    main: jamaicanColors.gold,
    light: jamaicanColors.goldLight,
    dark: jamaicanColors.goldDark,
    contrastText: jamaicanColors.black
  },
  info: {
    main: jamaicanColors.lightGreen,
    light: '#81C784',
    dark: jamaicanColors.darkGreen,
    contrastText: '#ffffff'
  },
  success: {
    main: jamaicanColors.lightGreen,
    light: '#81C784',
    dark: jamaicanColors.darkGreen,
    contrastText: '#ffffff'
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
    elevated: semanticColors.dark.surfaceElevated,
    hover: semanticColors.dark.surfaceHover,
    selected: semanticColors.dark.surfaceSelected
  },
  text: {
    primary: semanticColors.dark.primaryText,
    secondary: semanticColors.dark.secondaryText,
    disabled: semanticColors.dark.disabledText,
    muted: semanticColors.dark.mutedText,
    link: semanticColors.dark.linkText,
    linkHover: semanticColors.dark.linkHover,
    success: semanticColors.dark.successText,
    warning: semanticColors.dark.warningText,
    error: semanticColors.dark.errorText,
    info: semanticColors.dark.infoText
  },
  divider: semanticColors.dark.borderLight,
  border: {
    light: semanticColors.dark.borderLight,
    medium: semanticColors.dark.borderMedium,
    strong: semanticColors.dark.borderStrong
  },
  action: {
    hover: 'rgba(76, 175, 80, 0.08)',
    selected: 'rgba(76, 175, 80, 0.12)',
    disabled: semanticColors.dark.disabledText,
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
    focus: 'rgba(76, 175, 80, 0.12)'
  },
  jamaican: jamaicanColors,
  semantic: semanticColors.dark
};

// Enhanced component overrides with accessibility and semantic colors
const getComponentOverrides = (mode) => {
  return {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '12px 24px',
        minHeight: 48,
        fontSize: '16px',
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: mode === 'light' 
            ? '0 2px 8px rgba(0,0,0,0.15)' 
            : '0 2px 8px rgba(0,0,0,0.3)',
          transform: 'translateY(-1px)'
        },
        '&:active': {
          transform: 'scale(0.98)'
        }
      },
      contained: {
        '&:hover': {
          boxShadow: mode === 'light' 
            ? '0 4px 12px rgba(0,0,0,0.2)' 
            : '0 4px 12px rgba(0,0,0,0.4)'
        }
      }
    }
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          transition: 'all 0.2s ease-in-out',
          '& input': {
            fontSize: '16px',
            padding: '14px 16px'
          },
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? jamaicanColors.green : jamaicanColors.lightGreen
            }
          }
        }
      }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        transition: 'all 0.3s ease-in-out',
        boxShadow: mode === 'light' 
          ? '0 2px 12px rgba(0,0,0,0.08)' 
          : '0 2px 12px rgba(0,0,0,0.3)',
        '&:hover': {
          boxShadow: mode === 'light' 
            ? '0 4px 20px rgba(0,0,0,0.12)' 
            : '0 4px 20px rgba(0,0,0,0.4)',
          transform: 'translateY(-2px)'
        }
      }
    }
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontSize: '0.8rem',
        height: 28,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.05)'
        }
      }
    }
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: mode === 'light' 
          ? '0 1px 3px rgba(0,0,0,0.1)' 
          : '0 1px 3px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease-in-out'
      }
    }
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRadius: '0 16px 16px 0',
        backdropFilter: 'blur(10px)'
      }
    }
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        margin: '4px 8px',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: mode === 'light' 
            ? 'rgba(0, 150, 57, 0.08)' 
            : 'rgba(76, 175, 80, 0.12)',
          transform: 'translateX(4px)'
        }
      }
    }
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        transition: 'all 0.3s ease-in-out'
      },
      elevation1: {
        boxShadow: mode === 'light' 
          ? '0 1px 3px rgba(0,0,0,0.12)' 
          : '0 1px 3px rgba(0,0,0,0.4)'
      },
      elevation2: {
        boxShadow: mode === 'light' 
          ? '0 2px 6px rgba(0,0,0,0.12)' 
          : '0 2px 6px rgba(0,0,0,0.4)'
      }
    }
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.1)'
        }
      }
    }
  }
  };
};

// Create light theme
export const lightTheme = createTheme({
  ...baseTheme,
  palette: lightPalette,
  components: getComponentOverrides('light')
});

// Create dark theme
export const darkTheme = createTheme({
  ...baseTheme,
  palette: darkPalette,
  components: getComponentOverrides('dark')
});

// Theme configuration object
export const themeConfig = {
  light: lightTheme,
  dark: darkTheme,
  jamaicanColors
};

export default themeConfig;
