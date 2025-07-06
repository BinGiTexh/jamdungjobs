import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007E1B',
      light: '#E8F5E9',
      dark: '#005714'
    },
    secondary: {
      main: '#FFB30F',
      light: '#FFF3D6',
      dark: '#CC8F0C'
    },
    error: {
      main: '#CD2B2B'
    },
    background: {
      default: '#F9F9F9',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A'
    }
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '2rem'
      }
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.75rem'
      }
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      '@media (max-width:600px)': {
        fontSize: '1.5rem'
      }
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 24px'
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #007E1B 30%, #009921 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #005714 30%, #007E1B 90%)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }
      }
    }
  }
});

export default theme;
