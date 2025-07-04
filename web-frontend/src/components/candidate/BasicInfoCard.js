import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../utils/axiosConfig';

const BasicInfoCard = ({ userProfile, onProfileUpdate }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userProfile.firstName || '',
    lastName: userProfile.lastName || '',
    email: userProfile.email || '',
    phoneNumber: userProfile.phoneNumber || ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess('');
      
      const response = await api.put('/api/users/me', formData);
      onProfileUpdate(response.data);
      
      setSuccess('✅ Profile updated successfully!');
      
      // Keep modal open longer to show success state
      setTimeout(() => {
        handleClose();
      }, 2500); // Show success message for 2.5 seconds
      
    } catch (error) {
      console.error('Profile update error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Unable to update profile. Please try again.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Profile not found. Please refresh the page and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid profile information. Please check your inputs.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
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
        // Update the userProfile with new resume info
        onProfileUpdate({
          ...userProfile,
          candidateProfile: {
            ...userProfile.candidateProfile,
            resumeUrl: data.resumeUrl,
            resumeFileName: data.resumeFileName
          }
        });
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

  return (
    <>
      <Card sx={{ backgroundColor: '#1A1A1A', color: 'white', position: 'relative' }}>
        <IconButton 
          onClick={handleOpen}
          sx={{ 
            position: 'absolute', 
            right: 8, 
            top: 8,
            color: '#FFD700'
          }}
        >
          <EditIcon />
        </IconButton>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
            Basic Information
          </Typography>
          <Stack spacing={1}>
            <Typography>
              <strong>Name:</strong> {userProfile.firstName} {userProfile.lastName}
            </Typography>
            <Typography>
              <strong>Email:</strong> {userProfile.email}
            </Typography>
            <Typography>
              <strong>Phone:</strong> {userProfile.phoneNumber || 'Not provided'}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#1A1A1A', color: '#FFD700' }}>
          Edit Basic Information
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#1A1A1A', pt: 2 }}>
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
          <Stack spacing={2}>
            <TextField
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 215, 0, 0.3)'
                  },
                  '&:hover fieldset': {
                    borderColor: '#FFD700'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 215, 0, 0.7)'
                }
              }}
            />
            <TextField
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 215, 0, 0.3)'
                  },
                  '&:hover fieldset': {
                    borderColor: '#FFD700'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 215, 0, 0.7)'
                }
              }}
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 215, 0, 0.3)'
                  },
                  '&:hover fieldset': {
                    borderColor: '#FFD700'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 215, 0, 0.7)'
                }
              }}
            />
            <TextField
              name="phoneNumber"
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 215, 0, 0.3)'
                  },
                  '&:hover fieldset': {
                    borderColor: '#FFD700'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 215, 0, 0.7)'
                }
              }}
            />
            
            {/* Resume Upload Section */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>
                Resume
              </Typography>
              {success && (
                <Typography variant="body2" sx={{ color: '#51cf66', mb: 1 }}>
                  ✅ {success}
                </Typography>
              )}
              <Box sx={{
                border: '2px dashed #ccc',
                borderRadius: 1,
                p: 2,
                textAlign: 'center',
                backgroundColor: 'rgba(255, 215, 0, 0.05)',
                transition: 'border-color 0.2s',
                '&:hover': {
                  borderColor: '#FFD700'
                }
              }}>
                {userProfile?.candidateProfile?.resumeUrl ? (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#006400', mb: 1 }}>
                      📄 {userProfile.candidateProfile.resumeFileName || 'Resume uploaded'}
                    </Typography>
                    <Button 
                      href={userProfile.candidateProfile.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      size="small"
                      sx={{ color: '#006400', mr: 1 }}
                    >
                      View Resume
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    No resume uploaded
                  </Typography>
                )}
                
                <Button
                  component="label"
                  variant="outlined"
                  disabled={resumeUploading}
                  size="small"
                  sx={{
                    mt: 1,
                    borderColor: '#FFD700',
                    color: '#FFD700',
                    '&:hover': {
                      borderColor: '#FFD700',
                      backgroundColor: 'rgba(255, 215, 0, 0.1)'
                    }
                  }}
                >
                  {resumeUploading ? 'Uploading...' : 'Upload Resume'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    style={{ display: 'none' }}
                  />
                </Button>
                
                <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255, 255, 255, 0.5)', mt: 1 }}>
                  Accepted formats: PDF, DOC, DOCX (Max 5MB)
                </Typography>
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#1A1A1A', p: 2 }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              color: 'rgba(255, 215, 0, 0.7)',
              '&:hover': {
                color: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={saving || resumeUploading}
            startIcon={saving ? <CircularProgress size={16} sx={{ color: '#1A1A1A' }} /> : null}
            sx={{ 
              backgroundColor: saving ? 'rgba(255, 215, 0, 0.7)' : '#FFD700',
              color: '#1A1A1A',
              '&:hover': {
                backgroundColor: saving ? 'rgba(255, 215, 0, 0.7)' : 'rgba(255, 215, 0, 0.8)'
              },
              '&:disabled': {
                backgroundColor: 'rgba(255, 215, 0, 0.5)',
                color: 'rgba(26, 26, 26, 0.7)'
              }
            }}
          >
            {saving ? 'Saving Profile...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BasicInfoCard;

