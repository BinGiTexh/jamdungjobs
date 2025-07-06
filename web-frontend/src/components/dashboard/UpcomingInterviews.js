import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Event as EventIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';

const UpcomingInterviews = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingInterviews = async () => {
      try {
        const token = localStorage.getItem('jamdung_auth_token');
        const response = await fetch('http://localhost:5000/api/employer/interviews/upcoming', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setInterviews(data.interviews || []);
        } else {
          // Mock data for demo
          const mockInterviews = [
            {
              id: 1,
              candidateName: 'Sarah Johnson',
              position: 'Frontend Developer',
              scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'video',
              status: 'confirmed'
            },
            {
              id: 2,
              candidateName: 'Michael Brown',
              position: 'Marketing Manager',
              scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'phone',
              status: 'pending'
            }
          ];
          setInterviews(mockInterviews);
        }
      } catch (error) {
        console.error('Failed to fetch upcoming interviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingInterviews();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title="Upcoming Interviews"
        action={
          <Button 
            size="small" 
            onClick={() => navigate('/employer/interviews')}
          >
            View All
          </Button>
        }
      />
      <CardContent sx={{ p: 0 }}>
        {interviews.length > 0 ? (
          <List>
            {interviews.map(interview => (
              <ListItem key={interview.id}>
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2">
                        {interview.candidateName}
                      </Typography>
                      <Chip 
                        label={interview.status} 
                        color={getStatusColor(interview.status)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {interview.position}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(interview.scheduledAt), 'MMM dd, yyyy - h:mm a')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                        ({formatDistanceToNow(new Date(interview.scheduledAt), { addSuffix: true })})
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box textAlign="center" py={3}>
            <EventIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              No upcoming interviews scheduled
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingInterviews;
