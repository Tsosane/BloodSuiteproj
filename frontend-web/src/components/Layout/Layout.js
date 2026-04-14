// src/components/Layout/Layout.js
import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import useAuth from '../../hooks/useAuth';

const Layout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userName = user?.fullName || user?.hospitalName || user?.email?.split('@')[0] || 'User';
  const userRole = user?.role || localStorage.getItem('bloodSuiteUserRole');
  const userHospital = user?.hospitalName || localStorage.getItem('bloodSuiteHospital');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar 
        onMenuClick={handleDrawerToggle} 
        userName={userName}
        userRole={userRole}
        userHospital={userHospital}
        onLogout={handleLogout}
      />
      <Sidebar 
        open={!isMobile}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        userRole={userRole}
        userName={userName}
        userHospital={userHospital}
        onLogout={handleLogout}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 280px)` },
          mt: 8,
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;