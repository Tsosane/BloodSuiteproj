// src/services/forecastService.js
import axios from 'axios';
import api from './api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
      const response = await api.get(`/forecast/${encodeURIComponent(bloodType)}?horizon=${horizon}`);
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
  exportForecastReport: async ({ format = 'csv', horizon = '30day', bloodType = 'all' } = {}) => {
    try {
      const token = localStorage.getItem('bloodSuiteToken');
      const response = await axios.post(
        `${API_BASE_URL}/forecast/export`,
        { format, horizon, bloodType },
        {
          responseType: 'blob',
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
          },
        }
      );

      const disposition = response.headers['content-disposition'] || '';
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);

      return {
        success: true,
        blob: response.data,
        filename: filenameMatch?.[1] || null,
      };
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        const message = await error.response.data.text();
        try {
          const parsed = JSON.parse(message);
          throw parsed;
        } catch (parseError) {
          if (parseError && parseError !== undefined && parseError.name !== 'SyntaxError') {
            throw parseError;
          }
          throw { error: message || 'Export failed' };
        }
      }
      throw error.response?.data || error;
    }
  },
};

export default forecastService;
