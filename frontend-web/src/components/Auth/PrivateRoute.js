// src/components/Auth/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const token = localStorage.getItem('bloodSuiteToken');
  const userRole = localStorage.getItem('bloodSuiteUserRole');
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (userRole === 'hospital') return <Navigate to="/hospital/dashboard" replace />;
    if (userRole === 'donor') return <Navigate to="/donor/dashboard" replace />;
    if (userRole === 'blood_bank_manager') return <Navigate to="/manager/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;