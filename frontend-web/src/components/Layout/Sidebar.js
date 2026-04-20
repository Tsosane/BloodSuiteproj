// src/components/Layout/Sidebar.js
import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
  Collapse,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  LocalHospital as LocalHospitalIcon,
  Person as PersonIcon,
  Bloodtype as BloodtypeIcon,
  RequestPage as RequestIcon,
  Notifications as NotificationsIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Help as HelpIcon,
  LocationOn as LocationIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const Sidebar = ({ open, mobileOpen, onClose, userRole, userName, userHospital, onLogout }) => {
  const location = useLocation();
  const theme = useTheme();
  const [openMenus, setOpenMenus] = useState({});

  const handleMenuToggle = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Menu items based on role
  const getMenuItems = () => {
    const baseItems = [];

    if (userRole === 'admin') {
      return [
        {
          title: 'Dashboard',
          icon: <DashboardIcon />,
          path: '/admin/dashboard',
          children: null,
        },
        {
          title: 'User Management',
          icon: <PeopleIcon />,
          path: '/admin/users',
          children: null,
        },
        {
          title: 'Hospital Approvals',
          icon: <LocalHospitalIcon />,
          path: '/admin/hospitals/pending',
          children: null,
        },
        {
          title: 'Data Import',
          icon: <AdminIcon />,
          path: '/admin/data-import',
          children: null,
        },
        {
          title: 'Blood Inventory',
          icon: <BloodtypeIcon />,
          path: '/inventory',
          children: null,
        },
        {
          title: 'Analytics',
          icon: <AnalyticsIcon />,
          path: '/analytics',
          children: null,
        },
        {
          title: 'Request Forecast',
          icon: <TrendingUpIcon />,
          path: '/analytics/forecast',
          children: null,
        },
      ];
    }

    if (userRole === 'hospital') {
      return [
        {
          title: 'Dashboard',
          icon: <DashboardIcon />,
          path: '/hospital/dashboard',
          children: null,
        },
        {
          title: 'Inventory Management',
          icon: <BloodtypeIcon />,
          path: '/inventory',
          children: [
            { title: 'View Inventory', path: '/inventory', icon: <BloodtypeIcon /> },
            { title: 'Add Blood Unit', path: '/inventory/add', icon: <BloodtypeIcon /> },
          ],
        },
        {
          title: 'Blood Requests',
          icon: <RequestIcon />,
          path: '/requests',
          children: [
            { title: 'New Request', path: '/requests/new', icon: <RequestIcon /> },
            { title: 'Track Requests', path: '/requests/track', icon: <RequestIcon /> },
            { title: 'Request History', path: '/requests/history', icon: <HistoryIcon /> },
          ],
        },
        {
          title: 'Nearby Donors',
          icon: <LocationIcon />,
          path: '/donors/nearby',
          children: null,
        },
        {
          title: 'Analytics',
          icon: <AnalyticsIcon />,
          path: '/analytics',
          children: null,
        },
        {
          title: 'Request Forecast',
          icon: <TrendingUpIcon />,
          path: '/analytics/forecast',
          children: null,
        },
        {
          title: 'Settings',
          icon: <SettingsIcon />,
          path: '/settings',
          children: null,
        },
        {
          title: 'Help & Support',
          icon: <HelpIcon />,
          path: '/help',
          children: null,
        },
      ];
    }

    if (userRole === 'donor') {
      return [
        {
          title: 'Dashboard',
          icon: <DashboardIcon />,
          path: '/donor/dashboard',
          children: null,
        },
        {
          title: 'My Profile',
          icon: <PersonIcon />,
          path: '/profile',
          children: null,
        },
        {
          title: 'Eligibility Status',
          icon: <HistoryIcon />,
          path: '/eligibility',
          children: null,
        },
        {
          title: 'Donation History',
          icon: <HistoryIcon />,
          path: '/donations',
          children: null,
        },
        {
          title: 'Settings',
          icon: <SettingsIcon />,
          path: '/settings',
          children: null,
        },
        {
          title: 'Help & Support',
          icon: <HelpIcon />,
          path: '/help',
          children: null,
        },
      ];
    }

    if (userRole === 'blood_bank_manager') {
      return [
        {
          title: 'Dashboard',
          icon: <DashboardIcon />,
          path: '/manager/dashboard',
          children: null,
        },
        {
          title: 'Inventory Overview',
          icon: <BloodtypeIcon />,
          path: '/inventory',
          children: null,
        },
        {
          title: 'Analytics & Reporting',
          icon: <AnalyticsIcon />,
          path: '/analytics',
          children: [
            { title: 'Analytics Dashboard', path: '/analytics', icon: <AnalyticsIcon /> },
            { title: 'Request Forecast', path: '/analytics/forecast', icon: <TrendingUpIcon /> },
          ],
        },
        {
          title: 'Settings',
          icon: <SettingsIcon />,
          path: '/settings',
          children: null,
        },
        {
          title: 'Help & Support',
          icon: <HelpIcon />,
          path: '/help',
          children: null,
        },
      ];
    }

    return baseItems;
  };

  const renderMenuItem = (item, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.path);

    if (hasChildren) {
      return (
        <Box key={item.title}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                handleMenuToggle(item.title);
                if (onClose) onClose();
              }}
              selected={isItemActive}
              sx={{
                pl: depth * 2 + 2,
                pr: 2,
                py: 1,
                borderRadius: 1,
                mx: 1,
                '&.Mui-selected': {
                  bgcolor: '#fff5f5',
                  '&:hover': { bgcolor: '#ffe0e0' },
                  '& .MuiListItemIcon-root': { color: '#d32f2f' },
                  '& .MuiListItemText-primary': { color: '#d32f2f', fontWeight: 600 },
                },
                '&:hover': {
                  bgcolor: '#f5f5f5',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isItemActive ? '#d32f2f' : '#666' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: isItemActive ? 600 : 400,
                }}
              />
              {openMenus[item.title] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenus[item.title]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        </Box>
      );
    }

    return (
      <Box key={item.title}>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to={item.path}
            onClick={() => {
              if (onClose) onClose();
            }}
            selected={isItemActive}
            sx={{
              pl: depth * 2 + 2,
              pr: 2,
              py: 1,
              borderRadius: 1,
              mx: 1,
              '&.Mui-selected': {
                bgcolor: '#fff5f5',
                '&:hover': { bgcolor: '#ffe0e0' },
                '& .MuiListItemIcon-root': { color: '#d32f2f' },
                '& .MuiListItemText-primary': { color: '#d32f2f', fontWeight: 600 },
              },
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: isItemActive ? '#d32f2f' : '#666' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: isItemActive ? 600 : 400,
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    );
  };

  const menuItems = getMenuItems();

  const drawerVariant = open ? 'permanent' : 'temporary';
  const drawerOpen = open || mobileOpen;

  return (
    <Drawer
      variant={drawerVariant}
      open={drawerOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: drawerOpen ? 'block' : 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid #e0e0e0',
          bgcolor: '#ffffff',
        },
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Avatar sx={{ bgcolor: '#d32f2f', width: 40, height: 40 }}>
          <BloodtypeIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f', lineHeight: 1.2 }}>
            BloodSuite
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Blood Bank Management
          </Typography>
        </Box>
      </Box>

      {/* User Info */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#fff5f5',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: '#d32f2f' }}>
            {userName?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {userName || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userRole === 'admin' && 'System Administrator'}
              {userRole === 'hospital' && 'Hospital Staff'}
              {userRole === 'donor' && 'Donor'}
              {userRole === 'blood_bank_manager' && 'Blood Bank Manager'}
            </Typography>
            {userHospital && (
              <Typography variant="caption" color="text.secondary" display="block">
                {userHospital}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((item) => renderMenuItem(item))}
      </List>

      <Divider />

      {/* Footer Actions */}
      <List sx={{ py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={onLogout}
            sx={{
              mx: 1,
              borderRadius: 1,
              '&:hover': { bgcolor: '#fff5f5' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: '#d32f2f' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Version Info */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          BloodSuite v1.0.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;