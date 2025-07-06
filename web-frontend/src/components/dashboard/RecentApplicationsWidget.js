import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  ButtonGroup,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Event as EventIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const RecentApplicationsWidget = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentApplications = async () => {
      try {
        const token = localStorage.getItem('jamdung_auth_token');
        const response = await fetch('http://localhost:5000/api/employer/applications?limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
        }
      } catch (error) {
        console.error('Failed to fetch recent applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentApplications();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'interview': return 'info';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const handleScheduleInterview = (applicationId) => {
    // Navigate to interview scheduling
    navigate(`/employer/applications/${applicationId}/interview`);
  };

  const handleQuickAction = (event, application) => {
    event.stopPropagation();
    // Open quick actions menu
    console.log('Quick actions for application:', application.id);
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

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="Recent Applications" 
        action={
          <Button 
            variant="outlined" 
            onClick={() => navigate('/employer/applications')}
          >
            View All Applications
          </Button>
        }
      />
      <CardContent>
        {applications.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Applied</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map(application => (
                  <TableRow 
                    key={application.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/employer/applications/${application.id}`)}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar 
                          src={application.candidate?.avatar}
                          sx={{ width: 40, height: 40 }}
                        >
                          {application.candidate?.firstName?.[0] || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {application.candidate?.firstName || 'Unknown'} {application.candidate?.lastName || 'User'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {application.candidate?.title || 'Job Seeker'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {application.job?.title || 'Position'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={application.status || 'pending'} 
                        color={getStatusColor(application.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <ButtonGroup size="small">
                        <Tooltip title="View Application">
                          <IconButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/employer/applications/${application.id}`);
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Schedule Interview">
                          <IconButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScheduleInterview(application.id);
                            }}
                          >
                            <EventIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Quick Actions">
                          <IconButton 
                            onClick={(e) => handleQuickAction(e, application)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box textAlign="center" py={4}>
            <PersonAddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="textSecondary" gutterBottom>
              No recent applications. Post a job to start receiving applications.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }} 
              onClick={() => navigate('/employer/post-job')}
            >
              Post a Job
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentApplicationsWidget;
