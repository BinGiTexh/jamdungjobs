import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Box, CircularProgress, Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import JobApplicationForm from '../components/jobseeker/JobApplicationForm';
import { buildApiUrl } from '../config';
import { useAuth } from '../context/AuthContext';
import { logDev, logError, sanitizeForLogging } from '../utils/loggingUtils';

const JobApplyPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!currentUser) {
      logDev('debug', 'Redirecting unauthenticated user to login', {
        targetJobId: jobId,
        page: 'JobApplyPage'
      });
      navigate('/login', { state: { from: `/jobs/${jobId}/apply` } });
      return;
    }

    // Redirect to employer dashboard if user is an employer
    if (currentUser.role === 'EMPLOYER') {
      logDev('debug', 'Redirecting employer from job apply page', {
        userId: sanitizeForLogging(currentUser.id),
        userRole: currentUser.role,
        targetJobId: jobId
      });
      navigate('/dashboard');
      return;
    }

    // Log page access
    logDev('debug', 'Job apply page accessed', {
      jobId,
      userId: sanitizeForLogging(currentUser.id),
      referrer: location.state?.from || 'direct'
    });

    fetchJobDetails();
  }, [currentUser, jobId, navigate, location.state]);

  const fetchJobDetails = async () => {
    try {
      logDev('debug', 'Fetching job details', { 
        jobId, 
        userId: sanitizeForLogging(currentUser?.id)
      });
      
      const response = await axios.get(buildApiUrl(`/jobs/${jobId}`));
      setJob(response.data);
      
      logDev('debug', 'Job details fetched successfully', { 
        jobId, 
        jobTitle: response.data.title
      });
    } catch (err) {
      const errorContext = {
        module: 'JobApplyPage',
        function: 'fetchJobDetails',
        jobId,
        userId: sanitizeForLogging(currentUser?.id),
        status: err.response?.status,
        statusText: err.response?.statusText
      };
      
      logError('Error loading job details', err, errorContext);
      setError('Failed to load job details. The job may no longer be available.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSuccess = (applicationData) => {
    logDev('info', 'Job application submitted successfully', {
      jobId,
      jobTitle: job?.title,
      userId: sanitizeForLogging(currentUser?.id),
      applicationId: sanitizeForLogging(applicationData?.id)
    });
    
    setSuccess(true);
    // Redirect to applications page after a short delay
    setTimeout(() => {
      navigate('/applications');
    }, 3000);
  };

  const _handleCancel = () => {
    logDev('debug', 'Job application cancelled', {
      jobId,
      userId: sanitizeForLogging(currentUser?.id)
    });
    navigate(`/jobs/${jobId}`);
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
          onClick={() => navigate('/jobs')}
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

  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Your application has been submitted successfully! You will be redirected to your applications page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(`/jobs/${jobId}`)}
        sx={{
          mb: 3,
          color: '#2C5530',
          '&:hover': {
            backgroundColor: 'rgba(44, 85, 48, 0.05)'
          }
        }}
      >
        Back to Job Details
      </Button>
      
      {job && (
        <JobApplicationForm 
          jobId={job.id} 
          jobTitle={job.title} 
          onSuccess={handleApplicationSuccess}
          onCancel={() => navigate(-1)}
        />
      )}
    </Container>
  );
};

export default JobApplyPage;
