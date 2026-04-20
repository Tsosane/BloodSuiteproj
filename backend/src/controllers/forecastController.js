const forecastService = require('../services/forecastService');
const donorNotificationService = require('../services/donorNotificationService');

const normalizeAlertsPayload = (payload) => {
  if (Array.isArray(payload)) {
    return {
      alerts: payload,
      total_shortages: payload.length,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    alerts: Array.isArray(payload?.alerts) ? payload.alerts : [],
    total_shortages: payload?.total_shortages || payload?.totalShortages || payload?.alerts?.length || 0,
    timestamp: payload?.timestamp || new Date().toISOString(),
  };
};

const buildAlertFromForecast = (forecast, fallbackBloodType) => {
  const bloodType = forecast?.blood_type || fallbackBloodType;
  const currentStock = Number(forecast?.current_stock || 0);
  const predictedDemand = Number(forecast?.total_predicted_demand || 0);
  const shortage = Math.max(0, Math.ceil(predictedDemand - currentStock));

  if (!bloodType || shortage <= 0) {
    return null;
  }

  return {
    bloodType,
    currentStock,
    predictedDemand,
    shortage,
    severity: shortage >= 10 ? 'high' : 'medium',
  };
};

const summarizeNotificationResults = (results = []) => ({
  shortageTypesProcessed: results.length,
  notificationsSent: results.reduce((total, item) => total + Number(item.notificationsSent || 0), 0),
  emailsSent: results.reduce((total, item) => total + Number(item.emailsSent || 0), 0),
  smsSent: results.reduce((total, item) => total + Number(item.smsSent || 0), 0),
  whatsappSent: results.reduce((total, item) => total + Number(item.whatsappSent || 0), 0),
  skippedExisting: results.reduce((total, item) => total + Number(item.skippedExisting || 0), 0),
  results,
});

const notifyForAlerts = async (alerts) => {
  if (!alerts.length) {
    return summarizeNotificationResults([]);
  }

  try {
    const results = await donorNotificationService.processShortageAlerts(alerts, {
      cooldownHours: 12,
    });
    return summarizeNotificationResults(results);
  } catch (error) {
    console.error('Failed to process donor shortage notifications:', error);
    return {
      shortageTypesProcessed: alerts.length,
      notificationsSent: 0,
      emailsSent: 0,
      smsSent: 0,
      whatsappSent: 0,
      skippedExisting: 0,
      results: [],
      error: error.message,
    };
  }
};

const getForecast = async (req, res) => {
  try {
    const { bloodType } = req.params;
    const { horizon = '30day' } = req.query;

    const forecast = await forecastService.getForecast(bloodType, horizon);
    const derivedAlert = buildAlertFromForecast(forecast, bloodType);
    const notifications = await notifyForAlerts(derivedAlert ? [derivedAlert] : []);

    res.json({
      success: true,
      data: forecast,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getAllForecasts = async (req, res) => {
  try {
    const { horizon = '30day' } = req.query;

    const forecasts = await forecastService.getAllForecasts(horizon);
    const derivedAlerts = (forecasts?.forecasts || [])
      .map((forecast) => buildAlertFromForecast(forecast, forecast?.blood_type))
      .filter(Boolean);
    const notifications = await notifyForAlerts(derivedAlerts);

    res.json({
      success: true,
      data: forecasts,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getShortageAlerts = async (req, res) => {
  try {
    const payload = normalizeAlertsPayload(await forecastService.getShortageAlerts());
    const notifications = await notifyForAlerts(payload.alerts);

    res.json({
      success: true,
      data: payload,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getRecommendedStock = async (req, res) => {
  try {
    const payload = normalizeAlertsPayload(await forecastService.getShortageAlerts());
    const notifications = await notifyForAlerts(payload.alerts);

    const recommendations = payload.alerts.map((alert) => {
      const bloodType = alert.bloodType || alert.blood_type;
      const shortage = Number(alert.shortage || 0);
      return {
        bloodType,
        action: shortage > 0 ? `Increase stock by ${shortage} units` : 'Maintain current stock',
        priority: alert.severity || 'medium',
        suggestedDonors: shortage > 0 ? Math.max(5, Math.ceil(shortage / 2)) : 0,
        notificationsSent: notifications.results.find((item) => item.bloodType === bloodType)?.notificationsSent || 0,
        emailsSent: notifications.results.find((item) => item.bloodType === bloodType)?.emailsSent || 0,
      };
    });

    res.json({
      success: true,
      data: recommendations,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getModelAccuracy = async (req, res) => {
  try {
    const accuracy = await forecastService.getModelAccuracy();

    res.json({
      success: true,
      data: accuracy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const retrainModels = async (req, res) => {
  try {
    const result = await forecastService.retrainModels();

    res.json({
      success: true,
      data: result,
      message: 'Models retrained successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const triggerDonorNotifications = async (req, res) => {
  try {
    const { bloodType, shortageAmount, hospitalName } = req.body;

    if (!bloodType || !shortageAmount) {
      return res.status(400).json({
        success: false,
        error: 'bloodType and shortageAmount are required',
      });
    }

    const result = await donorNotificationService.sendDonationRequests(
      bloodType,
      shortageAmount,
      null,
      { cooldownHours: 12, hospitalName }
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
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
  triggerDonorNotifications,
};
