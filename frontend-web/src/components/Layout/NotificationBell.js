import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Bloodtype as BloodIcon,
  LocalHospital as HospitalIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Generate mock notifications
    const mockNotifications = [
      {
        id: 1,
        type: 'urgent',
        title: 'Urgent Blood Needed',
        message: 'O+ blood type urgently needed at Queen Elizabeth II Hospital',
        time: '5 minutes ago',
        read: false,
        icon: <BloodIcon sx={{ color: '#d32f2f' }} />,
      },
      {
        id: 2,
        type: 'appointment',
        title: 'Appointment Reminder',
        message: 'Your donation appointment is scheduled for tomorrow at 10:00 AM',
        time: '1 hour ago',
        read: false,
        icon: <ScheduleIcon sx={{ color: '#1976d2' }} />,
      },
      {
        id: 3,
        type: 'success',
        title: 'Donation Successful',
        message: 'Thank you for your recent blood donation on March 15, 2024',
        time: '2 days ago',
        read: true,
        icon: <CheckIcon sx={{ color: '#4caf50' }} />,
      },
      {
        id: 4,
        type: 'info',
        title: 'Blood Drive Announcement',
        message: 'Community blood drive event this weekend at Maseru Mall',
        time: '3 days ago',
        read: true,
        icon: <InfoIcon sx={{ color: '#ff9800' }} />,
      },
      {
        id: 5,
        type: 'hospital',
        title: 'Hospital Update',
        message: 'Scott Hospital has updated their blood inventory levels',
        time: '1 week ago',
        read: true,
        icon: <HospitalIcon sx={{ color: '#9c27b0' }} />,
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  const getNotificationColor = (type) => {
    switch (type) {
      case 'urgent':
        return '#d32f2f';
      case 'appointment':
        return '#1976d2';
      case 'success':
        return '#4caf50';
      case 'info':
        return '#ff9800';
      case 'hospital':
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-describedby={id}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? (
            <NotificationsIcon />
          ) : (
            <NotificationsNoneIcon />
          )}
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={markAllAsRead}
                sx={{ textTransform: 'none' }}
              >
                Mark all as read
              </Button>
            )}
          </Box>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              size="small"
              sx={{ mt: 1, bgcolor: '#ffebee', color: '#d32f2f' }}
            />
          )}
        </Box>

        <List sx={{ p: 0, maxHeight: 360, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.read ? 'transparent' : '#f5f5f5',
                    '&:hover': { bgcolor: '#eeeeee' },
                    cursor: 'pointer',
                  }}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {notification.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: notification.read ? 'normal' : 600,
                            color: getNotificationColor(notification.type),
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: getNotificationColor(notification.type),
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(notification.time)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>

        {notifications.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={handleClose}
              sx={{ textTransform: 'none' }}
            >
              View All Notifications
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationBell;
