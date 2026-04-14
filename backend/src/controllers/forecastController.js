// backend/src/controllers/forecastController.js
const forecastService = require('../services/forecastService');

const getForecast = async (req, res) => {
  try {
    const { bloodType } = req.params;
    const { horizon = '30day' } = req.query;
    
    const forecast = await forecastService.getForecast(bloodType, horizon);
    
    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getAllForecasts = async (req, res) => {
  try {
    const { horizon = '30day' } = req.query;
    
    const forecasts = await forecastService.getAllForecasts(horizon);
    
    res.json({
      success: true,
      data: forecasts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getShortageAlerts = async (req, res) => {
  try {
    const alerts = await forecastService.getShortageAlerts();
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getRecommendedStock = async (req, res) => {
  try {
    const alerts = await forecastService.getShortageAlerts();
    const recommendations = alerts.map((alert) => ({
      bloodType: alert.bloodType,
      action: alert.shortage > 0 ? `Increase stock by ${alert.shortage} units` : 'Maintain current stock',
      priority: alert.severity || 'medium',
      suggestedDonors: alert.shortage > 0 ? Math.max(5, Math.ceil(alert.shortage / 2)) : 0
    }));

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getModelAccuracy = async (req, res) => {
  try {
    const accuracy = await forecastService.getModelAccuracy();
    
    res.json({
      success: true,
      data: accuracy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const retrainModels = async (req, res) => {
  try {
    const result = await forecastService.retrainModels();
    
    res.json({
      success: true,
      data: result,
      message: 'Models retrained successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const healthCheck = async (req, res) => {
  try {
    const health = await forecastService.healthCheck();
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.json({
      success: false,
      data: { status: 'unavailable', error: error.message }
    });
  }
};

module.exports = {
  getForecast,
  getAllForecasts,
  getShortageAlerts,
  getRecommendedStock,
  getModelAccuracy,
  retrainModels,
  healthCheck
};