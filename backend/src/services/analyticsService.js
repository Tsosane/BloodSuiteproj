// src/services/analyticsService.js
import api from './api';

const analyticsService = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response;
  },

  getInventorySummary: async () => {
    const response = await api.get('/analytics/inventory-summary');
    return response;
  },

  getRequestTrends: async (period = '30days') => {
    const response = await api.get(`/analytics/request-trends?period=${period}`);
    return response;
  },

  getDonorStats: async () => {
    const response = await api.get('/analytics/donor-stats');
    return response;
  },
};

export default analyticsService;