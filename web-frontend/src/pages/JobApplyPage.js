import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import JobApplicationForm from '../components/jobseeker/JobApplicationForm';
import axios from 'axios';
import { buildApiUrl } from '../config';
import { useAuth } from '../context/AuthContext';

const JobApplyPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!currentUser) {
      navigate('/login', { state: { from: `/jobs/${jobId}/apply` } });
      return;
    }

    // Redirect to employer dashboard if user is an employer
    if (currentUser.role === 'EMPLOYER') {
      navigate('/dashboard');
      return;
    }

    fetchJobDetails();
  }, [currentUser, jobId, navigate]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(buildApiUrl(`/jobs/${jobId}`));
      setJob(response.data);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to load job details. The job may no longer be available.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSuccess = (applicationData) => {
    setSuccess(true);
    // Redirect to applications page after a short delay
    setTimeout(() => {
      navigate('/applications');
    }, 3000);
  };

  const handleCancel = () => {
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
