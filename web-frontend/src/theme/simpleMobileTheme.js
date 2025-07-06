import { createTheme } from '@mui/material/styles';

// Authentic Jamaican-themed mobile-first design
const simpleMobileTheme = createTheme({
  palette: {
    primary: {
      main: '#009639', // Jamaican green - vibrant and welcoming
      light: '#4CAF50',
      dark: '#006D2C',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#FFD700', // Jamaican gold - warm and inviting
      light: '#FFEB3B',
      dark: '#FFA000',
      contrastText: '#000000'
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828'
    },
    warning: {
      main: '#FFD700', // Use gold for warnings to maintain theme
      light: '#FFEB3B',
      dark: '#FFA000',
      contrastText: '#000000'
    },
    info: {
      main: '#009639', // Use green for info
      light: '#4CAF50',
      dark: '#006D2C',
      contrastText: '#ffffff'
    },
    success: {
      main: '#009639',
      light: '#4CAF50',
      dark: '#006D2C',
      contrastText: '#ffffff'
    },
    background: {
      default: '#fafafa', // Clean, welcoming background
      paper: '#ffffff'
    },
    text: {
      primary: '#1a1a1a', // Softer black for better readability
      secondary: '#666666' // Warmer gray
    },
    // Custom Jamaican palette
    jamaican: {
      green: '#009639',
      gold: '#FFD700',
      black: '#000000',
      lightGreen: '#4CAF50',
      darkGreen: '#006D2C'
    }
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.2rem',
      fontWeight: 800, // Bold and confident
      letterSpacing: '-0.02em',
      '@media (min-width:600px)': {
        fontSize: '3rem'
      }
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      '@media (min-width:600px)': {
        fontSize: '2.2rem'
      }
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em'
    },
    h4: {
      fontSize: '1.3rem',
      fontWeight: 600
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7, // More breathing room
      letterSpacing: '0.01em'
    },
    body2: {
      fontSize: '0.9rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em'
    },
    button: {
      fontSize: '1rem',
      fontWeight: 600,
      textTransform: 'none', // Keep natural casing
      letterSpacing: '0.02em'
    },
    // Custom tagline style
    tagline: {
      fontSize: '1.1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      fontStyle: 'italic',
      '@media (min-width:600px)': {
        fontSize: '1.3rem'
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
          minHeight: 48, // Touch-friendly
          fontSize: '16px', // Prevents zoom on iOS
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }
        },
        contained: {
          '&:active': {
            transform: 'scale(0.98)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& input': {
              fontSize: '16px', // Prevents zoom on iOS
              padding: '14px 16px'
            }
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: '0.8rem',
          height: 28
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '0 16px 16px 0'
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: 'rgba(0, 150, 57, 0.08)'
          }
        }
      }
    }
  }
});

export default simpleMobileTheme;
