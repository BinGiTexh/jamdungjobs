import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Fade,
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import { format } from 'date-fns';
import axios from 'axios';
import { buildApiUrl } from '../../config';
import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';

const ApplicationsReview = ({ jobId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    setLoading(true);
    const endpoint = jobId 
      ? buildApiUrl(`/jobs/${jobId}/applications`) 
      : buildApiUrl('/applications/employer');
    
    try {
      const response = await axios.get(endpoint);
      setApplications(response.data);
      logDev('debug', 'Applications fetched successfully', { 
        count: response.data?.length || 0,
        forJobId: jobId || 'all'
      });
    } catch (err) {
      logError('Error fetching applications', err, {
        module: 'ApplicationsReview',
        endpoint: endpoint,
        jobId: jobId || 'all',
        status: err.response?.status
      });
      setError('Failed to load applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDownloadResume = async (applicationId, resumeUrl) => {
    try {
      const response = await axios.get(resumeUrl, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-${applicationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      logDev('debug', 'Resume downloaded successfully', { applicationId });
    } catch (err) {
      logError('Error downloading resume', err, {
        module: 'ApplicationsReview',
        function: 'handleDownloadResume',
        applicationId,
        status: err.response?.status
      });
      setError('Failed to download resume. Please try again.');
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setStatusUpdateLoading(true);
    try {
      await axios.patch(buildApiUrl(`/applications/${applicationId}/status`), {
        status: newStatus
      });
      
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      
      if (selectedApplication && selectedApplication.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }
      logDev('debug', 'Application status updated', {
        applicationId,
        oldStatus: selectedApplication?.status,
        newStatus
      });
    } catch (err) {
      logError('Error updating application status', err, {
        module: 'ApplicationsReview',
        function: 'handleStatusChange',
        applicationId,
        newStatus,
        oldStatus: selectedApplication?.status,
        status: err.response?.status
      });
      setError('Failed to update application status. Please try again.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!feedback.trim() || !selectedApplication) return;
    
    try {
      await axios.post(buildApiUrl(`/applications/${selectedApplication.id}/feedback`), {
        message: feedback
      });
      
      setFeedback('');
      setFeedbackDialogOpen(false);
      logDev('debug', 'Feedback sent successfully', {
        applicationId: selectedApplication.id,
        recipientId: selectedApplication.user?.id
      });
    } catch (err) {
      logError('Error sending feedback', err, {
        module: 'ApplicationsReview',
        function: 'handleSendFeedback',
        applicationId: selectedApplication?.id,
        recipientId: selectedApplication?.user?.id,
        messageLength: feedback?.length,
        status: err.response?.status
      });
      setError('Failed to send feedback. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const filteredApplications = applications.filter(app => {
    if (tabValue === 0) return true; // All applications
    if (tabValue === 1) return ['APPLIED', 'REVIEWING'].includes(app.status); // New
    if (tabValue === 2) return ['INTERVIEW'].includes(app.status); // In Progress
    if (tabValue === 3) return ['OFFERED', 'REJECTED', 'WITHDRAWN'].includes(app.status); // Closed
    return true;
  });

  const statusOptions = [
    { value: 'APPLIED', label: 'Applied' },
    { value: 'REVIEWING', label: 'Reviewing' },
    { value: 'INTERVIEW', label: 'Interview' },
    { value: 'OFFERED', label: 'Offered' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPLIED':
        return { bg: '#e3f2fd', color: '#1565c0' }; // Blue
      case 'REVIEWING':
        return { bg: '#fff8e1', color: '#f57f17' }; // Amber
      case 'INTERVIEW':
        return { bg: '#e8f5e9', color: '#2e7d32' }; // Green
      case 'OFFERED':
        return { bg: '#f3e5f5', color: '#7b1fa2' }; // Purple
      case 'REJECTED':
        return { bg: '#ffebee', color: '#c62828' }; // Red
      case 'WITHDRAWN':
        return { bg: '#fafafa', color: '#616161' }; // Grey
      default:
        return { bg: '#e0e0e0', color: '#212121' }; // Default grey
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ width: '100%' }}>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            fontWeight: 700, 
            color: '#2C5530',
            mb: 3,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-10px',
              left: 0,
              width: '80px',
              height: '4px',
              background: 'linear-gradient(90deg, #2C5530, #FFD700)',
              borderRadius: '2px',
            }
          }}
        >
          {jobId ? 'Applications for This Job' : 'All Applications'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              },
              '& .Mui-selected': {
                color: '#2C5530',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFD700',
                height: 3,
              },
            }}
          >
            <Tab label="All Applications" />
            <Tab label="New" />
            <Tab label="In Progress" />
            <Tab label="Closed" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: '#2C5530' }} />
          </Box>
        ) : filteredApplications.length === 0 ? (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: '#f9f9f9'
            }}
          >
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No applications found
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {tabValue === 0 
                ? "You don't have any applications yet." 
                : "You don't have any applications in this category."}
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Applicant</TableCell>
                  {!jobId && <TableCell sx={{ fontWeight: 700 }}>Job Title</TableCell>}
                  <TableCell sx={{ fontWeight: 700 }}>Applied On</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.map((application) => {
                  const statusStyle = getStatusColor(application.status);
                  return (
                    <TableRow key={application.id} hover>
                      <TableCell>
                        {application.user?.firstName} {application.user?.lastName}
                      </TableCell>
                      {!jobId && <TableCell>{application.job.title}</TableCell>}
                      <TableCell>{formatDate(application.createdAt)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={application.status.replace('_', ' ')} 
                          sx={{ 
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            fontWeight: 600,
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewDetails(application)}
                              sx={{ color: '#2C5530' }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Resume">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadResume(application.id, application.resumeUrl)}
                              sx={{ color: '#2C5530' }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Contact Applicant">
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                setSelectedApplication(application);
                                setFeedbackDialogOpen(true);
                              }}
                              sx={{ color: '#2C5530' }}
                            >
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Application Details Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedApplication && (
            <>
              <DialogTitle sx={{ 
                fontWeight: 700, 
                color: '#2C5530',
                borderBottom: '1px solid #e0e0e0',
                pb: 2
              }}>
                Application Details
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Applicant</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {selectedApplication.user?.firstName} {selectedApplication.user?.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedApplication.user?.email}
                    </Typography>
                  </Grid>
                  {/* Add more application details */}
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button 
                  onClick={handleCloseDialog}
                  sx={{ color: '#2C5530' }}
                >
                  Close
                </Button>
                <Button 
                  variant="contained"
                  onClick={() => handleDownloadResume(selectedApplication.id, selectedApplication.resumeUrl)}
                  startIcon={<DownloadIcon />}
                  sx={{
                    background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                    color: '#000',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                    }
                  }}
                >
                  Download Resume
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog
          open={feedbackDialogOpen}
          onClose={() => setFeedbackDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ 
            fontWeight: 700, 
            color: '#2C5530',
            borderBottom: '1px solid #e0e0e0',
            pb: 2
          }}>
            Contact Applicant
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {selectedApplication && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Send a message to {selectedApplication.user?.firstName} {selectedApplication.user?.lastName}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Message"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write your message here..."
                  sx={{ mt: 2 }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button 
              onClick={() => setFeedbackDialogOpen(false)}
              sx={{ color: '#2C5530' }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained"
              onClick={handleSendFeedback}
              disabled={!feedback.trim()}
              sx={{
                background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                color: '#000',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                }
              }}
            >
              Send Message
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default ApplicationsReview;
