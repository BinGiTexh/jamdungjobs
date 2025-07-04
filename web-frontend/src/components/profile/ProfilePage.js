import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { SkillsAutocomplete } from '../common/SkillsAutocomplete';
import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';

const ProfilePage = () => {
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
          // Handle the response structure properly
          const responseData = response.data;
          const data = responseData.data || responseData; // Handle both wrapped and unwrapped responses
          
          logDev('debug', 'Profile data loaded:', sanitizeForLogging({
            role: user?.role,
            hasData: !!data,
            hasProfile: user?.role === 'JOBSEEKER' ? !!data?.candidateProfile : !!data?.company,
            fields: Object.keys(data || {})
          }));
          setProfileData(data);
          
          // Initialize form data with fetched profile data
          if (user?.role === 'JOBSEEKER') {
            // For job seekers, combine user data and candidate profile
            const profile = data.candidateProfile || {};
            setFormData({
              name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
              phone: data.phoneNumber || '',
              address: data.location || profile.location || '',
              bio: data.bio || profile.bio || '',
              skills: profile.skills || [],
              education: profile.education || '',
              workExperience: profile.experience || '',
              // Employer specific fields (empty for job seekers)
              companyName: '',
              companyWebsite: '',
              companyLocation: '',
              companyDescription: ''
            });
          } else {
            // For employers
            const company = data.company || {};
            setFormData({
              name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
              phone: data.phoneNumber || '',
              address: data.location || '',
              bio: data.bio || '',
              skills: [],
              education: '',
              workExperience: '',
              // Employer specific fields
              companyName: company.name || '',
              companyWebsite: company.website || '',
              companyLocation: company.location || '',
              companyDescription: company.description || ''
            });
          }
        } else {
          logError('Failed to fetch profile', new Error(`HTTP status: ${response.status}`), {
            module: 'ProfilePage',
            function: 'fetchProfileData',
            userId: user?.id,
            role: user?.role,
            status: response.status
          });
          setError('Failed to load profile data. Please try again later.');
        }
      } catch (err) {
        logError('Error fetching profile', err, {
          module: 'ProfilePage',
          function: 'fetchProfileData',
          userId: user?.id,
          role: user?.role,
          endpoint: user?.role === 'EMPLOYER' ? 'employer/profile' : 'users/me',
          errorMessage: err.message,
          responseStatus: err.response?.status
        });
        
        // Provide more specific error messages
        if (err.response?.status === 404) {
          setError('Profile not found. Please complete your profile setup.');
        } else if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError('An error occurred while loading your profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  // Development-only logging
  useEffect(() => {
    logDev('debug', 'Profile state updated', sanitizeForLogging({
      userAuthenticated: !!user,
      userRole: user?.role,
      profileLoaded: !!profileData,
      formFields: Object.keys(formData),
      loadingState: loading
    }));
  }, [user, profileData, formData, loading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle skill selection changes
  const handleSkillsChange = (newSkills) => {
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    }));
    
    // Log skill changes in development
    logDev('debug', 'Skills updated', {
      skillCount: newSkills.length,
      skills: newSkills
    });
  };

  // Handle resume upload
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
      setSuccess(''); // Clear any existing success message
      
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
        module: 'ProfilePage',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Log form submission attempt
    logDev('debug', 'Submitting profile update', sanitizeForLogging({
      userRole: user?.role,
      formFields: Object.keys(formData),
      isEmployer: user?.role === 'EMPLOYER'
    }));

    try {
      if (user?.role === 'JOBSEEKER') {
        // For job seekers, we need to update both user profile and candidate profile
        
        // First, update basic user information
        const nameParts = formData.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Use backend expected field names with underscores
        const userUpdateData = {
          first_name: firstName,
          last_name: lastName,
          bio: formData.bio,
          location: formData.address,
          phone_number: formData.phone
        };

        const userResponse = await axios.put('http://localhost:5000/api/users/me', userUpdateData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
          }
        });

        // Then, update candidate profile information
        const candidateProfileData = {
          bio: formData.bio,
          location: formData.address,
          // Convert strings to arrays as expected by backend
          skills: Array.isArray(formData.skills) ? formData.skills : 
                  (formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : []),
          education: Array.isArray(formData.education) ? formData.education : 
                     (formData.education ? [formData.education] : []),
          experience: Array.isArray(formData.workExperience) ? formData.workExperience : 
                      (formData.workExperience ? [formData.workExperience] : [])
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
          
          // Merge the updated data
          const updatedData = {
            ...userResponse.data.data,
            candidateProfile: profileResponse.data.data
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
          // Only include fields that exist in the Prisma schema
          name: formData.companyName, // Company name field
          website: formData.companyWebsite,
          location: formData.companyLocation,
          description: formData.companyDescription // Changed to match the expected field name
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
        module: 'ProfilePage',
        function: 'handleSubmit',
        userId: user?.id,
        role: user?.role,
        status: err.response?.status,
        endpoint: user?.role === 'EMPLOYER' ? 'employer/profile' : 'users/me',
        errorMessage: err.message,
        responseData: err.response?.data
      });
      
      // Provide more specific error messages
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid data provided. Please check your inputs.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to update this profile.');
      } else {
        setError(err.response?.data?.message || 'An error occurred while updating the profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel editing and revert to original values
  const handleCancel = () => {
    logDev('debug', 'Edit profile canceled', {
      userId: user?.id,
      role: user?.role
    });
    
    // Reset form data based on current profile data
    if (user?.role === 'JOBSEEKER') {
      const profile = profileData?.candidateProfile || {};
      setFormData({
        name: `${profileData?.firstName || ''} ${profileData?.lastName || ''}`.trim(),
        phone: profileData?.phoneNumber || '',
        address: profileData?.location || profile.location || '',
        bio: profileData?.bio || profile.bio || '',
        skills: profile.skills || [],
        education: profile.education || '',
        workExperience: profile.experience || '',
        companyName: '',
        companyWebsite: '',
        companyLocation: '',
        companyDescription: ''
      });
    } else {
      const company = profileData?.company || {};
      setFormData({
        name: `${profileData?.firstName || ''} ${profileData?.lastName || ''}`.trim(),
        phone: profileData?.phoneNumber || '',
        address: profileData?.location || '',
        bio: profileData?.bio || '',
        skills: [],
        education: '',
        workExperience: '',
        companyName: company.name || '',
        companyWebsite: company.website || '',
        companyLocation: company.location || '',
        companyDescription: company.description || ''
      });
    }
    
    setIsEditing(false);
    setError('');
  };

  // Common TextField styling
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      '& fieldset': {
        borderColor: '#FFD700'
      },
      '&:hover fieldset': {
        borderColor: '#FFD700'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#FFD700'
      }
    },
    '& .MuiInputLabel-root': {
      color: '#FFD700'
    },
    '& .MuiInputBase-input': {
      color: 'white'
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ 
          backgroundColor: '#1A1A1A', 
          color: 'white',
          textAlign: 'center',
          p: 4
        }}>
          <CircularProgress sx={{ color: '#FFD700', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#FFD700' }}>
            Loading profile information...
          </Typography>
        </Card>
      </Container>
    );
  }
  
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ 
          backgroundColor: '#1A1A1A', 
          color: 'white',
          textAlign: 'center',
          p: 4
        }}>
          <PersonIcon sx={{ fontSize: 48, color: '#FFD700', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#FFD700' }}>
            Please log in to view your profile.
          </Typography>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header Section */}
      <Card sx={{ 
        backgroundColor: '#1A1A1A', 
        color: 'white',
        mb: 3,
        borderTop: '4px solid #FFD700'
      }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user?.role === 'EMPLOYER' ? (
                <BusinessIcon sx={{ color: '#FFD700', fontSize: 32 }} />
              ) : (
                <PersonIcon sx={{ color: '#FFD700', fontSize: 32 }} />
              )}
              <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                {user?.role === 'EMPLOYER' ? 'Company Profile' : 'Job Seeker Profile'}
              </Typography>
            </Box>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="contained"
                startIcon={<EditIcon />}
                sx={{ 
                  backgroundColor: '#FFD700',
                  color: '#1A1A1A',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.8)'
                  }
                }}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Error and Success Messages */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            color: '#f44336',
            '& .MuiAlert-icon': {
              color: '#f44336'
            }
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2,
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            color: '#4caf50',
            '& .MuiAlert-icon': {
              color: '#4caf50'
            },
            fontWeight: 'bold'
          }}
        >
          {success}
        </Alert>
      )}

      {/* Main Profile Form */}
      <Card sx={{ 
        backgroundColor: '#1A1A1A', 
        color: 'white'
      }}>
        <CardContent>
          {isEditing ? (
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
              <Typography variant="h5" sx={{ color: '#FFD700', mb: 3, fontWeight: 'bold' }}>
                Edit Profile Information
              </Typography>
              
              <Grid container spacing={3}>
                {/* Common fields for both user types */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    sx={textFieldSx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    sx={textFieldSx}
                  />
                </Grid>

                {/* Job seeker specific fields */}
                {user?.role !== 'EMPLOYER' && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your address"
                        sx={textFieldSx}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        name="bio"
                        multiline
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself"
                        sx={textFieldSx}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Education"
                        name="education"
                        multiline
                        rows={3}
                        value={formData.education}
                        onChange={handleInputChange}
                        placeholder="Provide your education background"
                        sx={textFieldSx}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Work Experience"
                        name="workExperience"
                        multiline
                        rows={3}
                        value={formData.workExperience}
                        onChange={handleInputChange}
                        placeholder="Describe your work experience"
                        sx={textFieldSx}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography sx={{ color: '#FFD700', mb: 1 }}>Skills</Typography>
                      <SkillsAutocomplete 
                        value={formData.skills} 
                        onChange={handleSkillsChange} 
                      />
                    </Grid>

                    {/* Resume Upload */}
                    <Grid item xs={12}>
                      <Typography sx={{ color: '#FFD700', mb: 2 }}>Resume</Typography>
                      <Card sx={{
                        border: '2px dashed #FFD700',
                        backgroundColor: 'rgba(255, 215, 0, 0.05)',
                        p: 2,
                        textAlign: 'center'
                      }}>
                        {profileData?.candidateProfile?.resumeUrl ? (
                          <Box sx={{ mb: 2 }}>
                            <Typography sx={{ color: '#4caf50', mb: 1 }}>
                              📄 {profileData.candidateProfile.resumeFileName || 'Resume uploaded'}
                            </Typography>
                            <Button
                              component="a"
                              href={profileData.candidateProfile.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ color: '#4caf50', textDecoration: 'underline', mr: 2 }}
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
                          style={{ marginTop: '0.5rem' }}
                          disabled={resumeUploading}
                        />
                        
                        {resumeUploading && (
                          <Typography sx={{ color: '#4caf50', mt: 1 }}>Uploading resume...</Typography>
                        )}
                        
                        <Typography sx={{ fontSize: '0.8rem', color: '#666', mt: 1 }}>
                          Accepted formats: PDF, DOC, DOCX (Max 5MB)
                        </Typography>
                      </Card>
                    </Grid>
                  </>
                )}

                {/* Employer specific fields */}
                {user?.role === 'EMPLOYER' && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Company Name"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Enter your company name"
                        sx={textFieldSx}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Company Website"
                        name="companyWebsite"
                        type="url"
                        value={formData.companyWebsite}
                        onChange={handleInputChange}
                        placeholder="Enter your company website"
                        sx={textFieldSx}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Company Location"
                        name="companyLocation"
                        value={formData.companyLocation}
                        onChange={handleInputChange}
                        placeholder="Enter your company location"
                        sx={textFieldSx}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Company Description"
                        name="companyDescription"
                        multiline
                        rows={4}
                        value={formData.companyDescription}
                        onChange={handleInputChange}
                        placeholder="Describe your company"
                        sx={textFieldSx}
                      />
                    </Grid>
                  </>
                )}

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button
                      onClick={handleCancel}
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      sx={{
                        color: '#666',
                        borderColor: '#666',
                        '&:hover': {
                          borderColor: '#999',
                          backgroundColor: 'rgba(153, 153, 153, 0.1)'
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                      sx={{
                        backgroundColor: '#FFD700',
                        color: '#1A1A1A',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 215, 0, 0.8)'
                        },
                        '&:disabled': {
                          backgroundColor: 'rgba(255, 215, 0, 0.3)',
                          color: 'rgba(26, 26, 26, 0.5)'
                        }
                      }}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" sx={{ color: '#FFD700', mb: 3, fontWeight: 'bold' }}>
                Profile Information
              </Typography>
              
              <Stack spacing={3}>
                {/* Name */}
                <Box sx={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)', pb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    {profileData ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() : 'Not provided'}
                  </Typography>
                </Box>

                {/* Email */}
                <Box sx={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)', pb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    {profileData?.email || user?.email || 'Not provided'}
                  </Typography>
                </Box>

                {/* Phone */}
                <Box sx={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)', pb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                    Phone
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    {profileData?.phoneNumber || 'Not provided'}
                  </Typography>
                </Box>

                {/* Job seeker specific fields */}
                {user?.role !== 'EMPLOYER' && (
                  <>
                    <Box sx={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)', pb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                        Bio
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {profileData?.bio || profileData?.candidateProfile?.bio || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box sx={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)', pb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                        Education
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {profileData?.candidateProfile?.education || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box sx={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)', pb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                        Work Experience
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {profileData?.candidateProfile?.experience || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                        Skills
                      </Typography>
                      {profileData?.candidateProfile?.skills && profileData.candidateProfile.skills.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {profileData.candidateProfile.skills.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              sx={{
                                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                border: '1px solid #FFD700',
                                color: '#FFD700',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 215, 0, 0.2)'
                                }
                              }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body1" sx={{ color: 'white' }}>
                          No skills added yet
                        </Typography>
                      )}
                    </Box>
                  </>
                )}

                {/* Employer specific fields */}
                {user?.role === 'EMPLOYER' && (
                  <>
                    <Box sx={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)', pb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                        Company Name
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {profileData?.company?.name || profileData?.companyName || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box sx={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)', pb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                        Company Website
                      </Typography>
                      {(profileData?.company?.website || profileData?.companyWebsite) ? (
                        <Button
                          component="a"
                          href={profileData?.company?.website || profileData?.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            color: '#FFD700', 
                            textDecoration: 'underline',
                            p: 0,
                            minWidth: 'auto',
                            '&:hover': {
                              backgroundColor: 'transparent',
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {profileData?.company?.website || profileData?.companyWebsite}
                        </Button>
                      ) : (
                        <Typography variant="body1" sx={{ color: 'white' }}>
                          Not provided
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)', pb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                        Company Location
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {profileData?.company?.location || profileData?.companyLocation || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                        Company Description
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {profileData?.company?.description || profileData?.companyDescription || 'Not provided'}
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProfilePage;