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
  Chip,
  Box,
  Autocomplete,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../utils/axiosConfig';

const AboutMeCard = ({ userProfile, onProfileUpdate }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userProfile.firstName || '',
    lastName: userProfile.lastName || '',
    title: userProfile.title || '',
    bio: userProfile.bio || '',
    location: userProfile.location || '',
    skills: userProfile.candidateProfile?.skills || [],
    education: userProfile.candidateProfile?.education || []
  });
  const [error, setError] = useState(null);

  // Common skills suggestions
  const skillSuggestions = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL',
    'AWS', 'Docker', 'TypeScript', 'HTML', 'CSS', 'Git',
    'Product Management', 'Agile', 'UI/UX Design'
  ];

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSkillsChange = (event, newValue) => {
    setFormData({
      ...formData,
      skills: newValue
    });
  };

  const handleSubmit = async () => {
    try {
      // Update basic user info (first and last name)
      const userResponse = await api.put('/api/user/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      // Update extended profile
      const profileResponse = await api.put('/api/jobseeker/profile', {
        title: formData.title,
        bio: formData.bio,
        location: formData.location,
        skills: formData.skills,
        education: formData.education
      });

      onProfileUpdate({
        ...userResponse.data,
        candidateProfile: profileResponse.data.profile
      });
      handleClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating profile');
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
            About Me
          </Typography>
          <Stack spacing={3}>
            {/* Personal Information Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>
                Personal Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}>
                  Name
                </Typography>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                  {userProfile.firstName} {userProfile.lastName}
                </Typography>
              </Box>
            </Box>

            {/* Professional Information */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>
                Professional Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}>
                  Title
                </Typography>
                <Typography>
                  {userProfile.title || 'Not specified'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}>
                  Location
                </Typography>
                <Typography>
                  {userProfile.location || 'Not specified'}
                </Typography>
              </Box>
            </Box>

            {/* Bio Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>
                Bio
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                {userProfile.bio || 'No bio provided'}
              </Typography>
            </Box>

            {/* Skills Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>
                Skills
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {userProfile.candidateProfile?.skills?.map((skill) => (
                  <Chip 
                    key={skill}
                    label={skill}
                    sx={{
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      color: '#FFD700',
                      borderColor: 'rgba(255, 215, 0, 0.3)'
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#1A1A1A', color: '#FFD700' }}>
          Edit Profile Information
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#1A1A1A', pt: 2 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Stack spacing={3}>
            {/* Personal Information Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 2 }}>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#FFD700',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 215, 0, 0.7)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#FFD700',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 215, 0, 0.7)',
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Professional Information Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 2 }}>
                Professional Information
              </Typography>
              <Stack spacing={2}>
                <TextField
                  name="title"
                  label="Professional Title"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 215, 0, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#FFD700',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 215, 0, 0.7)',
                    }
                  }}
                />
                <TextField
                  name="location"
                  label="Location"
                  value={formData.location}
                  onChange={handleChange}
                  fullWidth
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 215, 0, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#FFD700',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 215, 0, 0.7)',
                    }
                  }}
                />
              </Stack>
            </Box>

            {/* Bio Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 2 }}>
                Bio
              </Typography>
              <TextField
                name="bio"
                label="Bio"
                value={formData.bio}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 215, 0, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#FFD700',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 215, 0, 0.7)',
                  }
                }}
              />
            </Box>

            {/* Skills Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#FFD700', mb: 2 }}>
                Skills
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={skillSuggestions}
                value={formData.skills}
                onChange={handleSkillsChange}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      label={option}
                      sx={{
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        color: '#FFD700',
                        borderColor: 'rgba(255, 215, 0, 0.3)'
                      }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Skills"
                    placeholder="Add skills"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#FFD700',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 215, 0, 0.7)',
                      }
                    }}
                  />
                )}
              />
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
            sx={{ 
              backgroundColor: '#FFD700',
              color: '#1A1A1A',
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.8)'
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AboutMeCard;
