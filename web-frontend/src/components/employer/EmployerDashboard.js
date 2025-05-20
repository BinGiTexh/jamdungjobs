import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Tabs,
  Tab,
  Button,
  TextField,
  CircularProgress,
  Alert,
  styled,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { LocationAutocomplete } from '../common/LocationAutocomplete';
import { SkillsAutocomplete } from '../common/SkillsAutocomplete';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
import CompanyDescriptionBuilder from './CompanyDescriptionBuilder';

// Styled components for Jamaican theme
const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    maxWidth: '1100px',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: 'rgba(20, 20, 20, 0.85)',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(44, 85, 48, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%)',
    opacity: 0.3,
    zIndex: 0,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: '#FFD700',
  },
}));

const EmployerDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);
  const [jobListings, setJobListings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [descriptionBuilderOpen, setDescriptionBuilderOpen] = useState(false);
  
  const [companyProfile, setCompanyProfile] = useState({
    companyName: '',
    description: '',
    industry: '',
    location: '',
    website: '',
    logoUrl: null,
    founded: '',
    size: '',
    specialties: []
  });

  useEffect(() => {
    const fetchEmployerData = async () => {
      try {
        setLoading(true);
        
        // Check if we have saved profile data in localStorage
        const savedProfile = localStorage.getItem('employerCompanyProfile');
        
        if (savedProfile) {
          // Use the saved profile data
          setCompanyProfile(JSON.parse(savedProfile));
        } else {
          // Fetch company profile from API
          try {
            const profileRes = await axios.get('/api/employer/company-profile');
            setCompanyProfile(profileRes.data);
          } catch (profileError) {
            console.error('Error fetching company profile:', profileError);
            // Set default profile if error
            setCompanyProfile({
              companyName: user?.companyName || '',
              description: '',
              industry: '',
              location: '',
              website: '',
              logoUrl: null,
              founded: '',
              size: '',
              specialties: []
            });
          }
        }
        
        // Fetch job listings
        try {
          const jobsRes = await axios.get('/api/employer/jobs');
          setJobListings(jobsRes.data);
        } catch (jobsError) {
          console.error('Error fetching job listings:', jobsError);
          setJobListings([]);
        }
        
        // Fetch applications
        try {
          const applicationsRes = await axios.get('/api/employer/applications');
          setApplications(applicationsRes.data);
        } catch (applicationsError) {
          console.error('Error fetching applications:', applicationsError);
          setApplications([]);
        }
        
        if (!companyProfile.companyName) {
          setMessage({ 
            type: 'success', 
            text: 'Welcome to your employer dashboard! Complete your company profile to get started.' 
          });
        }
      } catch (error) {
        console.error('Error in dashboard initialization:', error);
        setMessage({ type: 'error', text: 'Something went wrong. Please try again later.' });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerData();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, simulate a successful profile update
      console.log('Updating company profile with data:', companyProfile);
      
      // In a real application, you would send the profile data to your server
      // const response = await axios.post('/api/employer/company-profile', companyProfile);
      
      // Simulate a slight delay to make it feel like a real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store the updated profile in localStorage for persistence during the demo
      localStorage.setItem('employerCompanyProfile', JSON.stringify(companyProfile));
      
      // Update the local state to reflect the changes
      setMessage({ type: 'success', text: 'Company profile updated successfully' });
      setIsEditing(false); // Turn off editing mode after successful save
    } catch (error) {
      console.error('Error updating company profile:', error);
      setMessage({ type: 'error', text: 'Failed to update company profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file) => {
    try {
      // Create a file reader to read the file as a data URL
      const reader = new FileReader();
      
      reader.onload = (e) => {
        // e.target.result contains the data URL which is a base64 representation of the image
        const logoDataUrl = e.target.result;
        
        // Update the company profile with the data URL
        setCompanyProfile(prev => ({
          ...prev,
          logoUrl: logoDataUrl
        }));
        
        setMessage({ type: 'success', text: 'Logo uploaded successfully' });
      };
      
      // Read the file as a data URL (base64)
      reader.readAsDataURL(file);
      
      // In a real application, you would also upload the file to your server here
      console.log('File selected for upload:', file.name);
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage({ type: 'error', text: 'Failed to upload company logo' });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleOpenDescriptionBuilder = () => {
    setDescriptionBuilderOpen(true);
  };
  
  const handleCloseDescriptionBuilder = () => {
    setDescriptionBuilderOpen(false);
  };
  
  const handleSaveDescription = (newDescription) => {
    setCompanyProfile(prev => ({
      ...prev,
      description: newDescription
    }));
    setDescriptionBuilderOpen(false);
    setMessage({ type: 'success', text: 'Company description updated. Don\'t forget to save your profile changes!' });
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0A0A0A',
          position: 'relative',
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
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
            <CircularProgress sx={{ color: '#FFD700' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0A0A0A',
        position: 'relative',
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
      
      <StyledContainer maxWidth="lg">
        <Box sx={{ py: 4, position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: '#FFD700',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 4
            }}
          >
            Welcome back, {user?.companyName || 'Employer'}!
          </Typography>

          {message && (
            <Alert 
              severity={message.type === 'success' ? 'success' : 'error'}
              sx={{ 
                mb: 3,
                '& .MuiAlert-icon': {
                  color: message.type === 'success' ? '#2C5530' : '#CD2B2B'
                },
                backgroundColor: message.type === 'success' 
                  ? 'rgba(44, 85, 48, 0.1)' 
                  : 'rgba(205, 43, 43, 0.1)',
                color: message.type === 'success' ? '#E8F5E9' : '#f8d7da',
                border: message.type === 'success' 
                  ? '1px solid rgba(44, 85, 48, 0.3)' 
                  : '1px solid rgba(205, 43, 43, 0.3)',
              }}
            >
              {message.text}
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ 
              mb: 3,
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFD700',
              },
              borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
            }}
          >
            <StyledTab label="Company Profile" />
            <StyledTab label="Job Listings" />
            <StyledTab label="Applications" />
          </Tabs>

          {activeTab === 0 && (
            <StyledPaper>
              <Grid container spacing={3}>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#FFD700' }}>Company Profile</Typography>
                  {!isEditing ? (
                    <Button
                      variant="outlined"
                      onClick={() => setIsEditing(true)}
                      sx={{
                        color: '#FFD700',
                        borderColor: '#FFD700',
                        '&:hover': {
                          borderColor: '#FFD700',
                          backgroundColor: 'rgba(255, 215, 0, 0.1)'
                        }
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(false)}
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          '&:hover': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleProfileUpdate}
                        sx={{
                          backgroundColor: '#2C5530',
                          color: '#FFFFFF',
                          '&:hover': {
                            backgroundColor: '#1E3D23',
                          }
                        }}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  )}
                </Grid>

                {!isEditing ? (
                  // Profile Display View
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 180,
                          height: 180,
                          border: '2px solid rgba(255, 215, 0, 0.3)',
                          borderRadius: '50%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'hidden',
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          mb: 2,
                        }}
                      >
                        {companyProfile.logoUrl ? (
                          <img
                            src={companyProfile.logoUrl}
                            alt={`${companyProfile.companyName} logo`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', px: 2 }}>
                            No logo uploaded
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" sx={{ color: '#FFD700', mb: 1 }}>
                          {companyProfile.companyName || 'Company Name Not Set'}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                          {companyProfile.description || 'No company description available.'}
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)' }}>
                            Industry
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                            {companyProfile.industry || 'Not specified'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)' }}>
                            Location
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                            {companyProfile.location || 'Not specified'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)' }}>
                            Website
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                            {companyProfile.website ? (
                              <a href={companyProfile.website} target="_blank" rel="noopener noreferrer" 
                                 style={{ color: '#4FC3F7', textDecoration: 'none' }}>
                                {companyProfile.website}
                              </a>
                            ) : 'Not specified'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)' }}>
                            Founded
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                            {companyProfile.founded || 'Not specified'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)' }}>
                            Company Size
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                            {companyProfile.size || 'Not specified'}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)', mb: 1 }}>
                          Specialties
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {companyProfile.specialties && companyProfile.specialties.length > 0 ? (
                            companyProfile.specialties.map((specialty, index) => (
                              <Chip
                                key={index}
                                label={specialty}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(44, 85, 48, 0.7)',
                                  color: '#FFFFFF',
                                  borderRadius: '4px',
                                }}
                              />
                            ))
                          ) : (
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              No specialties listed
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  // Profile Edit Form
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 180,
                          height: 180,
                          border: '2px solid rgba(255, 215, 0, 0.3)',
                          borderRadius: '50%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'hidden',
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          mb: 2,
                          position: 'relative',
                        }}
                      >
                        {companyProfile.logoUrl ? (
                          <img
                            src={companyProfile.logoUrl}
                            alt={`${companyProfile.companyName} logo`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', px: 2 }}>
                            No logo uploaded
                          </Typography>
                        )}
                      </Box>
                      <Button
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        variant="outlined"
                        sx={{
                          color: '#FFD700',
                          borderColor: '#FFD700',
                          '&:hover': {
                            borderColor: '#FFD700',
                            backgroundColor: 'rgba(255, 215, 0, 0.1)'
                          }
                        }}
                      >
                        Upload Logo
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleLogoUpload(e.target.files[0])}
                        />
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            label="Company Name"
                            fullWidth
                            value={companyProfile.companyName}
                            onChange={(e) => setCompanyProfile({ ...companyProfile, companyName: e.target.value })}
                            required
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': {
                                  borderColor: 'rgba(255, 215, 0, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 215, 0, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#FFD700',
                                },
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#FFD700',
                              },
                              mb: 2,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ position: 'relative', mb: 2 }}>
                            <TextField
                              label="Description"
                              fullWidth
                              multiline
                              rows={4}
                              value={companyProfile.description}
                              onChange={(e) => setCompanyProfile({ ...companyProfile, description: e.target.value })}
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  color: 'white',
                                  '& fieldset': {
                                    borderColor: 'rgba(255, 215, 0, 0.3)',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'rgba(255, 215, 0, 0.5)',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#FFD700',
                                  },
                                },
                                '& .MuiInputLabel-root': {
                                  color: 'rgba(255, 255, 255, 0.7)',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#FFD700',
                                },
                              }}
                            />
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<DescriptionIcon />}
                              onClick={handleOpenDescriptionBuilder}
                              sx={{
                                position: 'absolute',
                                right: 8,
                                bottom: 8,
                                color: '#2C5530',
                                borderColor: '#2C5530',
                                backgroundColor: 'rgba(44, 85, 48, 0.1)',
                                '&:hover': {
                                  borderColor: '#2C5530',
                                  backgroundColor: 'rgba(44, 85, 48, 0.2)'
                                }
                              }}
                            >
                              Build Description
                            </Button>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Industry"
                            fullWidth
                            value={companyProfile.industry}
                            onChange={(e) => setCompanyProfile({ ...companyProfile, industry: e.target.value })}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': {
                                  borderColor: 'rgba(255, 215, 0, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 215, 0, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#FFD700',
                                },
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#FFD700',
                              },
                              mb: 2,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <LocationAutocomplete
                            value={companyProfile.location}
                            onChange={(newValue) => setCompanyProfile({ ...companyProfile, location: newValue })}
                            label="Location"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': {
                                  borderColor: 'rgba(255, 215, 0, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 215, 0, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#FFD700',
                                },
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#FFD700',
                              },
                              mb: 2,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Website"
                            fullWidth
                            value={companyProfile.website}
                            onChange={(e) => setCompanyProfile({ ...companyProfile, website: e.target.value })}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': {
                                  borderColor: 'rgba(255, 215, 0, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 215, 0, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#FFD700',
                                },
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#FFD700',
                              },
                              mb: 2,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Founded (Year)"
                            fullWidth
                            value={companyProfile.founded}
                            onChange={(e) => setCompanyProfile({ ...companyProfile, founded: e.target.value })}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': {
                                  borderColor: 'rgba(255, 215, 0, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 215, 0, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#FFD700',
                                },
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#FFD700',
                              },
                              mb: 2,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Company Size"
                            fullWidth
                            value={companyProfile.size}
                            onChange={(e) => setCompanyProfile({ ...companyProfile, size: e.target.value })}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': {
                                  borderColor: 'rgba(255, 215, 0, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 215, 0, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#FFD700',
                                },
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#FFD700',
                              },
                              mb: 2,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <SkillsAutocomplete
                            label="Specialties"
                            value={companyProfile.specialties}
                            onChange={(newValue) => setCompanyProfile({ ...companyProfile, specialties: newValue })}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': {
                                  borderColor: 'rgba(255, 215, 0, 0.3)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255, 215, 0, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#FFD700',
                                },
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#FFD700',
                              },
                              mb: 2,
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </StyledPaper>
          )}

          {activeTab === 1 && (
            <StyledPaper>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#FFD700' }}>Job Listings</Typography>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#2C5530',
                    color: '#FFFFFF',
                    '&:hover': {
                      backgroundColor: '#1E3D23',
                    }
                  }}
                >
                  Post New Job
                </Button>
              </Box>

              {jobListings.length === 0 ? (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 5,
                    px: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                    You haven't posted any job listings yet.
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{
                      color: '#FFD700',
                      borderColor: '#FFD700',
                      '&:hover': {
                        borderColor: '#FFD700',
                        backgroundColor: 'rgba(255, 215, 0, 0.1)'
                      }
                    }}
                  >
                    Create Your First Job Listing
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Mock job listings for demonstration */}
                  {[
                    {
                      id: 1,
                      title: 'Software Developer',
                      location: 'Kingston, Jamaica',
                      type: 'Full-time',
                      postedDate: '2023-04-15',
                      applicantsCount: 12,
                      status: 'active'
                    },
                    {
                      id: 2,
                      title: 'Marketing Manager',
                      location: 'Montego Bay, Jamaica',
                      type: 'Full-time',
                      postedDate: '2023-04-10',
                      applicantsCount: 8,
                      status: 'active'
                    },
                    {
                      id: 3,
                      title: 'Sales Representative',
                      location: 'Ocho Rios, Jamaica',
                      type: 'Part-time',
                      postedDate: '2023-04-05',
                      applicantsCount: 5,
                      status: 'closed'
                    }
                  ].map((job) => (
                    <Grid item xs={12} key={job.id}>
                      <Paper 
                        sx={{
                          p: 3,
                          backgroundColor: 'rgba(10, 10, 10, 0.7)',
                          border: '1px solid rgba(255, 215, 0, 0.2)',
                          position: 'relative',
                          '&:hover': {
                            backgroundColor: 'rgba(15, 15, 15, 0.8)',
                            borderColor: 'rgba(255, 215, 0, 0.3)',
                          }
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={8}>
                            <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                              {job.title}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                📍 {job.location}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                🕒 {job.type}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                📅 Posted: {job.postedDate}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Chip
                                label={`${job.applicantsCount} Applicants`}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(44, 85, 48, 0.7)',
                                  color: '#FFFFFF',
                                  borderRadius: '4px',
                                  mr: 2
                                }}
                              />
                              <Chip
                                label={job.status === 'active' ? 'Active' : 'Closed'}
                                size="small"
                                sx={{
                                  backgroundColor: job.status === 'active' 
                                    ? 'rgba(44, 85, 48, 0.7)' 
                                    : 'rgba(128, 128, 128, 0.7)',
                                  color: '#FFFFFF',
                                  borderRadius: '4px',
                                }}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                  color: '#FFD700',
                                  borderColor: '#FFD700',
                                  '&:hover': {
                                    borderColor: '#FFD700',
                                    backgroundColor: 'rgba(255, 215, 0, 0.1)'
                                  }
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                  color: job.status === 'active' ? '#f44336' : '#2C5530',
                                  borderColor: job.status === 'active' ? '#f44336' : '#2C5530',
                                  '&:hover': {
                                    borderColor: job.status === 'active' ? '#f44336' : '#2C5530',
                                    backgroundColor: job.status === 'active' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(44, 85, 48, 0.1)'
                                  }
                                }}
                              >
                                {job.status === 'active' ? 'Close' : 'Reopen'}
                              </Button>
                              <Button
                                variant="text"
                                size="small"
                                sx={{
                                  color: '#4FC3F7',
                                  '&:hover': {
                                    backgroundColor: 'rgba(79, 195, 247, 0.1)'
                                  }
                                }}
                              >
                                View Applicants
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </StyledPaper>
          )}

          {activeTab === 2 && (
            <StyledPaper>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#FFD700' }}>Applications</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    sx={{
                      color: '#FFD700',
                      borderColor: '#FFD700',
                      '&:hover': {
                        borderColor: '#FFD700',
                        backgroundColor: 'rgba(255, 215, 0, 0.1)'
                      }
                    }}
                  >
                    Filter Applications
                  </Button>
                </Box>
              </Box>

              {applications.length === 0 ? (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 5,
                    px: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                    You don't have any applications yet.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Applications will appear here when job seekers apply to your job listings.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Mock applications for demonstration */}
                  {[
                    {
                      id: 1,
                      applicantName: 'John Brown',
                      jobTitle: 'Software Developer',
                      appliedDate: '2023-04-18',
                      status: 'APPLIED',
                      resumeUrl: '#',
                      matchScore: 85
                    },
                    {
                      id: 2,
                      applicantName: 'Sarah Johnson',
                      jobTitle: 'Software Developer',
                      appliedDate: '2023-04-17',
                      status: 'REVIEWING',
                      resumeUrl: '#',
                      matchScore: 92
                    },
                    {
                      id: 3,
                      applicantName: 'Michael Davis',
                      jobTitle: 'Marketing Manager',
                      appliedDate: '2023-04-16',
                      status: 'INTERVIEW',
                      resumeUrl: '#',
                      matchScore: 78
                    },
                    {
                      id: 4,
                      applicantName: 'Lisa Thompson',
                      jobTitle: 'Marketing Manager',
                      appliedDate: '2023-04-15',
                      status: 'REJECTED',
                      resumeUrl: '#',
                      matchScore: 65
                    },
                    {
                      id: 5,
                      applicantName: 'Robert Wilson',
                      jobTitle: 'Sales Representative',
                      appliedDate: '2023-04-14',
                      status: 'OFFERED',
                      resumeUrl: '#',
                      matchScore: 88
                    }
                  ].map((application) => (
                    <Grid item xs={12} key={application.id}>
                      <Paper 
                        sx={{
                          p: 3,
                          backgroundColor: 'rgba(10, 10, 10, 0.7)',
                          border: '1px solid rgba(255, 215, 0, 0.2)',
                          position: 'relative',
                          '&:hover': {
                            backgroundColor: 'rgba(15, 15, 15, 0.8)',
                            borderColor: 'rgba(255, 215, 0, 0.3)',
                          }
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={7}>
                            <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                              {application.applicantName}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
                              Applied for: {application.jobTitle}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                📅 Applied: {application.appliedDate}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }}>
                                  Match Score:
                                </Typography>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    borderRadius: '10px',
                                    padding: '2px 8px',
                                    border: '1px solid rgba(255, 215, 0, 0.2)',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: '50px',
                                      height: '6px',
                                      backgroundColor: 'rgba(44, 85, 48, 0.3)',
                                      borderRadius: '3px',
                                      mr: 1,
                                      position: 'relative',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        height: '100%',
                                        width: `${application.matchScore}%`,
                                        backgroundColor: application.matchScore > 80 
                                          ? '#4caf50' 
                                          : application.matchScore > 60 
                                            ? '#ff9800' 
                                            : '#f44336',
                                        borderRadius: '3px',
                                      }}
                                    />
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: application.matchScore > 80 
                                        ? '#4caf50' 
                                        : application.matchScore > 60 
                                          ? '#ff9800' 
                                          : '#f44336',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    {application.matchScore}%
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mb: 2 }}>
                              <Chip
                                label={(() => {
                                  switch(application.status) {
                                    case 'APPLIED': return 'Applied';
                                    case 'REVIEWING': return 'Reviewing';
                                    case 'INTERVIEW': return 'Interview';
                                    case 'OFFERED': return 'Offered';
                                    case 'REJECTED': return 'Rejected';
                                    default: return application.status;
                                  }
                                })()}
                                size="small"
                                sx={{
                                  backgroundColor: (() => {
                                    switch(application.status) {
                                      case 'APPLIED': return 'rgba(33, 150, 243, 0.7)';
                                      case 'REVIEWING': return 'rgba(255, 152, 0, 0.7)';
                                      case 'INTERVIEW': return 'rgba(156, 39, 176, 0.7)';
                                      case 'OFFERED': return 'rgba(76, 175, 80, 0.7)';
                                      case 'REJECTED': return 'rgba(244, 67, 54, 0.7)';
                                      default: return 'rgba(158, 158, 158, 0.7)';
                                    }
                                  })(),
                                  color: '#FFFFFF',
                                  borderRadius: '4px',
                                  fontWeight: 500
                                }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                  color: '#FFD700',
                                  borderColor: '#FFD700',
                                  '&:hover': {
                                    borderColor: '#FFD700',
                                    backgroundColor: 'rgba(255, 215, 0, 0.1)'
                                  }
                                }}
                              >
                                View Details
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                  color: '#4FC3F7',
                                  borderColor: '#4FC3F7',
                                  '&:hover': {
                                    borderColor: '#4FC3F7',
                                    backgroundColor: 'rgba(79, 195, 247, 0.1)'
                                  }
                                }}
                              >
                                Download Resume
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                  color: '#2C5530',
                                  borderColor: '#2C5530',
                                  '&:hover': {
                                    borderColor: '#2C5530',
                                    backgroundColor: 'rgba(44, 85, 48, 0.1)'
                                  }
                                }}
                              >
                                Update Status
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </StyledPaper>
          )}
        </Box>
      </StyledContainer>
      {/* Description Builder Dialog */}
      <Dialog 
        open={descriptionBuilderOpen} 
        onClose={handleCloseDescriptionBuilder}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#0A0A0A',
            backgroundImage: 'linear-gradient(135deg, rgba(44, 85, 48, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
            color: '#FFFFFF',
          }
        }}
      >
        <DialogTitle sx={{ color: '#FFD700' }}>
          Company Description Builder
        </DialogTitle>
        <DialogContent>
          <CompanyDescriptionBuilder 
            initialDescription={companyProfile.description} 
            onSave={handleSaveDescription} 
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDescriptionBuilder}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#FFFFFF',
              }
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployerDashboard;
