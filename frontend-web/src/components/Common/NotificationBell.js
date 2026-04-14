// src/components/Common/NotificationBell.js
import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Button,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  CheckCircle as CheckCircleIcon,
  LocalHospital as LocalHospitalIcon,
  Bloodtype as BloodtypeIcon,
  Warning as WarningIcon,
  Error as EmergencyIcon,
  Person as PersonIcon,
  Done as DoneIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const open = Boolean(anchorEl);

  // Load notifications from localStorage or API
  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem('bloodSuiteNotifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } else {
        // Demo notifications
        const demoNotifications = [
          {
            id: '1',
            type: 'low_stock',
            title: 'Low Stock Alert',
            message: 'O-negative blood stock is below 5 units',
            priority: 'high',
            read: false,
            createdAt: new Date().toISOString(),
            icon: 'warning',
          },
          {
            id: '2',
            type: 'expiry',
            title: 'Blood Unit Expiring',
            message: '2 units of A-positive expiring in 3 days',
            priority: 'high',
            read: false,
            createdAt: new Date().toISOString(),
            icon: 'blood',
          },
          {
            id: '3',
            type: 'request',
            title: 'Emergency Request',
            message: 'Queen Elizabeth Hospital needs O-negative urgently',
            priority: 'critical',
            read: false,
            createdAt: new Date().toISOString(),
            icon: 'emergency',
          },
          {
            id: '4',
            type: 'eligibility',
            title: 'Donation Eligibility Restored',
            message: 'You are now eligible to donate blood again',
            priority: 'medium',
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            icon: 'person',
          },
        ];
        setNotifications(demoNotifications);
        setUnreadCount(demoNotifications.filter(n => !n.read).length);
        localStorage.setItem('bloodSuiteNotifications', JSON.stringify(demoNotifications));
      }
    };

    loadNotifications();
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    localStorage.setItem('bloodSuiteNotifications', JSON.stringify(updated));
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    localStorage.setItem('bloodSuiteNotifications', JSON.stringify(updated));
  };

  const handleDelete = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    localStorage.setItem('bloodSuiteNotifications', JSON.stringify(updated));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'warning':
        return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'blood':
        return <BloodtypeIcon sx={{ color: '#d32f2f' }} />;
      case 'emergency':
        return <EmergencyIcon sx={{ color: '#f44336' }} />;
      case 'person':
        return <PersonIcon sx={{ color: '#2196f3' }} />;
      default:
        return <LocalHospitalIcon sx={{ color: '#d32f2f' }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical':
        return '#f44336';
      case 'high':
        return '#ff9800';
      case 'medium':
        return '#2196f3';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={handleClick} size="large">
          <Badge badgeContent={unreadCount} color="error">
            {unreadCount > 0 ? (
              <NotificationsActiveIcon sx={{ color: '#d32f2f' }} />
            ) : (
              <NotificationsIcon />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 4,
          sx: {
            width: 380,
            maxHeight: 500,
            overflow: 'auto',
            borderRadius: 2,
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#d32f2f' }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{ color: '#d32f2f' }}
              startIcon={<DoneIcon />}
            >
              Mark all read
            </Button>
          )}
        </Box>
        
        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: notification.read ? 'transparent' : '#fff5f5',
                  borderBottom: '1px solid #f0f0f0',
                  '&:hover': { bgcolor: '#fafafa' },
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleDelete(notification.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      bgcolor: getPriorityColor(notification.priority) + '20',
                      color: getPriorityColor(notification.priority),
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getIcon(notification.icon)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.priority}
                        size="small"
                        sx={{
                          bgcolor: getPriorityColor(notification.priority),
                          color: 'white',
                          fontSize: '0.65rem',
                          height: 20,
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
                {!notification.read && (
                  <IconButton
                    size="small"
                    onClick={() => handleMarkAsRead(notification.id)}
                    sx={{ ml: 1 }}
                  >
                    <DoneIcon fontSize="small" />
                  </IconButton>
                )}
              </ListItem>
            ))}
          </List>
        )}

        <Divider />
        
        <Box sx={{ p: 1.5, textAlign: 'center' }}>
          <Button
            size="small"
            sx={{ color: '#d32f2f' }}
            onClick={() => {
              handleClose();
              // Navigate to notifications page
            }}
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBell;