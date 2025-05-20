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
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Alert,
  styled,
  LinearProgress,
  Fade
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { buildApiUrl } from '../../config';
import { LocationAutocomplete } from '../common/LocationAutocomplete';
import api from '../../utils/axiosConfig';
import axios from 'axios';
import ApplicationsList from '../jobseeker/ApplicationsList';

// Import icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Avatar from '@mui/material/Avatar';

// Styled components for Jamaican theme - matching login page styling
const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    maxWidth: '1100px',
  },
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'rgba(20, 20, 20, 0.85)',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: 'linear-gradient(90deg, #FFD700, #007E1B, #FFD700)',
  },
}));

// Background wrapper for the entire dashboard
const DashboardWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#0A0A0A',
  position: 'relative',
  overflow: 'hidden',
  paddingBottom: theme.spacing(4)
}));

// Background image overlay
const BackgroundOverlay = styled(Box)({
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
});

const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.95rem',
  textTransform: 'none',
  minWidth: 100,
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: '#FFD700',
  },
}));

const StyledButton = styled(Button)(({ theme, variant }) => ({
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: theme.shape.borderRadius,
  padding: '8px 24px',
  ...(variant === 'contained' && {
    background: 'linear-gradient(45deg, #007E1B 30%, #009921 90%)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(0, 126, 27, 0.5)',
    '&:hover': {
      background: 'linear-gradient(45deg, #005714 30%, #007E1B 90%)',
      boxShadow: '0 4px 12px rgba(0, 126, 27, 0.7)',
    },
  }),
  ...(variant === 'outlined' && {
    borderColor: '#FFD700',
    color: '#FFD700',
    '&:hover': {
      borderColor: '#FFD700',
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
    },
  }),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(255, 215, 0, 0.15)',
  color: '#FFD700',
  fontWeight: 500,
  margin: theme.spacing(0.5),
  borderRadius: 16,
  border: '1px solid rgba(255, 215, 0, 0.3)',
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// File upload button wrapper - matching login page styling
const FileUploadButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #007E1B 30%, #009921 90%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #005714 30%, #007E1B 90%)',
  },
  padding: '8px 24px',
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 500,
  marginTop: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0, 126, 27, 0.25)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
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
    color: 'rgba(255, 215, 0, 0.7)',
  },
  '& .MuiInputBase-input': {
    color: 'white',
  },
}));

const CandidateDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { logout } = useAuth();
  
  // State for profile data
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    bio: '',
    skills: [],
    education: [],
    experience: [],
    profilePicture: null,
    resumeFileName: null,
    resumeUrl: null
  });
  
  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  
  // Form state
  const [newSkill, setNewSkill] = useState('');
  const [editedProfile, setEditedProfile] = useState({...profile});
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle profile edit mode toggle
  const handleEditToggle = () => {
    if (editMode) {
      // If we're exiting edit mode, reset the edited profile to the current profile
      setEditedProfile({...profile});
    } else {
      // If we're entering edit mode, initialize the edited profile with the current profile
      setEditedProfile({...profile});
    }
    setEditMode(!editMode);
  };
  
  // Handle profile field changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle location selection
  const handleLocationSelect = (location) => {
    setEditedProfile(prev => ({
      ...prev,
      location
    }));
  };

  // Constants for localStorage keys (must match the ones in AuthContext.js)
  const TOKEN_KEY = 'jamdung_auth_token';
  
  useEffect(() => {
    // Debug token information
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('Token exists:', !!token);
    if (token) {
      console.log('Token first 10 chars:', token.substring(0, 10) + '...');
    } else {
      // Check for legacy token
      const legacyToken = localStorage.getItem('token');
      if (legacyToken) {
        console.log('Legacy token exists, migrating...');
        localStorage.setItem(TOKEN_KEY, legacyToken);
      }
    }
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Use individual try/catch blocks for each API call to handle them independently
        try {
          const profileRes = await api.get('/api/candidate/profile');
          
          // Only use the data from the API response, don't mix with demo files
          // This ensures each user only sees their own profile data
          setProfile({
            ...profileRes.data
          });
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          // Don't show an error message for this specifically, as we'll show a general one below if needed
        }
        
        // Set a welcome message if the profile is empty
        if (!profile.firstName && !profile.lastName) {
          setMessage({ 
            type: 'success', 
            text: 'Welcome to your dashboard! Complete your profile to get started.' 
          });
        }
      } catch (error) {
        console.error('Error in dashboard initialization:', error);
        // Only show error if it's a critical failure
        setMessage({ type: 'error', text: 'Something went wrong. Please try again later.' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Handle save profile changes
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      console.log('Updating profile with data:', editedProfile);
      
      // Get the token for explicit authorization
      const token = localStorage.getItem(TOKEN_KEY);
      
      // Make API call to update profile using PUT instead of POST
      const response = await api.put('/api/candidate/profile', editedProfile, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile update response:', response.data);
      
      // Update local state
      setProfile(editedProfile);
      setEditMode(false);
      
      // Show success message
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: `Failed to update profile: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle adding a new skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !editedProfile.skills.includes(newSkill.trim())) {
      setEditedProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };
  
  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove) => {
    setEditedProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };
  
  // Handle file selection for resume upload
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Only accept PDF files
      if (file.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'Please upload a PDF file.' });
        return;
      }
      
      setSelectedFile(file);
      console.log('File selected:', file.name);
    }
  };
  
  // Handle resume upload
  const handleUploadResume = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('resume', selectedFile);
      
      // Get the token for explicit authorization
      const token = localStorage.getItem(TOKEN_KEY);
      
      // Make API call to upload resume with progress tracking
      const response = await api.post('/api/candidate/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      console.log('Upload response:', response.data);
      
      // Update profile with new resume info
      setProfile(prev => ({
        ...prev,
        resumeFileName: selectedFile.name,
        resumeUrl: response.data.resumeUrl
      }));
      
      // Reset file selection
      setSelectedFile(null);
      
      // Show success message
      setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
    } catch (error) {
      console.error('Error uploading resume:', error);
      setMessage({ type: 'error', text: 'Failed to upload resume. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle view resume
  const handleViewResume = () => {
    console.log('Viewing resume, file name:', profile.resumeFileName);
    console.log('Resume URL available:', !!profile.resumeUrl);
    
    // Debug authentication token
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('Auth token exists:', !!token);
    if (token) {
      console.log('Token first 10 chars:', token.substring(0, 10) + '...');
      console.log('Token length:', token.length);
    } else {
      console.error('No authentication token found in localStorage');
      // Check for legacy token
      const legacyToken = localStorage.getItem('token');
      if (legacyToken) {
        console.log('Legacy token exists, migrating...');
        localStorage.setItem(TOKEN_KEY, legacyToken);
      }
    }
    
    // Check if we need to fetch the resume URL from the server
    if (!profile.resumeUrl && profile.resumeFileName) {
      console.log('No resume URL in state, fetching from server...');
      // Show loading message
      setMessage({
        type: 'info',
        text: 'Loading resume...',
      });
      
      // Get the token directly from localStorage for this specific request
      const authToken = localStorage.getItem(TOKEN_KEY);
      console.log('Using token directly for resume request:', authToken ? 'Token exists' : 'No token');
      
      // Fetch the resume URL from the server with explicit authorization header
      api.get('/api/candidate/resume', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
        .then(response => {
          console.log('Fetched resume data from server');
          
          if (!response.data.resumeUrl) {
            console.error('Server returned empty resume URL');
            setMessage({
              type: 'error',
              text: 'Resume data not found on server.'
            });
            return;
          }
          
          // Update the profile with the resume URL
          setProfile(prev => ({
            ...prev,
            resumeUrl: response.data.resumeUrl
          }));
          
          // Show the preview dialog
          setShowResumePreview(true);
        })
        .catch(error => {
          console.error('Error fetching resume:', error);
          setMessage({
            type: 'error',
            text: 'Unable to load resume preview. The resume data may not be in the correct format.'
          });
        });
    } else if (profile.resumeUrl) {
      console.log('Resume URL already in state, using it directly');
      
      // Check if the URL is a base64 string and ensure it has the correct MIME type
      if (profile.resumeUrl.startsWith('data:') && !profile.resumeUrl.includes('application/pdf')) {
        console.log('Fixing resume URL format for PDF');
        
        // Extract the base64 part (after the comma)
        const base64Part = profile.resumeUrl.split(',')[1];
        
        // Reconstruct with the correct PDF MIME type
        const resumeUrl = `data:application/pdf;base64,${base64Part}`;
        
        // Update the profile with the fixed URL
        setProfile(prev => ({
          ...prev,
          resumeUrl: resumeUrl
        }));
      }
    }
    
    // Clear any previous error messages
    setMessage(null);
    
    // Show the preview dialog
    setShowResumePreview(true);
  };
  
  // Handle close resume preview
  const handleCloseResumePreview = () => {
    setShowResumePreview(false);
  };
  
  // Handle download resume
  const handleDownloadResume = () => {
    console.log('Downloading resume:', profile.resumeFileName);
    console.log('Resume URL available:', !!profile.resumeUrl);
    
    // Check if we need to fetch the resume URL from the server
    if (!profile.resumeUrl && profile.resumeFileName) {
      // Get the token directly from localStorage for this specific request
      const authToken = localStorage.getItem(TOKEN_KEY);
      console.log('Using token directly for resume download request:', authToken ? 'Token exists' : 'No token');
      
      // Fetch the resume URL from the server with explicit authorization header
      api.get('/api/candidate/resume', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      .then(response => {
        if (!response.data.resumeUrl) {
          setMessage({
            type: 'error',
            text: 'Resume data not found on server.'
          });
          return;
        }
        
        // Update the profile with the resume URL
        setProfile(prev => ({
          ...prev,
          resumeUrl: response.data.resumeUrl
        }));
        
        // Download the file
        downloadFile(response.data.resumeUrl);
      })
      .catch(error => {
        console.error('Error fetching resume for download:', error);
        setMessage({
          type: 'error',
          text: 'Unable to download resume. Please try again later.'
        });
      });
    } else if (profile.resumeUrl) {
      // Download the file directly
      downloadFile(profile.resumeUrl);
    } else {
      setMessage({
        type: 'error',
        text: 'No resume available to download.'
      });
    }
  };
  
  // Helper function to download a file from a URL
  const downloadFile = (resumeUrl) => {
    // Check if the URL is a base64 string and ensure it has the correct MIME type
    if (resumeUrl.startsWith('data:') && !resumeUrl.includes('application/pdf')) {
      // Extract the base64 part (after the comma)
      const base64Part = resumeUrl.split(',')[1];
      
      // Reconstruct with the correct PDF MIME type
      resumeUrl = `data:application/pdf;base64,${base64Part}`;
    }
    
    // Create a temporary link element
    const downloadLink = document.createElement('a');
    downloadLink.href = resumeUrl;
    downloadLink.download = profile.resumeFileName || 'resume.pdf';
    
    // Append to the document body, click it, and then remove it
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  
  // Handle profile picture upload
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Only accept image files
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file.' });
      return;
    }
    
    try {
      setLoading(true);
      
      // Create form data with current profile data to prevent losing other fields
      const formData = new FormData();
      
      // Add all current profile fields
      formData.append('firstName', profile.firstName || '');
      formData.append('lastName', profile.lastName || '');
      formData.append('title', profile.title || '');
      formData.append('bio', profile.bio || '');
      formData.append('location', profile.location || '');
      formData.append('skills', JSON.stringify(profile.skills || []));
      formData.append('education', JSON.stringify(profile.education || []));
      formData.append('photoUrl', profile.photoUrl || '');
      formData.append('resumeFileName', profile.resumeFileName || '');
      
      // Add the photo file with the correct field name
      formData.append('photoFile', file);
      
      // Make API call to update profile with the new photo
      const response = await api.put('/api/candidate/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update both profile and editedProfile with new profile picture URL
      const updatedPhotoUrl = response.data.profile.photoUrl;
      
      setProfile(prev => ({
        ...prev,
        photoUrl: updatedPhotoUrl
      }));
      
      // Also update editedProfile to ensure it's saved when clicking Save
      setEditedProfile(prev => ({
        ...prev,
        photoUrl: updatedPhotoUrl
      }));
      
      // Automatically save the profile to ensure changes persist
      try {
        await api.put('/api/candidate/profile', {
          ...profile,
          photoUrl: updatedPhotoUrl
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (saveError) {
        console.error('Error saving profile after photo upload:', saveError);
      }
      
      // Show success message
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage({ type: 'error', text: 'Failed to upload profile picture. Please try again.' });
    } finally {
      setLoading(false);
    }
  };
  
  // Render profile section
  const renderProfileSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <StyledPaper>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar 
                src={profile.photoUrl} 
                alt={`${profile.firstName} ${profile.lastName}`}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              {editMode && (
                <label htmlFor="profile-picture-upload">
                  <IconButton 
                    component="span"
                    sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      right: 0,
                      backgroundColor: '#009B77',
                      color: 'white',
                      '&:hover': { backgroundColor: '#007c5f' }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <VisuallyHiddenInput
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                  />
                </label>
              )}
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
              {profile.firstName} {profile.lastName}
            </Typography>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.7)" gutterBottom>
              {profile.title || 'Job Title'}
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              {profile.location || 'Location'}
            </Typography>
          </Box>
          
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 2, color: '#FFD700' }}>
            Contact Information
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" gutterBottom>
              Email: {profile.email}
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" gutterBottom>
              Phone: {profile.phone || 'Not provided'}
              {editMode && (
                <StyledButton 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setEditMode(true)}
                  sx={{ ml: 2, py: 0 }}
                >
                  Update
                </StyledButton>
              )}
            </Typography>
          </Box>
          
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 2, color: '#FFD700' }}>
            Resume
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {profile.resumeFileName ? (
              <>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" gutterBottom>
                  {profile.resumeFileName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <StyledButton 
                    variant="outlined" 
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={handleViewResume}
                  >
                    View
                  </StyledButton>
                  <StyledButton 
                    variant="outlined" 
                    size="small"
                    startIcon={<GetAppIcon />}
                    onClick={handleDownloadResume}
                  >
                    Download
                  </StyledButton>
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" gutterBottom>
                No resume uploaded
              </Typography>
            )}
            
            {editMode && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <input
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    id="resume-upload"
                    type="file"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="resume-upload">
                    <FileUploadButton 
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                    >
                      {profile.resumeFileName ? 'Update Resume' : 'Upload Resume'}
                    </FileUploadButton>
                  </label>
                  
                  {selectedFile && (
                    <Box sx={{ 
                      mt: 1, 
                      p: 2, 
                      border: `1px solid ${theme.palette.primary.light}`,
                      borderRadius: 1,
                      backgroundColor: theme.palette.background.paper
                    }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Selected:</strong> {selectedFile.name}
                      </Typography>
                      
                      {isUploading && (
                        <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={uploadProgress} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: theme.palette.primary.light,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: theme.palette.primary.main,
                              }
                            }}
                          />
                          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                            {uploadProgress}% Complete
                          </Typography>
                        </Box>
                      )}
                      
                      <StyledButton 
                        variant="contained" 
                        size="small"
                        onClick={handleUploadResume}
                        disabled={isUploading}
                        fullWidth
                        sx={{ mt: 1 }}
                      >
                        {isUploading ? 'Uploading...' : 'Confirm Upload'}
                      </StyledButton>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </StyledPaper>
      </Grid>
      
      <Grid item xs={12} md={8}>
        <StyledPaper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FFD700' }}>
              About Me
            </Typography>
            {!editMode && (
              <StyledButton 
                variant="outlined" 
                size="small"
                startIcon={<EditIcon />}
                onClick={handleEditToggle}
              >
                Edit Profile
              </StyledButton>
            )}
          </Box>
          
          {editMode ? (
            <>
              <StyledTextField
                name="bio"
                label="Bio"
                multiline
                rows={4}
                value={editedProfile.bio || ''}
                onChange={handleProfileChange}
                fullWidth
                margin="normal"
                placeholder="Tell employers about yourself, your experience, and what you're looking for."
              />
              
              <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600, color: '#FFD700' }}>
                Contact Information
              </Typography>
              
              <StyledTextField
                name="phone"
                label="Phone Number"
                value={editedProfile.phone || ''}
                onChange={handleProfileChange}
                fullWidth
                margin="normal"
                placeholder="e.g., +1 (876) 555-1234"
              />
            </>
          ) : (
            <Typography variant="body1" paragraph sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {profile.bio || 'No bio provided. Edit your profile to add a bio.'}
            </Typography>
          )}
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#FFD700' }}>
            Skills
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
            {(editMode ? editedProfile.skills : profile.skills).map((skill, index) => (
              <StyledChip 
                key={index} 
                label={skill} 
                onDelete={editMode ? () => handleRemoveSkill(skill) : undefined}
              />
            ))}
            
            {(editMode ? editedProfile.skills : profile.skills).length === 0 && (
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                No skills added yet.
              </Typography>
            )}
          </Box>
          
          {editMode && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <StyledTextField
                label="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                size="small"
                sx={{ mr: 1 }}
              />
              <StyledButton 
                variant="contained" 
                size="small"
                onClick={handleAddSkill}
              >
                Add
              </StyledButton>
            </Box>
          )}
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#FFD700' }}>
            Location
          </Typography>
          
          {editMode ? (
            <LocationAutocomplete
              value={editedProfile.location || ''}
              onChange={handleLocationSelect}
              placeholder="Enter your location"
            />
          ) : (
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {profile.location || 'No location provided.'}
            </Typography>
          )}
          
          {editMode && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
              <StyledButton 
                variant="outlined"
                onClick={handleEditToggle}
              >
                Cancel
              </StyledButton>
              <StyledButton 
                variant="contained"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                Save Changes
              </StyledButton>
            </Box>
          )}
        </StyledPaper>
      </Grid>
    </Grid>
  );
  
  // Render resume preview dialog - matching homepage styling
  const renderResumePreview = () => (
    <Dialog
      open={showResumePreview}
      onClose={handleCloseResumePreview}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #007E1B 30%, #009921 90%)',
        color: 'white',
        paddingY: 1.5,
        borderBottom: '1px solid rgba(255, 215, 0, 0.3)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>Resume Preview</Typography>
          <IconButton onClick={handleCloseResumePreview} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ padding: 3, backgroundColor: 'rgba(20, 20, 20, 0.95)' }}>
        {profile.resumeUrl ? (
          <Box sx={{ 
            borderRadius: theme.shape.borderRadius, 
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}>
            <object
              data={profile.resumeUrl}
              type="application/pdf"
              width="100%"
              height="500px"
              style={{ border: '1px solid rgba(255, 215, 0, 0.3)', borderRadius: theme.shape.borderRadius }}
            >
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Unable to display PDF. <a href={profile.resumeUrl} download={profile.resumeFileName || 'resume.pdf'} style={{ color: '#FFD700' }}>Download</a> instead.
              </Typography>
            </object>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>No resume available to preview.</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>Upload a resume to see it here.</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid rgba(255, 215, 0, 0.3)', padding: '16px 24px' }}>
        <StyledButton onClick={handleDownloadResume} startIcon={<GetAppIcon />} variant="outlined">
          Download
        </StyledButton>
        <StyledButton onClick={handleCloseResumePreview} variant="contained">
          Close
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <DashboardWrapper>
      <BackgroundOverlay />
      <StyledContainer>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, zIndex: 2 }}>
            <CircularProgress sx={{ color: '#FFD700' }} />
          </Box>
        )}
      
      {message && (
        <Alert 
          severity={message.type} 
          sx={{ 
            mb: 3, 
            zIndex: 2,
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            color: message.type === 'error' ? '#ff6b6b' : message.type === 'success' ? '#51cf66' : '#FFD700',
            border: '1px solid',
            borderColor: message.type === 'error' ? '#ff6b6b' : message.type === 'success' ? '#51cf66' : '#FFD700',
          }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 215, 0, 0.3)', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#FFD700',
            },
          }}
        >
          <StyledTab label="Profile" />
          <StyledTab label="Applications" />
          <StyledTab label="Saved Jobs" />
          <StyledTab label="Settings" />
        </Tabs>
      </Box>
      
      {tabValue === 0 && renderProfileSection()}
      {tabValue === 1 && (
        <Fade in={true} timeout={800}>
          <Box>
            <StyledPaper>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#FFD700' }}>
                  My Applications
                </Typography>
                <ApplicationsList />
              </Box>
            </StyledPaper>
          </Box>
        </Fade>
      )}
      {tabValue === 2 && (
        <Typography variant="body1">Your saved jobs will appear here.</Typography>
      )}
      {tabValue === 3 && (
        <Box>
          <Typography variant="h5" gutterBottom>Account Settings</Typography>
          <StyledButton 
            variant="outlined" 
            color="error"
            onClick={logout}
            sx={{ mt: 2 }}
          >
            Logout
          </StyledButton>
        </Box>
      )}
      
      {renderResumePreview()}
      </StyledContainer>
    </DashboardWrapper>
  );
};

export default CandidateDashboard;
