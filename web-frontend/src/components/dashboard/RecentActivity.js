import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Bookmark as BookmarkIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import api from '../../utils/api';
import { logDev, logError } from '../../utils/loggingUtils';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the token directly from localStorage (same as ApplicationsList)
      const token = localStorage.getItem('jamdung_auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Make the request with explicit headers (same as ApplicationsList)
      const response = await api.get('/api/jobseeker/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      logDev('debug', 'Recent activities response received', {
        hasData: !!response.data,
        hasApplications: !!response.data?.applications,
        applicationsLength: response.data?.applications?.length || 0,
        responseKeys: Object.keys(response.data || {})
      });

      // Extract applications from response (same structure as ApplicationsList)
      const applications = response.data?.applications || [];
      
      if (!Array.isArray(applications)) {
        logError('Applications is not an array', null, {
          module: 'RecentActivity',
          applicationsType: typeof applications,
          applications: applications
        });
        setActivities([]);
        return;
      }
      
      // Convert applications to activity format
      const applicationActivities = applications
        .slice(0, 10) // Get last 10 applications
        .map(app => ({
          id: `app-${app.id}`,
          type: 'application',
          title: `Applied to ${app.job?.title || 'Job'}`,
          subtitle: app.job?.company?.name || 'Company',
          timestamp: app.createdAt || app.created_at,
          status: app.status,
          icon: SendIcon,
          data: app
        }));

      // Sort activities by timestamp (most recent first)
      const sortedActivities = applicationActivities.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );

      setActivities(sortedActivities);
      
      logDev('debug', 'Recent activities processed', {
        applicationCount: applications.length,
        activitiesCount: sortedActivities.length,
        firstActivity: sortedActivities[0] || null
      });

    } catch (error) {
      logError('Failed to fetch recent activities', error, {
        module: 'RecentActivity',
        function: 'fetchRecentActivities',
        errorStatus: error.response?.status,
        errorMessage: error.message
      });
      
      if (error.message === 'Authentication token not found. Please log in again.') {
        setError('Please log in to view recent activities.');
      } else if (error.response && error.response.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Unable to load recent activities. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const getActivityIcon = (activity) => {
    switch (activity.type) {
      case 'application':
        return <SendIcon />;
      case 'view':
        return <VisibilityIcon />;
      case 'save':
        return <BookmarkIcon />;
      default:
        return <WorkIcon />;
    }
  };

  const getActivityColor = (activity) => {
    if (activity.type === 'application') {
      switch (activity.status) {
        case 'pending':
        case 'submitted':
          return '#2196f3'; // Blue
        case 'reviewed':
        case 'under_review':
          return '#ff9800'; // Orange
        case 'interview':
        case 'interview_scheduled':
          return '#4caf50'; // Green
        case 'accepted':
        case 'hired':
          return '#4caf50'; // Green
        case 'rejected':
        case 'declined':
          return '#f44336'; // Red
        default:
          return '#2196f3'; // Blue
      }
    }
    return '#2196f3'; // Default blue
  };

  const getStatusChip = (activity) => {
    if (activity.type !== 'application') return null;

    const status = activity.status;
    let label = status;
    let color = 'default';
    let icon = null;

    switch (status) {
      case 'pending':
      case 'submitted':
        label = 'Submitted';
        color = 'primary';
        icon = <ScheduleIcon fontSize="small" />;
        break;
      case 'reviewed':
      case 'under_review':
        label = 'Under Review';
        color = 'warning';
        icon = <VisibilityIcon fontSize="small" />;
        break;
      case 'interview':
      case 'interview_scheduled':
        label = 'Interview';
        color = 'success';
        icon = <CheckCircleIcon fontSize="small" />;
        break;
      case 'accepted':
      case 'hired':
        label = 'Accepted';
        color = 'success';
        icon = <CheckCircleIcon fontSize="small" />;
        break;
      case 'rejected':
      case 'declined':
        label = 'Rejected';
        color = 'error';
        icon = <CancelIcon fontSize="small" />;
        break;
      default:
        label = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }

    return (
      <Chip
        label={label}
        color={color}
        size="small"
        icon={icon}
        sx={{ ml: 'auto' }}
      />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader title="Recent Activity" />
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            Loading recent activities...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Recent Activity" />
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Recent Activity" />
      <CardContent sx={{ p: 0 }}>
        {activities.length > 0 ? (
          <List dense>
            {activities.map((activity, index) => (
              <ListItem 
                key={activity.id}
                divider={index < activities.length - 1}
                sx={{ px: 2 }}
              >
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: getActivityColor(activity),
                      width: 32,
                      height: 32
                    }}
                  >
                    {getActivityIcon(activity)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {activity.title}
                      </Typography>
                      {getStatusChip(activity)}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {activity.subtitle}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <WorkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="textSecondary" gutterBottom>
              No recent activity yet
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Your job search activities will appear here
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;