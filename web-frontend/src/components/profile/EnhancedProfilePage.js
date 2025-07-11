import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Avatar,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import SkillsAutocomplete from '../common/SkillsAutocomplete';
import ResumeViewer from './ResumeViewer';
import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';
import axios from 'axios';

// Enhanced styling with Jamaica theme
const ProfileContainer = styled(Container)(() => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%)',
  paddingTop: '32px',
  paddingBottom: '32px'
}));

const ProfileCard = styled(Card)(() => ({
  background: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)',
  border: '1px solid rgba(255, 215, 0, 0.2)',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: 'rgba(255, 215, 0, 0.4)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
  }
}));

const StyledTextField = styled(TextField)(() => ({
  marginBottom: '24px',
  '& .MuiOutlinedInput-root': {
    color: '#FFFFFF',
    backgroundColor: 'rgba(45, 45, 45, 0.8)',
    '& fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.3)'
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 215, 0, 0.5)'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700',
      borderWidth: '2px'
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 215, 0, 0.7)',
    '&.Mui-focused': {
      color: '#FFD700'
    }
  },
  '& .MuiFormHelperText-root': {
    color: 'rgba(255, 255, 255, 0.7)'
  }
}));

const ActionButton = styled(Button)(() => ({
  background: 'linear-gradient(90deg, #FFD700, #009639)',
  color: '#000000',
  fontWeight: 600,
  borderRadius: '12px',
  padding: '12px 32px',
  textTransform: 'none',
  fontSize: '1rem',
  minHeight: '48px',
  boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)',
  '&:hover': {
    background: 'linear-gradient(90deg, #009639, #FFD700)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 24px rgba(255, 215, 0, 0.4)'
  },
  '&:disabled': {
    background: 'rgba(255, 215, 0, 0.3)',
    color: 'rgba(0, 0, 0, 0.5)'
  },
  transition: 'all 0.3s ease'
}));

const SecondaryButton = styled(Button)(() => ({
  color: '#FFD700',
  borderColor: '#FFD700',
  borderWidth: '2px',
  borderRadius: '12px',
  padding: '12px 32px',
  textTransform: 'none',
  fontSize: '1rem',
  minHeight: '48px',
  '&:hover': {
    borderColor: '#009639',
    color: '#009639',
    background: 'rgba(255, 215, 0, 0.1)',
    borderWidth: '2px'
  },
  transition: 'all 0.3s ease'
}));

const InfoCard = styled(Paper)(() => ({
  background: 'rgba(45, 45, 45, 0.6)',
  border: '1px solid rgba(255, 215, 0, 0.1)',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  backdropFilter: 'blur(10px)'
}));

const SectionTitle = styled(Typography)(() => ({
  color: '#FFD700',
  fontWeight: 700,
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '&::after': {
    content: '""',
    flex: 1,
    height: '2px',
    background: 'linear-gradient(90deg, #FFD700, transparent)',
    marginLeft: '16px'
  }
}));

const UserAvatar = styled(Avatar)(() => ({
  width: 120,
  height: 120,
  background: 'linear-gradient(135deg, #FFD700, #009639)',
  color: '#000',
  fontSize: '3rem',
  fontWeight: 'bold',
  margin: '0 auto',
  border: '4px solid rgba(255, 215, 0, 0.3)',
  boxShadow: '0 8px 24px rgba(255, 215, 0, 0.2)'
}));

const EnhancedProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: '',
    skills: [],
    education: '',
    workExperience: '',
    // Employer specific fields
    companyName: '',
    companyWebsite: '',
    companyLocation: '',
    companyDescription: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeViewerOpen, setResumeViewerOpen] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setError('');
        setLoading(true);
        logDev('debug', 'Fetching profile data for user role:', user?.role);
        
        const endpoint = user?.role === 'EMPLOYER' 
          ? 'http://localhost:5000/api/employer/profile'
          : 'http://localhost:5000/api/users/me';
          
        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
          }
        });

        if (response.status === 200) {
          const responseData = response.data;
          const data = responseData.data || responseData;
          
          logDev('debug', 'Profile data loaded:', sanitizeForLogging({
            role: user?.role,
            hasData: !!data,
            hasProfile: user?.role === 'JOBSEEKER' ? !!data?.candidateProfile : !!data?.company,
            fields: Object.keys(data || {})
          }));
          setProfileData(data);
          
          // Initialize form data with fetched profile data
          if (user?.role === 'JOBSEEKER') {
            const profile = data.candidateProfile || {};
            setFormData({
              name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
              phone: data.phoneNumber || '',
              address: data.location || '',
              bio: data.bio || '',
              skills: Array.isArray(profile.skills) ? profile.skills : [],
              education: Array.isArray(profile.education) ? profile.education.join('\n') : (profile.education || ''),
              workExperience: Array.isArray(profile.experience) ? profile.experience.join('\n') : (profile.experience || ''),
              companyName: '',
              companyWebsite: '',
              companyLocation: '',
              companyDescription: ''
            });
          } else if (user?.role === 'EMPLOYER') {
            const company = data.company || {};
            setFormData({
              name: `${data.employer?.firstName || data.firstName || ''} ${data.employer?.lastName || data.lastName || ''}`.trim(),
              phone: data.employer?.phoneNumber || data.phoneNumber || '',
              address: data.employer?.location || data.location || '',
              bio: data.employer?.bio || data.bio || '',
              skills: [],
              education: '',
              workExperience: '',
              companyName: company.name || '',
              companyWebsite: company.website || '',
              companyLocation: company.location || '',
              companyDescription: company.description || ''
            });
          }
        }
      } catch (err) {
        setError('Failed to load profile');
        logError('Error fetching profile:', err, {
          module: 'EnhancedProfilePage',
          function: 'fetchProfileData',
          userId: user?.id,
          role: user?.role
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (newSkills) => {
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    }));
    
    logDev('debug', 'Skills updated', {
      skillCount: newSkills.length,
      skills: newSkills
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    logDev('debug', 'Submitting profile update', sanitizeForLogging({
      userRole: user?.role,
      formFields: Object.keys(formData),
      isEmployer: user?.role === 'EMPLOYER'
    }));

    try {
      if (user?.role === 'JOBSEEKER') {
        // For job seekers, update both user profile and candidate profile
        const nameParts = formData.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Update basic user information using camelCase (schema fix applied)
        const userUpdateData = {
          firstName: firstName,
          lastName: lastName,
          bio: formData.bio,
          location: formData.address,
          phoneNumber: formData.phone
        };

        const userResponse = await axios.put('http://localhost:5000/api/users/me', userUpdateData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
          }
        });

        // Update candidate profile information using camelCase
        // Preserve existing resume data if it exists
        const candidateProfileData = {
          firstName: firstName,
          lastName: lastName,
          bio: formData.bio,
          location: formData.address,
          phoneNumber: formData.phone,
          skills: Array.isArray(formData.skills) ? formData.skills : 
                  (formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : []),
          education: Array.isArray(formData.education) ? formData.education : 
                     (formData.education ? [formData.education] : []),
          experience: Array.isArray(formData.workExperience) ? formData.workExperience : 
                      (formData.workExperience ? [formData.workExperience] : []),
          // Preserve existing resume data
          ...(profileData?.candidateProfile?.resumeUrl && {
            resumeUrl: profileData.candidateProfile.resumeUrl,
            resumeFileName: profileData.candidateProfile.resumeFileName
          }),
          // Preserve existing photo data
          ...(profileData?.candidateProfile?.photoUrl && {
            photoUrl: profileData.candidateProfile.photoUrl
          })
        };

        const profileResponse = await axios.put('http://localhost:5000/api/jobseeker/profile', candidateProfileData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
          }
        });

        if (userResponse.status === 200 && profileResponse.status === 200) {
          logDev('info', 'Profile updated successfully', {
            userId: user?.id,
            role: user?.role
          });
          
          const userData = userResponse.data.data || userResponse.data;
          const profileData = profileResponse.data.data || profileResponse.data;
          const updatedData = {
            ...userData,
            candidateProfile: profileData
          };
          
          setProfileData(updatedData);
          setSuccess('Profile updated successfully!');
          setIsEditing(false);
        } else {
          throw new Error('Failed to update profile');
        }
      } else {
        // For employers, use the employer profile endpoint
        const endpoint = 'http://localhost:5000/api/employer/profile';
        
        const dataToSubmit = {
          name: formData.companyName,
          website: formData.companyWebsite,
          location: formData.companyLocation,
          description: formData.companyDescription,
          // Preserve existing logo data
          ...(profileData?.company?.logoUrl && {
            logoUrl: profileData.company.logoUrl
          })
        };

        const response = await axios.put(endpoint, dataToSubmit, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
          }
        });

        if (response.status === 200) {
          logDev('info', 'Profile updated successfully', {
            userId: user?.id,
            role: user?.role
          });
          setProfileData(response.data);
          setSuccess('Profile updated successfully!');
          setIsEditing(false);
        } else {
          throw new Error('Failed to update profile');
        }
      }
    } catch (err) {
      logError('Error updating profile', err, {
        module: 'EnhancedProfilePage',
        function: 'handleSubmit',
        userId: user?.id,
        role: user?.role,
        status: err.response?.status
      });
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logo upload for employers
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Logo file size must be less than 2MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, GIF, or WebP image');
      return;
    }

    try {
      setLogoUploading(true);
      setError('');
      setSuccess('');
      
      const formData = new FormData();
      formData.append('logo', file);

      const response = await axios.post('http://localhost:5000/api/employer/profile/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
        }
      });

      if (response.status === 200) {
        // Update profile data with new logo info
        setProfileData(prev => ({
          ...prev,
          company: {
            ...prev?.company,
            logoUrl: response.data.logoUrl
          }
        }));
        setSuccess('Company logo uploaded successfully!');
        logDev('info', 'Logo uploaded successfully', {
          logoUrl: response.data.logoUrl
        });
      }
    } catch (err) {
      logError('Error uploading logo', err, {
        module: 'EnhancedProfilePage',
        function: 'handleLogoUpload',
        userId: user?.id,
        fileSize: file.size,
        fileType: file.type
      });
      setError(err.response?.data?.message || 'Failed to upload logo. Please try again.');
    } finally {
      setLogoUploading(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  // Handle resume upload for jobseekers
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Resume file size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    try {
      setResumeUploading(true);
      setError('');
      setSuccess('');
      
      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post('http://localhost:5000/api/jobseeker/profile/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
        }
      });

      if (response.status === 200) {
        // Update profile data with new resume info
        setProfileData(prev => ({
          ...prev,
          candidateProfile: {
            ...prev?.candidateProfile,
            resumeUrl: response.data.resumeUrl,
            resumeFileName: response.data.resumeFileName
          }
        }));
        setSuccess('Resume uploaded successfully!');
        logDev('info', 'Resume uploaded successfully', {
          fileName: response.data.resumeFileName,
          url: response.data.resumeUrl
        });
      }
    } catch (err) {
      logError('Error uploading resume', err, {
        module: 'EnhancedProfilePage',
        function: 'handleResumeUpload',
        userId: user?.id,
        fileSize: file.size,
        fileType: file.type
      });
      setError(err.response?.data?.message || 'Failed to upload resume. Please try again.');
    } finally {
      setResumeUploading(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  if (loading && !profileData) {
    return (
      <ProfileContainer maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress sx={{ color: '#FFD700' }} size={60} />
        </Box>
      </ProfileContainer>
    );
  }

  if (error && !profileData) {
    return (
      <ProfileContainer maxWidth="lg">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer maxWidth="lg">
      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3, color: '#FFD700' }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <ProfileCard>
        <CardContent sx={{ p: 4 }}>
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <UserAvatar>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </UserAvatar>
            <Typography variant="h3" sx={{ color: '#FFD700', mt: 2, fontWeight: 700 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
              {user?.role === 'EMPLOYER' ? 'Employer Profile' : 'Job Seeker Profile'}
            </Typography>
            
            {!isEditing && (
              <ActionButton
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </ActionButton>
            )}
          </Box>

          <Divider sx={{ bgcolor: 'rgba(255, 215, 0, 0.2)', mb: 4 }} />

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Personal Information */}
              <Grid item xs={12} md={6}>
                <InfoCard>
                  <SectionTitle variant="h5">
                    <PersonIcon /> Personal Information
                  </SectionTitle>

                  <StyledTextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ color: '#FFD700', mr: 1 }} />
                    }}
                  />

                  <StyledTextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ color: '#FFD700', mr: 1 }} />
                    }}
                  />

                  <StyledTextField
                    fullWidth
                    label="Location"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <LocationIcon sx={{ color: '#FFD700', mr: 1 }} />
                    }}
                  />

                  <StyledTextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    multiline
                    rows={4}
                    helperText="Tell us about yourself"
                  />
                </InfoCard>
              </Grid>

              {/* Professional Information */}
              <Grid item xs={12} md={6}>
                <InfoCard>
                  <SectionTitle variant="h5">
                    <WorkIcon /> Professional Information
                  </SectionTitle>

                  {user?.role === 'JOBSEEKER' ? (
                    <>
                      <Box sx={{ mb: 3 }}>
                        <SkillsAutocomplete
                          value={formData.skills}
                          onChange={handleSkillsChange}
                          disabled={!isEditing}
                          placeholder="Select your skills..."
                          maxTags={15}
                        />
                      </Box>

                      <StyledTextField
                        fullWidth
                        label="Education"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        multiline
                        rows={3}
                        helperText="Your educational background"
                      />

                      <StyledTextField
                        fullWidth
                        label="Work Experience"
                        name="workExperience"
                        value={formData.workExperience}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        multiline
                        rows={4}
                        helperText="Your work experience and achievements"
                      />
                    </>
                  ) : (
                    <>
                      <StyledTextField
                        fullWidth
                        label="Company Name"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: <BusinessIcon sx={{ color: '#FFD700', mr: 1 }} />
                        }}
                      />

                      <StyledTextField
                        fullWidth
                        label="Company Website"
                        name="companyWebsite"
                        value={formData.companyWebsite}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        helperText="e.g., https://yourcompany.com"
                      />

                      <StyledTextField
                        fullWidth
                        label="Company Location"
                        name="companyLocation"
                        value={formData.companyLocation}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: <LocationIcon sx={{ color: '#FFD700', mr: 1 }} />
                        }}
                      />

                      <StyledTextField
                        fullWidth
                        label="Company Description"
                        name="companyDescription"
                        value={formData.companyDescription}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        multiline
                        rows={4}
                        helperText="Describe your company and what you do"
                      />
                    </>
                  )}
                </InfoCard>
              </Grid>

              {/* File Upload Section */}
              <Grid item xs={12}>
                <InfoCard>
                  <SectionTitle variant="h5">
                    <CloudUploadIcon /> Files & Documents
                  </SectionTitle>

                  {user?.role === 'JOBSEEKER' ? (
                    <>
                      {/* Resume Upload */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon /> Resume
                        </Typography>
                        
                        {profileData?.candidateProfile?.resumeUrl ? (
                          <Box sx={{ mb: 2 }}>
                            <Typography sx={{ color: '#4caf50', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              📄 {profileData.candidateProfile.resumeFileName || 'Resume uploaded'}
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ color: '#FFD700', borderColor: '#FFD700' }}
                              onClick={() => setResumeViewerOpen(true)}
                            >
                              View Resume
                            </Button>
                          </Box>
                        ) : (
                          <Typography sx={{ color: '#666', mb: 1 }}>No resume uploaded</Typography>
                        )}

                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          style={{ display: 'none' }}
                          id="resume-upload"
                          disabled={resumeUploading}
                        />
                        <label htmlFor="resume-upload">
                          <Button
                            component="span"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            sx={{ color: '#FFD700', borderColor: '#FFD700' }}
                            disabled={resumeUploading}
                          >
                            {profileData?.candidateProfile?.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                          </Button>
                        </label>
                        {resumeUploading && (
                          <Typography sx={{ color: '#4caf50', mt: 1 }}>Uploading resume...</Typography>
                        )}
                      </Box>
                    </>
                  ) : (
                    <>
                      {/* Logo Upload for Employers */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ImageIcon /> Company Logo
                        </Typography>
                        
                        {profileData?.company?.logoUrl ? (
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                              <img 
                                src={profileData.company.logoUrl} 
                                alt="Company Logo" 
                                style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '8px' }}
                              />
                              <Typography sx={{ color: '#4caf50' }}>
                                Logo uploaded
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Typography sx={{ color: '#666', mb: 1 }}>No logo uploaded</Typography>
                        )}

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={handleLogoUpload}
                          style={{ display: 'none' }}
                          id="logo-upload"
                          disabled={logoUploading}
                        />
                        <label htmlFor="logo-upload">
                          <Button
                            component="span"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            sx={{ color: '#FFD700', borderColor: '#FFD700' }}
                            disabled={logoUploading}
                          >
                            {profileData?.company?.logoUrl ? 'Replace Logo' : 'Upload Logo'}
                          </Button>
                        </label>
                        {logoUploading && (
                          <Typography sx={{ color: '#4caf50', mt: 1 }}>Uploading logo...</Typography>
                        )}
                      </Box>
                    </>
                  )}
                </InfoCard>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                <ActionButton
                  type="submit"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </ActionButton>
                <SecondaryButton
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </SecondaryButton>
              </Box>
            )}
          </form>
        </CardContent>
      </ProfileCard>

      {/* Resume Viewer Modal */}
      <ResumeViewer
        open={resumeViewerOpen}
        onClose={() => setResumeViewerOpen(false)}
        resumeUrl={profileData?.candidateProfile?.resumeUrl}
        resumeFileName={profileData?.candidateProfile?.resumeFileName}
      />
    </ProfileContainer>
  );
};

export default EnhancedProfilePage;