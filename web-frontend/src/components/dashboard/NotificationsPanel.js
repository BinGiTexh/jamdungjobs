import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Typography,
  Box,
  Badge,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  PersonAdd as PersonAddIcon,
  Event as EventIcon,
  RemoveCircle as RemoveCircleIcon,
  AccessTime as AccessTimeIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  MarkEmailRead as MarkEmailReadIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPanel = () => {
  const { 
    notifications: allNotifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Get the 3 most recent notifications for the panel
    setRecentNotifications(allNotifications.slice(0, 3));
  }, [allNotifications]);

  const notificationTypes = {
    new_application: { icon: PersonAddIcon, color: 'primary' },
    interview_scheduled: { icon: EventIcon, color: 'info' },
    application_withdrawn: { icon: RemoveCircleIcon, color: 'warning' },
    job_expired: { icon: AccessTimeIcon, color: 'error' }
  };

  const handleViewAll = () => {
    setDialogOpen(true);
    // Mark all as read when viewing all
    markAllAsRead();
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
        title={
          <Box display="flex" alignItems="center" gap={1}>
            Notifications
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="primary">
                <NotificationsIcon />
              </Badge>
            )}
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {unreadCount > 0 && (
              <IconButton 
                size="small" 
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <MarkEmailReadIcon />
              </IconButton>
            )}
            <Button 
              size="small" 
              onClick={handleViewAll}
              endIcon={<ExpandMoreIcon />}
            >
              View All ({allNotifications.length})
            </Button>
          </Box>
        }
      />
      <CardContent sx={{ p: 0 }}>
        {recentNotifications.length > 0 ? (
          <List>
            {recentNotifications.map(notification => {
              const NotificationIcon = notificationTypes[notification.type]?.icon || NotificationsIcon;
              
              return (
                <ListItem 
                  key={notification.id}
                  sx={{ 
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderLeft: notification.read ? 'none' : '4px solid',
                    borderLeftColor: 'primary.main'
                  }}
                >
                  <ListItemIcon>
                    <NotificationIcon color={notificationTypes[notification.type]?.color || 'default'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notification.read && (
                    <IconButton 
                      size="small" 
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckIcon />
                    </IconButton>
                  )}
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Box textAlign="center" py={3}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              No new notifications
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* All Notifications Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1A1A1A',
            color: '#FFD700'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#FFD700',
          borderBottom: '1px solid rgba(255, 215, 0, 0.2)'
        }}>
          All Notifications ({allNotifications.length})
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {allNotifications.length > 0 ? (
            <List>
              {allNotifications.map((notification, index) => {
                const NotificationIcon = notificationTypes[notification.type]?.icon || NotificationsIcon;
                
                return (
                  <React.Fragment key={notification.id}>
                    <ListItem 
                      sx={{ 
                        bgcolor: notification.read ? 'transparent' : 'rgba(255, 215, 0, 0.1)',
                        color: '#FFD700'
                      }}
                    >
                      <ListItemIcon>
                        <NotificationIcon sx={{ color: '#FFD700' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography sx={{ color: '#FFD700', fontWeight: notification.read ? 400 : 600 }}>
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 215, 0, 0.7)' }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 215, 0, 0.5)' }}>
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </Typography>
                          </Box>
                        }
                      />
                      {!notification.read && (
                        <IconButton 
                          size="small" 
                          onClick={() => markAsRead(notification.id)}
                          sx={{ color: '#FFD700' }}
                        >
                          <CheckIcon />
                        </IconButton>
                      )}
                    </ListItem>
                    {index < allNotifications.length - 1 && (
                      <Divider sx={{ borderColor: 'rgba(255, 215, 0, 0.1)' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          ) : (
            <Box textAlign="center" py={6}>
              <NotificationsIcon sx={{ fontSize: 64, color: 'rgba(255, 215, 0, 0.3)', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'rgba(255, 215, 0, 0.7)' }}>
                No notifications yet
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 215, 0, 0.5)' }}>
                You'll see new notifications here when they arrive
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255, 215, 0, 0.2)' }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{ color: '#FFD700' }}
          >
            Close
          </Button>
          {allNotifications.some(n => !n.read) && (
            <Button 
              onClick={markAllAsRead}
              variant="outlined"
              sx={{ 
                color: '#FFD700',
                borderColor: '#FFD700',
                '&:hover': {
                  borderColor: '#FFD700',
                  backgroundColor: 'rgba(255, 215, 0, 0.1)'
                }
              }}
            >
              Mark All Read
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default NotificationsPanel;
