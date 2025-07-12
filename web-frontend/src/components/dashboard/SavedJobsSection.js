import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Skeleton,
  Alert
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import api from '../../utils/api';
import { logError } from '../../utils/loggingUtils';
import QuickApplyModal from '../jobseeker/QuickApplyModal';

const SavedJobCard = ({ job, onRemove, onApply }) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3
        }
      }} 
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {job.title}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {job.company?.name || 'Company'}
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(job.id);
            }}
            title="Remove from saved jobs"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <LocationIcon fontSize="small" color="action" />
          <Typography variant="body2" color="textSecondary">
            {job.location}
          </Typography>
        </Box>
        
        {job.salary && (
          <Typography variant="body2" color="primary" fontWeight="medium" mb={2}>
            {typeof job.salary === 'object' 
              ? `$${job.salary.min?.toLocaleString()} - $${job.salary.max?.toLocaleString()}`
              : job.salary
            }
          </Typography>
        )}
        
        {job.type && (
          <Box mb={2}>
            <Chip 
              label={job.type.replace('_', ' ')} 
              size="small" 
              variant="outlined"
            />
          </Box>
        )}
        
        <Typography variant="body2" color="textSecondary" mb={2}>
          Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </Typography>
        
        <Button 
          variant="contained" 
          fullWidth 
          size="small"
          sx={{
            background: 'linear-gradient(135deg, #009639 0%, #FFD700 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #007a2e 0%, #e6c200 100%)'
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            onApply?.(job);
          }}
        >
          Quick Apply
        </Button>
      </CardContent>
    </Card>
  );
};

const SavedJobsSkeleton = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item xs={12} md={6} key={index}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
            <Box mt={2}>
              <Skeleton variant="rectangular" width="100%" height={32} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </>
);

const SavedJobsSection = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickApplyModalOpen, setQuickApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/jobseeker/saved-jobs');
      
      if (response.data.success) {
        setSavedJobs(response.data.savedJobs || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch saved jobs');
      }
    } catch (error) {
      logError('Failed to fetch saved jobs:', error);
      setError('Unable to load saved jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSavedJob = async (jobId) => {
    try {
      const response = await api.delete(`/api/jobseeker/saved-jobs/${jobId}`);
      
      if (response.data.success) {
        setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      } else {
        throw new Error(response.data.message || 'Failed to remove saved job');
      }
    } catch (error) {
      logError('Failed to remove saved job:', error);
      setError('Unable to remove saved job. Please try again.');
    }
  };

  const handleQuickApply = (job) => {
    // Open quick apply modal instead of routing
    setSelectedJob(job);
    setQuickApplyModalOpen(true);
  };

  const handleQuickApplySuccess = (applicationData) => {
    // Close modal and show success - the modal handles the thank you message
    setQuickApplyModalOpen(false);
    setSelectedJob(null);
    
    // Optional: You could show a toast notification here if desired
    console.log('Application submitted successfully:', applicationData);
  };

  const handleQuickApplyClose = () => {
    setQuickApplyModalOpen(false);
    setSelectedJob(null);
  };

  if (error) {
    return (
      <Card>
        <CardHeader title="Saved Jobs" />
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="outlined" 
            onClick={fetchSavedJobs}
            sx={{ mt: 1 }}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title="Saved Jobs" 
        action={
          <Button 
            variant="text" 
            onClick={() => navigate('/saved-jobs')}
            disabled={savedJobs.length === 0}
          >
            View All
          </Button>
        }
      />
      <CardContent>
        {loading ? (
          <Grid container spacing={2}>
            <SavedJobsSkeleton count={3} />
          </Grid>
        ) : savedJobs.length > 0 ? (
          <Grid container spacing={2}>
            {savedJobs.slice(0, 6).map(job => (
              <Grid item xs={12} md={6} key={job.id}>
                <SavedJobCard 
                  job={job}
                  onRemove={handleRemoveSavedJob}
                  onApply={handleQuickApply}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box textAlign="center" py={4}>
            <BookmarkBorderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Saved Jobs Yet
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Save jobs you're interested in to easily find them later
            </Typography>
            <Button 
              variant="contained" 
              sx={{ 
                mt: 2,
                background: 'linear-gradient(135deg, #009639 0%, #FFD700 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #007a2e 0%, #e6c200 100%)'
                }
              }} 
              onClick={() => navigate('/jobs')}
            >
              Browse Jobs
            </Button>
          </Box>
        )}
      </CardContent>

      {/* Quick Apply Modal */}
      <QuickApplyModal
        open={quickApplyModalOpen}
        onClose={handleQuickApplyClose}
        job={selectedJob}
        onSuccess={handleQuickApplySuccess}
      />
    </Card>
  );
};

export default SavedJobsSection;
