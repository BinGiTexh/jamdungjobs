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
  DialogActions
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { LocationAutocomplete } from '../common/LocationAutocomplete';
import { SkillsAutocomplete } from '../common/SkillsAutocomplete';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const CandidateDashboard = () => {
  const { user } = useAuth();
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
        const [profileRes, applicationsRes, savedJobsRes] = await Promise.all([
          axios.get('/api/candidate/profile'),
          axios.get('/api/applications/candidate'),
          axios.get('/api/jobs/saved')
        ]);
        
        setProfile(profileRes.data);
        setApplications(applicationsRes.data);
        setSavedJobs(savedJobsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setMessage({ type: 'error', text: 'Failed to load dashboard data' });
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
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>

        {message && (
          <Box sx={{ mb: 2, p: 2, bgcolor: message.type === 'error' ? 'error.light' : 'success.light', borderRadius: 1 }}>
            <Typography color={message.type === 'error' ? 'error' : 'success'}>
              {message.text}
            </Typography>
          </Box>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Profile" />
            <Tab label="Applications" />
            <Tab label="Saved Jobs" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Professional Title"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                />
              </Grid>

              <Grid item xs={12}>
                <LocationAutocomplete
                  value={profile.location}
                  onChange={(value) => setProfile({ ...profile, location: value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Professional Summary"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <SkillsAutocomplete
                  value={profile.skills}
                  onChange={(value) => setProfile({ ...profile, skills: value })}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle1">Resume</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => setShowResumeDialog(true)}
                  >
                    {profile.resumeUrl ? 'Update Resume' : 'Upload Resume'}
                  </Button>
                  {profile.resumeUrl && (
                    <Button
                      variant="text"
                      href={profile.resumeUrl}
                      target="_blank"
                    >
                      View Resume
                    </Button>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleProfileUpdate}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Applications ({applications.length})
            </Typography>
            <Grid container spacing={2}>
              {applications.map((application) => (
                <Grid item xs={12} key={application.id}>
                  <Paper sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={8}>
                        <Typography variant="h6">{application.job.title}</Typography>
                        <Typography color="text.secondary">
                          {application.job.company.name}
                        </Typography>
                        <Chip
                          label={application.status}
                          color={
                            application.status === 'ACCEPTED' ? 'success' :
                            application.status === 'REJECTED' ? 'error' :
                            application.status === 'PENDING' ? 'warning' : 'default'
                          }
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                        <Button
                          variant="outlined"
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
                  <Typography color="text.secondary" align="center">
                    You haven't applied to any jobs yet.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        {activeTab === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Saved Jobs ({savedJobs.length})
            </Typography>
            <Grid container spacing={2}>
              {savedJobs.map((job) => (
                <Grid item xs={12} key={job.id}>
                  <Paper sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={8}>
                        <Typography variant="h6">{job.title}</Typography>
                        <Typography color="text.secondary">
                          {job.company.name} • {job.location}
                        </Typography>
                        {job.salary && (
                          <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                            ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                        <Button
                          variant="contained"
                          href={`/jobs/${job.id}`}
                          sx={{ mr: 1 }}
                        >
                          Apply
                        </Button>
                        <IconButton
                          color="error"
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
                  <Typography color="text.secondary" align="center">
                    You haven't saved any jobs yet.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
      </Box>

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
    </Container>
  );
};

export default CandidateDashboard;
