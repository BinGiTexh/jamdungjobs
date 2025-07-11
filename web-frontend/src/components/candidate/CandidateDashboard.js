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

// Import icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Avatar from '@mui/material/Avatar';
import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';
import ApplicationsList from '../jobseeker/ApplicationsList';
import api from '../../utils/axiosConfig';
import { SkillsAutocomplete } from '../common/SkillsAutocomplete';
import { JamaicaLocationAutocomplete } from '../common/JamaicaLocationAutocomplete';
import { buildAssetUrl } from '../../config';
import { useAuth } from '../../context/AuthContext';
import NotificationsMenu from './NotificationsMenu';

// Styled components for Jamaican theme - matching login page styling
const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    maxWidth: '1100px'
  },
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column'
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
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: 'linear-gradient(90deg, #FFD700, #007E1B, #FFD700)'
  }
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
  zIndex: 1
});

const StyledTab = styled(Tab)(({ _theme }) => ({
  fontWeight: 500,
  fontSize: '0.95rem',
  textTransform: 'none',
  minWidth: 100,
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: '#FFD700'
  }
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
      boxShadow: '0 4px 12px rgba(0, 126, 27, 0.7)'
    }
  }),
  ...(variant === 'outlined' && {
    borderColor: '#FFD700',
    color: '#FFD700',
    '&:hover': {
      borderColor: '#FFD700',
      backgroundColor: 'rgba(255, 215, 0, 0.1)'
    }
  })
}));

const StyledChip = styled(Chip)(({ _theme }) => ({
  backgroundColor: 'rgba(255, 215, 0, 0.15)',
  color: '#FFD700',
  fontWeight: 500,
  margin: "4px",
  borderRadius: 16,
  border: '1px solid rgba(255, 215, 0, 0.3)'
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
  width: 1
});

// File upload button wrapper - matching login page styling
const FileUploadButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #007E1B 30%, #009921 90%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #005714 30%, #007E1B 90%)'
  },
  padding: '8px 24px',
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 500,
  marginTop: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0, 126, 27, 0.25)'
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.3)'
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.5)'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700'
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 215, 0, 0.7)'
  },
  '& .MuiInputBase-input': {
    color: 'white'
  }
}));

const CandidateDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { logout } = useAuth();
  
  // Default profile structure with empty arrays
  const defaultProfile = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    bio: '',
    skills: [], // Initialize empty skills array
    education: [],
    experience: [],
    profilePicture: null,
    resumeFileName: null,
    resumeUrl: null,
    photoUrl: null
  };

  // Helper function to ensure valid skills array
  const getValidSkills = (profile) => {
    if (!profile) return [];
    const skills = profile.skills;
    if (!skills) return [];
    if (Array.isArray(skills)) return skills.filter(skill => !!skill);
    return [];
  };


  // Helper to build full asset URL using shared helper
  const getFullUrl = (relativeUrl) => {
    if (!relativeUrl || typeof relativeUrl !== 'string') return '';
    return buildAssetUrl(relativeUrl);
  };

  // State for profile data
  const [profile, setProfile] = useState(defaultProfile);
  
  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  
  // Form state
  const [editedProfile, setEditedProfile] = useState({...defaultProfile});
  
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
      setEditedProfile({
        ...profile,
        skills: Array.isArray(profile?.skills) ? profile.skills : []
      });
    } else {
      // If we're entering edit mode, initialize the edited profile with the current profile
      setEditedProfile({
        ...profile,
        skills: Array.isArray(profile?.skills) ? profile.skills : []
      });
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
  
  // Handle Jamaica-specific location selection
  const handleLocationSelect = (location) => {
    // Format the location for display and storage
    if (location && typeof location === 'object') {
      // Create a formatted location string that includes parish information
      const formattedLocation = location.parish
        ? `${location.name}, ${location.parish}, Jamaica`
        : `${location.name}, Jamaica`;
      
      // Store both the formatted string and the structured data
      setEditedProfile(prev => ({
        ...prev,
        location: formattedLocation,
        // Store the structured location data for potential future use
        locationData: {
          name: location.name,
          parish: location.parish,
          placeId: location.placeId || `jamaica-${location.parish ? location.parish.toLowerCase().replace(/\s+/g, '-') : ''}-${location.name.toLowerCase().replace(/\s+/g, '-')}`,
          type: location.type || 'location'
        }
      }));
      
      logDev('debug', 'Selected Jamaica location:', location);
    } else {
      // Handle case where location is cleared or invalid
      setEditedProfile(prev => ({
        ...prev,
        location: '',
        locationData: null
      }));
    }
  };

  // Constants for localStorage keys (must match the ones in AuthContext.js)
  const TOKEN_KEY = 'jamdung_auth_token';
  
  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile data
      const userResponse = await api.get('/api/jobseeker/profile');
      
      if (!userResponse.data) {
        throw new Error('No profile data returned from server');
      }
      
      logDev('debug', 'Fetched profile data:', userResponse.data);
      
      // Handle different backend response shapes (e.g., { success, data: {...} } or raw user object)
      const userData = userResponse.data?.data || userResponse.data || {};
      
      const candidateData = userData.candidateProfile || userData.candidate_profile || {};
      
      // Extract photo and resume URLs from the candidateProfile
      const photoUrl = candidateData.photoUrl || null;
      const resumeUrl = candidateData.resumeUrl || null;
      const resumeFileName = candidateData.resumeFileName || null;
      
      // Update both profile states with defaults for any missing fields
      const updatedProfile = {
        ...defaultProfile,
        ...userData,
        photoUrl,
        resumeUrl,
        resumeFileName,
        // Ensure arrays are always properly initialized
        skills: Array.isArray(candidateData.skills) ? candidateData.skills : [],
        education: candidateData.education || [],
        experience: candidateData.experience || []
      };
      
      logDev('debug', 'Profile URLs:', {
        photoUrl,
        fullPhotoUrl: getFullUrl(photoUrl),
        resumeUrl,
        fullResumeUrl: getFullUrl(resumeUrl),
        resumeFileName
      });
      
      const sanitizedProfile = {
        ...updatedProfile,
        skills: getValidSkills(updatedProfile.skills)
      };
      
      setProfile(sanitizedProfile);
      setEditedProfile(sanitizedProfile);
      
      return sanitizedProfile;
    } catch (error) {
      logError('Error fetching profile data', { error: sanitizeForLogging(error), context: 'candidateDashboard' });
      setMessage({ type: 'error', text: 'Failed to load profile data. Please try again later.' });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Load profile data when component mounts
  useEffect(() => {
    fetchProfileData();
  }, []);
  
  // Handle save profile changes
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      logDev('debug', 'Updating profile with data:', editedProfile);
      
      // Combine user and jobseeker profile data into one payload for backend
      const payload = {
        first_name: editedProfile.firstName,
        last_name: editedProfile.lastName,
        phone_number: editedProfile.phone,
        title: editedProfile.title,
        bio: editedProfile.bio,
        location: editedProfile.location,
        skills: editedProfile.skills,
        education: editedProfile.education,
        experience: editedProfile.experience,
        locationData: editedProfile.locationData || null
      };
      
      // Send single request to update jobseeker profile (also updates user fields in backend)
      const profileResponse = await api.put('/api/jobseeker/profile', payload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
        }
      });
      
      logDev('debug', 'Profile update response:', profileResponse.data);
      
      // Extract updated data accommodating different response shapes
      const responseData = profileResponse.data?.data || profileResponse.data || {};
      
      const updatedProfile = {
        ...profile,
        ...responseData,
        ...payload
      };
      
      // Ensure skills array is properly initialized
      const sanitizedProfile = {
        ...updatedProfile,
        skills: Array.isArray(updatedProfile.skills) ? updatedProfile.skills : []
      };
      setProfile(sanitizedProfile);
      setEditedProfile(sanitizedProfile);
      
      setEditMode(false);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      logError('Error updating profile', { error: sanitizeForLogging(error), userId: profile.id, context: 'candidateDashboard' });
      setMessage({ type: 'error', text: `Failed to update profile: ${error.message}` });
    } finally {
      setLoading(false);
    }
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
      logDev('debug', 'File selected:', file.name);
    }
  };
  
  // Handle resume upload
  const handleUploadResume = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (selectedFile.size > maxSize) {
      setMessage({ type: 'error', text: `File size exceeds 5MB limit. Your file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB.` });
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
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      logDev('debug', 'Uploading resume:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type
      });
      
      // Make API call to upload resume with progress tracking
      const response = await api.post('/api/jobseeker/profile/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          logDev('debug', `Upload progress: ${percentCompleted}%`);
        }
      });
      
      // Safely handle the response data
      const responseData = response.data || {};
      logDev('debug', 'Upload response:', responseData);
      
      // Check if we have a valid resumeUrl in the response
      if (!responseData.resumeUrl) {
        logError('Invalid resume upload response', { 
          response: sanitizeForLogging(responseData),
          context: 'candidateDashboard'
        });
        throw new Error('Resume URL not found in server response');
      }
      
      // Update profile with resume URL from response
      const resumeUrl = getFullUrl(responseData.resumeUrl);
      const resumeFileName = responseData.resumeFileName || selectedFile.name;
      
      const updatedProfile = {
        ...profile,
        resumeUrl: resumeUrl,
        resumeFileName: resumeFileName
      };
      
      logDev('debug', 'Updated profile with resume URL:', {
        resumeUrl,
        fullUrl: getFullUrl(resumeUrl),
        resumeFileName
      });
      
      // Also update editedProfile to keep them in sync
      setEditedProfile(prev => ({
        ...prev,
        resumeFileName: selectedFile.name,
        resumeUrl: getFullUrl(responseData.resumeUrl)
      }));
      
      // Reset file selection
      setSelectedFile(null);
      
      // Show success message
      setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
      
      // Refresh profile data to ensure we have the latest resume info
      await fetchProfileData();
    } catch (error) {
      // Handle specific error codes
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          setMessage({ type: 'error', text: 'Invalid file format. Please upload a PDF file.' });
        } else if (status === 401) {
          setMessage({ type: 'error', text: 'Authentication error. Please log in again.' });
        } else if (status === 413) {
          setMessage({ type: 'error', text: 'File too large. Maximum size is 5MB.' });
        } else {
          setMessage({ type: 'error', text: `Upload failed: ${error.response.data?.message || error.message}` });
        }
      } else {
        setMessage({ type: 'error', text: `Upload failed: ${error.message}` });
      }
      
      logError('Resume upload error', { 
        error: sanitizeForLogging(error), 
        fileName: selectedFile?.name,
        fileSize: selectedFile?.size,
        context: 'candidateDashboard' 
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'Photo size should be less than 5MB' });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post('/api/jobseeker/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
        }
      });

      if (!response.data || !response.data.photoUrl) {
        throw new Error('No photo URL returned from server');
      }

      // Log the response for debugging
      logDev('debug', 'Profile photo upload response:', response.data);
      
      // Optimistically update the profile photo locally for instant feedback
      const newPhotoUrl = response.data.photoUrl;
      setProfile(prev => ({ ...prev, photoUrl: newPhotoUrl }));
      // Also refresh entire profile to sync other possible changes
      await fetchProfileData();
      
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
    } catch (error) {
      logError('Error uploading profile picture', {
        error: sanitizeForLogging(error),
        context: 'candidateDashboard'
      });
      setMessage({ type: 'error', text: 'Failed to update profile picture.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle opening resume preview
  const handleViewResume = () => {
    if (!profile.resumeUrl) {
      setMessage({ type: 'error', text: 'No resume available to view.' });
      return;
    }
    setShowResumePreview(true);
  };

  // Handle resume download
  const handleDownloadResume = async () => {
    if (!profile.resumeUrl) {
      setMessage({ type: 'error', text: 'No resume available to download.' });
      return;
    }

    try {
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = getFullUrl(profile.resumeUrl);
      link.download = profile.resumeFileName || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      logDev('debug', 'Resume download initiated:', {
        fileName: profile.resumeFileName
      });
    } catch (error) {
      logError('Error downloading resume', {
        error: sanitizeForLogging(error),
        context: 'candidateDashboard'
      });
      setMessage({ type: 'error', text: 'Failed to download resume.' });
    }
  };

  // Handle closing resume preview
  const handleCloseResumePreview = () => {
    setShowResumePreview(false);
  };

  // Render resume preview dialog
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
        borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
        padding: '16px 24px'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 600 }}>
            Resume Preview
          </Typography>
          <IconButton onClick={handleCloseResumePreview} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ padding: 0 }}>
        {profile.resumeUrl ? (
          <Box sx={{ height: '70vh', overflow: 'auto', backgroundColor: '#fff' }}>
            <object
              data={getFullUrl(profile.resumeUrl)}
              type="application/pdf"
              width="100%"
              height="100%"
              style={{ minHeight: '500px' }}
            >
              <Typography variant="body1" sx={{ p: 3, color: '#000' }}>
                Unable to display PDF. <a href={getFullUrl(profile.resumeUrl)} target="_blank" rel="noopener noreferrer">Download</a> instead.
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

  // Render profile section
  const renderProfileSection = () => {
    // Get the photo URL and log details for debugging
    const photoUrl = getFullUrl(profile.photoUrl);
    console.warn('Profile photo rendering:', { 
      originalUrl: profile.photoUrl,
      processedUrl: photoUrl,
      profileData: JSON.stringify(profile)
    });
    
    // Force reload the image by adding a timestamp
    const photoUrlWithTimestamp = photoUrl ? `${photoUrl}?t=${new Date().getTime()}` : '';
    
    return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <StyledPaper>
          <Box sx={{ textAlign: 'center', position: 'relative' }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              {photoUrl ? (
                <Box sx={{ position: 'relative' }}>
                  <Avatar 
                    src={photoUrlWithTimestamp} 
                    alt={`${profile.firstName} ${profile.lastName}`}
                    sx={{ width: 120, height: 120, mb: 2 }}
                    imgProps={{ 
                      onError: (e) => {
                        console.error('Image failed to load:', photoUrlWithTimestamp);
                        e.target.onerror = null; // Prevent infinite error loop
                        e.target.src = ''; // Clear the src to show fallback
                      }
                    }}
                  />
                </Box>
              ) : (
                <Avatar
                  sx={{ width: 120, height: 120, mb: 2, bgcolor: '#009B77' }}
                >
                  {profile.firstName && profile.lastName ? 
                    `${profile.firstName[0]}${profile.lastName[0]}` : '?'}
                </Avatar>
              )}
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
                                backgroundColor: theme.palette.primary.main
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
                Personal Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    name="firstName"
                    label="First Name"
                    value={editedProfile.firstName || ''}
                    onChange={handleProfileChange}
                    fullWidth
                    margin="normal"
                    placeholder="Your first name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    name="lastName"
                    label="Last Name"
                    value={editedProfile.lastName || ''}
                    onChange={handleProfileChange}
                    fullWidth
                    margin="normal"
                    placeholder="Your last name"
                  />
                </Grid>
              </Grid>
              
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
            {(() => {
              // Get the appropriate profile based on edit mode
              const currentProfile = editMode ? editedProfile : profile;
              
              // Get validated skills array using helper function
              const skills = getValidSkills(currentProfile);
              
              // Display message if no skills
              if (!skills || skills.length === 0) {
                return (
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                    No skills added yet.
                  </Typography>
                );
              }
              
              // Render skills chips
              return skills.map((skill, index) => (
                <StyledChip 
                  key={`skill-${index}-${skill}`}
                  label={skill}
                  onDelete={editMode ? undefined : undefined}
                />
              ));
            })()}
          </Box>
          
          {editMode && (
            <Box sx={{ mt: 2 }}>
              <SkillsAutocomplete
                value={getValidSkills(editedProfile)}
                onChange={(newSkills) => {
                  setEditedProfile(prev => ({
                    ...prev,
                    skills: Array.isArray(newSkills) ? newSkills.filter(skill => !!skill) : []
                  }));
                }}
                label="Skills"
                placeholder="Search or add skills"
                multiple={true}
                freeSolo={true}
              />
            </Box>
          )}
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#FFD700' }}>
            Location
          </Typography>
          
          {editMode ? (
            <JamaicaLocationAutocomplete
              value={editedProfile.location || ''}
              onChange={handleLocationSelect}
              placeholder="Enter your location in Jamaica"
              sx={{ mb: 2 }}
            />
          ) : (
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {profile.location || 'No location provided.'}
            </Typography>
          )}

          {/* ===================== Education Section ===================== */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#FFD700' }}>
            Education
          </Typography>

          {editMode ? (
            <>
              {(editedProfile.education || []).length > 0 ? (
                editedProfile.education.map((edu, idx) => (
                  <Box key={`edu-${idx}`} sx={{ mb: 2, border: '1px solid rgba(255,215,0,0.2)', p: 2, borderRadius: 2, position: 'relative' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          label="School / Institution"
                          value={edu.school || ''}
                          onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          label="Degree / Certification"
                          value={edu.degree || ''}
                          onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          label="Field of Study"
                          value={edu.fieldOfStudy || ''}
                          onChange={(e) => handleEducationChange(idx, 'fieldOfStudy', e.target.value)}
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <StyledTextField
                          label="Start Year"
                          value={edu.startDate || ''}
                          onChange={(e) => handleEducationChange(idx, 'startDate', e.target.value)}
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <StyledTextField
                          label="End Year"
                          value={edu.endDate || ''}
                          onChange={(e) => handleEducationChange(idx, 'endDate', e.target.value)}
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                    </Grid>
                    <IconButton
                      size="small"
                      onClick={() => removeEducationEntry(idx)}
                      sx={{ position: 'absolute', top: 8, right: 8, color: '#ff6b6b' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 2 }}>
                  No education entries added yet.
                </Typography>
              )}
              <StyledButton
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addEducationEntry}
                sx={{ mb: 3 }}
              >
                Add Education
              </StyledButton>
            </>
          ) : (
            <Box sx={{ mb: 3 }}>
              {(profile.education || []).length > 0 ? (
                profile.education.map((edu, idx) => (
                  <Typography key={`edu-view-${idx}`} variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    {edu.degree ? `${edu.degree}, ` : ''}{edu.school} {(edu.startDate || edu.endDate) ? `(${edu.startDate || ''}${edu.endDate ? ` - ${edu.endDate}` : ''})` : ''}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                  No education information provided.
                </Typography>
              )}
            </Box>
          )}

          {/* ===================== Experience Section ===================== */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#FFD700' }}>
            Work Experience
          </Typography>

          {editMode ? (
            <>
              {(editedProfile.experience || []).length > 0 ? (
                editedProfile.experience.map((exp, idx) => (
                  <Box key={`exp-${idx}`} sx={{ mb: 2, border: '1px solid rgba(255,215,0,0.2)', p: 2, borderRadius: 2, position: 'relative' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          label="Company"
                          value={exp.company || ''}
                          onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          label="Job Title"
                          value={exp.title || ''}
                          onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <StyledTextField
                          label="Start Date"
                          value={exp.startDate || ''}
                          onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)}
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <StyledTextField
                          label="End Date"
                          value={exp.endDate || ''}
                          onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)}
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <StyledTextField
                          label="Description"
                          value={exp.description || ''}
                          onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                          fullWidth
                          margin="dense"
                          multiline
                          rows={3}
                        />
                      </Grid>
                    </Grid>
                    <IconButton
                      size="small"
                      onClick={() => removeExperienceEntry(idx)}
                      sx={{ position: 'absolute', top: 8, right: 8, color: '#ff6b6b' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 2 }}>
                  No experience entries added yet.
                </Typography>
              )}
              <StyledButton
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addExperienceEntry}
                sx={{ mb: 3 }}
              >
                Add Experience
              </StyledButton>
            </>
          ) : (
            <Box sx={{ mb: 3 }}>
              {(profile.experience || []).length > 0 ? (
                profile.experience.map((exp, idx) => (
                  <Typography key={`exp-view-${idx}`} variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    {exp.title} at {exp.company} {(exp.startDate || exp.endDate) ? `(${exp.startDate || ''}${exp.endDate ? ` - ${exp.endDate}` : ''})` : ''}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                  No work experience provided.
                </Typography>
              )}
            </Box>
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
};

// Helper function for education CRUD
const handleEducationChange = (index, field, value) => {
  setEditedProfile(prev => {
    const newEducation = Array.isArray(prev.education) ? [...prev.education] : [];
    // Ensure the entry exists
    newEducation[index] = {
      ...(newEducation[index] || {}),
      [field]: value
    };
    return { ...prev, education: newEducation };
  });
};

const addEducationEntry = () => {
  setEditedProfile(prev => ({
    ...prev,
    education: [...(prev.education || []), {
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: ''
    }]
  }));
};

const removeEducationEntry = (index) => {
  setEditedProfile(prev => {
    const newEducation = [...(prev.education || [])];
    newEducation.splice(index, 1);
    return { ...prev, education: newEducation };
  });
};

// Helper function for experience CRUD
const handleExperienceChange = (index, field, value) => {
  setEditedProfile(prev => {
    const newExperience = Array.isArray(prev.experience) ? [...prev.experience] : [];
    newExperience[index] = {
      ...(newExperience[index] || {}),
      [field]: value
    };
    return { ...prev, experience: newExperience };
  });
};

const addExperienceEntry = () => {
  setEditedProfile(prev => ({
    ...prev,
    experience: [...(prev.experience || []), {
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      description: ''
    }]
  }));
};

const removeExperienceEntry = (index) => {
  setEditedProfile(prev => {
    const newExperience = [...(prev.experience || [])];
    newExperience.splice(index, 1);
    return { ...prev, experience: newExperience };
  });
};

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
              borderColor: message.type === 'error' ? '#ff6b6b' : message.type === 'success' ? '#51cf66' : '#FFD700'
            }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}
      
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1, 
          borderColor: 'rgba(255, 215, 0, 0.3)', 
          mb: 3 
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFD700'
              },
              flexGrow: 1
            }}
          >
            <StyledTab label="Profile" />
            <StyledTab label="Applications" />
            <StyledTab label="Saved Jobs" />
            <StyledTab label="Settings" />
          </Tabs>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsMenu />
          </Box>
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
          <StyledPaper>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Your saved jobs will appear here.</Typography>
          </StyledPaper>
        )}
        {tabValue === 3 && (
          <StyledPaper>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#FFD700' }}>Account Settings</Typography>
              <StyledButton 
                variant="outlined" 
                color="error"
                onClick={logout}
                sx={{ mt: 2 }}
              >
                Logout
              </StyledButton>
            </Box>
          </StyledPaper>
        )}
        
        {renderResumePreview()}
      </StyledContainer>
    </DashboardWrapper>
  );
};

export default CandidateDashboard;
