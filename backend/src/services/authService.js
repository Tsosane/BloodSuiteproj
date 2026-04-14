// src/services/authService.js
import api from './api';

const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.token) {
      localStorage.setItem('bloodSuiteToken', response.data.token);
      localStorage.setItem('bloodSuiteUserRole', response.data.user.role);
      localStorage.setItem('bloodSuiteUserEmail', response.data.user.email);
      if (response.data.profile?.hospital_name) {
        localStorage.setItem('bloodSuiteHospital', response.data.profile.hospital_name);
      }
    }
    return response;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response;
  },

  logout: () => {
    localStorage.removeItem('bloodSuiteToken');
    localStorage.removeItem('bloodSuiteUserRole');
    localStorage.removeItem('bloodSuiteUserEmail');
    localStorage.removeItem('bloodSuiteHospital');
    window.location.href = '/login';
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('bloodSuiteToken');
  },

  getUserRole: () => {
    return localStorage.getItem('bloodSuiteUserRole');
  },

  getUserEmail: () => {
    return localStorage.getItem('bloodSuiteUserEmail');
  },
};

export default authService;