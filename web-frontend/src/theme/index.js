import { createTheme } from '@mui/material/styles';

// Jamaican color palette
export const jamaicanColors = {
  primary: {
    main: '#006633', // Jamaican Green
    light: '#4CAF50',
    dark: '#004d26',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#FFD700', // Jamaican Gold
    light: '#FFEB3B',
    dark: '#FFC107',
    contrastText: '#000000'
  },
  error: {
    main: '#DC143C', // Jamaican Red
    light: '#F44336',
    dark: '#B71C1C',
    contrastText: '#ffffff'
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
    contrastText: '#000000'
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#ffffff'
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    contrastText: '#ffffff'
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    accent: '#f5f5f5'
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd',
    hint: '#9e9e9e'
  }
};

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

// Typography system
export const typography = {
  fontFamily: [
    'Roboto',
    'Arial',
    'sans-serif'
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.4
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.5
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4
  }
};

// Breakpoints for responsive design
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920
};

// Component styling overrides
export const componentOverrides = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 8,
        fontWeight: 500,
        padding: '8px 16px'
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }
      }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
        }
      }
    }
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8
        }
      }
    }
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16
      }
    }
  }
};

// Create the main theme
export const theme = createTheme({
  palette: jamaicanColors,
  typography,
  spacing: (factor) => `${spacing.xs * factor}px`,
  breakpoints: {
    values: breakpoints
  },
  components: componentOverrides,
  shape: {
    borderRadius: 8
  }
});

// Theme utilities
export const getColor = (colorPath) => {
  const paths = colorPath.split('.');
  let color = jamaicanColors;
  
  for (const path of paths) {
    color = color[path];
    if (!color) return jamaicanColors.primary.main;
  }
  
  return color;
};

export const getSpacing = (size) => {
  return spacing[size] || spacing.md;
};

// Responsive utilities
export const mediaQueries = {
  up: (breakpoint) => `@media (min-width: ${breakpoints[breakpoint]}px)`,
  down: (breakpoint) => `@media (max-width: ${breakpoints[breakpoint] - 1}px)`,
  between: (start, end) => 
    `@media (min-width: ${breakpoints[start]}px) and (max-width: ${breakpoints[end] - 1}px)`
};

// Common style mixins
export const mixins = {
  centerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row'
  },
  cardShadow: {
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
  },
  hoverShadow: {
    '&:hover': {
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
    }
  },
  textEllipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
};

export default theme;
