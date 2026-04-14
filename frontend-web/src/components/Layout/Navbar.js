// src/components/Layout/Navbar.js
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Tooltip,
  Button,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Navbar = ({ onMenuClick, userName, userRole, userHospital, onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const getRoleBadge = () => {
    switch(userRole) {
      case 'admin':
        return { label: 'Admin', color: '#ed6c02' };
      case 'hospital':
        return { label: 'Hospital Staff', color: '#d32f2f' };
      case 'donor':
        return { label: 'Donor', color: '#1976d2' };
      case 'blood_bank_manager':
        return { label: 'Manager', color: '#2e7d32' };
      default:
        return { label: 'User', color: '#666' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: '#ffffff',
        color: '#333',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left Section */}
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#d32f2f',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            BloodSuite
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 2 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/dashboard')}
              sx={{ textTransform: 'none', color: '#666' }}
            >
              Dashboard
            </Button>
          </Box>
        </Box>

        {/* Right Section */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* User Info - Desktop */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', mr: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
              {userName || 'User'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                bgcolor: roleBadge.color,
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 2,
                fontSize: '0.7rem',
              }}
            >
              {roleBadge.label}
            </Typography>
          </Box>

          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenuClick}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#d32f2f' }}>
                {userName?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 4,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.08))',
                mt: 1.5,
                minWidth: 200,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {userName || 'User'}
              </Typography>
              {userHospital && (
                <Typography variant="caption" color="text.secondary">
                  {userHospital}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" display="block">
                {userRole === 'admin' && 'System Administrator'}
                {userRole === 'hospital' && 'Hospital Staff'}
                {userRole === 'donor' && 'Donor'}
                {userRole === 'blood_bank_manager' && 'Blood Bank Manager'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => handleNavigate('/profile')}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              My Profile
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/dashboard')}>
              <ListItemIcon>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              Dashboard
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/settings')}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleNavigate('/help')}>
              <ListItemIcon>
                <HelpIcon fontSize="small" />
              </ListItemIcon>
              Help & Support
            </MenuItem>
            <MenuItem onClick={onLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#d32f2f' }} />
              </ListItemIcon>
              <Typography sx={{ color: '#d32f2f' }}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;