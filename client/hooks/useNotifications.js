import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '@/lib/auth-context';

// Define API base URL - use the same one used in auth-context.js
const API_BASE_URL = 'http://localhost:5296';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connection, setConnection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState(null);
  const auth = useAuth();
  const token = localStorage.getItem('token');

  // Ref to track if event handlers are registered
  const handlersRegistered = useRef(false);
  // Ref to track processed notification IDs to prevent duplicate logs
  const processedNotifications = useRef(new Set());

  // Initialize SignalR connection
  useEffect(() => {
    if (!token || !auth.userId) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/notifications`, {
        accessTokenFactory: () => token,
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection && newConnection.state === signalR.HubConnectionState.Connected) {
        newConnection.stop();
        handlersRegistered.current = false; // Reset the flag when connection is stopped
        processedNotifications.current.clear(); // Clear the processed notifications set
      }
    };
  }, [token, auth.userId]);

  // Start connection and register event handlers
  useEffect(() => {
    if (!connection || !auth.userId) return;

    const startConnection = async () => {
      try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
          await connection.start();
          console.log('SignalR connection established successfully');
          
          // Load initial notifications
          await fetchNotifications();
          await fetchNotificationStats();
          await fetchPreferences();
        }
      } catch (err) {
        console.error('Error establishing SignalR connection:', err);
        setTimeout(startConnection, 5000);
      }
    };

    // Only register handlers once
    if (!handlersRegistered.current) {
      // Register handlers for real-time updates
      connection.on('ReceiveNotification', (notification) => {
        // Only log if this notification hasn't been processed before
        if (!processedNotifications.current.has(notification.id)) {
          console.log('Received notification:', notification);
          processedNotifications.current.add(notification.id);
          
          // Update notifications state but prevent duplicates
          setNotifications(prev => {
            if (prev.some(n => n.id === notification.id)) return prev;
            return [notification, ...prev];
          });
          
          setUnreadCount(prev => prev + 1);
        }
      });

      connection.on('NotificationRead', (notificationId) => {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId 
            ? { ...n, isRead: true } 
            : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      });

      connection.on('AllNotificationsRead', () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      });

      connection.on('NotificationDeleted', (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        // Update unread count if needed
        fetchNotificationStats();
      });

      connection.onreconnecting(error => {
        console.log('SignalR attempting to reconnect:', error);
      });

      connection.onreconnected(connectionId => {
        console.log('SignalR reconnected with connectionId:', connectionId);
      });

      connection.onclose(error => {
        console.log('SignalR connection closed:', error);
      });

      // Mark that we've registered the handlers
      handlersRegistered.current = true;
    }

    startConnection();
  }, [connection, auth.userId]);

  // Fetch notifications from the API
  const fetchNotifications = useCallback(async (page = 1, pageSize = 20) => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/notifications?page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fetch notification stats (unread count)
  const fetchNotificationStats = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  }, [token]);

  // Fetch user notification preferences
  const fetchPreferences = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/preferences`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  }, [token]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!token) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId 
            ? { ...n, isRead: true } 
            : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [token]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/mark-all-read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [token]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!token) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        // Update unread count if needed
        fetchNotificationStats();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [token, fetchNotificationStats]);

  // Update notification preferences
  const updatePreferences = useCallback(async (updatedPreferences) => {
    if (!token) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/preferences`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedPreferences)
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }, [token]);

  return {
    notifications,
    unreadCount,
    preferences,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    fetchNotifications,
    fetchNotificationStats
  };
}

export default useNotifications;