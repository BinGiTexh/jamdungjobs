import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  styled,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  CircularProgress,
  TextField,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
// Icons
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { logError } from '../../utils/loggingUtils';
import api from '../../utils/axiosConfig';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: 'rgba(20, 20, 20, 0.85)',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)'
  }
}));

const StatusChip = styled(Chip)(({ status }) => {
  const statusColors = {
    PENDING: { bg: 'rgba(255, 152, 0, 0.1)', color: '#FFA726' },
    REVIEWING: { bg: 'rgba(33, 150, 243, 0.1)', color: '#42A5F5' },
    ACCEPTED: { bg: 'rgba(76, 175, 80, 0.1)', color: '#81C784' },
    REJECTED: { bg: 'rgba(244, 67, 54, 0.1)', color: '#E57373' },
    INTERVIEWING: { bg: 'rgba(156, 39, 176, 0.1)', color: '#BA68C8' }
  };

  return {
    backgroundColor: statusColors[status]?.bg || 'rgba(158, 158, 158, 0.1)',
    color: statusColors[status]?.color || '#9E9E9E',
    border: `1px solid ${statusColors[status]?.color || '#9E9E9E'}`,
    '& .MuiChip-label': {
      fontWeight: 500
    }
  };
});

const ApplicationsList = ({ jobListings }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeApplicationId, setActiveApplicationId] = useState(null);
  const [filterJob, setFilterJob] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/employer/applications');
      const appsArray = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.applications)
          ? response.data.applications
          : [];
      setApplications(appsArray);
      setError(null);
    } catch (err) {
      logError('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await api.put(`/api/employer/applications/${applicationId}/status`, { status: newStatus });
      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      handleMenuClose();
    } catch (err) {
      logError('Error updating application status:', err);
      setError('Failed to update application status. Please try again.');
    }
  };

  const handleNotesUpdate = async (applicationId) => {
    try {
      await api.put(`/api/employer/applications/${applicationId}/notes`, { notes });
      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, notes } : app
      ));
      setDetailsOpen(false);
    } catch (err) {
      logError('Error updating application notes:', err);
      setError('Failed to update notes. Please try again.');
    }
  };

  const handleMenuClick = (event, application) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveApplicationId(application.id);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveApplicationId(null);
  };

  const handleDetailsOpen = (application) => {
    setSelectedApplication(application);
    setNotes(application.notes || '');
    setDetailsOpen(true);
  };

  const filteredApplications = applications.filter(app => {
    const jobMatch = filterJob === 'all' || app.jobId === filterJob;
    const statusMatch = filterStatus === 'all' || app.status === filterStatus;
    return jobMatch && statusMatch;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress sx={{ color: '#FFD700' }} />
      </Box>
    );
  }

  return (
    <Fade in={true}>
      <Box>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Filter by Job</InputLabel>
                <Select
                  value={filterJob}
                  onChange={(e) => setFilterJob(e.target.value)}
                  sx={{ color: '#FFFFFF' }}
                >
                  <MenuItem value="all">All Jobs</MenuItem>
                  {jobListings.map(job => (
                    <MenuItem key={job.id} value={job.id}>{job.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{ color: '#FFFFFF' }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="REVIEWING">Reviewing</MenuItem>
                  <MenuItem value="INTERVIEWING">Interviewing</MenuItem>
                  <MenuItem value="ACCEPTED">Accepted</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {filteredApplications.length === 0 ? (
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', mt: 4 }}>
            No applications found matching your filters
          </Typography>
        ) : (
          filteredApplications.map(application => (
            <StyledPaper key={application.id}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar 
                    src={application.candidate?.avatar || ''}
                    alt={(application.user ? `${application.user.firstName || ''} ${application.user.lastName || ''}`.trim() : application.candidate?.name) || 'Candidate'}
                    sx={{ width: 60, height: 60 }}
                  />
                </Grid>
                <Grid item xs>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
                    {(application.user ? `${application.user.firstName || ''} ${application.user.lastName || ''}`.trim() : application.candidate?.name) || 'Unknown Candidate'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmailIcon sx={{ color: 'rgba(255, 215, 0, 0.7)', fontSize: 18 }} />
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                        {application.candidate?.email || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <WorkIcon sx={{ color: 'rgba(255, 215, 0, 0.7)', fontSize: 18 }} />
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                        {jobListings.find(job => job.id === application.jobId)?.title || 'Unknown Position'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ color: 'rgba(255, 215, 0, 0.7)', fontSize: 18 }} />
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                        {(() => { const d = application.appliedDate || application.createdAt || application.applied_at; return d ? `Applied ${new Date(d).toLocaleDateString()}` : 'Applied –'; })()}
                      </Typography>
                    </Box>
                  </Box>
                  <StatusChip
                    status={application.status}
                    label={application.status}
                  />
                </Grid>
                <Grid item>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleDetailsOpen(application)}
                      sx={{
                        borderColor: 'rgba(255, 215, 0, 0.3)',
                        color: '#FFD700',
                        '&:hover': {
                          borderColor: '#FFD700',
                          backgroundColor: 'rgba(255, 215, 0, 0.1)'
                        }
                      }}
                    >
                      View Details
                    </Button>
                    <IconButton
                      onClick={(e) => handleMenuClick(e, application)}
                      sx={{ color: '#FFD700' }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </StyledPaper>
          ))
        )}

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: '#1A1A1A',
              border: '1px solid rgba(255, 215, 0, 0.3)'
            }
          }}
        >
          <MenuItem onClick={() => handleStatusChange(activeApplicationId, 'REVIEWING')}>
            <Typography sx={{ color: '#42A5F5' }}>Mark as Reviewing</Typography>
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange(activeApplicationId, 'INTERVIEWING')}>
            <Typography sx={{ color: '#BA68C8' }}>Set to Interviewing</Typography>
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange(activeApplicationId, 'ACCEPTED')}>
            <Typography sx={{ color: '#81C784' }}>Accept Application</Typography>
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange(activeApplicationId, 'REJECTED')}>
            <Typography sx={{ color: '#E57373' }}>Reject Application</Typography>
          </MenuItem>
        </Menu>

        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#1A1A1A',
              border: '1px solid rgba(255, 215, 0, 0.3)'
            }
          }}
        >
          {selectedApplication && (
            <>
              <DialogTitle sx={{ color: '#FFD700' }}>
                Application Details
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                    Candidate Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        <strong>Name:</strong> {(selectedApplication.user ? `${selectedApplication.user.firstName || ''} ${selectedApplication.user.lastName || ''}`.trim() : selectedApplication.candidate?.name) || 'Unknown Candidate'}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        <strong>Email:</strong> {selectedApplication.user?.email || selectedApplication.candidate?.email || 'N/A'}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        <strong>Phone:</strong> {selectedApplication.user?.phoneNumber || selectedApplication.candidate?.phone || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        <strong>Status:</strong> {selectedApplication.status}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {(() => { const d = selectedApplication.appliedDate || selectedApplication.createdAt || selectedApplication.applied_at; return <><strong>Applied Date:</strong> {d ? new Date(d).toLocaleDateString() : '—'}</>; })()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                    Notes
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        '& fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.3)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.5)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FFD700'
                        }
                      }
                    }}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setDetailsOpen(false)}
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleNotesUpdate(selectedApplication.id)}
                  variant="contained"
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#000000',
                    '&:hover': {
                      backgroundColor: '#FFE44D'
                    }
                  }}
                >
                  Save Notes
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Fade>
  );
};

export default ApplicationsList;
