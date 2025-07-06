import { createTheme } from '@mui/material/styles';

// Enhanced mobile-first theme for JamDung Jobs
export const mobileTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 375,
      md: 768,
      lg: 1024,
      xl: 1200
    }
  },
  palette: {
    primary: {
      main: '#009639', // Jamaican green
      light: '#4CAF50',
      dark: '#006400',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#FFD700', // Jamaican gold
      light: '#FFEB3B',
      dark: '#FFA000',
      contrastText: '#000000'
    },
    error: {
      main: '#DC143C' // Jamaican red
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      '@media (max-width:768px)': {
        fontSize: '1.5rem'
      },
      '@media (max-width:480px)': {
        fontSize: '1.3rem'
      }
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      '@media (max-width:768px)': {
        fontSize: '1.4rem'
      },
      '@media (max-width:480px)': {
        fontSize: '1.2rem'
      }
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      '@media (max-width:768px)': {
        fontSize: '1.25rem'
      }
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      '@media (max-width:768px)': {
        fontSize: '1.1rem'
      }
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      '@media (max-width:768px)': {
        fontSize: '0.95rem',
        lineHeight: 1.5
      }
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      '@media (max-width:768px)': {
        fontSize: '0.85rem'
      }
    },
    button: {
      fontSize: '1rem',
      fontWeight: 600,
      textTransform: 'none',
      '@media (max-width:768px)': {
        fontSize: '0.95rem'
      }
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          minHeight: 44, // Touch-friendly
          '@media (max-width:768px)': {
            padding: '12px 20px',
            minHeight: 48,
            fontSize: '16px' // Prevents zoom on iOS
          }
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 150, 57, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 150, 57, 0.4)',
            transform: 'translateY(-1px)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '@media (max-width:768px)': {
              '& input': {
                fontSize: '16px', // Prevents zoom on iOS
                padding: '14px'
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
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)'
          },
          '@media (max-width:768px)': {
            borderRadius: 8,
            margin: '0 8px 16px 8px'
          }
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',
          '@media (max-width:768px)': {
            padding: '16px'
          },
          '@media (max-width:480px)': {
            padding: '12px'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          '@media (max-width:768px)': {
            position: 'sticky'
          }
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          '@media (max-width:768px)': {
            width: '85%',
            maxWidth: 320
          }
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          minHeight: 48,
          '@media (max-width:768px)': {
            minHeight: 52,
            padding: '12px 16px'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          '@media (max-width:768px)': {
            fontSize: '0.8rem',
            height: 28
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          '@media (max-width:768px)': {
            margin: 16,
            width: 'calc(100% - 32px)',
            maxHeight: 'calc(100% - 64px)'
          }
        }
      }
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:768px)': {
            paddingLeft: 16,
            paddingRight: 16
          },
          '@media (max-width:480px)': {
            paddingLeft: 12,
            paddingRight: 12
          }
        }
      }
    }
  },
  spacing: 8
});

export default mobileTheme;
