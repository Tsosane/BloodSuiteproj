// src/services/analyticsService.js
import api from './api';

const analyticsService = {
  // Get dashboard KPIs
  getDashboard: async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get inventory summary
  getInventorySummary: async () => {
    try {
      const response = await api.get('/analytics/inventory-summary');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get request trends
  getRequestTrends: async (period = '30days') => {
    try {
      const response = await api.get(`/analytics/request-trends?period=${period}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get donor statistics
  getDonorStats: async () => {
    try {
      const response = await api.get('/analytics/donor-stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get hospital statistics
  getHospitalStats: async () => {
    try {
      const response = await api.get('/analytics/hospital-stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get fulfillment rate
  getFulfillmentRate: async () => {
    try {
      const response = await api.get('/analytics/fulfillment-rate');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get weekly demand pattern
  getWeeklyDemandPattern: async () => {
    try {
      const response = await api.get('/analytics/weekly-demand');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get hospital performance ranking
  getHospitalPerformance: async () => {
    try {
      const response = await api.get('/analytics/hospital-performance');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get expiry analysis
  getExpiryAnalysis: async () => {
    try {
      const response = await api.get('/analytics/expiry-analysis');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export analytics report
  exportReport: async (type, format, dateRange) => {
    try {
      const response = await api.post('/analytics/export', { type, format, dateRange });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default analyticsService;