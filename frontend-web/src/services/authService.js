// src/services/authService.js
import api from './api';

const persistSession = ({ token, user, profile }) => {
  if (!token || !user) {
    return;
  }

  localStorage.setItem('bloodSuiteToken', token);
  localStorage.setItem('bloodSuiteUserRole', user.role);
  localStorage.setItem('bloodSuiteUserEmail', user.email);
  localStorage.setItem('bloodSuiteUserRoleDisplay', user.role);

  if (profile?.hospital_name) {
    localStorage.setItem('bloodSuiteHospital', profile.hospital_name);
  } else {
    localStorage.removeItem('bloodSuiteHospital');
  }

  if (profile?.id) {
    localStorage.setItem('bloodSuiteHospitalId', profile.id);
  } else {
    localStorage.removeItem('bloodSuiteHospitalId');
  }
};

const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const payload = response.data || {};
    const normalized = {
      success: response.success,
      user: payload.user,
      profile: payload.profile || null,
      token: payload.token,
      message: response.message,
    };

    persistSession(normalized);

    return normalized;
  },

  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return {
      success: response.success,
      user: response.data?.user,
      token: response.data?.token,
      message: response.message,
    };
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    const payload = response.data || {};

    return {
      success: response.success,
      user: payload.user,
      profile: payload.profile || null,
    };
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
