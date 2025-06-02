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
  Grid
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { buildApiUrl } from '../../config';
import { format } from 'date-fns';
import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Get the token directly from localStorage
      const token = localStorage.getItem('jamdung_auth_token');
      
      // Log the token presence (not the actual token)
      logDev('debug', 'Fetching applications - pre request', { 
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        endpoint: '/applications/my' 
      });
      
      // If no token is available, throw an error to be handled
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Create a specific instance with the token for this request
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // Make the request with explicit headers
      const response = await axios.get(buildApiUrl('/applications/my'), { headers });
      
      // Add more detailed response logging
      logDev('debug', 'Applications fetched successfully', { 
        count: response.data?.applications?.length || 0,
        hasApplications: Array.isArray(response.data?.applications),
        responseStatus: response.status,
        contentType: response.headers?.['content-type']
      });
      
      // Log the full response structure (sanitized)
      logDev('debug', 'Applications response structure', {
        dataKeys: Object.keys(response.data || {}),
        isApplicationsArray: Array.isArray(response.data?.applications),
        firstApplication: response.data?.applications?.[0] ? 
          { id: response.data.applications[0].id, status: response.data.applications[0].status } : null
      });
      
      setApplications(response.data.applications || []);
      // Clear any previous errors
      setError(null);
    } catch (err) {
      // Add more detailed error logging
      logError('Error fetching applications', err, {
        module: 'ApplicationsList',
        function: 'fetchApplications',
        endpoint: '/applications/my',
        errorStatus: err.response?.status,
        errorData: sanitizeForLogging(err.response?.data),
        errorMessage: err.message,
        hasResponse: !!err.response
      });
      
      // Handle different error cases
      if (err.message === 'Authentication token not found. Please log in again.') {
        setError('Please log in to view your applications.');
      } else if (err.response && err.response.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response && err.response.status !== 404) {
        setError('Failed to load your applications. Please try again later.');
      }
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
      
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-${applicationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      logError('Error downloading resume', err, sanitizeForLogging({
        module: 'ApplicationsList',
        function: 'handleDownloadResume',
        applicationId,
        errorStatus: err.response?.status
      }));
      setError('Failed to download resume. Please try again.');
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      try {
        await axios.delete(buildApiUrl(`/applications/${applicationId}`));
        // Remove from state
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        logDev('debug', 'Application withdrawn successfully', sanitizeForLogging({ 
          applicationId,
          action: 'withdraw'
        }));
      } catch (err) {
        logError('Error withdrawing application', err, sanitizeForLogging({
          module: 'ApplicationsList',
          function: 'handleDeleteApplication',
          applicationId,
          errorStatus: err.response?.status,
          action: 'withdraw'
        }));
        setError('Failed to withdraw application. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPLIED':
        return { bg: 'rgba(21, 101, 192, 0.2)', color: '#64b5f6' }; // Blue
      case 'REVIEWING':
        return { bg: 'rgba(245, 127, 23, 0.2)', color: '#ffd54f' }; // Amber
      case 'INTERVIEW':
        return { bg: 'rgba(46, 125, 50, 0.2)', color: '#81c784' }; // Green
      case 'OFFERED':
        return { bg: 'rgba(123, 31, 162, 0.2)', color: '#ce93d8' }; // Purple
      case 'REJECTED':
        return { bg: 'rgba(198, 40, 40, 0.2)', color: '#ef9a9a' }; // Red
      case 'WITHDRAWN':
        return { bg: 'rgba(97, 97, 97, 0.2)', color: '#bdbdbd' }; // Grey
      default:
        return { bg: 'rgba(33, 33, 33, 0.2)', color: '#e0e0e0' }; // Default grey
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const filteredApplications = applications.filter(app => {
    if (tabValue === 0) return true; // All applications
    if (tabValue === 1) return ['APPLIED', 'REVIEWING', 'INTERVIEW'].includes(app.status); // Active
    if (tabValue === 2) return ['OFFERED'].includes(app.status); // Offered
    if (tabValue === 3) return ['REJECTED', 'WITHDRAWN'].includes(app.status); // Closed
    return true;
  });

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ color: 'white' }}>
        {/* Title moved to parent ApplicationsPage component */}

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 215, 0, 0.3)', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFD700',
              },
            }}
          >
            <Tab label="All Applications" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&.Mui-selected': { color: '#FFD700' } }} />
            <Tab label="Active" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&.Mui-selected': { color: '#FFD700' } }} />
            <Tab label="Offered" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&.Mui-selected': { color: '#FFD700' } }} />
            <Tab label="Closed" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&.Mui-selected': { color: '#FFD700' } }} />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: '#FFD700' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ 
            mb: 3,
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            color: '#ff6b6b',
            border: '1px solid #ff6b6b'
          }}>
            {error}
          </Alert>
        ) : filteredApplications.length === 0 ? (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: 'rgba(249, 249, 249, 0.9)',
              border: '1px solid rgba(255, 215, 0, 0.1)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <img 
                src="/images/icons/application-empty.svg" 
                alt="No applications" 
                style={{ width: '100px', height: '100px', opacity: 0.7 }} 
                onError={(e) => {
                  e.target.src = 'https://img.icons8.com/fluency/96/null/document.png';
                }}
              />
            </Box>
            <Typography variant="h6" sx={{ color: '#2C5530', fontWeight: 600 }} gutterBottom>
              {tabValue === 0 ? "Ready to start your career journey?" : "Nothing here yet"}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph sx={{ maxWidth: '500px', mx: 'auto' }}>
              {tabValue === 0 
                ? "Your job applications will appear here once you start applying. Browse available jobs to find your perfect match in Jamaica." 
                : "You don't have any applications in this category yet. Keep applying to see updates here."}
            </Typography>
            <Button 
              variant="contained"
              href="/jobs"
              sx={{
                mt: 2,
                background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                color: '#000',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                },
                transition: 'all 0.3s ease',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.2
              }}
            >
              Explore Jobs
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ 
            mb: 4, 
            backgroundColor: 'rgba(20, 20, 20, 0.85)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}>
            <Table sx={{ '& .MuiTableCell-root': { borderColor: 'rgba(255, 215, 0, 0.1)' } }}>
              <TableHead sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                <TableRow>
                  <TableCell sx={{ color: '#FFD700', fontWeight: 600 }}>Job Title</TableCell>
                  <TableCell sx={{ color: '#FFD700', fontWeight: 600 }}>Company</TableCell>
                  <TableCell sx={{ color: '#FFD700', fontWeight: 600 }}>Applied On</TableCell>
                  <TableCell sx={{ color: '#FFD700', fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: '#FFD700', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.map((application) => {
                  const statusStyle = getStatusColor(application.status);
                  return (
                    <TableRow key={application.id} hover>
                      <TableCell sx={{ color: 'white' }}>{application.job.title}</TableCell>
                      <TableCell sx={{ color: 'white' }}>{application.job.company.name}</TableCell>
                      <TableCell sx={{ color: 'white' }}>{formatDate(application.createdAt)}</TableCell>
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
                              sx={{ color: '#FFD700' }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Resume">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadResume(application.id, application.resumeUrl)}
                              sx={{ color: '#007E1B' }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {['APPLIED', 'REVIEWING'].includes(application.status) && (
                            <Tooltip title="Withdraw Application">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteApplication(application.id)}
                                sx={{ color: '#ff6b6b' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
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
          PaperProps={{
            style: {
              backgroundColor: 'rgba(20, 20, 20, 0.95)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              color: 'white'
            }
          }}
        >
          {selectedApplication && (
            <>
              <DialogTitle sx={{ 
                fontWeight: 700, 
                borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
                pb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#FFD700'
              }}>
                Application Details
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)' }}>Job Title</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2, color: 'white' }}>
                      {selectedApplication.job.title}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)' }}>Company</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2, color: 'white' }}>
                      {selectedApplication.job.company.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)' }}>Applied On</Typography>
                    <Typography variant="body1" sx={{ mb: 2, color: 'white' }}>
                      {formatDate(selectedApplication.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)' }}>Status</Typography>
                    <Chip 
                      label={selectedApplication.status.replace('_', ' ')} 
                      sx={{ 
                        backgroundColor: getStatusColor(selectedApplication.status).bg,
                        color: getStatusColor(selectedApplication.status).color,
                        fontWeight: 600,
                        mb: 2
                      }} 
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)' }}>Cover Letter</Typography>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: 'rgba(30, 30, 30, 0.7)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: 'white' }}>
                        {selectedApplication.coverLetter || 'No cover letter provided'}
                      </Typography>
                    </Paper>
                  </Grid>
                  {selectedApplication.additionalInfo && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 215, 0, 0.7)' }}>Additional Information</Typography>
                      <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: 'rgba(30, 30, 30, 0.7)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: 'white' }}>
                          {selectedApplication.additionalInfo}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255, 215, 0, 0.3)' }}>
                <Button 
                  onClick={handleCloseDialog}
                  sx={{
                    color: '#FFD700',
                    borderColor: '#FFD700',
                    border: '1px solid',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.1)'
                    }
                  }}
                >
                  Close
                </Button>
                <Button 
                  variant="contained"
                  onClick={() => handleDownloadResume(selectedApplication.id, selectedApplication.resumeUrl)}
                  startIcon={<DownloadIcon />}
                  sx={{
                    background: 'linear-gradient(45deg, #007E1B 30%, #009921 90%)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(0, 126, 27, 0.5)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #005714 30%, #007E1B 90%)',
                      boxShadow: '0 4px 12px rgba(0, 126, 27, 0.7)',
                    },
                    textTransform: 'none',
                  }}
                >
                  Download Resume
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
