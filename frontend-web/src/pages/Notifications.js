// src/pages/Notifications.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Close as CloseIcon,
  DoneAll as DoneAllIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import notificationService from '../services/notificationService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({ limit: 50 });
      setNotifications(response.data || []);

      const unreadResponse = await notificationService.getUnreadCount();
      setUnreadCount(unreadResponse.data?.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
      case 'alert':
        return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'success':
        return <CheckIcon sx={{ color: '#4caf50' }} />;
      default:
        return <InfoIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning':
      case 'alert':
        return '#ff9800';
      case 'error':
        return '#f44336';
      case 'success':
        return '#4caf50';
      default:
        return '#2196f3';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f', mb: 1 }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchNotifications} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </Button>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No notifications at this time
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Paper>
              <List sx={{ width: '100%' }}>
                {notifications.map((notification, index) => (
                  <Box key={notification.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      disablePadding
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {!notification.read && (
                            <Tooltip title="Mark as read">
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => setDeleteConfirm(notification.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemButton
                        onClick={() => handleNotificationClick(notification)}
                        sx={{
                          backgroundColor: notification.read ? 'transparent' : '#f5f5f5',
                          '&:hover': {
                            backgroundColor: notification.read ? '#fafafa' : '#eeeeee',
                          },
                        }}
                      >
                        <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                          {getNotificationIcon(notification.type)}
                        </Box>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: notification.read ? 400 : 600,
                                color: notification.read ? 'text.primary' : '#d32f2f',
                              }}
                            >
                              {notification.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {notification.message}
                              <br />
                              {new Date(notification.createdAt || notification.created_at).toLocaleString()}
                            </Typography>
                          }
                        />
                        {!notification.read && (
                          <Chip
                            label="New"
                            size="small"
                            sx={{
                              ml: 2,
                              backgroundColor: '#d32f2f',
                              color: 'white',
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  </Box>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Notification Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedNotification && getNotificationIcon(selectedNotification.type)}
            {selectedNotification?.title}
          </Box>
          <IconButton size="small" onClick={() => setDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" paragraph>
                {selectedNotification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(selectedNotification.createdAt || selectedNotification.created_at).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this notification?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={() => handleDeleteNotification(deleteConfirm)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notifications;
