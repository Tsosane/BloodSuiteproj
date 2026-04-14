// src/services/hospitalService.js
import api from './api';

const hospitalService = {
  // Get all hospitals (admin only)
  getAllHospitals: async (params = {}) => {
    try {
      const response = await api.get('/hospitals', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get current hospital profile
  getMyHospital: async () => {
    try {
      const response = await api.get('/hospitals/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get hospital by ID
  getHospitalById: async (id) => {
    try {
      const response = await api.get(`/hospitals/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Register new hospital
  registerHospital: async (data) => {
    try {
      const response = await api.post('/hospitals/register', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update hospital (admin only)
  updateHospital: async (id, data) => {
    try {
      const response = await api.put(`/hospitals/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Approve hospital registration (admin only)
  approveHospital: async (id) => {
    try {
      const response = await api.put(`/hospitals/${id}/approve`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reject hospital registration (admin only)
  rejectHospital: async (id) => {
    try {
      const response = await api.put(`/hospitals/${id}/reject`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get pending hospitals (admin/manager)
  getPendingHospitals: async () => {
    try {
      const response = await api.get('/hospitals/pending');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get hospital statistics
  getHospitalStats: async () => {
    try {
      const response = await api.get('/hospitals/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get hospital performance metrics
  getHospitalPerformance: async (hospitalId) => {
    try {
      const response = await api.get(`/hospitals/${hospitalId}/performance`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default hospitalService;