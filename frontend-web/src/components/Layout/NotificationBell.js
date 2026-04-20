import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  Typography,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const recentNotifications = notifications.slice(0, 6);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenNotifications = () => {
    handleClose();
    navigate('/notifications');
  };

  return (
    <>
      <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} size="large">
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? (
            <NotificationsActiveIcon sx={{ color: '#d32f2f' }} />
          ) : (
            <NotificationsIcon />
          )}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 4,
          sx: {
            width: 360,
            maxHeight: 460,
            borderRadius: 2,
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f' }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead} sx={{ color: '#d32f2f' }}>
              Mark all read
            </Button>
          )}
        </Box>

        <Divider />

        {recentNotifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet.
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {recentNotifications.map((notification) => (
              <ListItem key={notification.id} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                    handleOpenNotifications();
                  }}
                  sx={{
                    bgcolor: notification.read ? 'transparent' : '#fff5f5',
                    alignItems: 'flex-start',
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 500 : 700 }}>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.createdAt || notification.created_at).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        <Divider />

        <Box sx={{ p: 1.5, textAlign: 'center' }}>
          <Button size="small" sx={{ color: '#d32f2f' }} onClick={handleOpenNotifications}>
            View all notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBell;
