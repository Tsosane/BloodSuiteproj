const forecastService = require('../services/forecastService');
const donorNotificationService = require('../services/donorNotificationService');
const XLSX = require('xlsx');

const getErrorMessage = (error, fallbackMessage = 'Forecast request failed.') => (
  error?.response?.data?.detail ||
  error?.response?.data?.error ||
  error?.message ||
  fallbackMessage
);

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
  const shortage = Math.max(
    0,
    Math.ceil(forecast?.risk_assessment?.projected_shortage_units || (predictedDemand - currentStock))
  );
  const riskLevel = forecast?.risk_assessment?.risk_level || 'warning';

  if (!bloodType || shortage <= 0) {
    return null;
  }

  return {
    bloodType,
    currentStock,
    predictedDemand,
    shortage,
    severity: riskLevel === 'critical' ? 'critical' : riskLevel === 'warning' ? 'high' : 'medium',
    riskLevel,
    shortageProbability: Number(forecast?.risk_assessment?.shortage_probability || 0),
    confidenceLabel: forecast?.confidence_label || 'medium',
    daysUntilShortage: forecast?.risk_assessment?.days_until_shortage || null,
    recommendedActions: forecast?.recommended_actions || [],
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
      error: getErrorMessage(error, 'Unable to notify donors for forecast shortages.'),
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
      error: getErrorMessage(error, 'Unable to load forecast for the selected blood type.'),
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
      error: getErrorMessage(error, 'Unable to load forecasts right now.'),
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
      error: getErrorMessage(error, 'Unable to load shortage alerts right now.'),
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
      const recommendedActions = alert.recommendedActions || alert.recommended_actions || [];
      return {
        bloodType,
        action: recommendedActions[0] || (shortage > 0 ? `Increase stock by ${shortage} units` : 'Maintain current stock'),
        actionPlan: recommendedActions,
        priority: alert.riskLevel || alert.risk_level || alert.severity || 'medium',
        suggestedDonors: shortage > 0 ? Math.max(5, Math.ceil(shortage / 2)) : 0,
        notificationsSent: notifications.results.find((item) => item.bloodType === bloodType)?.notificationsSent || 0,
        emailsSent: notifications.results.find((item) => item.bloodType === bloodType)?.emailsSent || 0,
        shortageProbability: Number(alert.shortageProbability || alert.shortage_probability || 0),
        confidenceLabel: alert.confidenceLabel || alert.confidence_label || 'medium',
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
      error: getErrorMessage(error, 'Unable to load recommended stock actions right now.'),
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
      error: getErrorMessage(error, 'Unable to load model accuracy right now.'),
    });
  }
};

const buildExportRows = ({ forecastResponse, bloodType, horizon }) => {
  if (bloodType && bloodType !== 'all') {
    return (forecastResponse?.forecasts || []).map((item) => ({
      blood_type: forecastResponse?.blood_type || bloodType,
      horizon,
      day: item.day,
      date: item.date,
      predicted_demand: item.predicted_demand,
      lower_bound: item.lower_bound,
      upper_bound: item.upper_bound,
      current_stock: forecastResponse?.current_stock || 0,
      total_predicted_demand: forecastResponse?.total_predicted_demand || 0,
      shortage_alert: forecastResponse?.shortage_alert ? 'Yes' : 'No',
    }));
  }

  return (forecastResponse?.forecasts || []).flatMap((forecast) =>
    (forecast?.forecasts || []).map((item) => ({
      blood_type: forecast?.blood_type || '',
      horizon,
      day: item.day,
      date: item.date,
      predicted_demand: item.predicted_demand,
      lower_bound: item.lower_bound,
      upper_bound: item.upper_bound,
      current_stock: forecast?.current_stock || 0,
      total_predicted_demand: forecast?.total_predicted_demand || 0,
      shortage_alert: forecast?.shortage_alert ? 'Yes' : 'No',
    }))
  );
};

const exportForecastReport = async (req, res) => {
  try {
    const { format = 'csv', horizon = '30day', bloodType = 'all' } = req.body || {};
    const normalizedFormat = String(format).toLowerCase();
    const normalizedBloodType = bloodType === 'all' ? 'all' : String(bloodType || '').toUpperCase();

    if (!['csv', 'excel'].includes(normalizedFormat)) {
      return res.status(400).json({
        success: false,
        error: 'Only csv and excel exports are supported by the API. Use the browser print flow for PDF.',
      });
    }

    const forecastResponse = normalizedBloodType === 'all'
      ? await forecastService.getAllForecasts(horizon)
      : await forecastService.getForecast(normalizedBloodType, horizon);

    const rows = buildExportRows({
      forecastResponse,
      bloodType: normalizedBloodType,
      horizon,
    });

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No forecast data available for export.',
      });
    }

    const safeBloodType = normalizedBloodType === 'all'
      ? 'all-blood-types'
      : normalizedBloodType.replace(/[^A-Z0-9+-]/gi, '');
    const fileBase = `forecast-report-${safeBloodType}-${horizon}`;
    const worksheet = XLSX.utils.json_to_sheet(rows);

    if (normalizedFormat === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileBase}.csv"`);
      return res.send(csv);
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Forecast');
    const workbookBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileBase}.xlsx"`);
    return res.send(workbookBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, 'Unable to export forecast data right now.'),
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
      error: getErrorMessage(error, 'Unable to retrain forecast models right now.'),
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
      error: getErrorMessage(error, 'Unable to trigger donor notifications right now.'),
    });
  }
};

module.exports = {
  getForecast,
  getAllForecasts,
  getShortageAlerts,
  getRecommendedStock,
  getModelAccuracy,
  exportForecastReport,
  retrainModels,
  triggerDonorNotifications,
};
