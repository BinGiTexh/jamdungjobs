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
  Skeleton
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import ProfileEditModal from '../profile/ProfileEditModal';
import QuickApplyModal from '../jobseeker/QuickApplyModal';

const JobCardSkeleton = ({ count = 3 }) => (
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

const JobCard = ({ job, showMatchScore = false, onApply, onSave }) => {
  const navigate = useNavigate();
  
  return (
    <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate(`/jobs/${job.id}`)}>
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
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(job.id);
            }}
          >
            {job.isSaved ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
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
            {job.salary}
          </Typography>
        )}
        
        {showMatchScore && job.matchScore && (
          <Box mb={2}>
            <Chip 
              label={`${job.matchScore}% match`} 
              color="success" 
              size="small" 
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

const RecommendedJobs = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [quickApplyModalOpen, setQuickApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('jamdung_auth_token');
        
        // Fetch job recommendations (using regular job search for now)
        const response = await fetch('http://localhost:5000/api/jobs?limit=6', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const jobsWithMatchScore = data.jobs?.map(job => ({
            ...job,
            matchScore: Math.floor(Math.random() * 30) + 70 // Mock match score 70-100%
          })) || [];
          
          setRecommendations(jobsWithMatchScore);
        }
        
        // Fetch saved jobs
        const savedResponse = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (savedResponse.ok) {
          const userData = await savedResponse.json();
          setSavedJobs(new Set(userData.savedJobs || []));
        }
        
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);

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

  const handleSaveJob = async (jobId) => {
    try {
      const token = localStorage.getItem('jamdung_auth_token');
      const method = savedJobs.has(jobId) ? 'DELETE' : 'POST';
      
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/save`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          if (newSet.has(jobId)) {
            newSet.delete(jobId);
          } else {
            newSet.add(jobId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to save/unsave job:', error);
    }
  };

  return (
    <Card>
      <CardHeader 
        title="Recommended for You" 
        action={
          <Button variant="text" onClick={() => navigate('/jobs')}>
            View All
          </Button>
        }
      />
      <CardContent>
        {loading ? (
          <Grid container spacing={2}>
            <JobCardSkeleton count={3} />
          </Grid>
        ) : (
          <Grid container spacing={2}>
            {recommendations.map(job => (
              <Grid item xs={12} md={6} key={job.id}>
                <JobCard 
                  job={{
                    ...job,
                    isSaved: savedJobs.has(job.id)
                  }}
                  compact={true}
                  showMatchScore={true}
                  onApply={handleQuickApply}
                  onSave={handleSaveJob}
                />
              </Grid>
            ))}
          </Grid>
        )}
        
        {recommendations.length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <WorkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Complete your profile to get personalized job recommendations
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }} 
              onClick={() => setProfileModalOpen(true)}
            >
              Complete Profile
            </Button>
          </Box>
        )}
      </CardContent>
      
      <ProfileEditModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSave={() => {
          setProfileModalOpen(false);
          // Refresh recommendations after profile update
        }}
      />

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

export default RecommendedJobs;
