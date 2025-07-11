import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Alert,
  Divider
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';
import GoogleOAuthButton from './GoogleOAuthButton';

const LoginPage = () => {
  const { login, loginWithGoogle, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we're coming from the employer hiring button
  const isEmployerRedirect = location.state?.employerRedirect;
  
  // Log navigation to login page
  useEffect(() => {
    logDev('debug', 'Login page accessed', {
      from: location.state?.from || 'direct',
      isEmployerRedirect: !!isEmployerRedirect
    });
  }, [location.state, isEmployerRedirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      let redirectTo = location.state?.from;
      
      if (!redirectTo) {
        // Redirect based on user role
        redirectTo = user.role === 'EMPLOYER' 
          ? '/employer/dashboard'
          : '/dashboard';
      }
      
      logDev('info', 'Login successful', {
        userRole: user.role,
        redirectTo: sanitizeForLogging(redirectTo)
      });
      
      navigate(redirectTo, { replace: true });
    } catch (err) {
      logError('Login failed', err, {
        module: 'App',
        function: 'handleLogin',
        status: err.response?.status,
        email: email ? `${email.substring(0, 3)}...` : 'empty',
        hasPassword: !!password
      });
    }
  };

  const handleGoogleSuccess = async (googleData) => {
    try {
      const user = await loginWithGoogle(googleData.googleToken, googleData.userInfo);
      let redirectTo = location.state?.from;
      
      if (!redirectTo) {
        // Redirect based on user role
        redirectTo = user.role === 'EMPLOYER' 
          ? '/employer/dashboard'
          : '/dashboard';
      }
      
      logDev('info', 'Google login successful', {
        userRole: user.role,
        redirectTo: sanitizeForLogging(redirectTo)
      });
      
      navigate(redirectTo, { replace: true });
    } catch (err) {
      logError('Google login failed', err, {
        module: 'LoginPage',
        function: 'handleGoogleSuccess',
        email: googleData.userInfo?.email ? `${googleData.userInfo.email.substring(0, 3)}...` : 'none'
      });
    }
  };

  const handleGoogleError = (error) => {
    logError('Google OAuth error', error, {
      module: 'LoginPage',
      function: 'handleGoogleError'
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0A0A0A',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background image with Jamaican styling */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: 'url("/images/generated/jamaican-design-1747273968.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          zIndex: 1
        }}
      />
      
      <Container maxWidth="sm" sx={{ 
        position: 'relative', 
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '80vh',
        py: 8
      }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            backgroundColor: 'rgba(20, 20, 20, 0.85)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Card background gradient */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(44, 85, 48, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%)',
              opacity: 0.3
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography variant="h4" component="h1" align="center" sx={{ 
              mb: 2, 
              color: '#FFD700',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Sign In to JamDung Jobs
            </Typography>
            
            {isEmployerRedirect && (
              <Typography variant="subtitle1" align="center" sx={{ 
                mb: 3, 
                color: 'rgba(255, 215, 0, 0.8)',
                fontWeight: 500,
                backgroundColor: 'rgba(44, 85, 48, 0.2)',
                py: 1,
                px: 2,
                borderRadius: 1
              }}>
                Sign in to start posting jobs and hiring top talent
              </Typography>
            )}
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  color: '#ffcdd2',
                  border: '1px solid rgba(211, 47, 47, 0.3)',
                  '& .MuiAlert-icon': {
                    color: '#ef5350'
                  }
                }}
              >
                {error}
                {error.includes('Invalid email or password') && (
                  <Box sx={{ mt: 1, fontSize: '0.875rem', opacity: 0.8 }}>
                    💡 Tip: Make sure you're using the correct email address and password. If you forgot your password, contact support.
                  </Box>
                )}
                {error.includes('Unable to connect') && (
                  <Box sx={{ mt: 1, fontSize: '0.875rem', opacity: 0.8 }}>
                    💡 Tip: Check your internet connection and try refreshing the page.
                  </Box>
                )}
              </Alert>
            )}
            
            {/* Google OAuth Button */}
            <GoogleOAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="Continue with Google"
              variant="outlined"
              sx={{ mb: 3 }}
            />
            
            {/* Divider */}
            <Divider sx={{ 
              my: 3,
              '&::before, &::after': {
                borderColor: 'rgba(255, 215, 0, 0.3)'
              }
            }}>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                px: 2,
                fontWeight: 500
              }}>
                or
              </Typography>
            </Divider>
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                margin="normal"
                InputProps={{
                  sx: {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 215, 0, 0.5)',
                      borderWidth: '2px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 215, 0, 0.8)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FFD700',
                      borderWidth: '2px'
                    }
                  }
                }}
                InputLabelProps={{
                  sx: { color: '#FFD700', fontWeight: 500 }
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                margin="normal"
                InputProps={{
                  sx: {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 215, 0, 0.5)',
                      borderWidth: '2px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 215, 0, 0.8)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FFD700',
                      borderWidth: '2px'
                    }
                  }
                }}
                InputLabelProps={{
                  sx: { color: '#FFD700', fontWeight: 500 }
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                  color: '#000',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Signing in...' : isEmployerRedirect ? 'Sign In to Start Hiring' : 'Sign In'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Don't have an account?{' '}
                  <Link 
                    to={isEmployerRedirect ? '/employer/register' : '/register'} 
                    style={{ color: '#FFD700', textDecoration: 'none' }}
                  >
                    {isEmployerRedirect ? 'Sign up as an employer' : 'Sign up'}
                  </Link>
                </Typography>
                
                {/* Development Helper - No Credentials */}
                {process.env.NODE_ENV === 'development' && (
                  <Box sx={{ 
                    mt: 3, 
                    p: 2, 
                    backgroundColor: 'rgba(255, 215, 0, 0.1)', 
                    borderRadius: 1,
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                  }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 215, 0, 0.9)', fontWeight: 600 }}>
                      🧪 Development Mode
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block', mt: 1 }}>
                      Contact your development team for test account credentials
                    </Typography>
                  </Box>
                )}
              </Box>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;

