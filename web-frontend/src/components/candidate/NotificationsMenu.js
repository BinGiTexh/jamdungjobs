import React, { useState, useEffect, useCallback } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Box,
  ListItemText,
  ListItemIcon,
  Button
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import api from '../../utils/axiosConfig';
import { logDev, logError, sanitizeForLogging } from '../../utils/loggingUtils';
import { useNavigate } from 'react-router-dom';

const NotificationsMenu = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const notificationsOpen = Boolean(anchorEl);
  const navigate = useNavigate();

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data);
      
      logDev('debug', 'Fetched notifications', { 
        count: response.data.length,
        unreadCount: response.data.filter(n => n.status === 'UNREAD').length
      });
    } catch (error) {
      logError('Error fetching notifications', error, {
        module: 'NotificationsMenu',
        function: 'fetchNotifications'
      });
    }
  }, []);

  // Function to fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/api/notifications/count');
      setUnreadCount(response.data.count);
      
      logDev('debug', 'Fetched unread notification count', { 
        count: response.data.count 
      });
    } catch (error) {
      logError('Error fetching unread count', error, {
        module: 'NotificationsMenu',
        function: 'fetchUnreadCount'
      });
    }
  }, []);

  // Function to mark a notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}`);
      
      // Update local state to reflect the change
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'READ', isRead: true } 
            : notification
        )
      );
      
      fetchUnreadCount(); // Update the badge count
      
      logDev('debug', 'Marked notification as read', { notificationId });
    } catch (error) {
      logError('Error marking notification as read', error, {
        module: 'NotificationsMenu',
        function: 'markAsRead',
        notificationId
      });
    }
  }, [fetchUnreadCount]);

  // Function to mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status === 'UNREAD');
      if (unreadNotifications.length === 0) return;
      
      // Use the new endpoint to mark all notifications as read
      await api.patch('/api/notifications/read-all');
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          status: 'READ',
          isRead: true
        }))
      );
      
      setUnreadCount(0);
      
      logDev('debug', 'Marked all notifications as read', { 
        count: unreadNotifications.length 
      });
    } catch (error) {
      logError('Error marking all notifications as read', error, {
        module: 'NotificationsMenu',
        function: 'markAllAsRead'
      });
    }
  }, [notifications]);

  // Handle notification icon click
  const handleNotificationsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle notification menu close
  const handleNotificationsClose = () => {
    setAnchorEl(null);
  };

  // Handle notification item click
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (notification.status === 'UNREAD') {
      markAsRead(notification.id);
    }
    
    // Close the menu
    handleNotificationsClose();
    
    // Navigate based on notification type
    if (notification.type === 'APPLICATION') {
      // Extract data from content
      const contentObj = notification.contentObj || {};
      
      // If we have an application ID, navigate to application details
      if (contentObj.applicationId) {
        navigate('/applications');
      }
    } else if (notification.type === 'MESSAGE') {
      // Navigate to messages or inbox
      navigate('/messages');
    } else if (notification.type === 'SYSTEM') {
      // System notifications might not need navigation
    }
  };

  // Effect for fetching notifications and setting up polling
  useEffect(() => {
    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();
    
    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchNotifications, fetchUnreadCount]);

  return (
    <>
      {/* Notification Icon with Badge */}
      <IconButton
        onClick={handleNotificationsClick}
        size="large"
        aria-label="show notifications"
        aria-controls="notifications-menu"
        aria-haspopup="true"
        sx={{
          color: '#FFD700',
          '&:hover': {
            backgroundColor: 'rgba(255, 215, 0, 0.1)'
          }
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#ff6b6b',
              color: 'white',
              fontWeight: 'bold'
            }
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      {/* Notifications Menu */}
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={notificationsOpen}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: '350px',
            backgroundColor: '#1A1A1A',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: '#FFD700', fontWeight: 600 }}>
            Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
          </Typography>
          
          {unreadCount > 0 && (
            <Button
              startIcon={<DoneAllIcon />}
              onClick={markAllAsRead}
              size="small"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#FFD700'
                },
                fontSize: '0.75rem'
              }}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        
        <Divider sx={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }} />
        
        {notifications.length === 0 ? (
          <MenuItem sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            <ListItemText primary="No notifications" />
          </MenuItem>
        ) : (
          <>
            {notifications.map((notification) => {
              const contentObj = notification.contentObj || {};
              const isApplication = notification.type === 'APPLICATION';
              const isMessage = notification.type === 'MESSAGE';
              const isSystem = notification.type === 'SYSTEM';
              
              let title = 'Notification';
              let content = 'You have a new notification';
              
              if (isApplication && contentObj.jobTitle) {
                title = 'Application Update';
                content = `Update on your application for ${contentObj.jobTitle}`;
              } else if (isMessage && contentObj.senderName) {
                title = 'New Message';
                content = `New message from ${contentObj.senderName}`;
              } else if (isSystem) {
                title = 'System Notification';
                content = notification.content || 'System update';
              }
              
              return (
                <MenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    borderLeft: notification.status === 'UNREAD' ? '3px solid #2C5530' : 'none',
                    backgroundColor: notification.status === 'UNREAD' ? 'rgba(44, 85, 48, 0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.1)'
                    },
                    padding: '10px 16px'
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          color: '#FFD700',
                          fontWeight: notification.status === 'UNREAD' ? 600 : 400,
                          fontSize: '0.9rem'
                        }}
                      >
                        {title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: notification.status === 'UNREAD' ? 500 : 400,
                          fontSize: '0.8rem'
                        }}
                      >
                        {content}
                        {notification.createdAt && (
                          <Box component="span" sx={{ display: 'block', fontSize: '0.75rem', mt: 0.5, color: 'rgba(255, 255, 255, 0.5)' }}>
                            {new Date(notification.createdAt).toLocaleString()}
                          </Box>
                        )}
                      </Typography>
                    }
                  />
                </MenuItem>
              );
            })}
            
            <Divider sx={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }} />
            
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                size="small"
                sx={{
                  color: '#FFD700',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.1)'
                  },
                  fontSize: '0.8rem'
                }}
                onClick={handleNotificationsClose}
              >
                Close
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationsMenu;

