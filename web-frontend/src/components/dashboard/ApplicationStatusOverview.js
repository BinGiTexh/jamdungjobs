import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  Tabs,
  Tab,
  Box,
  Chip,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Notifications as NotificationsIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import EmptyApplicationsState from './EmptyApplicationsState';

const ApplicationStatusOverview = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('jamdung_auth_token');
        const response = await fetch('http://localhost:5000/api/applications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setApplications(data);
        } else {
          throw new Error('Failed to fetch applications');
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const statusCounts = useMemo(() => {
    return applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
  }, [applications]);

  const statusOptions = [
    { value: 'all', label: 'All Applications', count: applications.length },
    { value: 'pending', label: 'Under Review', count: statusCounts.pending || 0 },
    { value: 'interview', label: 'Interview Stage', count: statusCounts.interview || 0 },
    { value: 'rejected', label: 'Not Selected', count: statusCounts.rejected || 0 },
    { value: 'accepted', label: 'Offers Received', count: statusCounts.accepted || 0 }
  ];

  const filteredApplications = useMemo(() => {
    if (filter === 'all') return applications;
    return applications.filter(app => app.status === filter);
  }, [applications, filter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <HourglassEmptyIcon sx={{ color: '#FFD700' }} />;
      case 'interview': return <ScheduleIcon sx={{ color: '#FFB30F' }} />;
      case 'accepted': return <CheckCircleIcon sx={{ color: '#009921' }} />;
      case 'rejected': return <CancelIcon sx={{ color: '#CD2B2B' }} />;
      default: return <WorkIcon sx={{ color: '#007E1B' }} />;
    }
  };

  const getStatusColor = (status) => {
    // Custom Jamaican theme color mapping for chips
    const jamaicaColors = {
      pending: { backgroundColor: 'rgba(255, 215, 0, 0.1)', color: '#FFD700' },
      interview: { backgroundColor: 'rgba(255, 179, 15, 0.1)', color: '#FFB30F' },
      accepted: { backgroundColor: 'rgba(0, 153, 33, 0.1)', color: '#009921' },
      rejected: { backgroundColor: 'rgba(205, 43, 43, 0.1)', color: '#CD2B2B' },
      default: { backgroundColor: 'rgba(0, 126, 27, 0.1)', color: '#007E1B' }
    };
    return jamaicaColors[status] || jamaicaColors.default;
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <EmptyApplicationsState 
        variant="error"
        onBrowseJobs={() => navigate('/jobs')}
        onCompleteProfile={() => navigate('/profile')}
      />
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="Application Status" 
        action={
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/jobs')}
          >
            Find More Jobs
          </Button>
        }
      />
      <CardContent>
        {/* Status Filter Tabs */}
        <Tabs 
          value={filter} 
          onChange={(e, value) => setFilter(value)} 
          sx={{ mb: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {statusOptions.map(option => (
            <Tab 
              key={option.value}
              value={option.value}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {option.label}
                  <Chip size="small" label={option.count} />
                </Box>
              }
            />
          ))}
        </Tabs>
        
        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <List>
            {filteredApplications.slice(0, 5).map(application => (
              <ListItem 
                key={application.id}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => navigate(`/applications/${application.id}`)}
              >
                <ListItemIcon>
                  {getStatusIcon(application.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">
                        {application.job?.title || 'Job Title'}
                      </Typography>
                      <Chip 
                        label={application.status} 
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(application.status).backgroundColor,
                          color: getStatusColor(application.status).color,
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {application.job?.company || 'Company Name'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <EmptyApplicationsState 
            variant="no-applications"
            onBrowseJobs={() => navigate('/jobs')}
            onCompleteProfile={() => navigate('/profile')}
          />
        )}
        
        {/* Quick Actions */}
        {applications.length > 0 && (
          <Box mt={2} display="flex" gap={2} flexWrap="wrap">
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              size="small"
            >
              Export Applications
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<NotificationsIcon />}
              size="small"
            >
              Set Status Alerts
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicationStatusOverview;
