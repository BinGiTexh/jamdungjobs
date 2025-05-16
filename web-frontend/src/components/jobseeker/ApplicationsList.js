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
  DialogContentText,
  DialogTitle,
  Grid
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { buildApiUrl } from '../../config';
import { format } from 'date-fns';

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
      const response = await axios.get(buildApiUrl('/applications/my'));
      setApplications(response.data);
      // Clear any previous errors
      setError(null);
    } catch (err) {
      console.error('Error fetching applications:', err);
      // Only set error if it's not a 404 (no applications found)
      if (err.response && err.response.status !== 404) {
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
      console.error('Error downloading resume:', err);
      setError('Failed to download resume. Please try again.');
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      try {
        await axios.delete(buildApiUrl(`/applications/${applicationId}`));
        // Remove from state
        setApplications(prev => prev.filter(app => app.id !== applicationId));
      } catch (err) {
        console.error('Error deleting application:', err);
        setError('Failed to withdraw application. Please try again.');
      }
    }
  };

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
      <Box sx={{ width: '100%' }}>
        {/* Title moved to parent ApplicationsPage component */}

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
            <Tab label="Active" />
            <Tab label="Offered" />
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
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Job Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
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
                      <TableCell>{application.job.title}</TableCell>
                      <TableCell>{application.job.company.name}</TableCell>
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
                          {['APPLIED', 'REVIEWING'].includes(application.status) && (
                            <Tooltip title="Withdraw Application">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteApplication(application.id)}
                                sx={{ color: '#c62828' }}
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
                    <Typography variant="subtitle2" color="textSecondary">Job Title</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {selectedApplication.job.title}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Company</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {selectedApplication.job.company.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Applied On</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formatDate(selectedApplication.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Status</Typography>
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
                    <Typography variant="subtitle2" color="textSecondary">Cover Letter</Typography>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: '#f9f9f9' }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {selectedApplication.coverLetter || 'No cover letter provided'}
                      </Typography>
                    </Paper>
                  </Grid>
                  {selectedApplication.additionalInfo && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Additional Information</Typography>
                      <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: '#f9f9f9' }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                          {selectedApplication.additionalInfo}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button 
                  onClick={handleCloseDialog}
                  sx={{
                    color: '#2C5530',
                    '&:hover': {
                      backgroundColor: 'rgba(44, 85, 48, 0.05)'
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
                    background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                    color: '#000',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #FFD700, #2C5530)',
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
