import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/axiosConfig';

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
      const response = await api.get('/api/notifications');

      if (response.status === 200) {
        const data = response.data;
        const notificationsList = data.data || [];
        setNotifications(notificationsList);
        setUnreadCount(notificationsList.filter(n => n.status === 'UNREAD').length);
      } else {
        // Mock data for demo
        const mockNotifications = [
          {
            id: 1,
            type: 'APPLICATION_UPDATE',
            title: 'New Application Received',
            content: 'John Doe applied for Software Developer position',
            createdAt: new Date().toISOString(),
            status: 'UNREAD',
            read: false
          },
          {
            id: 2,
            type: 'SYSTEM',
            title: 'Interview Scheduled',
            content: 'Interview with Jane Smith scheduled for tomorrow',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            status: 'UNREAD',
            read: false
          }
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => n.status === 'UNREAD').length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/mark-read`);

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, status: 'read', read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/mark-all-read');

      setNotifications(prev => prev.map(notif => ({ ...notif, status: 'read', read: true })));
      setUnreadCount(0);
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