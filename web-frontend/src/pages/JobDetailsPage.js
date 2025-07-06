import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Divider,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { SalaryDisplay } from '../components/common/SalaryDisplay';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { logDev, logError, sanitizeForLogging } from '../utils/loggingUtils';
import { formatDate } from '../utils/dateUtils';
import QuickApplyModal from '../components/jobseeker/QuickApplyModal';

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickApplyModalOpen, setQuickApplyModalOpen] = useState(false);

  useEffect(() => {
    // Log page access
    logDev('debug', 'Job details page accessed', {
      jobId,
      userId: isAuthenticated ? sanitizeForLogging(currentUser?.id) : 'guest',
      userRole: currentUser?.role || 'guest',
      referrer: location.state?.from || 'direct'
    });

    fetchJobDetails();
  }, [jobId, isAuthenticated, currentUser, location.state]);

  const fetchJobDetails = async () => {
    try {
      logDev('debug', 'Fetching job details', { 
        jobId, 
        userId: isAuthenticated ? sanitizeForLogging(currentUser?.id) : 'guest'
      });
      
      const response = await api.get(`/api/jobs/${jobId}`);
      setJob(response.data);
      
      logDev('debug', 'Job details fetched successfully', { 
        jobId, 
        jobTitle: response.data.title
      });
    } catch (err) {
      const errorContext = {
        module: 'JobDetailsPage',
        function: 'fetchJobDetails',
        jobId,
        userId: isAuthenticated ? sanitizeForLogging(currentUser?.id) : 'guest',
        status: err.response?.status,
        statusText: err.response?.statusText
      };
      
      logError('Error loading job details', err, errorContext);
      setError('Failed to load job details. The job may no longer be available.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login', { state: { from: `/jobs/${jobId}` } });
      return;
    }
    
    // Safely check if the user is an employer
    if (currentUser?.role === 'EMPLOYER') {
      // Show an error message for employers
      setError('Employers cannot apply for jobs. Please login as a job seeker.');
      return;
    }
    
    // Open quick apply modal instead of routing to separate page
    setQuickApplyModalOpen(true);
  };

  const handleQuickApplySuccess = (applicationData) => {
    // Close modal and show success - the modal handles the thank you message
    setQuickApplyModalOpen(false);
    
    // Log successful application
    logDev('info', 'Application submitted from job details page', {
      jobId,
      applicationId: applicationData?.id,
      userId: currentUser?.id
    });
  };

  const handleQuickApplyClose = () => {
    setQuickApplyModalOpen(false);
  };

  const handleBackToJobs = () => {
    navigate('/jobs');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress sx={{ color: '#2C5530' }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToJobs}
          sx={{
            color: '#2C5530',
            '&:hover': {
              backgroundColor: 'rgba(44, 85, 48, 0.05)'
            }
          }}
        >
          Back to Jobs
        </Button>
      </Container>
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
        overflow: 'hidden'
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
          zIndex: 1
        }}
      />
      
      <Container maxWidth="md" sx={{ mt: 8, mb: 8, position: 'relative', zIndex: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToJobs}
          sx={{
            mb: 3,
            color: '#FFD700',
            borderColor: '#FFD700',
            border: '1px solid',
            '&:hover': {
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              borderColor: '#FFD700'
            }
          }}
        >
          Back to Jobs
        </Button>
        
        {job && (
          <Paper
            elevation={3}
            sx={{
              p: 4,
              backgroundColor: 'rgba(20, 20, 20, 0.85)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Card background gradient */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(44, 85, 48, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%)',
                opacity: 0.3,
                zIndex: 0
              }}
            />
            
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h4" component="h1" sx={{ 
                color: '#FFD700',
                fontWeight: 600,
                mb: 1
              }}>
                {job.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {job.company.name}
                </Typography>
                <Box sx={{ ml: 2 }}>
                  <Chip 
                    label={job.type.replace('_', ' ')} 
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(44, 85, 48, 0.6)',
                      color: '#FFD700',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOnIcon sx={{ color: '#FFD700', mr: 1 }} />
                      <Typography sx={{ color: 'white' }}>
                        {job.location}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarTodayIcon sx={{ color: '#FFD700', mr: 1 }} />
                      <Typography sx={{ color: 'white' }}>
                        Posted {formatDate(job.postedDate)}
                      </Typography>
                    </Box>
                    
                    {job.remote && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <WorkIcon sx={{ color: '#FFD700', mr: 1 }} />
                        <Typography sx={{ color: 'white' }}>
                          Remote Work Available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Divider sx={{ backgroundColor: 'rgba(255, 215, 0, 0.3)', mb: 3 }} />
                  
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                    Job Description
                  </Typography>
                  
                  <Typography sx={{ color: 'white', mb: 3, whiteSpace: 'pre-line' }}>
                    {job.description}
                  </Typography>
                  
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                    Requirements
                  </Typography>
                  
                  <Typography sx={{ color: 'white', mb: 3, whiteSpace: 'pre-line' }}>
                    {job.requirements}
                  </Typography>
                  
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                    Required Skills
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    {job.skills.map(skill => (
                      <Chip
                        key={skill}
                        label={skill}
                        sx={{
                          mr: 1,
                          mb: 1,
                          backgroundColor: 'rgba(44, 85, 48, 0.6)',
                          color: '#FFD700'
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    backgroundColor: 'rgba(44, 85, 48, 0.3)',
                    border: '1px solid rgba(255, 215, 0, 0.5)',
                    mb: 3
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                        Job Details
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <MonetizationOnIcon sx={{ color: '#FFD700', mr: 1 }} />
                        <Typography sx={{ color: 'white' }}>
                          <SalaryDisplay salary={job.salary} />
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccessTimeIcon sx={{ color: '#FFD700', mr: 1 }} />
                        <Typography sx={{ color: 'white' }}>
                          {job.type.replace('_', ' ')}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: 3 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<FlashOnIcon />}
                          onClick={handleApply}
                          sx={{
                            py: 1.5,
                            background: 'linear-gradient(90deg, #2C5530, #FFD700)',
                            color: '#000',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            '&:hover': {
                              background: 'linear-gradient(90deg, #FFD700, #2C5530)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isAuthenticated 
                            ? (currentUser?.role === 'EMPLOYER' ? 'Employers Cannot Apply' : 'Apply Now') 
                            : 'Sign In to Apply'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Card sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                        About {job.company.name}
                      </Typography>
                      
                      <Typography sx={{ color: 'white', mb: 2 }}>
                        {job.company.description || 'Company information not available.'}
                      </Typography>
                      
                      {job.company.website && (
                        <Button
                          variant="outlined"
                          fullWidth
                          href={job.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            mt: 2,
                            borderColor: '#FFD700',
                            color: '#FFD700',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 215, 0, 0.1)',
                              borderColor: '#FFD700'
                            }
                          }}
                        >
                          Visit Company Website
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}
      </Container>

      {/* Quick Apply Modal */}
      <QuickApplyModal
        open={quickApplyModalOpen}
        onClose={handleQuickApplyClose}
        job={job}
        onSuccess={handleQuickApplySuccess}
      />
    </Box>
  );
};

export default JobDetailsPage;

