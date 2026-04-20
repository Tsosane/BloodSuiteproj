// src/pages/Manager/ForecastReports.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Bloodtype as BloodIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
} from 'recharts';
import forecastService from '../../services/forecastService';

const ForecastReports = () => {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const [forecastPeriod, setForecastPeriod] = useState('7day');
  const [selectedBloodType, setSelectedBloodType] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [forecastDataItems, setForecastDataItems] = useState([]);
  const [allForecastSummary, setAllForecastSummary] = useState([]);
  const [shortageAlerts, setShortageAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [modelAccuracy, setModelAccuracy] = useState({ mape: 0, mae: 0, rmse: 0, lastUpdated: null });
  const [isRetraining, setIsRetraining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [notificationSummary, setNotificationSummary] = useState(null);

  const mergeNotificationSummary = (current, incoming) => {
    if (!incoming) {
      return current;
    }

    return {
      shortageTypesProcessed: Math.max(Number(current?.shortageTypesProcessed || 0), Number(incoming.shortageTypesProcessed || 0)),
      notificationsSent: Math.max(Number(current?.notificationsSent || 0), Number(incoming.notificationsSent || 0)),
      emailsSent: Math.max(Number(current?.emailsSent || 0), Number(incoming.emailsSent || 0)),
      smsSent: Math.max(Number(current?.smsSent || 0), Number(incoming.smsSent || 0)),
      whatsappSent: Math.max(Number(current?.whatsappSent || 0), Number(incoming.whatsappSent || 0)),
      skippedExisting: Math.max(Number(current?.skippedExisting || 0), Number(incoming.skippedExisting || 0)),
    };
  };

  const fetchForecastData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      let combinedNotificationSummary = null;

      const forecastResponse = selectedBloodType === 'all'
        ? await forecastService.getForecasts({ horizon: forecastPeriod })
        : await forecastService.getForecastByBloodType(selectedBloodType, forecastPeriod);

      if (forecastResponse?.success) {
        combinedNotificationSummary = mergeNotificationSummary(combinedNotificationSummary, forecastResponse.notifications);
        const data = forecastResponse.data || {};
        if (selectedBloodType === 'all') {
          setAllForecastSummary(data.forecasts || []);
          setForecastDataItems([]);
        } else {
          const forecastItems = (data.forecasts || []).map((item) => ({
            ...item,
            demand: item.predicted_demand,
            lowerBound: item.lower_bound,
            upperBound: item.upper_bound,
            supply: data.current_stock,
          }));
          setForecastDataItems(forecastItems);
          setAllForecastSummary([]);
        }
      }

      const alertsResponse = await forecastService.getShortageAlerts();
      if (alertsResponse?.success) {
        combinedNotificationSummary = mergeNotificationSummary(combinedNotificationSummary, alertsResponse.notifications);
        const alerts = Array.isArray(alertsResponse.data)
          ? alertsResponse.data
          : alertsResponse.data?.alerts || [];

        setShortageAlerts(alerts.map((alert) => ({
          bloodType: alert.bloodType || alert.blood_type,
          currentStock: alert.currentStock || alert.current_stock || 0,
          predictedDemand: alert.predictedDemand || alert.predicted_demand_7d || 0,
          shortage: alert.shortage || 0,
          severity: alert.severity || 'medium',
          daysUntilShortage: alert.daysUntilShortage || alert.days_until_shortage || 7,
        })));
      }

      try {
        const recommendationsResponse = await forecastService.getRecommendedStock();
        if (recommendationsResponse?.success) {
          combinedNotificationSummary = mergeNotificationSummary(combinedNotificationSummary, recommendationsResponse.notifications);
          setRecommendations(recommendationsResponse.data || []);
        }
      } catch (recError) {
        console.warn('Recommendations endpoint unavailable', recError);
        setRecommendations([]);
      }

      const accuracyResponse = await forecastService.getForecastAccuracy();
      if (accuracyResponse?.success) {
        const ensemble = accuracyResponse.data?.models?.Ensemble || {};
        setModelAccuracy({
          mape: ensemble.mape || 0,
          mae: ensemble.mae || 0,
          rmse: ensemble.rmse || 0,
          lastUpdated: accuracyResponse.data?.last_updated || null,
        });
      }

      setNotificationSummary(combinedNotificationSummary);
    } catch (error) {
      console.error('Unable to load forecast data', error);
      setErrorMessage(error.error || error.message || 'Unable to load forecast data.');
      setNotificationSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrainModels = async () => {
    setIsRetraining(true);
    try {
      const response = await forecastService.retrainModels();
      if (response?.success) {
        // Refresh data after retraining
        await fetchForecastData();
        // Show success message
        setExportStatus('retrain-success');
      } else {
        setExportStatus('retrain-error');
      }
    } catch (error) {
      setExportStatus('retrain-error');
      console.error('Retrain failed', error);
    } finally {
      setIsRetraining(false);
      setTimeout(() => setExportStatus(null), 5000);
    }
  };

  useEffect(() => {
    fetchForecastData();
  }, [forecastPeriod, selectedBloodType]);

  const currentData = forecastDataItems;
  const hasShortage = shortageAlerts.length > 0;
  const showBounds = currentData.some((item) => item.lowerBound != null);

  const buildExportRows = () => {
    if (selectedBloodType === 'all') {
      return allForecastSummary.map((item) => ({
        bloodType: item.blood_type,
        forecastPeriod,
        totalPredictedDemand: item.total_predicted_demand,
        currentStock: item.current_stock,
        shortageAlert: item.shortage_alert ? 'Yes' : 'No',
      }));
    }

    return currentData.map((item) => ({
      bloodType: selectedBloodType,
      forecastPeriod,
      day: item.day,
      date: item.date,
      predictedDemand: item.demand,
      lowerBound: item.lowerBound,
      upperBound: item.upperBound,
      currentSupply: item.supply,
    }));
  };

  const triggerBrowserDownload = (blob, filename) => {
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  };

  const openPdfPrintView = () => {
    const rows = buildExportRows();
    const printWindow = window.open('', '_blank', 'width=1000,height=800');

    if (!printWindow) {
      throw new Error('Unable to open print view. Please allow pop-ups for this site.');
    }

    const tableHeaders = rows.length ? Object.keys(rows[0]) : [];
    const tableRows = rows.map((row) => `
      <tr>${tableHeaders.map((header) => `<td>${row[header] ?? ''}</td>`).join('')}</tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Blood Suite Forecast Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
            h1, h2 { color: #d32f2f; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #fff5f5; }
            .meta { margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <h1>Blood Suite Forecast Report</h1>
          <div class="meta">
            <p><strong>Forecast Period:</strong> ${forecastPeriod}</p>
            <p><strong>Blood Type:</strong> ${selectedBloodType}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <h2>Forecast Data</h2>
          <table>
            <thead>
              <tr>${tableHeaders.map((header) => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${tableRows || '<tr><td colspan="100%">No forecast data available.</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const handleExport = async (format) => {
    setAnchorEl(null);
    setExportStatus('loading');
    try {
      if (format === 'pdf') {
        openPdfPrintView();
        setExportStatus('pdf-success');
        setTimeout(() => setExportStatus(null), 5000);
        return;
      }

      const response = await forecastService.exportForecastReport({
        format,
        horizon: forecastPeriod,
        bloodType: selectedBloodType,
      });

      const fallbackExtension = format === 'excel' ? 'xlsx' : 'csv';
      const filename = response?.filename || `forecast-report-${selectedBloodType}-${forecastPeriod}.${fallbackExtension}`;
      triggerBrowserDownload(response.blob, filename);
      setExportStatus(response?.success ? 'success' : 'error');
    } catch (error) {
      setExportStatus('error');
      console.error('Export failed', error);
    }
    setTimeout(() => setExportStatus(null), 3000);
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      default: return '#4caf50';
    }
  };

  const renderNotificationSummary = () => {
    if (!notificationSummary || notificationSummary.shortageTypesProcessed <= 0) {
      return null;
    }

    const sentParts = [];
    if (notificationSummary.notificationsSent > 0) {
      sentParts.push(`${notificationSummary.notificationsSent} in-app request message(s)`);
    }
    if (notificationSummary.emailsSent > 0) {
      sentParts.push(`${notificationSummary.emailsSent} email(s)`);
    }
    if (notificationSummary.smsSent > 0) {
      sentParts.push(`${notificationSummary.smsSent} SMS message(s)`);
    }
    if (notificationSummary.whatsappSent > 0) {
      sentParts.push(`${notificationSummary.whatsappSent} WhatsApp message(s)`);
    }

    if (sentParts.length === 0) {
      return 'Prediction-triggered donor outreach ran successfully. No new donor messages were needed.';
    }

    return `Prediction-triggered donor outreach sent ${sentParts.join(', ')}.`;
  };
  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>Demand Forecast Reports</Typography>
        <Box>
          <FormControl sx={{ minWidth: 120, mr: 2 }} size="small">
            <InputLabel>Forecast Period</InputLabel>
            <Select value={forecastPeriod} onChange={(e) => setForecastPeriod(e.target.value)} label="Forecast Period">
              <MenuItem value="7day">7-Day Forecast</MenuItem>
              <MenuItem value="30day">30-Day Forecast</MenuItem>
              <MenuItem value="90day">90-Day Forecast</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120, mr: 2 }} size="small">
            <InputLabel>Blood Type</InputLabel>
            <Select value={selectedBloodType} onChange={(e) => setSelectedBloodType(e.target.value)} label="Blood Type">
              <MenuItem value="all">All Types</MenuItem>
              {bloodTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </Select>
          </FormControl>
          <Tooltip title="Export Report">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: '#d32f2f' }}><DownloadIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Refresh"><IconButton onClick={fetchForecastData} sx={{ color: '#d32f2f' }}><RefreshIcon /></IconButton></Tooltip>
          <Tooltip title="Retrain Models">
            <IconButton onClick={handleRetrainModels} disabled={isRetraining} sx={{ color: '#d32f2f' }}>
              {isRetraining ? <CircularProgress size={20} sx={{ color: '#d32f2f' }} /> : <TimelineIcon />}
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => handleExport('pdf')}>Print / Save as PDF</MenuItem>
            <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
            <MenuItem onClick={() => handleExport('excel')}>Export as Excel</MenuItem>
          </Menu>
        </Box>
      </Box>

      {hasShortage && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: '#ffebee' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Critical Shortage Alert</Typography>
          <Typography variant="body2">{shortageAlerts.filter(a => a.severity === 'high').map(a => a.bloodType).join(', ')} blood types projected to be in shortage within 7 days.</Typography>
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}
      {!errorMessage && notificationSummary && notificationSummary.shortageTypesProcessed > 0 && (
        <Alert severity={notificationSummary.notificationsSent > 0 ? 'success' : 'info'} sx={{ mb: 3 }}>
          {renderNotificationSummary()}
          {notificationSummary.skippedExisting > 0 ? ` ${notificationSummary.skippedExisting} recent notification(s) were skipped to avoid duplicates.` : ''}
        </Alert>
      )}
      {exportStatus === 'success' && (
      <Alert severity="success" sx={{ mb: 3 }}>
        Forecast export request submitted successfully.
      </Alert>
    )}
      {exportStatus === 'pdf-success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Print dialog opened. Choose Save as PDF in your browser to download the report.
        </Alert>
      )}
      {exportStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Unable to export forecast report. Please try again.
        </Alert>
      )}
      {exportStatus === 'retrain-success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Models retrained successfully. Forecast data has been updated.
        </Alert>
      )}
      {exportStatus === 'retrain-error' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Unable to retrain models. Please try again.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {shortageAlerts.map((alert) => (
          <Grid item xs={12} sm={6} md={4} key={alert.bloodType}>
            <Card sx={{ borderTop: `4px solid ${getSeverityColor(alert.severity)}` }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Chip label={alert.bloodType} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Current Stock: {alert.currentStock} units</Typography>
                    <Typography variant="body2" color="text.secondary">Predicted Demand: {alert.predictedDemand} units</Typography>
                    <Typography variant="body2" sx={{ color: getSeverityColor(alert.severity), fontWeight: 600 }}>Shortage: {Math.abs(alert.shortage)} units</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${getSeverityColor(alert.severity)}20`, color: getSeverityColor(alert.severity) }}>
                    <WarningIcon />
                  </Avatar>
                </Box>
                <LinearProgress variant="determinate" value={alert.predictedDemand > 0 ? Math.min(100, (alert.currentStock / alert.predictedDemand) * 100) : 0} sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: '#ffe0e0', '& .MuiLinearProgress-bar': { bgcolor: getSeverityColor(alert.severity) } }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Shortage expected in {alert.daysUntilShortage} days</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fff5f5', '& .MuiTab-root.Mui-selected': { color: '#d32f2f' }, '& .MuiTabs-indicator': { bgcolor: '#d32f2f' } }}>
          <Tab label="Forecast Chart" /><Tab label="Recommendations" /><Tab label="Model Accuracy" />
        </Tabs>

        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
              {selectedBloodType === 'all'
                ? `All Blood Types Forecast Summary (${forecastPeriod.replace('day', '-day')})`
                : forecastPeriod === '7day'
                  ? '7-Day Demand Forecast'
                  : forecastPeriod === '30day'
                    ? '30-Day Demand Forecast'
                    : '90-Day Demand Forecast'}
            </Typography>
            {isLoading ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress sx={{ color: '#d32f2f' }} />
              </Box>
            ) : selectedBloodType === 'all' ? (
              allForecastSummary.length === 0 ? (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No forecast summary available for all blood types.</Typography>
                </Box>
              ) : (
                <Box>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={allForecastSummary} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="blood_type" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="total_predicted_demand" fill="#d32f2f" name="Total Predicted Demand" />
                    </BarChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Total demand by blood type</Typography>
                    <Grid container spacing={2}>
                      {allForecastSummary.map((item) => (
                        <Grid item xs={12} sm={6} md={3} key={item.blood_type}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.blood_type}</Typography>
                            <Typography variant="body2" color="text.secondary">Predicted demand: {item.total_predicted_demand}</Typography>
                            <Typography variant="body2" color="text.secondary">Current stock: {item.current_stock}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              )
            ) : currentData.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No forecast data available for the selected filters.</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={forecastPeriod === '7day' ? 'day' : 'date'} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  {showBounds && <Area type="monotone" dataKey="lowerBound" fill="#ffebee" stroke="none" />}
                  {showBounds && <Area type="monotone" dataKey="upperBound" fill="#ffcdd2" stroke="none" />}
                  <Line type="monotone" dataKey="demand" stroke="#d32f2f" strokeWidth={2} name="Predicted Demand" />
                  <Line type="monotone" dataKey="supply" stroke="#4caf50" strokeWidth={2} name="Current Supply" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 20, height: 20, bgcolor: '#d32f2f' }} /><Typography variant="caption">Predicted Demand</Typography></Box>
              <Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 20, height: 20, bgcolor: '#4caf50' }} /><Typography variant="caption">Current Supply</Typography></Box>
              <Box display="flex" alignItems="center" gap={1}><Box sx={{ width: 20, height: 20, bgcolor: '#ffebee' }} /><Typography variant="caption">80% Confidence Interval</Typography></Box>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>Recommended Actions</Typography>
            <Grid container spacing={2}>
              {recommendations.map((rec) => (
                <Grid item xs={12} key={rec.bloodType}>
                  <Paper sx={{ p: 2, borderLeft: `4px solid ${getSeverityColor(rec.priority)}` }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Chip label={rec.bloodType} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', mb: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{rec.action}</Typography>
                        <Typography variant="body2" color="text.secondary">Suggested donors: {rec.suggestedDonors}+</Typography>
                      </Box>
                      <Button variant="outlined" size="small" sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}>Schedule Drive</Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>Model Performance Metrics</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">MAPE</Typography><Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>{modelAccuracy.mape}%</Typography><Typography variant="caption">Mean Absolute Percentage Error</Typography></Paper></Grid>
              <Grid item xs={12} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">MAE</Typography><Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>{modelAccuracy.mae}</Typography><Typography variant="caption">Mean Absolute Error (units)</Typography></Paper></Grid>
              <Grid item xs={12} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">RMSE</Typography><Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>{modelAccuracy.rmse}</Typography><Typography variant="caption">Root Mean Square Error</Typography></Paper></Grid>
              <Grid item xs={12} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">Last Updated</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{modelAccuracy.lastUpdated}</Typography><Typography variant="caption">Daily at 2:00 AM</Typography></Paper></Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" gutterBottom>Model Information</Typography>
            <Typography variant="body2" color="text.secondary">Ensemble model combining ARIMA (trend), Prophet (seasonality), and LSTM (complex patterns). Weights adjusted based on recent performance.</Typography>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 2, bgcolor: '#fff5f5' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <AnalyticsIcon sx={{ color: '#d32f2f' }} />
          <Box><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Forecast Methodology</Typography><Typography variant="caption" color="text.secondary">Forecasts generated using ensemble machine learning models trained on 24 months of historical data. Confidence intervals represent 80% prediction bounds.</Typography></Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForecastReports;
