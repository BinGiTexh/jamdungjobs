import React, { useState, useEffect, useCallback } from 'react';
import CompanyProfileSetup from './CompanyProfileSetup';
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
  DialogActions,
  Fade,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { JamaicaLocationProfileAutocomplete } from '../common/JamaicaLocationProfileAutocomplete';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import axios from 'axios';
import api from '../../utils/axiosConfig';
import CompanyDescriptionBuilder from './CompanyDescriptionBuilder';
import CreateJobListing from './CreateJobListing';
import JobDetailsDialog from './JobDetailsDialog';
import { keyframes } from '@mui/material/styles';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const underlineExpand = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;

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
  backgroundColor: 'rgba(10, 10, 10, 0.85)',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
  },
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
    transition: 'opacity 0.3s ease-in-out',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: '#FFD700',
  },
  transition: 'all 0.3s ease',
  '&:hover': {
    color: 'rgba(255, 215, 0, 0.9)',
    backgroundColor: 'rgba(44, 85, 48, 0.1)',
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2C5530, #FFD700)',
  color: '#000',
  '&:hover': {
    background: 'linear-gradient(90deg, #FFD700, #2C5530)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
  },
  transition: 'all 0.3s ease',
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 24px',
  borderRadius: '8px',
}));

const BackgroundImage = styled('div')`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('/images/generated/jamaican-design-1747273968.png');
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  z-index: 1;
`;

const EmployerDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);
  const [jobListings, setJobListings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [descriptionBuilderOpen, setDescriptionBuilderOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [jobEditMode, setJobEditMode] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const notificationsOpen = Boolean(anchorEl);
  
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

  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  // Function to fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/api/notifications/count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
    }
  }, []);

  // Function to mark a notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}`);
      // Update local state to reflect the change
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'READ', isRead: true } 
            : notification
        )
      );
      fetchUnreadCount(); // Update the badge count
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [fetchUnreadCount]);

  // Function to mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status === 'UNREAD');
      
      // Mark each unread notification as read
      const promises = unreadNotifications.map(notification => 
        api.patch(`/api/notifications/${notification.id}`)
      );
      
      await Promise.all(promises);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          status: 'READ',
          isRead: true
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [notifications]);

  // Handle notification icon click
  const handleNotificationsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle notification menu close
  const handleNotificationsClose = () => {
    setAnchorEl(null);
  };

  // Handle notification item click
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (notification.status === 'UNREAD') {
      markAsRead(notification.id);
    }
    
    // Close the menu
    handleNotificationsClose();
    
    // Navigate to the appropriate view based on notification type
    if (notification.type === 'APPLICATION') {
      // Extract data from content
      const contentObj = notification.contentObj || {};
      
      // If we have an application ID, navigate to application details
      if (contentObj.applicationId) {
        // For now, just switch to the Applications tab
        setActiveTab(2);
        
        // In a more complex implementation, you might want to navigate to a specific application
        // or open a dialog with the application details
      }
    }
  };

  const fetchEmployerData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if we have saved profile data in localStorage
      const savedProfile = localStorage.getItem('employerCompanyProfile');
      
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setCompanyProfile(parsedProfile);
        
        // If the company profile doesn't have a name, we need to set up a profile
        if (!parsedProfile.companyName) {
          setNeedsProfileSetup(true);
        }
      } else {
        // No saved profile, need to set up
        setNeedsProfileSetup(true);
        setCompanyProfile({
          companyName: user?.name || '',
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
      
      // Fetch job listings
      try {
        // Use the configured api instance that includes authentication headers
        const jobsRes = await api.get('/api/employer/jobs/simple');
        setJobListings(jobsRes.data);
      } catch (jobsError) {
        console.error('Error fetching job listings:', jobsError);
        setJobListings([]);
      }
      
      // For testing purposes, you can force the profile setup to show
      // setNeedsProfileSetup(true);
      
      // Fetch applications
      try {
        const applicationsRes = await axios.get('/api/employer/applications');
        setApplications(applicationsRes.data);
      } catch (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching employer data:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load employer data'
      });
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    fetchEmployerData();
  }, [fetchEmployerData]);
  
  // Effect for fetching notifications and setting up polling
  useEffect(() => {
    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();
    
    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);
    
    // Clean up on component unmount
    return () => clearInterval(intervalId);
  }, [fetchNotifications, fetchUnreadCount]);
  
  const handleProfileSetupComplete = (profileData) => {
    setCompanyProfile(profileData);
    setNeedsProfileSetup(false);
    // Refresh data
    fetchEmployerData();
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      
      // Save profile data to localStorage as a backup
      localStorage.setItem('employerCompanyProfile', JSON.stringify(companyProfile));
      
      // Prepare data for API in the format expected by the backend
      const apiData = {
        name: companyProfile.companyName || 'My Company',
        description: companyProfile.description || '',
        website: companyProfile.website || '',
        // Handle location data properly
        location: typeof companyProfile.location === 'object' ? 
          companyProfile.location.formattedAddress || '' : 
          companyProfile.location || ''
        // Note: industry field removed as it doesn't exist in the Prisma schema
      };
      
      console.log('Sending company data to API:', apiData);
      
      try {
        // Use our new endpoint that handles both create and update
        const response = await axios.post('http://localhost:5000/api/employer/create-company', apiData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
          }
        });
        
        console.log('Company profile saved:', response.data);
        
        // Exit editing mode
        setIsEditing(false);
        setMessage({
          type: 'success',
          text: response.data.message || 'Company profile saved successfully in the database!'
        });
        
        // Refresh the profile data
        await fetchEmployerData();
        
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // If there's an error, show a message that we're using localStorage
        setIsEditing(false);
        setMessage({
          type: 'warning',
          text: `Could not save to database: ${apiError.response?.data?.message || apiError.message}. Profile saved locally only.`
        });
      }
    } catch (error) {
      console.error('Error handling profile update:', error);
      setMessage({
        type: 'error',
        text: `Failed to save company profile: ${error.response?.data?.message || error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogoUpload = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      setCompanyProfile(prev => ({
        ...prev,
        logoUrl: e.target.result
      }));
      
      setMessage({
        type: 'success',
        text: 'Logo uploaded successfully!'
      });
    };
    
    reader.readAsDataURL(file);
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
  
  const handleJobCreationSuccess = (newJob) => {
    // Add the new job to the job listings
    setJobListings(prev => [newJob, ...prev]);
    
    // Show success message
    setMessage({
      type: 'success',
      text: 'Job listing created successfully!'
    });
    
    // Switch to the job listings tab
    setActiveTab(1);
  };
  
  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
    setJobEditMode(false);
    setJobDetailsOpen(true);
  };
  
  const handleEditJob = (job) => {
    setSelectedJob(job);
    setJobEditMode(true);
    setJobDetailsOpen(true);
  };
  
  const handleCloseJobDetails = () => {
    setJobDetailsOpen(false);
    // Reset after a short delay to allow for the dialog closing animation
    setTimeout(() => {
      setSelectedJob(null);
      setJobEditMode(false);
    }, 500);
  };
  
  const handleJobUpdate = (updatedJob) => {
    // Update the job in the job listings
    setJobListings(prev => 
      prev.map(job => job.id === updatedJob.id ? updatedJob : job)
    );
    
    // Show success message
    setMessage({
      type: 'success',
      text: 'Job listing updated successfully!'
    });
  };
  
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#0A0A0A',
          backgroundImage: 'linear-gradient(135deg, rgba(44, 85, 48, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 4,
          paddingBottom: 8,
        }}
      >
        <CircularProgress sx={{ color: '#FFD700' }} />
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
      <BackgroundImage />
      
      <StyledContainer>
        <Fade in={true} timeout={1000} style={{ transitionDelay: '300ms' }}>
          <Box sx={{ position: 'relative', zIndex: 2, p: 3, animation: `${fadeInUp} 0.8s ease-out` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon sx={{ color: '#FFD700', fontSize: 40 }} />
                <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 600 }}>
                  Employer Dashboard
                </Typography>
              </Box>
              
              {/* Notification Icon with Badge */}
              <IconButton
                onClick={handleNotificationsClick}
                size="large"
                aria-label="show notifications"
                aria-controls="notifications-menu"
                aria-haspopup="true"
                sx={{
                  color: '#FFD700',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.1)'
                  }
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#2C5530',
                      color: '#FFD700',
                      fontWeight: 'bold',
                    }
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              
              {/* Notifications Menu */}
              <Menu
                id="notifications-menu"
                anchorEl={anchorEl}
                open={notificationsOpen}
                onClose={handleNotificationsClose}
                PaperProps={{
                  sx: {
                    maxHeight: 400,
                    width: '350px',
                    backgroundColor: '#1A1A1A',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ padding: '10px 16px', borderBottom: '1px solid rgba(255, 215, 0, 0.3)' }}>
                  <Typography sx={{ color: '#FFD700', fontWeight: 600 }}>
                    Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                  </Typography>
                </Box>
                
                {notifications.length === 0 ? (
                  <MenuItem sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    <ListItemText primary="No notifications" />
                  </MenuItem>
                ) : (
                  <>
                    {notifications.map((notification) => {
                      const contentObj = notification.contentObj || {};
                      const isApplication = notification.type === 'APPLICATION';
                      
                      return (
                        <MenuItem
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          sx={{
                            borderLeft: notification.status === 'UNREAD' ? '3px solid #2C5530' : 'none',
                            backgroundColor: notification.status === 'UNREAD' ? 'rgba(44, 85, 48, 0.1)' : 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 215, 0, 0.1)'
                            },
                            padding: '10px 16px'
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography
                                sx={{
                                  color: '#FFD700',
                                  fontWeight: notification.status === 'UNREAD' ? 600 : 400,
                                  fontSize: '0.9rem'
                                }}
                              >
                                {isApplication ? 'New Job Application' : 'Notification'}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontWeight: notification.status === 'UNREAD' ? 500 : 400,
                                  fontSize: '0.8rem'
                                }}
                              >
                                {isApplication && contentObj.candidateName && contentObj.jobTitle ? (
                                  <>
                                    {contentObj.candidateName} applied for {contentObj.jobTitle}
                                    {contentObj.appliedAt && (
                                      <Box component="span" sx={{ display: 'block', fontSize: '0.75rem', mt: 0.5 }}>
                                        {new Date(contentObj.appliedAt).toLocaleString()}
                                      </Box>
                                    )}
                                  </>
                                ) : (
                                  'You have a new notification'
                                )}
                              </Typography>
                            }
                          />
                        </MenuItem>
                      );
                    })}
                    
                    <Divider sx={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }} />
                    
                    <MenuItem
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                      sx={{
                        color: unreadCount === 0 ? 'rgba(255, 255, 255, 0.3)' : '#FFD700',
                        justifyContent: 'center',
                        padding: '10px 16px'
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: '30px' }}>
                        <DoneAllIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontSize: '0.9rem' }}>
                            Mark all as read
                          </Typography>
                        }
                      />
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Manage your company profile, job listings, and applications
              </Typography>
              <Box sx={{ 
                position: 'absolute', 
                bottom: -5, 
                left: 0, 
                height: '2px', 
                bgcolor: 'rgba(44, 85, 48, 0.7)', 
                animation: `${underlineExpand} 1.5s ease-out forwards`,
                animationDelay: '0.5s' 
              }} />
            </Box>
          </Box>
        </Fade>
        
        {message && (
          <Fade in={true}>
            <Alert 
              severity={message.type} 
              sx={{ 
                mb: 3,
                backgroundColor: message.type === 'success' ? 'rgba(44, 85, 48, 0.9)' : 'rgba(211, 47, 47, 0.9)',
                color: 'white',
                border: message.type === 'success' ? '1px solid rgba(76, 175, 80, 0.5)' : '1px solid rgba(244, 67, 54, 0.5)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                '& .MuiAlert-icon': {
                  color: '#FFD700'
                }
              }}
              onClose={() => setMessage(null)}
            >
              {message.text}
            </Alert>
          </Fade>
        )}
        
        <Fade in={true} timeout={1000} style={{ transitionDelay: '500ms' }}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'rgba(255, 215, 0, 0.3)', 
            mb: 3,
            borderRadius: '4px 4px 0 0',
            background: 'linear-gradient(90deg, rgba(44, 85, 48, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#FFD700',
                  height: '3px',
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <StyledTab label="Company Profile" />
              <StyledTab label="Job Listings" />
              <StyledTab label="Applications" />
              <StyledTab label="Create Job" icon={<AddIcon />} iconPosition="start" />
            </Tabs>
          </Box>
        </Fade>
        
        {/* Company Profile Tab */}
        {activeTab === 0 && (
          needsProfileSetup ? (
            // Company profile setup flow
            <Box sx={{ flexGrow: 1, p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <CompanyProfileSetup onComplete={handleProfileSetupComplete} />
                </Grid>
              </Grid>
            </Box>
          ) : (
            // Regular company profile view/edit
            <StyledPaper>
              <Grid container spacing={3}>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#FFD700' }}>Company Profile</Typography>
                  {!isEditing ? (
                    <Button
                      variant="outlined"
                      onClick={() => setIsEditing(true)}
                      startIcon={<EditIcon />}
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
                  <Button
                    variant="contained"
                    onClick={handleProfileUpdate}
                    sx={{
                      backgroundColor: '#2C5530',
                      '&:hover': {
                        backgroundColor: '#1E3D20'
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                )}
              </Grid>
              
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {isEditing ? (
                  <TextField
                    label="Company Name"
                    value={companyProfile.companyName || ''}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, companyName: e.target.value })}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                      sx: { color: 'rgba(255, 215, 0, 0.7)' }
                    }}
                    InputProps={{
                      sx: {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 215, 0, 0.3)'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 215, 0, 0.5)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FFD700'
                        }
                      }
                    }}
                  />
                ) : null}
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 2,
                    backgroundImage: companyProfile.logoUrl ? `url(${companyProfile.logoUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    border: '2px solid rgba(255, 215, 0, 0.3)'
                  }}
                >
                  {!companyProfile.logoUrl && (
                    <Typography variant="h3" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      {companyProfile.companyName ? companyProfile.companyName.charAt(0).toUpperCase() : 'C'}
                    </Typography>
                  )}
                  
                  {isEditing && (
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="logo-upload"
                      type="file"
                      onChange={(e) => handleLogoUpload(e.target.files[0])}
                    />
                    
                  )}
                  
                  {isEditing && (
                    <label htmlFor="logo-upload">
                      <IconButton
                        component="span"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: '#2C5530',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#1E3D20'
                          }
                        }}
                      >
                        <CloudUploadIcon />
                      </IconButton>
                    </label>
                  )}
                </Box>
                
                <Typography variant="h5" sx={{ color: 'white', mb: 1, textAlign: 'center' }}>
                  {companyProfile.companyName || 'Company Name'}
                </Typography>
                
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2, textAlign: 'center' }}>
                  {companyProfile.industry || 'Industry'}
                </Typography>
                
                {isEditing ? (
                  <TextField
                    label="Company Website"
                    value={companyProfile.website}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, website: e.target.value })}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                      sx: { color: 'rgba(255, 215, 0, 0.7)' }
                    }}
                    InputProps={{
                      sx: {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 215, 0, 0.3)'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 215, 0, 0.5)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FFD700'
                        }
                      }
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                    Website: {companyProfile.website || 'Not provided'}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ color: '#FFD700' }}>About the Company</Typography>
                    {isEditing && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleOpenDescriptionBuilder}
                        startIcon={<DescriptionIcon />}
                        sx={{
                          color: '#FFD700',
                          borderColor: '#FFD700',
                          '&:hover': {
                            borderColor: '#FFD700',
                            backgroundColor: 'rgba(255, 215, 0, 0.1)'
                          }
                        }}
                      >
                        Description Builder
                      </Button>
                    )}
                  </Box>
                  
                  {isEditing ? (
                    <TextField
                      multiline
                      rows={6}
                      value={companyProfile.description}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, description: e.target.value })}
                      fullWidth
                      placeholder="Describe your company..."
                      InputProps={{
                        sx: {
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 215, 0, 0.3)'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 215, 0, 0.5)'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FFD700'
                          }
                        }
                      }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', whiteSpace: 'pre-line' }}>
                      {companyProfile.description || 'No company description provided.'}
                    </Typography>
                  )}
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    {isEditing ? (
                      <TextField
                        label="Industry"
                        value={companyProfile.industry}
                        onChange={(e) => setCompanyProfile({ ...companyProfile, industry: e.target.value })}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                          sx: { color: 'rgba(255, 215, 0, 0.7)' }
                        }}
                        InputProps={{
                          sx: {
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 215, 0, 0.3)'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 215, 0, 0.5)'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FFD700'
                            }
                          }
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                        <strong>Industry:</strong> {companyProfile.industry || 'Not specified'}
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    {isEditing ? (
                      <TextField
                        label="Company Size"
                        value={companyProfile.size}
                        onChange={(e) => setCompanyProfile({ ...companyProfile, size: e.target.value })}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                          sx: { color: 'rgba(255, 215, 0, 0.7)' }
                        }}
                        InputProps={{
                          sx: {
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 215, 0, 0.3)'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 215, 0, 0.5)'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FFD700'
                            }
                          }
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                        <strong>Company Size:</strong> {companyProfile.size || 'Not specified'}
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    {isEditing ? (
                      <TextField
                        label="Founded Year"
                        value={companyProfile.founded}
                        onChange={(e) => setCompanyProfile({ ...companyProfile, founded: e.target.value })}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                          sx: { color: 'rgba(255, 215, 0, 0.7)' }
                        }}
                        InputProps={{
                          sx: {
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 215, 0, 0.3)'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 215, 0, 0.5)'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FFD700'
                            }
                          }
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                        <strong>Founded:</strong> {companyProfile.founded || 'Not specified'}
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    {isEditing ? (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 215, 0, 0.7)', mb: 1 }}>
                          Location
                        </Typography>
                        <JamaicaLocationProfileAutocomplete
                          value={companyProfile.location}
                          onChange={(location) => setCompanyProfile({ ...companyProfile, location })}
                          placeholder="Company Location in Jamaica"
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                        <strong>Location:</strong> {companyProfile.location?.formattedAddress || companyProfile.location || 'Not specified'}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </StyledPaper>
        )
      )}
        
        {/* Job Listings Tab */}
        {activeTab === 1 && (
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#FFD700' }}>Job Listings</Typography>
              <AnimatedButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setActiveTab(3)}
              >
                Create New Job
              </AnimatedButton>
            </Box>
            
            {jobListings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                  You haven't posted any job listings yet.
                </Typography>
                <AnimatedButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setActiveTab(3)}
                >
                  Create Your First Job Listing
                </AnimatedButton>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {jobListings.map((job) => (
                  <Grid item xs={12} key={job.id}>
                    <Paper 
                      sx={{
                        p: 2,
                        backgroundColor: 'rgba(30, 30, 30, 0.9)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        },
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 600 }}>
                            {job.title}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                            <Chip 
                              label={job.jobType} 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(44, 85, 48, 0.7)',
                                color: 'white',
                              }}
                            />
                            <Chip 
                              label={job.location} 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(44, 85, 48, 0.7)',
                                color: 'white',
                              }}
                            />
                            <Chip 
                              label={
                                (job.salaryMin !== undefined && job.salaryMin !== null && 
                                 job.salaryMax !== undefined && job.salaryMax !== null)
                                  ? `$${Number(job.salaryMin).toLocaleString()} - $${Number(job.salaryMax).toLocaleString()}`
                                  : 'Salary not specified'
                              } 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(44, 85, 48, 0.7)',
                                color: 'white',
                              }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                            Posted: {new Date(job.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {job.description.substring(0, 150)}...
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Chip 
                              label={`${job.applications?.length || 0} Applications`} 
                              sx={{ 
                                backgroundColor: 'rgba(255, 215, 0, 0.2)',
                                color: '#FFD700',
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mt: 2 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleViewJobDetails(job)}
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
                              onClick={() => handleEditJob(job)}
                              sx={{
                                color: '#4FC3F7',
                                borderColor: '#4FC3F7',
                                '&:hover': {
                                  borderColor: '#4FC3F7',
                                  backgroundColor: 'rgba(79, 195, 247, 0.1)'
                                }
                              }}
                            >
                              Edit
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
        
        {/* Applications Tab */}
        {activeTab === 2 && (
          <StyledPaper>
            <Typography variant="h6" sx={{ color: '#FFD700', mb: 3 }}>Applications</Typography>
            
            {applications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  You don't have any applications yet.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {applications.map((application) => (
                  <Grid item xs={12} key={application.id}>
                    <Paper 
                      sx={{
                        p: 2,
                        backgroundColor: 'rgba(30, 30, 30, 0.9)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Typography variant="h6" sx={{ color: '#FFD700' }}>
                            {application.job.title}
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                            Applicant: {application.candidate.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                            Applied: {new Date(application.createdAt).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                            <Chip 
                              label={application.status} 
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
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mt: 2 }}>
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
        
        {/* Create Job Tab */}
        {activeTab === 3 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#FFD700' }}>Create New Job Listing</Typography>
            </Box>
            <CreateJobListing onSuccess={handleJobCreationSuccess} />
          </>
        )}
      </StyledContainer>
      
      {/* Description Builder Dialog */}
      <Dialog 
        open={descriptionBuilderOpen} 
        onClose={handleCloseDescriptionBuilder}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={500}
        PaperProps={{
          sx: {
            backgroundColor: '#0A0A0A',
            backgroundImage: 'linear-gradient(135deg, rgba(44, 85, 48, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
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
      
      {/* Job Details Dialog */}
      <JobDetailsDialog
        open={jobDetailsOpen}
        onClose={handleCloseJobDetails}
        job={selectedJob}
        isEditing={jobEditMode}
        onSave={handleJobUpdate}
      />
    </Box>
  );
};

export default EmployerDashboard;
