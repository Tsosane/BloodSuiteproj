// src/services/authService.js
import api from './api';

const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.token) {
        localStorage.setItem('bloodSuiteToken', response.token);
        localStorage.setItem('bloodSuiteUserRole', response.user.role);
        localStorage.setItem('bloodSuiteUserEmail', response.user.email);
        localStorage.setItem('bloodSuiteUserRoleDisplay', response.user.roleDisplay);
        if (response.user.hospitalName) {
          localStorage.setItem('bloodSuiteHospital', response.user.hospitalName);
        }
        if (response.user.hospitalId) {
          localStorage.setItem('bloodSuiteHospitalId', response.user.hospitalId);
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('bloodSuiteToken');
    localStorage.removeItem('bloodSuiteUserRole');
    localStorage.removeItem('bloodSuiteUserRoleDisplay');
    localStorage.removeItem('bloodSuiteUserEmail');
    localStorage.removeItem('bloodSuiteHospital');
    localStorage.removeItem('bloodSuiteHospitalId');
    localStorage.removeItem('bloodSuiteHospitalCode');
    localStorage.removeItem('bloodSuiteLastUser');
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('bloodSuiteToken');
    return !!token;
  },

  // Get user role
  getUserRole: () => {
    return localStorage.getItem('bloodSuiteUserRole');
  },

  // Get user email
  getUserEmail: () => {
    return localStorage.getItem('bloodSuiteUserEmail');
  },

  // Get user hospital
  getUserHospital: () => {
    return localStorage.getItem('bloodSuiteHospital');
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      if (response.token) {
        localStorage.setItem('bloodSuiteToken', response.token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', { oldPassword, newPassword });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset password request
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;