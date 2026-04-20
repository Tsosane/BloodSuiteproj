// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const hydrateUser = (authPayload) => {
    if (!authPayload?.user) {
      return null;
    }

    return {
      ...authPayload.user,
      hospitalName: authPayload.profile?.hospital_name || null,
      hospitalId: authPayload.profile?.id || null,
      profile: authPayload.profile || null,
    };
  };

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = localStorage.getItem('bloodSuiteToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(hydrateUser(userData));
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('bloodSuiteToken');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(hydrateUser(response));
      setIsAuthenticated(true);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.error || error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.error || error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    setIsAuthenticated,
    login,
    register,
    logout,
    updateUser,
    getUserRole: () => user?.role || localStorage.getItem('bloodSuiteUserRole'),
    getUserHospital: () => user?.hospitalName || localStorage.getItem('bloodSuiteHospital'),
    getUserEmail: () => user?.email || localStorage.getItem('bloodSuiteUserEmail'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
