// src/services/forecastService.js
import api from './api';

const forecastService = {
  // Get demand forecasts
  getForecasts: async (params = {}) => {
    try {
      const response = await api.get('/forecast', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get forecast by blood type
  getForecastByBloodType: async (bloodType, horizon = '30day') => {
    try {
      const response = await api.get(`/forecast/${bloodType}?horizon=${horizon}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get shortage alerts
  getShortageAlerts: async () => {
    try {
      const response = await api.get('/forecast/alerts');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get recommended minimum stock levels
  getRecommendedStock: async () => {
    try {
      const response = await api.get('/forecast/recommendations');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get forecast accuracy metrics
  getForecastAccuracy: async () => {
    try {
      const response = await api.get('/forecast/accuracy');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Trigger model retraining (admin only)
  retrainModels: async () => {
    try {
      const response = await api.post('/forecast/train');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get forecast comparison (actual vs predicted)
  getForecastComparison: async (bloodType) => {
    try {
      const response = await api.get(`/forecast/comparison/${bloodType}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export forecast report
  exportForecastReport: async (format = 'pdf') => {
    try {
      const response = await api.post('/forecast/export', { format });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default forecastService;