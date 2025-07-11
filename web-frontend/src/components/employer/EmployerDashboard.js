/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Typography, Grid, Paper, Container, Tabs, Tab, Button,
  TextField, CircularProgress, Alert, styled, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Fade,
  useTheme, useMediaQuery, Avatar, Menu, MenuItem, ListItemText,
  ListItemIcon, Divider, Badge
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
import axios from 'axios';

// Import components
// Import icons
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';
import api from '../../utils/axiosConfig';
import { buildApiUrl, buildAssetUrl } from '../../config';
import { useAuth } from '../../context/AuthContext';
import CreateJobListing from './CreateJobListing';
import JobDetailsDialog from './JobDetailsDialog';
import ApplicationsList from './ApplicationsList';
import CompanyProfileSetup from './CompanyProfileSetup';

// Define animations
const fadeInUp = keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(30px)'
  },
  to: {
    opacity: 1,
    transform: 'translateY(0)'
  }
});

const underlineExpand = keyframes({
  from: {
    width: 0
  },
  to: {
    width: '100%'
  }
});

// Styled components
const StyledContainer = styled(Container)(({ _theme }) => ({
  marginTop: theme.spacing(4),
  animation: `${fadeInUp} 0.6s ease-out`
}));

const DashboardWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: '#0A0A0A'
}));

const BackgroundOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: 'url("/images/generated/jamaican-design-1747273968.png")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  opacity: 0.15,
  zIndex: 0
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#FFFFFF',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid rgba(44, 85, 48, 0.2)',
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  color: '#000000',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(44, 85, 48, 0.4)'
  }
}));

const TabPanel = ({ children, value, index }) => (
  <Box sx={{ py: 3 }} hidden={value !== index} role="tabpanel" id={`tabpanel-${index}`}>
    {value === index && children}
  </Box>
);

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
};

const EmployerDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState({
    jobUpdate: false,
    jobCreate: false,
    profileUpdate: false
  });
  const [dataLoading, setDataLoading] = useState({
    employer: true,
    jobs: false,
    notifications: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [message, setMessage] = useState(null);
  const [profileUpdateStatus, setProfileUpdateStatus] = useState({
    success: false,
    error: null,
    loading: false
  });
  const [jobListings, setJobListings] = useState([]);
  const [descriptionBuilderOpen, setDescriptionBuilderOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [jobEditMode, setJobEditMode] = useState(false);
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [companyProfile, setCompanyProfile] = useState({
    companyName: '',
    description: '',
    industry: '',
    location: '',
    website: '',
    logoUrl: null
  });
  const [profileSetupOpen, setProfileSetupOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useAuth();

  const notificationsOpen = Boolean(anchorEl);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchEmployerData = useCallback(async () => {
    setDataLoading(prev => ({ ...prev, employer: true }));
    try {
      console.warn('Fetching employer data...');
      const response = await api.get('/api/employer/profile');
      const data = response?.data?.data ?? response?.data;
      console.warn('Employer data response:', data);

      // Validate response structure
      if (!data) {
        throw new Error('Invalid response from server');
      }

      // Check if we have employer data
      if (!data.employer) {
        throw new Error('Invalid response format: missing employer data');
      }

      // Handle company data if it exists
      if (data.company) {
        // Validate company data structure
        const company = data.company;
        if (!company || typeof company !== 'object') {
          throw new Error('Invalid company data structure');
        }

        // Validate required company fields
        if (!company.name) {
          throw new Error('Invalid company data: missing name');
        }

        // Map API response to frontend data structure
        const companyData = {
          companyName: company.name,
          description: company.description || '',
          industry: company.industry || '',
          location: company.location || '',
          website: company.website || '',
          logoUrl: company.logoUrl || null
        };

        console.warn('Mapped company data:', companyData);

        // Check if we have essential company data
        if (companyData.companyName && companyData.industry) {
          setCompanyProfile(companyData);
          setNeedsProfileSetup(false);
          setMessage(null);
        } else {
          // Company exists but missing required data
          setCompanyProfile(companyData);
          setNeedsProfileSetup(true);
          setMessage({
            type: 'info',
            text: 'Please complete your company profile.'
          });
        }
      } else {
        // No company data found
        console.warn('No company data found');
        setNeedsProfileSetup(true);
        setCompanyProfile({
          companyName: '',
          description: '',
          industry: '',
          location: '',
          website: '',
          logoUrl: null
        });
        setMessage({
          type: 'info',
          text: 'Welcome! Please set up your company profile to get started.'
        });
      }

      // Only fetch job listings if company profile exists
      if (data.company) {
        try {
          setDataLoading(prev => ({ ...prev, jobs: true }));
          const jobsResponse = await api.get('/api/employer/jobs');
          
          // Validate jobs response
          if (!jobsResponse?.data) {
            throw new Error('Invalid jobs response format');
          }

          // Ensure we have an array of jobs
          setJobListings(Array.isArray(jobsResponse.data) ? jobsResponse.data : []);
        } catch (jobsError) {
          console.error('Error fetching job listings:', jobsError);
          setJobListings([]);
        } finally {
          setDataLoading(prev => ({ ...prev, jobs: false }));
        }
      } else {
        // Clear job listings if no company profile exists
        setJobListings([]);
      }

    } catch (error) {
      // Log the error with full context
      console.error('Error fetching employer data:', {
        error: error.response || error,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      // Log to error tracking service
      logError('Error fetching employer data', error, {
        module: 'EmployerDashboard',
        function: 'fetchEmployerData',
        userId: user?.id,
        error: error.response?.data || error.message,
        status: error.response?.status,
        stack: error.stack
      });

      // Reset state
      const emptyProfile = {
        companyName: '',
        description: '',
        industry: '',
        location: '',
        website: '',
        logoUrl: null
      };
      setCompanyProfile(emptyProfile);
      setJobListings([]);

      // Handle different error cases
      if (error.message.includes('Invalid company data: missing name')) {
        setMessage({
          type: 'info',
          text: 'Please set up your company profile with a valid company name.'
        });
        setNeedsProfileSetup(true);
      } else if (error.message.includes('Invalid response format') || 
          error.message.includes('Invalid data format') ||
          error.message.includes('Invalid company data structure')) {
        setMessage({
          type: 'error',
          text: 'Unexpected server response format. Please try again later.'
        });
      } else if (error.response?.status === 404) {
        console.warn('New employer detected - initializing empty profile');
        setNeedsProfileSetup(true);
        setMessage({
          type: 'info',
          text: 'Welcome! Please set up your company profile to get started.'
        });
      } else if (error.response?.status === 401) {
        setMessage({
          type: 'error',
          text: 'Your session has expired. Please log in again.'
        });
      } else if (error.response?.status === 403) {
        setMessage({
          type: 'error',
          text: 'You do not have permission to access employer features.'
        });
      } else if (!error.response || error.response.status >= 500) {
        setMessage({
          type: 'error',
          text: 'Unable to connect to the server. Please try again later.'
        });
      } else {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Failed to load employer data. Please try again.'
        });
      }

      // Always set needs profile setup on error except for auth errors
      if (![401, 403].includes(error.response?.status)) {
        setNeedsProfileSetup(true);
      }

    } finally {
      // Reset loading states
      setDataLoading(prev => ({
        ...prev,
        employer: false,
        jobs: false
      }));
      setLoading(false);
    }
  }, [user]);

  const handleProfileUpdate = async (profileData) => {
    setProfileUpdateStatus({ success: false, error: null, loading: true });
    setApiLoading(prev => ({ ...prev, profileUpdate: true }));
    try {
      const response = await api.put('/api/employer/profile', profileData);
      
      // Extract company object from possible response shapes
      const company = response.data?.data?.company || response.data?.company || response.data;
      
      // Format the response data to match our component structure
      const formattedData = {
        companyName: company.name || '',
        description: company.description || '',
        industry: company.industry || '',
        location: company.location || '',
        website: company.website || '',
        logoUrl: company.logoUrl || null
      };
      
      setCompanyProfile(formattedData);
      setNeedsProfileSetup(false);
      
      setProfileUpdateStatus({
        success: true,
        error: null,
        loading: false
      });
      
      // Show success message
      setMessage({
        type: 'success',
        text: 'Company profile updated successfully'
      });
      
      // Close dialog after short delay to show success state
      setTimeout(() => {
        setProfileSetupOpen(false);
        // Clear success message after dialog closes
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }, 1000);
    } catch (error) {
      logError('Error updating company profile', error);
      setProfileUpdateStatus({
        success: false,
        error: error.response?.data?.message || 'Failed to update company profile',
        loading: false
      });
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update company profile'
      });
    } finally {
      setApiLoading(prev => ({ ...prev, profileUpdate: false }));
    }
  };
  

  const handleJobUpdate = async (jobData) => {
    setApiLoading(prev => ({ ...prev, jobUpdate: true }));
    try {
      const response = await api.put(`/api/jobs/${selectedJob.id}`, jobData);
      setJobListings(prevListings =>
        prevListings.map(job =>
          job.id === selectedJob.id ? response.data : job
        )
      );
      setJobDetailsOpen(false);
    } catch (error) {
      logError('Error updating job', error);
      setMessage({
        type: 'error',
        text: 'Failed to update job listing'
      });
    } finally {
      setApiLoading(prev => ({ ...prev, jobUpdate: false }));
    }
  };

  const handleCreateJob = async (jobData) => {
    setApiLoading(prev => ({ ...prev, jobCreate: true }));
    try {
      const response = await api.post('/api/jobs', jobData);
      setJobListings(prev => [...prev, response.data]);
      setCreateJobOpen(false);
    } catch (error) {
      logError('Error creating job', error);
      setMessage({
        type: 'error',
        text: 'Failed to create job listing'
      });
    } finally {
      setApiLoading(prev => ({ ...prev, jobCreate: false }));
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setDataLoading(prev => ({ ...prev, notifications: true }));
      setNotificationsLoading(true);
      const response = await api.get('/api/notifications');
      // Support different response shapes e.g. { data: [...] } or []
      const notificationsRaw = response?.data?.data ?? response?.data ?? [];
      const notificationsData = Array.isArray(notificationsRaw) ? notificationsRaw : [];
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => n.status === 'UNREAD').length);
    } catch (error) {
      logError('Error fetching notifications', error);
      setNotificationsError('Failed to load notifications');
    } finally {
      setDataLoading(prev => ({ ...prev, notifications: false }));
      setNotificationsLoading(false);
    }
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}`);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, status: 'READ' } : n
        )
      );
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      logError('Error marking notification as read', error);
    }
  };

  const handleNotificationsClick = (event) => {
    // Open menu immediately for better UX
    setAnchorEl(event.currentTarget);
    // Fire and forget refresh
    fetchNotifications().catch(err => {
      console.error('Failed to refresh notifications', err);
    });
  };

  const handleNotificationsClose = () => {
    setAnchorEl(null);
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setJobEditMode(true);
    setJobDetailsOpen(true);
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setJobEditMode(false);
    setJobDetailsOpen(true);
  };

  const handleNotificationClick = (notification) => {
    if (notification.status === 'UNREAD') {
      markAsRead(notification.id);
    }
    handleNotificationsClose();
    // Navigate based on notification type
    if (notification.type === 'APPLICATION') {
      setActiveTab(2);
    }
  };
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (isMounted) {
        try {
          await fetchEmployerData();
          await fetchNotifications();
        } catch (error) {
          console.error('Error in initial data fetch:', error);
        }
      }
    };

    fetchData();
    
    // Set up notification polling
    const intervalId = setInterval(() => {
      if (isMounted) {
        fetchNotifications().catch(error => {
          console.error('Error in notification polling:', error);
        });
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fetchEmployerData, fetchNotifications]);

  return (
    <DashboardWrapper>
      <BackgroundOverlay />
      <StyledContainer>
        {loading || dataLoading.employer ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <CircularProgress sx={{ color: '#FFD700' }} />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" sx={{ color: '#FFD700' }}>
                    Employer Dashboard
                  </Typography>
                  <Box>
                    <IconButton
                      onClick={handleNotificationsClick}
                      size="large"
                      aria-label="show notifications"
                      aria-controls="notifications-menu"
                      aria-haspopup="true"
                      sx={{
                        color: theme.palette.mode === 'dark' ? '#FFD700' : '#2C5530',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 215, 0, 0.1)'
                        }
                      }}
                    >
                      <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                    <Menu
                      id="notifications-menu"
                      anchorEl={anchorEl}
                      open={notificationsOpen}
                      onClose={handleNotificationsClose}
                      PaperProps={{
                        sx: {
                          maxHeight: 400,
                          width: '350px',
                          backgroundColor: '#1A1A1A'
                        }
                      }}
                    >
                      {notificationsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                          <CircularProgress size={24} sx={{ color: '#FFD700' }} />
                        </Box>
                      ) : notifications.length === 0 ? (
                        <MenuItem sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          <ListItemText primary="No notifications" />
                        </MenuItem>
                      ) : (
                        notifications.map(notification => (
                          <MenuItem
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            sx={{
                              borderLeft: notification.status === 'UNREAD' ? '3px solid #FFD700' : 'none',
                              backgroundColor: notification.status === 'UNREAD' ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
                            }}
                          >
                            <ListItemText
                              primary={notification.title}
                              secondary={notification.content}
                              secondaryTypographyProps={{
                                sx: { color: 'rgba(255, 255, 255, 0.5)' }
                              }}
                            />
                          </MenuItem>
                        ))
                      )}
                    </Menu>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Overview" icon={<BusinessIcon />} />
              <Tab label="Job Listings" icon={<WorkIcon />} />
              <Tab label="Applications" icon={<PeopleIcon />} />
            </Tabs>

            {/* Tab panels */}
            {activeTab === 0 && (
              <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    {message && (
                      <Box sx={{ mb: 2 }}>
                        <Alert 
                          severity={message.type} 
                          onClose={() => setMessage(null)}
                          sx={{
                            '& .MuiAlert-message': {
                              color: message.type === 'error' ? '#5F2120' : '#1E4620'
                            }
                          }}
                        >
                          {message.text}
                        </Alert>
                      </Box>
                    )}
                    <StyledPaper>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ 
                          color: '#2C5530', 
                          fontWeight: 700,
                          fontSize: '1.5rem'
                        }}>Company Profile</Typography>
                        <Button
                          variant="contained"
                          startIcon={apiLoading.profileUpdate ? (
                            <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                          ) : (
                            <EditIcon />
                          )}
                          onClick={() => {
                            setProfileSetupOpen(true);
                            setApiLoading(prev => ({ ...prev, profileUpdate: false }));
                          }}
                          disabled={apiLoading.profileUpdate}
                          sx={{
                            backgroundColor: '#2C5530',
                            color: '#FFFFFF',
                            padding: '8px 24px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': {
                              backgroundColor: '#1E3D23',
                              boxShadow: '0 4px 12px rgba(44, 85, 48, 0.2)'
                            },
                            '&.Mui-disabled': {
                              backgroundColor: 'rgba(44, 85, 48, 0.5)',
                              color: '#FFFFFF'
                            }
                          }}
                        >
                          {apiLoading.profileUpdate ? 'Updating...' : 'Edit Profile'}
                        </Button>
                      </Box>
                      {profileUpdateStatus.loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                          <CircularProgress sx={{ color: '#2C5530' }} />
                        </Box>
                      ) : companyProfile ? (
                        <>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Company Logo Preview */}
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              {companyProfile.logoUrl ? (
                                <Avatar
                                  src={buildAssetUrl(companyProfile.logoUrl)}
                                  alt={companyProfile.companyName}
                                  sx={{ width: 120, height: 120, border: '2px solid #FFD700', objectFit: 'contain' }}
                                />
                              ) : (
                                <Avatar
                                  sx={{ width: 120, height: 120, backgroundColor: '#2C5530' }}
                                >
                                  <BusinessIcon sx={{ fontSize: 60, color: '#FFD700' }} />
                                </Avatar>
                              )}
                            </Box>
                            <Box sx={{ 
                              backgroundColor: 'rgba(44, 85, 48, 0.05)', 
                              p: 2, 
                              borderRadius: 1,
                              border: '1px solid rgba(44, 85, 48, 0.1)'
                            }}>
                              <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 1 }}>
                                <Box component="span" sx={{ 
                                  fontWeight: 600, 
                                  color: '#2C5530',
                                  fontSize: '1.2rem',
                                  display: 'block',
                                  mb: 1
                                }}>Company Name</Box>
                                <Box component="span">{companyProfile.companyName || 'Not specified'}</Box>
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              backgroundColor: 'rgba(44, 85, 48, 0.05)', 
                              p: 2, 
                              borderRadius: 1,
                              border: '1px solid rgba(44, 85, 48, 0.1)'
                            }}>
                              <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 1 }}>
                                <Box component="span" sx={{ 
                                  fontWeight: 600, 
                                  color: '#2C5530',
                                  fontSize: '1.2rem',
                                  display: 'block',
                                  mb: 1
                                }}>Industry</Box>
                                <Box component="span">{companyProfile.industry || 'Not specified'}</Box>
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              backgroundColor: 'rgba(44, 85, 48, 0.05)', 
                              p: 2, 
                              borderRadius: 1,
                              border: '1px solid rgba(44, 85, 48, 0.1)'
                            }}>
                              <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 1 }}>
                                <Box component="span" sx={{ 
                                  fontWeight: 600, 
                                  color: '#2C5530',
                                  fontSize: '1.2rem',
                                  display: 'block',
                                  mb: 1
                                }}>Location</Box>
                                <Box component="span">{companyProfile.location || 'Not specified'}</Box>
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              backgroundColor: 'rgba(44, 85, 48, 0.05)', 
                              p: 2, 
                              borderRadius: 1,
                              border: '1px solid rgba(44, 85, 48, 0.1)'
                            }}>
                              <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                                <Box component="span" sx={{ 
                                  fontWeight: 600, 
                                  color: '#2C5530',
                                  fontSize: '1.2rem',
                                  display: 'block',
                                  mb: 1
                                }}>Description</Box>
                                <Box component="span" sx={{ lineHeight: 1.6 }}>{companyProfile.description || 'No description provided'}</Box>
                              </Typography>
                            </Box>
                          </Box>
                        </>
                      ) : (
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: '#666666',
                            fontSize: '1.1rem',
                            textAlign: 'center',
                            py: 3
                          }}
                        >
                          No company profile set up yet. Click Edit Profile to get started.
                        </Typography>
                      )}
                    </StyledPaper>
                  </Grid>
                </Grid>
              </TabPanel>
            )}

            {activeTab === 1 && (
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Active Job Listings</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setCreateJobOpen(true)}
                      sx={{
                        backgroundColor: '#FFD700',
                        color: '#000',
                        '&:hover': {
                          backgroundColor: '#FFD700'
                        }
                      }}
                    >
                      Create New Listing
                    </Button>
                  </Box>

                  {dataLoading.jobs ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress sx={{ color: '#FFD700' }} />
                    </Box>
                  ) : jobListings.length === 0 ? (
                    <StyledPaper>
                      <Typography variant="body1" color="text.secondary" align="center">
                        No job listings yet. Create your first job posting!
                      </Typography>
                    </StyledPaper>
                  ) : (
                    jobListings.map((job) => (
                      <StyledPaper key={job.id}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={8}>
                            <Typography variant="h6" gutterBottom>
                              {job.title}
                            </Typography>
                            {(() => {
                              const locationText = job.location?.formattedAddress || job.location || '—';
                              const employmentText = job.employmentType || job.type || '—';
                              const descSnippet = job.shortDescription || (job.description ? job.description.substring(0, 200) : '');
                              return (
                                <>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {locationText} • {employmentText}
                                  </Typography>
                                  {descSnippet && (
                                    <Typography variant="body1" paragraph>
                                      {descSnippet}...
                                    </Typography>
                                  )}
                                </>
                              );
                            })()}
                          </Grid>
                          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Button
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => handleEditJob(job)}
                              sx={{
                                mr: 1,
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
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewJob(job)}
                              sx={{
                                color: '#2C5530',
                                borderColor: '#2C5530',
                                '&:hover': {
                                  borderColor: '#2C5530',
                                  backgroundColor: 'rgba(44, 85, 48, 0.1)'
                                }
                              }}
                            >
                              View
                            </Button>
                          </Grid>
                        </Grid>
                      </StyledPaper>
                    ))
                  )}
                </Box>
              </TabPanel>
            )}

            {activeTab === 2 && (
              <TabPanel value={activeTab} index={2}>
                <ApplicationsList jobListings={jobListings} />
              </TabPanel>
            )}
          </>
        )}
      </StyledContainer>

      {/* Dialogs */}
      <CompanyProfileSetup
        open={profileSetupOpen}
        onClose={() => {
          setProfileSetupOpen(false);
          setProfileUpdateStatus({ success: false, error: null, loading: false });
          setMessage(null);
        }}
        onSave={handleProfileUpdate}
        initialData={companyProfile}
        loading={profileUpdateStatus.loading}
        error={profileUpdateStatus.error}
        success={profileUpdateStatus.success}
      />

      <JobDetailsDialog
        open={jobDetailsOpen}
        onClose={() => setJobDetailsOpen(false)}
        job={selectedJob}
        isEditing={jobEditMode}
        onSave={handleJobUpdate}
      />

      <CreateJobListing
        open={createJobOpen}
        onClose={() => setCreateJobOpen(false)}
        onSave={handleCreateJob}
      />
    </DashboardWrapper>
  );
};

export default EmployerDashboard;
