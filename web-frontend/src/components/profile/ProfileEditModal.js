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

const ProfileEditModal = ({ open, onClose, onSave }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeViewerOpen, setResumeViewerOpen] = useState(false);
  
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

  const handleSkillsChange = (newSkills) => {
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    }));
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

      let updateData;
      
      if (user?.role === 'JOBSEEKER') {
        updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          location: formData.location,
          bio: formData.bio,
          candidateProfile: {
            jobTitle: formData.jobTitle,
            experienceLevel: formData.experienceLevel,
            skills: formData.skills,
            salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
            salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
            education: formData.education,
            experience: formData.experience,
            location: formData.location
          }
        };
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
        setSuccess('Profile updated successfully!');
        
        // Update user context if needed
        if (updateUser) {
          updateUser({
            ...user,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber
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
          errorMessage = errorData.message || 'Invalid profile information. Please check your inputs.';
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
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    disabled
                    helperText="Email cannot be changed"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
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
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
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
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
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
                    <TextField
                      fullWidth
                      label="Minimum Salary (JMD)"
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Maximum Salary (JMD)"
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Education"
                      multiline
                      rows={3}
                      value={formData.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      placeholder="Your educational background..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Work Experience"
                      multiline
                      rows={4}
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      placeholder="Describe your work experience..."
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
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Website"
                      value={formData.companyWebsite}
                      onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                      placeholder="https://..."
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
                      value={formData.companyDescription}
                      onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                      placeholder="Describe your company..."
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
