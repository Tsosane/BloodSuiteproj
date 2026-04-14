// backend/src/services/forecastService.js
const axios = require('axios');

const FORECAST_SERVICE_URL = process.env.FORECAST_SERVICE_URL || 'http://localhost:8001';

class ForecastService {
  constructor() {
    this.client = axios.create({
      baseURL: FORECAST_SERVICE_URL,
      timeout: 30000,
    });
  }

  /**
   * Get forecast for a specific blood type
   */
  async getForecast(bloodType, horizon = '30day') {
    try {
      const response = await this.client.get(`/forecast/${bloodType}`, {
        params: { horizon }
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting forecast for ${bloodType}:`, error.message);
      throw error;
    }
  }

  /**
   * Get forecasts for all blood types
   */
  async getAllForecasts(horizon = '30day') {
    try {
      const response = await this.client.get('/forecast/all', {
        params: { horizon }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting all forecasts:', error.message);
      throw error;
    }
  }

  /**
   * Get shortage alerts
   */
  async getShortageAlerts() {
    try {
      const response = await this.client.get('/forecast/alerts/shortages');
      return response.data;
    } catch (error) {
      console.error('Error getting shortage alerts:', error.message);
      throw error;
    }
  }

  /**
   * Get model accuracy metrics
   */
  async getModelAccuracy() {
    try {
      const response = await this.client.get('/forecast/accuracy');
      return response.data;
    } catch (error) {
      console.error('Error getting model accuracy:', error.message);
      throw error;
    }
  }

  /**
   * Retrain all models (admin only)
   */
  async retrainModels() {
    try {
      const response = await this.client.post('/forecast/train');
      return response.data;
    } catch (error) {
      console.error('Error retraining models:', error.message);
      throw error;
    }
  }

  /**
   * Check if forecast service is healthy
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      return { status: 'unavailable', error: error.message };
    }
  }
}

module.exports = new ForecastService();