/**
 * Recommended Jobs Component
 * Personalized job recommendations based on user behavior
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Stack,
  IconButton,
  Skeleton,
  Alert,
  Divider
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Share,
  LocationOn,
  Work,
  TrendingUp,
  Star,
  Refresh,
  Visibility
} from '@mui/icons-material';
import { useTheme } from '../../../context/ThemeContext';
import { formatDistance } from '../utils/distanceCalculator';
import { formatJMD } from '../utils/currencyFormatter';

const RecommendedJobs = ({
  recommendations = [],
  loading = false,
  onJobClick,
  onJobSave,
  onJobShare,
  onRefresh,
  userLocation = null,
  maxJobs = 6,
  showReasonBadges = true,
  compact = false
}) => {
  const { jamaicanColors } = useTheme();
  const [savedJobs, setSavedJobs] = useState(new Set());

  /**
   * Handle job save/unsave
   */
  const handleJobSave = useCallback((job, event) => {
    event.stopPropagation();
    
    const newSavedJobs = new Set(savedJobs);
    if (savedJobs.has(job.id)) {
      newSavedJobs.delete(job.id);
    } else {
      newSavedJobs.add(job.id);
    }
    
    setSavedJobs(newSavedJobs);
    onJobSave?.(job, !savedJobs.has(job.id));
    
    console.warn('💾 Job save toggled:', job.title, !savedJobs.has(job.id));
  }, [savedJobs, onJobSave]);

  /**
   * Handle job share
   */
  const handleJobShare = useCallback((job, event) => {
    event.stopPropagation();
    onJobShare?.(job);
    console.warn('📤 Job shared:', job.title);
  }, [onJobShare]);

  /**
   * Handle job click
   */
  const handleJobClick = useCallback((job) => {
    onJobClick?.(job);
    console.warn('👀 Recommended job clicked:', job.title);
  }, [onJobClick]);

  /**
   * Get recommendation reason badge
   */
  const getRecommendationReason = (job) => {
    if (job.recommendationScore > 50) {
      return { text: 'Perfect Match', color: jamaicanColors.green, icon: Star };
    } else if (job.recommendationScore > 30) {
      return { text: 'Great Match', color: '#2196F3', icon: TrendingUp };
    } else if (job.recommendationScore > 15) {
      return { text: 'Good Match', color: '#FF9800', icon: Work };
    }
    return { text: 'Suggested', color: '#9C27B0', icon: Visibility };
  };

  /**
   * Render job card skeleton
   */
  const renderJobSkeleton = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="80%" height={16} sx={{ mt: 2 }} />
        <Skeleton variant="text" width="70%" height={16} />
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 3 }} />
        </Box>
      </CardContent>
      <CardActions>
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="circular" width={40} height={40} sx={{ ml: 'auto' }} />
      </CardActions>
    </Card>
  );

  /**
   * Render job card
   */
  const renderJobCard = (job) => {
    const isSaved = savedJobs.has(job.id);
    const reason = getRecommendationReason(job);
    const ReasonIcon = reason.icon;

    return (
      <Card
        key={job.id}
        sx={{
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          border: '1px solid transparent',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3,
            border: `1px solid ${jamaicanColors.green}30`
          }
        }}
        onClick={() => handleJobClick(job)}
      >
        <CardContent sx={{ pb: 1 }}>
          {/* Recommendation Badge */}
          {showReasonBadges && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Chip
                icon={<ReasonIcon sx={{ fontSize: '0.9rem' }} />}
                label={reason.text}
                size="small"
                sx={{
                  bgcolor: `${reason.color}20`,
                  color: reason.color,
                  border: `1px solid ${reason.color}50`,
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
              {job.recommendationScore && (
                <Typography variant="caption" color="text.secondary">
                  {Math.round(job.recommendationScore)}% match
                </Typography>
              )}
            </Box>
          )}

          {/* Job Title & Company */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.2 }}>
            {job.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {job.company?.name || 'Company'}
          </Typography>

          {/* Job Details */}
          <Stack spacing={1}>
            {/* Location */}
            {job.location && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ fontSize: '1rem', color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {job.location}
                  {userLocation && job.distance && (
                    <span> • {formatDistance(job.distance)}</span>
                  )}
                </Typography>
              </Box>
            )}

            {/* Salary */}
            {job.salary && (
              <Typography variant="body2" sx={{ fontWeight: 600, color: jamaicanColors.green }}>
                {typeof job.salary === 'object' 
                  ? `${formatJMD(job.salary.min)} - ${formatJMD(job.salary.max)}`
                  : formatJMD(job.salary)
                }
              </Typography>
            )}
          </Stack>

          {/* Job Tags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
            {job.jobType && (
              <Chip
                label={job.jobType}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
            {job.industry && (
              <Chip
                label={job.industry}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
            {job.experienceLevel && (
              <Chip
                label={job.experienceLevel}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
          <Button
            size="small"
            variant="contained"
            sx={{
              bgcolor: jamaicanColors.green,
              '&:hover': { bgcolor: jamaicanColors.green, opacity: 0.9 }
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleJobClick(job);
            }}
          >
            View Details
          </Button>

          <Box>
            <IconButton
              size="small"
              onClick={(e) => handleJobSave(job, e)}
              sx={{ color: isSaved ? '#f44336' : 'text.secondary' }}
            >
              {isSaved ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => handleJobShare(job, e)}
              sx={{ color: 'text.secondary' }}
            >
              <Share />
            </IconButton>
          </Box>
        </CardActions>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Star sx={{ color: jamaicanColors.green, mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Recommended for You
            </Typography>
          </Box>
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        </Box>

        <Grid container spacing={3}>
          {Array.from({ length: maxJobs }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              {renderJobSkeleton()}
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!recommendations.length) {
    return (
      <Alert
        severity="info"
        sx={{
          bgcolor: `${jamaicanColors.green}10`,
          border: `1px solid ${jamaicanColors.green}30`,
          '& .MuiAlert-icon': { color: jamaicanColors.green }
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          🤖 Building Your Recommendations
        </Typography>
        <Typography variant="body2">
          Search for jobs and view job details to help us learn your preferences. 
          We'll then show personalized recommendations here.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Star sx={{ color: jamaicanColors.green, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recommended for You
          </Typography>
          <Chip
            label={`${recommendations.length} jobs`}
            size="small"
            sx={{ 
              ml: 2, 
              bgcolor: jamaicanColors.green, 
              color: 'white',
              fontSize: '0.75rem'
            }}
          />
        </Box>

        {onRefresh && (
          <Button
            startIcon={<Refresh />}
            onClick={onRefresh}
            size="small"
            sx={{
              color: jamaicanColors.green,
              '&:hover': { bgcolor: `${jamaicanColors.green}10` }
            }}
          >
            Refresh
          </Button>
        )}
      </Box>

      {/* Job Cards */}
      <Grid container spacing={3}>
        {recommendations.slice(0, maxJobs).map((job) => (
          <Grid item xs={12} sm={6} md={compact ? 6 : 4} key={job.id}>
            {renderJobCard(job)}
          </Grid>
        ))}
      </Grid>

      {/* Show More */}
      {recommendations.length > maxJobs && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {recommendations.length - maxJobs} more recommended jobs available
          </Typography>
          <Button
            variant="outlined"
            sx={{
              borderColor: jamaicanColors.green,
              color: jamaicanColors.green,
              '&:hover': {
                borderColor: jamaicanColors.green,
                bgcolor: `${jamaicanColors.green}10`
              }
            }}
            onClick={() => console.warn('Show more recommendations')}
          >
            View All Recommendations
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RecommendedJobs;
