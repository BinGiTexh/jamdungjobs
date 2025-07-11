import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { SkillsAutocomplete } from '../common/SkillsAutocomplete';
import JamaicaLocationProfileAutocomplete from '../common/JamaicaLocationProfileAutocomplete';
import ResumeViewer from './ResumeViewer';
// Phone input focus issue resolved with uncontrolled input approach

const ProfileEditModal = ({ open, onClose, onSave }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeViewerOpen, setResumeViewerOpen] = useState(false);
  const [originalEmail, setOriginalEmail] = useState('');
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    location: '',
    bio: '',
    
    // Professional Information (for job seekers)
    jobTitle: '',
    experienceLevel: '',
    skills: [],
    salaryMin: '',
    salaryMax: '',
    education: '',
    experience: '',
    
    // Company Information (for employers)
    companyName: '',
    companyWebsite: '',
    companyLocation: '',
    companyDescription: '',
    companyIndustry: ''
  });

  const experienceLevels = [
    'Entry Level (0-2 years)',
    'Mid Level (3-5 years)',
    'Senior Level (6-10 years)',
    'Executive Level (10+ years)'
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Tourism',
    'Education',
    'Manufacturing',
    'Construction',
    'Retail',
    'Transportation',
    'Agriculture',
    'Legal',
    'Marketing',
    'Security',
    'Telecommunications'
  ];

  // Fetch profile data when modal opens
  useEffect(() => {
    if (open && user) {
      fetchProfileData();
    }
  }, [open, user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const endpoint = user?.role === 'EMPLOYER' 
        ? 'http://localhost:5000/api/employer/profile'
        : 'http://localhost:5000/api/users/me';
        
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const profileInfo = data.data || data;
        setProfileData(profileInfo);
        setOriginalEmail(profileInfo.email || ''); // Store original email
        
        // Initialize form data
        if (user?.role === 'JOBSEEKER') {
          const profile = profileInfo.candidateProfile || {};
          setFormData({
            firstName: profileInfo.firstName || '',
            lastName: profileInfo.lastName || '',
            email: profileInfo.email || '',
            phoneNumber: profileInfo.phoneNumber || '',
            location: profileInfo.location || profile.location || '',
            bio: profileInfo.bio || profile.bio || '',
            jobTitle: profile.jobTitle || '',
            experienceLevel: profile.experienceLevel || '',
            skills: profile.skills || [],
            salaryMin: profile.salaryMin || '',
            salaryMax: profile.salaryMax || '',
            education: profile.education || '',
            experience: profile.experience || '',
            companyName: '',
            companyWebsite: '',
            companyLocation: '',
            companyDescription: '',
            companyIndustry: ''
          });
        } else {
          const company = profileInfo.company || {};
          setFormData({
            firstName: profileInfo.firstName || '',
            lastName: profileInfo.lastName || '',
            email: profileInfo.email || '',
            phoneNumber: profileInfo.phoneNumber || '',
            location: profileInfo.location || '',
            bio: profileInfo.bio || '',
            jobTitle: '',
            experienceLevel: '',
            skills: [],
            salaryMin: '',
            salaryMax: '',
            education: '',
            experience: '',
            companyName: company.name || '',
            companyWebsite: company.website || '',
            companyLocation: company.location || '',
            companyDescription: company.description || '',
            companyIndustry: company.industry || ''
          });
        }
      } else {
        setError('Failed to load profile data');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Phone input focus issue is now handled by PhoneInputFixed component

  const handleSkillsChange = (newSkills) => {
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  // Handle email update separately if email has changed
  const updateEmailIfChanged = async () => {
    if (formData.email && formData.email !== originalEmail) {
      console.log('Email changed, updating separately:', formData.email);
      try {
        const emailResponse = await fetch('http://localhost:5000/api/users/me/email', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
          },
          body: JSON.stringify({ email: formData.email })
        });

        if (emailResponse.ok) {
          console.log('Email updated successfully');
          setOriginalEmail(formData.email); // Update original email
        } else {
          const emailError = await emailResponse.json();
          console.error('Email update failed:', emailError);
          setError(`Email update failed: ${emailError.message || 'Unknown error'}`);
          return false;
        }
      } catch (emailErr) {
        console.error('Email update error:', emailErr);
        setError('Failed to update email. Please try again.');
        return false;
      }
    }
    return true;
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
      setSuccess('');
      
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('http://localhost:5000/api/jobseeker/profile/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Update profile data with new resume info
        setProfileData(prev => ({
          ...prev,
          candidateProfile: {
            ...prev?.candidateProfile,
            resumeUrl: data.resumeUrl,
            resumeFileName: data.resumeFileName
          }
        }));
        setSuccess('Resume uploaded successfully!');
        // Auto-clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload resume');
      }
    } catch (err) {
      setError('Failed to upload resume. Please try again.');
    } finally {
      setResumeUploading(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const endpoint = user?.role === 'EMPLOYER' 
        ? 'http://localhost:5000/api/employer/profile'
        : 'http://localhost:5000/api/users/me';

      console.log('=== PROFILE SAVE DEBUG ===');
      console.log('User role:', user?.role);
      console.log('Form data:', formData);

      // For JOBSEEKER: Use /api/users/me for basic user fields only
      // For EMPLOYER: Use /api/employer/profile for full profile
      let updateData;
      
      if (user?.role === 'JOBSEEKER') {
        // Backend expects flat fields for user profile
        updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          location: formData.location,
          bio: formData.bio,
          title: formData.jobTitle // Backend expects 'title' not 'jobTitle'
        };
        
        // Note: Email updates are handled by /api/users/me/email endpoint separately
        
        // Candidate-specific fields will be handled by jobseeker routes separately
        console.log('JOBSEEKER payload:', updateData);
      } else {
        updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          location: formData.location,
          bio: formData.bio,
          company: {
            name: formData.companyName,
            website: formData.companyWebsite,
            location: formData.companyLocation,
            description: formData.companyDescription,
            industry: formData.companyIndustry
          }
        };
      }

      console.log('Endpoint:', endpoint);
      console.log('Payload being sent:', JSON.stringify(updateData, null, 2));

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        
        // Update email separately if it has changed
        const emailUpdateSuccess = await updateEmailIfChanged();
        if (!emailUpdateSuccess) {
          return; // Stop if email update failed
        }
        
        setSuccess('Profile updated successfully!');
        
        // Update user context if needed
        if (updateUser) {
          updateUser({
            ...user,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber,
            email: formData.email // Include updated email
          });
        }
        
        // Call onSave callback
        if (onSave) {
          onSave(updatedData);
        }
        
        setSuccess('Profile updated successfully!');
        // Close modal after short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        const errorData = await response.json();
        
        // Provide user-friendly error messages
        let errorMessage = 'Unable to update profile. Please try again.';
        
        if (response.status === 404) {
          errorMessage = 'Profile not found. Please refresh the page and try again.';
        } else if (response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (response.status === 400) {
          console.error('Server validation error:', errorData);
          console.error('Failed fields:', errorData.errors);
          
          // Show specific field errors if available
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const fieldErrors = errorData.errors.map(err => `${err.field}: ${err.message}`).join(', ');
            errorMessage = `Validation failed: ${fieldErrors}`;
          } else {
            errorMessage = errorData.message || 'Invalid profile information. Please check your inputs.';
          }
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again in a few moments.';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Unable to update profile. Please try again.';
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message.includes('401')) {
        errorMessage = 'Your session has expired. Please log in again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    onClose();
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Edit Profile</Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {!loading && (
          <>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab icon={<PersonIcon />} label="Personal Info" />
              {user?.role === 'JOBSEEKER' && (
                <Tab icon={<WorkIcon />} label="Professional Info" />
              )}
              {user?.role === 'EMPLOYER' && (
                <Tab icon={<DescriptionIcon />} label="Company Info" />
              )}
            </Tabs>

            {/* Personal Information Tab */}
            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    defaultValue={formData.firstName}
                    onBlur={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    autoComplete="given-name"
                    inputProps={{
                      style: { fontSize: '16px' } // Prevent iOS zoom
                    }}
                    key="firstname-input-uncontrolled" // Stable key
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    defaultValue={formData.lastName}
                    onBlur={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    autoComplete="family-name"
                    inputProps={{
                      style: { fontSize: '16px' } // Prevent iOS zoom
                    }}
                    key="lastname-input-uncontrolled" // Stable key
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    defaultValue={formData.email}
                    onBlur={(e) => handleInputChange('email', e.target.value)}
                    autoComplete="email"
                    inputProps={{
                      style: { fontSize: '16px' } // Prevent iOS zoom
                    }}
                    key="email-input-uncontrolled" // Stable key
                    helperText="Update your email address if needed"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    defaultValue={formData.phoneNumber}
                    onBlur={(e) => handleInputChange('phoneNumber', e.target.value)}
                    type="tel"
                    autoComplete="tel"
                    inputProps={{
                      style: { fontSize: '16px' } // Prevent iOS zoom
                    }}
                    key="phone-input-uncontrolled" // Stable key
                  />
                </Grid>
                <Grid item xs={12}>
                  <JamaicaLocationProfileAutocomplete
                    value={formData.location}
                    onChange={(value) => handleInputChange('location', value)}
                    label="Location"
                    placeholder="Select your location in Jamaica"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={4}
                    defaultValue={formData.bio}
                    onBlur={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    inputProps={{
                      style: { fontSize: '16px' } // Prevent iOS zoom
                    }}
                    key="bio-input-uncontrolled" // Stable key
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Professional Information Tab (Job Seekers) */}
            {user?.role === 'JOBSEEKER' && (
              <TabPanel value={activeTab} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Current/Desired Job Title"
                      defaultValue={formData.jobTitle}
                      onBlur={(e) => handleInputChange('jobTitle', e.target.value)}
                      autoComplete="organization-title"
                      inputProps={{
                        style: { fontSize: '16px' } // Prevent iOS zoom
                      }}
                      key="jobtitle-input-uncontrolled" // Stable key
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Experience Level</InputLabel>
                      <Select
                        value={formData.experienceLevel}
                        onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                        label="Experience Level"
                      >
                        {experienceLevels.map((level) => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <SkillsAutocomplete
                      value={formData.skills}
                      onChange={handleSkillsChange}
                      label="Skills"
                      placeholder="Add your skills..."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Minimum Salary (JMD)</InputLabel>
                      <Select
                        value={formData.salaryMin}
                        onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                        label="Minimum Salary (JMD)"
                      >
                        <MenuItem value="">Not specified</MenuItem>
                        <MenuItem value="50000">$50,000 JMD</MenuItem>
                        <MenuItem value="75000">$75,000 JMD</MenuItem>
                        <MenuItem value="100000">$100,000 JMD</MenuItem>
                        <MenuItem value="150000">$150,000 JMD</MenuItem>
                        <MenuItem value="200000">$200,000 JMD</MenuItem>
                        <MenuItem value="250000">$250,000 JMD</MenuItem>
                        <MenuItem value="300000">$300,000 JMD</MenuItem>
                        <MenuItem value="400000">$400,000 JMD</MenuItem>
                        <MenuItem value="500000">$500,000 JMD</MenuItem>
                        <MenuItem value="600000">$600,000 JMD</MenuItem>
                        <MenuItem value="750000">$750,000 JMD</MenuItem>
                        <MenuItem value="1000000">$1,000,000 JMD</MenuItem>
                        <MenuItem value="1500000">$1,500,000 JMD</MenuItem>
                        <MenuItem value="2000000">$2,000,000+ JMD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Maximum Salary (JMD)</InputLabel>
                      <Select
                        value={formData.salaryMax}
                        onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                        label="Maximum Salary (JMD)"
                      >
                        <MenuItem value="">Not specified</MenuItem>
                        <MenuItem value="75000">$75,000 JMD</MenuItem>
                        <MenuItem value="100000">$100,000 JMD</MenuItem>
                        <MenuItem value="150000">$150,000 JMD</MenuItem>
                        <MenuItem value="200000">$200,000 JMD</MenuItem>
                        <MenuItem value="250000">$250,000 JMD</MenuItem>
                        <MenuItem value="300000">$300,000 JMD</MenuItem>
                        <MenuItem value="400000">$400,000 JMD</MenuItem>
                        <MenuItem value="500000">$500,000 JMD</MenuItem>
                        <MenuItem value="600000">$600,000 JMD</MenuItem>
                        <MenuItem value="750000">$750,000 JMD</MenuItem>
                        <MenuItem value="1000000">$1,000,000 JMD</MenuItem>
                        <MenuItem value="1500000">$1,500,000 JMD</MenuItem>
                        <MenuItem value="2000000">$2,000,000 JMD</MenuItem>
                        <MenuItem value="3000000">$3,000,000+ JMD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Education"
                      multiline
                      rows={3}
                      defaultValue={formData.education}
                      onBlur={(e) => handleInputChange('education', e.target.value)}
                      placeholder="Your educational background..."
                      inputProps={{
                        style: { fontSize: '16px' } // Prevent iOS zoom
                      }}
                      key="education-input-uncontrolled" // Stable key
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Work Experience"
                      multiline
                      rows={4}
                      defaultValue={formData.experience}
                      onBlur={(e) => handleInputChange('experience', e.target.value)}
                      placeholder="Describe your work experience..."
                      inputProps={{
                        style: { fontSize: '16px' } // Prevent iOS zoom
                      }}
                      key="experience-input-uncontrolled" // Stable key
                    />
                  </Grid>
                  
                  {/* Resume Upload Section */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Resume
                    </Typography>
                    <Box sx={{
                      border: '2px dashed #ccc',
                      borderRadius: 1,
                      p: 2,
                      textAlign: 'center',
                      backgroundColor: '#f9f9f9',
                      transition: 'border-color 0.2s',
                      '&:hover': {
                        borderColor: '#009639'
                      }
                    }}>
                      {profileData?.candidateProfile?.resumeUrl ? (
                        <Box>
                          <Typography variant="body2" sx={{ color: '#006400', mb: 1 }}>
                            📄 {profileData.candidateProfile.resumeFileName || 'Resume uploaded'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button 
                              onClick={() => setResumeViewerOpen(true)}
                              size="small"
                              sx={{ color: '#006400' }}
                            >
                              Quick Preview
                            </Button>
                            <Button
                              component="label"
                              variant="outlined"
                              startIcon={<UploadIcon />}
                              disabled={resumeUploading}
                              size="small"
                              sx={{
                                borderColor: '#009639',
                                color: '#009639',
                                '&:hover': {
                                  borderColor: '#007A2E',
                                  backgroundColor: 'rgba(0, 150, 57, 0.04)'
                                }
                              }}
                            >
                              {resumeUploading ? 'Uploading...' : 'Replace Resume'}
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeUpload}
                                style={{ display: 'none' }}
                              />
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                            📝 No resume uploaded yet
                          </Typography>
                          
                          <Typography variant="body2" sx={{ color: '#333', mb: 2, fontWeight: 500 }}>
                            Choose an option to get started:
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
                            <Button
                              component="label"
                              variant="outlined"
                              startIcon={<UploadIcon />}
                              disabled={resumeUploading}
                              size="small"
                              sx={{
                                borderColor: '#009639',
                                color: '#009639',
                                '&:hover': {
                                  borderColor: '#007A2E',
                                  backgroundColor: 'rgba(0, 150, 57, 0.04)'
                                }
                              }}
                            >
                              {resumeUploading ? 'Uploading...' : 'Upload Existing Resume'}
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeUpload}
                                style={{ display: 'none' }}
                              />
                            </Button>
                            
                            <Button
                              variant="contained"
                              startIcon={<DescriptionIcon />}
                              size="small"
                              onClick={() => {
                                // Navigate to resume builder
                                window.open('/resume-builder', '_blank');
                              }}
                              sx={{
                                backgroundColor: '#FFD700',
                                color: '#000',
                                '&:hover': {
                                  backgroundColor: '#E6C200'
                                }
                              }}
                            >
                              Build Resume
                            </Button>
                          </Box>
                          
                          <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                            Upload: PDF, DOC, DOCX (Max 5MB) | Build: Create a professional resume from scratch
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>
            )}

            {/* Company Information Tab (Employers) */}
            {user?.role === 'EMPLOYER' && (
              <TabPanel value={activeTab} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      defaultValue={formData.companyName}
                      onBlur={(e) => handleInputChange('companyName', e.target.value)}
                      required
                      autoComplete="organization"
                      inputProps={{
                        style: { fontSize: '16px' } // Prevent iOS zoom
                      }}
                      key="companyname-input-uncontrolled" // Stable key
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Website"
                      defaultValue={formData.companyWebsite}
                      onBlur={(e) => handleInputChange('companyWebsite', e.target.value)}
                      placeholder="https://..."
                      type="url"
                      autoComplete="url"
                      inputProps={{
                        style: { fontSize: '16px' } // Prevent iOS zoom
                      }}
                      key="companywebsite-input-uncontrolled" // Stable key
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <JamaicaLocationProfileAutocomplete
                      value={formData.companyLocation}
                      onChange={(value) => handleInputChange('companyLocation', value)}
                      label="Company Location"
                      placeholder="Select company location"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Industry</InputLabel>
                      <Select
                        value={formData.companyIndustry}
                        onChange={(e) => handleInputChange('companyIndustry', e.target.value)}
                        label="Industry"
                      >
                        {industries.map((industry) => (
                          <MenuItem key={industry} value={industry}>
                            {industry}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Company Description"
                      multiline
                      rows={4}
                      defaultValue={formData.companyDescription}
                      onBlur={(e) => handleInputChange('companyDescription', e.target.value)}
                      placeholder="Describe your company..."
                      inputProps={{
                        style: { fontSize: '16px' } // Prevent iOS zoom
                      }}
                      key="companydescription-input-uncontrolled" // Stable key
                    />
                  </Grid>
                </Grid>
              </TabPanel>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{
            background: 'linear-gradient(45deg, #009639 30%, #FFD700 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #007A2E 30%, #E6C200 90%)'
            }
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>

      {/* Resume Viewer Modal */}
      <ResumeViewer
        open={resumeViewerOpen}
        onClose={() => setResumeViewerOpen(false)}
        resumeUrl={profileData?.candidateProfile?.resumeUrl}
        resumeFileName={profileData?.candidateProfile?.resumeFileName}
      />
    </Dialog>
  );
};

export default ProfileEditModal;
