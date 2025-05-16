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
  styled
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { LocationAutocomplete } from '../common/LocationAutocomplete';
import { SkillsAutocomplete } from '../common/SkillsAutocomplete';
import { SalaryDisplay } from '../common/SalaryDisplay';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

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
  backgroundColor: 'rgba(20, 20, 20, 0.85)',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
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
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: '#FFD700',
  },
}));

const CandidateDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  const handleUnsaveJob = async (jobId) => {
    try {
      await axios.delete(`/api/jobs/${jobId}/save`);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      setMessage({ type: 'success', text: 'Job removed from saved jobs' });
    } catch (error) {
      console.error('Error unsaving job:', error);
      setMessage({ type: 'error', text: 'Failed to remove job from saved jobs' });
    }
  };

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    title: '',
    bio: '',
    location: '',
    skills: [],
    experience: [],
    education: [],
    resumeUrl: null
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Use individual try/catch blocks for each API call to handle them independently
        try {
          const profileRes = await axios.get('/api/candidate/profile');
          setProfile(profileRes.data);
        } catch (profileError) {
          console.error('Error fetching profile data:', profileError);
          // Set default profile data instead of showing error
          setProfile({
            firstName: '',
            lastName: '',
            title: '',
            bio: '',
            location: '',
            skills: [],
            resumeUrl: null
          });
        }
        
        try {
          const applicationsRes = await axios.get('/api/applications/candidate');
          setApplications(applicationsRes.data);
        } catch (applicationsError) {
          console.error('Error fetching applications:', applicationsError);
          setApplications([]);
        }
        
        try {
          const savedJobsRes = await axios.get('/api/jobs/saved');
          setSavedJobs(savedJobsRes.data);
        } catch (savedJobsError) {
          console.error('Error fetching saved jobs:', savedJobsError);
          setSavedJobs([]);
        }
        
        // Show welcome message for new users instead of error
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

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      await axios.put('/api/candidate/profile', profile);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post('/api/candidate/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfile(prev => ({
        ...prev,
        resumeUrl: response.data.resumeUrl
      }));

      setMessage({ type: 'success', text: 'Resume uploaded successfully' });
    } catch (error) {
      console.error('Error uploading resume:', error);
      setMessage({ type: 'error', text: 'Failed to upload resume' });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
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
        <Box
          sx={{
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
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
            <CircularProgress sx={{ color: '#FFD700' }} />
          </Box>
        </Container>
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
      <Box
        sx={{
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
        }}
      />
      
      <StyledContainer maxWidth="lg">
        <Box sx={{ py: 4, position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: '#FFD700',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 4
            }}
          >
            Welcome back, {user?.firstName}!
          </Typography>

          {message && (
            <Alert 
              severity={message.type === 'success' ? 'success' : 'error'}
              sx={{ 
                mb: 3,
                '& .MuiAlert-icon': {
                  color: message.type === 'success' ? '#2C5530' : '#CD2B2B'
                },
                backgroundColor: message.type === 'success' 
                  ? 'rgba(44, 85, 48, 0.1)' 
                  : 'rgba(205, 43, 43, 0.1)',
                color: message.type === 'success' ? '#E8F5E9' : '#f8d7da',
                border: message.type === 'success' 
                  ? '1px solid rgba(44, 85, 48, 0.3)' 
                  : '1px solid rgba(205, 43, 43, 0.3)',
              }}
            >
              {message.text}
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ 
              mb: 3,
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFD700',
              },
              borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
            }}
          >
            <StyledTab label="Profile" />
            <StyledTab label="Applications" />
            <StyledTab label="Saved Jobs" />
          </Tabs>

          {activeTab === 0 && (
            <StyledPaper>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profile.firstName || ''}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    margin="normal"
                    InputProps={{
                      sx: {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 215, 0, 0.6)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FFD700',
                        },
                      },
                    }}
                    InputLabelProps={{
                      sx: { color: 'rgba(255, 255, 255, 0.7)' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profile.lastName || ''}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    margin="normal"
                    InputProps={{
                      sx: {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 215, 0, 0.6)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FFD700',
                        },
                      },
                    }}
                    InputLabelProps={{
                      sx: { color: 'rgba(255, 255, 255, 0.7)' },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Professional Title"
                    value={profile.title || ''}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    margin="normal"
                    placeholder="e.g., Senior Web Developer"
                    InputProps={{
                      sx: {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 215, 0, 0.6)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FFD700',
                        },
                      },
                    }}
                    InputLabelProps={{
                      sx: { color: 'rgba(255, 255, 255, 0.7)' },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    margin="normal"
                    multiline
                    rows={4}
                    placeholder="Tell employers about yourself, your experience, and what you're looking for"
                    InputProps={{
                      sx: {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 215, 0, 0.6)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FFD700',
                        },
                      },
                    }}
                    InputLabelProps={{
                      sx: { color: 'rgba(255, 255, 255, 0.7)' },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <LocationAutocomplete
                    value={profile.location || ''}
                    onChange={(location) => setProfile({ ...profile, location })}
                    label="Location"
                  />
                </Grid>
                <Grid item xs={12}>
                  <SkillsAutocomplete
                    value={profile.skills || []}
                    onChange={(skills) => setProfile({ ...profile, skills })}
                    label="Skills"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mr: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                      Resume:
                    </Typography>
                    {profile.resumeUrl ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label="Resume Uploaded"
                          sx={{ mr: 2, bgcolor: 'rgba(44, 85, 48, 0.2)', color: '#E8F5E9', border: '1px solid rgba(44, 85, 48, 0.3)' }}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(profile.resumeUrl, '_blank')}
                          sx={{
                            color: '#FFD700',
                            borderColor: '#FFD700',
                            '&:hover': {
                              borderColor: '#FFD700',
                              backgroundColor: 'rgba(255, 215, 0, 0.1)'
                            }
                          }}
                        >
                          View
                        </Button>
                        <IconButton
                          onClick={() => setShowResumeDialog(true)}
                          sx={{ ml: 1, color: '#FFD700' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        onClick={() => setShowResumeDialog(true)}
                        startIcon={<CloudUploadIcon />}
                        sx={{
                          color: '#FFD700',
                          borderColor: '#FFD700',
                          '&:hover': {
                            borderColor: '#FFD700',
                            backgroundColor: 'rgba(255, 215, 0, 0.1)'
                          }
                        }}
                      >
                        Upload Resume
                      </Button>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                      color: '#000',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </Grid>
              </Grid>
            </StyledPaper>
          )}

          {activeTab === 1 && (
            <StyledPaper>
              <Typography variant="h6" gutterBottom sx={{ color: '#FFD700', fontWeight: 600, mb: 2 }}>
                Applications ({applications.length})
              </Typography>
              <Grid container spacing={2}>
                {applications.map((application) => (
                  <Grid item xs={12} key={application.id}>
                    <Paper sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(255, 255, 255, 0.08)', 
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={8}>
                          <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{application.job.title}</Typography>
                          <Typography sx={{ color: 'rgba(255, 215, 0, 0.8)' }}>
                            {application.job.company.name} • {application.job.location}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, color: '#FFFFFF' }}>
                            Status: <Chip size="small" label={application.status} sx={{ backgroundColor: '#2C5530', color: '#FFD700', fontWeight: 500 }} />
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{ 
                              mr: 1,
                              color: '#FFD700',
                              borderColor: 'rgba(255, 215, 0, 0.5)',
                              '&:hover': {
                                borderColor: '#FFD700',
                                backgroundColor: 'rgba(255, 215, 0, 0.08)'
                              }
                            }}
                            href={`/applications/${application.id}`}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                              color: '#000',
                              fontWeight: 600,
                              '&:hover': {
                                background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                              }
                            }}
                            href={`/jobs/${application.job.id}`}
                          >
                            View Job
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
                {applications.length === 0 && (
                  <Grid item xs={12}>
                    <Typography sx={{ color: 'rgba(255, 215, 0, 0.7)', fontWeight: 500 }} align="center">
                      You haven't applied to any jobs yet.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </StyledPaper>
          )}

          {activeTab === 2 && (
            <StyledPaper>
              <Typography variant="h6" gutterBottom sx={{ color: '#FFD700', fontWeight: 600, mb: 2 }}>
                Saved Jobs ({savedJobs.length})
              </Typography>
              <Grid container spacing={2}>
                {savedJobs.map((job) => (
                  <Grid item xs={12} key={job.id}>
                    <Paper sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(255, 255, 255, 0.08)', 
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={8}>
                          <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{job.title}</Typography>
                          <Typography sx={{ color: 'rgba(255, 215, 0, 0.8)' }}>
                            {job.company.name} • {job.location}
                          </Typography>
                          {job.salary && (
                            <Box sx={{ mt: 1 }}>
                              <SalaryDisplay salary={job.salary} />
                            </Box>
                          )}
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                          <Button
                            variant="contained"
                            href={`/jobs/${job.id}`}
                            sx={{ 
                              mr: 1,
                              background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                              color: '#000',
                              fontWeight: 600,
                              '&:hover': {
                                background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                              }
                            }}
                          >
                            Apply
                          </Button>
                          <IconButton
                            sx={{ 
                              color: '#FFD700',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                color: '#FF5252'
                              }
                            }}
                            onClick={() => handleUnsaveJob(job.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
                {savedJobs.length === 0 && (
                  <Grid item xs={12}>
                    <Typography sx={{ color: 'rgba(255, 215, 0, 0.7)', fontWeight: 500 }} align="center">
                      You haven't saved any jobs yet.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </StyledPaper>
          )}
        </Box>
      </StyledContainer>

      <Dialog open={showResumeDialog} onClose={() => setShowResumeDialog(false)}>
        <DialogTitle>Upload Resume</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleResumeUpload(e.target.files[0]);
                setShowResumeDialog(false);
              }
            }}
            style={{ display: 'none' }}
            id="resume-upload"
          />
          <label htmlFor="resume-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 2 }}
            >
              Choose File
            </Button>
          </label>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResumeDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CandidateDashboard;
