import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user || user.role !== 'EMPLOYER') {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('jamdung_auth_token');
      const response = await fetch('http://localhost:5000/api/employer/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const notificationsList = data.notifications || [];
        setNotifications(notificationsList);
        setUnreadCount(notificationsList.filter(n => !n.read).length);
      } else {
        // Mock data for demo
        const mockNotifications = [
          {
            id: 1,
            type: 'new_application',
            title: 'New Application Received',
            message: 'John Doe applied for Software Developer position',
            createdAt: new Date().toISOString(),
            read: false
          },
          {
            id: 2,
            type: 'interview_scheduled',
            title: 'Interview Scheduled',
            message: 'Interview with Jane Smith scheduled for tomorrow',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            read: false
          }
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('jamdung_auth_token');
      const response = await fetch(`http://localhost:5000/api/employer/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('jamdung_auth_token');
      const response = await fetch('http://localhost:5000/api/employer/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Fetch notifications when user changes or component mounts
  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Poll for new notifications every 30 seconds for employers
  useEffect(() => {
    if (!user || user.role !== 'EMPLOYER') return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const value = {
    unreadCount,
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;