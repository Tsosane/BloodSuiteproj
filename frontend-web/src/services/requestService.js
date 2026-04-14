// src/services/requestService.js
import api from './api';

const requestService = {
  // Get all requests (with filters)
  getAllRequests: async (params = {}) => {
    try {
      const response = await api.get('/requests', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get requests by hospital
  getRequestsByHospital: async (hospitalId) => {
    try {
      const response = await api.get(`/requests/hospital/${hospitalId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get single request
  getRequestById: async (id) => {
    try {
      const response = await api.get(`/requests/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Submit new blood request
  submitRequest: async (data) => {
    try {
      const response = await api.post('/requests', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update request status
  updateRequestStatus: async (id, status) => {
    try {
      const response = await api.patch(`/requests/${id}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Fulfill request (allocates FEFO units)
  fulfillRequest: async (id) => {
    try {
      const response = await api.put(`/requests/${id}/fulfill`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cancel request
  cancelRequest: async (id) => {
    try {
      const response = await api.delete(`/requests/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get urgent/emergency requests
  getUrgentRequests: async () => {
    try {
      const response = await api.get('/requests/urgent');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get request statistics
  getRequestStats: async () => {
    try {
      const response = await api.get('/requests/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get request trends
  getRequestTrends: async (period = '30days') => {
    try {
      const response = await api.get(`/requests/trends?period=${period}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default requestService;