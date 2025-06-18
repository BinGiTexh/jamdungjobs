import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Alert,
  CircularProgress,
  Divider,
  Fade
} from '@mui/material';
import { JamaicaLocationAutocomplete } from './common/JamaicaLocationAutocomplete';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  
  // Check if we have a role in the location state (e.g., coming from "Post a Job")
  const defaultRole = location.state?.role || 'JOBSEEKER';
  const redirectPath = location.state?.from || '/dashboard';
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    // Company fields (only for employers)
    companyName: '',
    companyWebsite: '',
    companyLocation: '',
    companyDescription: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Set a message if coming from another page
  const [message, setMessage] = useState(location.state?.message || '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWebsiteBlur = () => {
    if (formData.companyWebsite && !/^https?:\/\//i.test(formData.companyWebsite)) {
      setFormData(prev => ({
        ...prev,
        companyWebsite: `https://${prev.companyWebsite}`
      }));
    }
  };

  const handleLocationSelect = (locationObj) => {
    if (!locationObj) {
      setFormData(prev => ({ ...prev, companyLocation: '' }));
      return;
    }
    const locationString = `${locationObj.name || locationObj.mainText}, ${locationObj.parish}, Jamaica`;
    setFormData(prev => ({ ...prev, companyLocation: locationString }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Remove confirmPassword before sending to API and map field names to backend expectations
      const {
        confirmPassword,
        firstName,
        lastName,
        companyName,
        companyWebsite,
        companyLocation,
        companyDescription,
        ...rest
      } = formData;

      const registrationData = {
        ...rest,
        first_name: firstName,
        last_name: lastName,
        // Only include company fields for employers to avoid sending undefined
        ...(formData.role === 'EMPLOYER' && {
          company_name: companyName,
          company_website: companyWebsite,
          company_location: companyLocation,
          company_description: companyDescription
        })
      };

      await register(registrationData);
      
      // If we came from the employer job posting flow, redirect back there
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0A0A0A',
        position: 'relative',
        overflow: 'hidden',
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
          zIndex: 1,
        }}
      />
      
      <Container component="main" maxWidth="md" sx={{ 
        position: 'relative', 
        zIndex: 2,
        py: 8,
      }}>
        <Fade in={true} timeout={800}>
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography 
              component="h1" 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: '#FFD700',
                mb: 3,
                position: 'relative',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                  borderRadius: '2px',
                }
              }}
            >
              Create Your Account
            </Typography>
            
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 2, sm: 4 }, 
                mt: 4, 
                width: '100%',
                borderRadius: 2,
                backgroundColor: 'rgba(10, 10, 10, 0.8)',
                border: '1px solid rgba(255, 215, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(44, 85, 48, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
                  opacity: 0.1,
                  zIndex: 0,
                },
              }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {message && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  {message}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, position: 'relative', zIndex: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="firstName"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      autoFocus
                      value={formData.firstName}
                      onChange={handleChange}
                      InputProps={{
                        sx: {
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 215, 0, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 215, 0, 0.6)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FFD700',
                          },
                        },
                      }}
                      InputLabelProps={{
                        sx: { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      InputProps={{
                        sx: {
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 215, 0, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 215, 0, 0.6)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FFD700',
                          },
                        },
                      }}
                      InputLabelProps={{
                        sx: { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      InputProps={{
                        sx: {
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 215, 0, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 215, 0, 0.6)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FFD700',
                          },
                        },
                      }}
                      InputLabelProps={{
                        sx: { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      helperText="Password must be at least 8 characters long"
                      InputProps={{
                        sx: {
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 215, 0, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 215, 0, 0.6)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FFD700',
                          },
                        },
                      }}
                      InputLabelProps={{
                        sx: { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                      FormHelperTextProps={{
                        sx: { color: 'rgba(255, 255, 255, 0.5)' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      InputProps={{
                        sx: {
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 215, 0, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 215, 0, 0.6)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FFD700',
                          },
                        },
                      }}
                      InputLabelProps={{
                        sx: { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl component="fieldset" sx={{ my: 2 }}>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>I am registering as:</Typography>
                      <RadioGroup
                        row
                        aria-label="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <FormControlLabel 
                          value="JOBSEEKER" 
                          control={<Radio sx={{ 
                            color: 'rgba(255, 215, 0, 0.5)',
                            '&.Mui-checked': {
                              color: '#FFD700',
                            },
                          }} />} 
                          label={<Typography sx={{ color: 'white' }}>Job Seeker</Typography>} 
                        />
                        <FormControlLabel 
                          value="EMPLOYER" 
                          control={<Radio sx={{ 
                            color: 'rgba(255, 215, 0, 0.5)',
                            '&.Mui-checked': {
                              color: '#FFD700',
                            },
                          }} />} 
                          label={<Typography sx={{ color: 'white' }}>Employer</Typography>} 
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  
                  {formData.role === 'EMPLOYER' && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ 
                          my: 3, 
                          '&::before, &::after': {
                            borderColor: 'rgba(255, 215, 0, 0.3)',
                          },
                        }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFD700' }}>
                            Company Information
                          </Typography>
                        </Divider>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          id="companyName"
                          label="Company Name"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          InputProps={{
                            sx: {
                              color: 'white',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 215, 0, 0.3)',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 215, 0, 0.6)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#FFD700',
                              },
                            },
                          }}
                          InputLabelProps={{
                            sx: { color: 'rgba(255, 255, 255, 0.7)' },
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="companyWebsite"
                          label="Company Website"
                          name="companyWebsite"
                          type="url"
                          value={formData.companyWebsite}
                          onChange={handleChange}
                          onBlur={handleWebsiteBlur}
                          placeholder="https://example.com"
                          InputProps={{
                            sx: {
                              color: 'white',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 215, 0, 0.3)',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 215, 0, 0.6)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#FFD700',
                              },
                            },
                          }}
                          InputLabelProps={{
                            sx: { color: 'rgba(255, 255, 255, 0.7)' },
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <JamaicaLocationAutocomplete
                          value={null}
                          onChange={handleLocationSelect}
                          placeholder="Company Location (Jamaica)"
                          sx={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          id="companyDescription"
                          label="Company Description"
                          name="companyDescription"
                          multiline
                          rows={4}
                          value={formData.companyDescription}
                          onChange={handleChange}
                          InputProps={{
                            sx: {
                              color: 'white',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 215, 0, 0.3)',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 215, 0, 0.6)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#FFD700',
                              },
                            },
                          }}
                          InputLabelProps={{
                            sx: { color: 'rgba(255, 255, 255, 0.7)' },
                          }}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12}>
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
                        '&:hover': {
                          background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                        },
                        transition: 'all 0.3s ease',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                      }}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={24} sx={{ mr: 1, color: '#000' }} />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                    <Grid container justifyContent="center">
                      <Grid item>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                          <Typography variant="body2" sx={{ mt: 2, color: '#FFD700', '&:hover': { textDecoration: 'underline' } }}>
                            Already have an account? Sign in
                          </Typography>
                        </Link>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default Register;
