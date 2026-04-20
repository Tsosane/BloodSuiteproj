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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import {
  Line,
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
  const [forecastDetails, setForecastDetails] = useState(null);
  const [shortageAlerts, setShortageAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [modelAccuracy, setModelAccuracy] = useState({ mape: 0, mae: 0, rmse: 0, lastUpdated: null });
  const [modelMetrics, setModelMetrics] = useState({});
  const [evaluationTargets, setEvaluationTargets] = useState({});
  const [isRetraining, setIsRetraining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [notificationSummary, setNotificationSummary] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);
  const [activeRecommendation, setActiveRecommendation] = useState('');

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
    setExportStatus(null);
    setForecastDataItems([]);
    setAllForecastSummary([]);
    setForecastDetails(null);
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
          setForecastDetails(null);
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
          setForecastDetails(data);
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
          riskLevel: alert.riskLevel || alert.risk_level || alert.severity || 'medium',
          confidenceLabel: alert.confidenceLabel || alert.confidence_label || 'medium',
          shortageProbability: Number(alert.shortageProbability || alert.shortage_probability || 0),
          daysUntilShortage: alert.daysUntilShortage || alert.days_until_shortage || 7,
          recommendedActions: alert.recommendedActions || alert.recommended_actions || [],
          alertMessage: alert.alertMessage || alert.alert_message || '',
          bufferUnits: Number(alert.bufferUnits || alert.buffer_units || 0),
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
        const accuracyData = accuracyResponse.data || {};
        const ensemble = accuracyData.models?.Ensemble || {};
        setModelAccuracy({
          mape: ensemble.mape || 0,
          mae: ensemble.mae || 0,
          rmse: ensemble.rmse || 0,
          lastUpdated: accuracyData.last_updated || null,
        });
        setModelMetrics(accuracyData.models || {});
        setEvaluationTargets(accuracyData.evaluation_targets || {});
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

  const handleForecastPeriodChange = (event) => {
    setForecastPeriod(event.target.value);
  };

  const handleBloodTypeChange = (event) => {
    setSelectedBloodType(event.target.value);
  };

  const currentData = forecastDataItems;
  const filteredShortageAlerts = selectedBloodType === 'all'
    ? shortageAlerts
    : shortageAlerts.filter((alert) => alert.bloodType === selectedBloodType);
  const filteredRecommendations = selectedBloodType === 'all'
    ? recommendations
    : recommendations.filter((recommendation) => recommendation.bloodType === selectedBloodType);
  const highSeverityAlerts = filteredShortageAlerts.filter((alert) => ['high', 'critical'].includes(alert.severity));
  const hasShortage = filteredShortageAlerts.length > 0;
  const showBounds = currentData.some((item) => item.lowerBound != null);
  const selectedForecastSummary = selectedBloodType === 'all' ? null : forecastDetails;
  const selectedRiskAssessment = selectedForecastSummary?.risk_assessment || null;
  const selectedFeatureContext = selectedForecastSummary?.feature_context || null;
  const selectedTrendSummary = selectedForecastSummary?.trend_summary || null;
  const selectedMethodology = selectedForecastSummary?.methodology_summary || null;
  const selectedModelBreakdown = Object.values(selectedForecastSummary?.model_breakdown || {});

  const buildExportRows = () => {
    if (selectedBloodType === 'all') {
      return allForecastSummary.map((item) => ({
        bloodType: item.blood_type,
        forecastPeriod,
        totalPredictedDemand: item.total_predicted_demand,
        currentStock: item.current_stock,
        shortageAlert: item.shortage_alert ? 'Yes' : 'No',
        riskLevel: item.risk_assessment?.risk_level || 'normal',
        confidenceLabel: item.confidence_label || 'medium',
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

  const forecastTableRows = selectedBloodType === 'all'
    ? allForecastSummary.map((item) => ({
      bloodType: item.blood_type,
      totalPredictedDemand: Number(item.total_predicted_demand || 0),
      currentStock: Number(item.current_stock || 0),
      shortageGap: Math.max(0, Number(item.total_predicted_demand || 0) - Number(item.current_stock || 0)),
      shortageAlert: item.shortage_alert ? 'Yes' : 'No',
      riskLevel: item.risk_assessment?.risk_level || 'normal',
      confidenceLabel: item.confidence_label || 'medium',
    }))
    : currentData.map((item) => ({
      day: item.day,
      date: item.date,
      predictedDemand: Number(item.demand || 0),
      currentSupply: Number(item.supply || 0),
      projectedShortage: Math.max(0, Number(item.demand || 0) - Number(item.supply || 0)),
      lowerBound: item.lowerBound != null ? Number(item.lowerBound) : null,
      upperBound: item.upperBound != null ? Number(item.upperBound) : null,
    }));

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

  const handleRecommendationAction = async (recommendation) => {
    const matchingAlert = filteredShortageAlerts.find((alert) => alert.bloodType === recommendation.bloodType);
    const shortageAmount = Math.max(1, Number(matchingAlert?.shortage || recommendation.suggestedDonors || 0));

    setActiveRecommendation(recommendation.bloodType);
    setActionStatus(null);

    try {
      const response = await forecastService.triggerDonorNotifications({
        bloodType: recommendation.bloodType,
        shortageAmount,
      });

      if (response?.success) {
        setActionStatus({
          severity: 'success',
          message: `Donor requests sent for ${recommendation.bloodType}.`,
        });
        await fetchForecastData();
        return;
      }

      setActionStatus({
        severity: 'error',
        message: `Unable to send donor requests for ${recommendation.bloodType}.`,
      });
    } catch (error) {
      setActionStatus({
        severity: 'error',
        message: error.error || error.message || `Unable to send donor requests for ${recommendation.bloodType}.`,
      });
    } finally {
      setActiveRecommendation('');
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return '#b71c1c';
      case 'high': return '#f44336';
      case 'warning': return '#f44336';
      case 'watch': return '#ff9800';
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

  const renderForecastTable = () => (
    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: '#fff5f5' }}>
          <TableRow>
            {selectedBloodType === 'all' ? (
              <>
                <TableCell sx={{ fontWeight: 700 }}>Blood Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Predicted Demand</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Current Stock</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Shortage Gap</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Risk Level</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Confidence</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Alert</TableCell>
              </>
            ) : (
              <>
                <TableCell sx={{ fontWeight: 700 }}>Day</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Predicted Demand</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Current Supply</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Projected Shortage</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Lower Bound</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Upper Bound</TableCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {forecastTableRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={selectedBloodType === 'all' ? 7 : 7} align="center">
                No forecast data available for the selected filters.
              </TableCell>
            </TableRow>
          ) : forecastTableRows.map((row) => (
            <TableRow key={selectedBloodType === 'all' ? row.bloodType : `${row.date}-${row.day}`}>
              {selectedBloodType === 'all' ? (
                <>
                  <TableCell>{row.bloodType}</TableCell>
                  <TableCell>{row.totalPredictedDemand}</TableCell>
                  <TableCell>{row.currentStock}</TableCell>
                  <TableCell>{row.shortageGap}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={String(row.riskLevel || 'normal').toUpperCase()}
                      sx={{
                        bgcolor: `${getSeverityColor(row.riskLevel)}20`,
                        color: getSeverityColor(row.riskLevel),
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell>{String(row.confidenceLabel || 'medium').toUpperCase()}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.shortageAlert}
                      sx={{
                        bgcolor: row.shortageAlert === 'Yes' ? '#ffebee' : '#e8f5e9',
                        color: row.shortageAlert === 'Yes' ? '#c62828' : '#2e7d32',
                      }}
                    />
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>{row.day}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.predictedDemand}</TableCell>
                  <TableCell>{row.currentSupply}</TableCell>
                  <TableCell>{row.projectedShortage}</TableCell>
                  <TableCell>{row.lowerBound ?? 'N/A'}</TableCell>
                  <TableCell>{row.upperBound ?? 'N/A'}</TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>Demand Forecast Reports</Typography>
        <Box>
          <FormControl sx={{ minWidth: 120, mr: 2 }} size="small">
            <InputLabel>Forecast Period</InputLabel>
            <Select value={forecastPeriod} onChange={handleForecastPeriodChange} label="Forecast Period">
              <MenuItem value="7day">7-Day Forecast</MenuItem>
              <MenuItem value="30day">30-Day Forecast</MenuItem>
              <MenuItem value="90day">90-Day Forecast</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120, mr: 2 }} size="small">
            <InputLabel>Blood Type</InputLabel>
            <Select value={selectedBloodType} onChange={handleBloodTypeChange} label="Blood Type">
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
          <Typography variant="body2">
            {highSeverityAlerts.length > 0
              ? `${highSeverityAlerts.map((alert) => alert.bloodType).join(', ')} projected to be in shortage within 7 days.`
              : `${selectedBloodType === 'all' ? 'Some blood types are' : `${selectedBloodType} is`} projected to face a shortage in the selected view.`}
          </Typography>
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}
      {!errorMessage && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Viewing <strong>{forecastPeriod.replace('day', '-day')}</strong> forecast data for{' '}
          <strong>{selectedBloodType === 'all' ? 'all blood types' : selectedBloodType}</strong>.
          {isLoading ? ' Refreshing report now...' : ' Select a different period or blood type to reload the report.'}
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
      {actionStatus && (
        <Alert severity={actionStatus.severity} sx={{ mb: 3 }}>
          {actionStatus.message}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {filteredShortageAlerts.map((alert) => (
          <Grid item xs={12} sm={6} md={4} key={alert.bloodType}>
            <Card sx={{ borderTop: `4px solid ${getSeverityColor(alert.severity)}` }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Chip label={alert.bloodType} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Current Stock: {alert.currentStock} units</Typography>
                    <Typography variant="body2" color="text.secondary">Predicted Demand: {alert.predictedDemand} units</Typography>
                    <Typography variant="body2" sx={{ color: getSeverityColor(alert.severity), fontWeight: 600 }}>Shortage: {Math.abs(alert.shortage)} units</Typography>
                    <Typography variant="body2" color="text.secondary">Risk: {String(alert.riskLevel || alert.severity).toUpperCase()}</Typography>
                    <Typography variant="body2" color="text.secondary">Confidence: {String(alert.confidenceLabel || 'medium').toUpperCase()}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${getSeverityColor(alert.severity)}20`, color: getSeverityColor(alert.severity) }}>
                    <WarningIcon />
                  </Avatar>
                </Box>
                <LinearProgress variant="determinate" value={alert.predictedDemand > 0 ? Math.min(100, (alert.currentStock / alert.predictedDemand) * 100) : 0} sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: '#ffe0e0', '& .MuiLinearProgress-bar': { bgcolor: getSeverityColor(alert.severity) } }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Shortage expected in {alert.daysUntilShortage} days</Typography>
                {alert.alertMessage && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {alert.alertMessage}
                  </Typography>
                )}
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
                : `${selectedBloodType} ${forecastPeriod === '7day'
                  ? '7-Day Demand Forecast'
                  : forecastPeriod === '30day'
                    ? '30-Day Demand Forecast'
                    : '90-Day Demand Forecast'}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Prediction results are shown in table form first for easier review, with the chart kept below for quick visual comparison.
            </Typography>
            {selectedForecastSummary && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="caption" color="text.secondary">Total Predicted Demand</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                      {selectedForecastSummary.total_predicted_demand || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="caption" color="text.secondary">Current Stock</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                      {selectedForecastSummary.current_stock || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="caption" color="text.secondary">Risk Level</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: getSeverityColor(selectedRiskAssessment?.risk_level) }}>
                      {String(selectedRiskAssessment?.risk_level || 'normal').toUpperCase()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="caption" color="text.secondary">Confidence</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {String(selectedForecastSummary.confidence_label || 'medium').toUpperCase()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Alert severity={selectedRiskAssessment?.risk_level === 'critical' ? 'error' : selectedRiskAssessment?.risk_level === 'warning' ? 'warning' : 'info'}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {selectedRiskAssessment?.alert_message || 'Forecast context loaded successfully.'}
                    </Typography>
                    {selectedTrendSummary?.summary && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {selectedTrendSummary.summary}
                      </Typography>
                    )}
                    {selectedFeatureContext && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Recent averages: 7-day {selectedFeatureContext.recent_average_7d}, 30-day {selectedFeatureContext.recent_average_30d}.
                        {selectedFeatureContext.upcoming_holiday
                          ? ` Upcoming holiday: ${selectedFeatureContext.upcoming_holiday} in ${selectedFeatureContext.days_until_nearest_holiday} day(s).`
                          : ''}
                      </Typography>
                    )}
                  </Alert>
                </Grid>
              </Grid>
            )}
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
                  {renderForecastTable()}
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      key={`summary-${forecastPeriod}-${selectedBloodType}`}
                      data={allForecastSummary}
                      margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                    >
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
                            <Typography variant="body2" color="text.secondary">Risk: {String(item.risk_assessment?.risk_level || 'normal').toUpperCase()}</Typography>
                            <Typography variant="body2" color="text.secondary">Confidence: {String(item.confidence_label || 'medium').toUpperCase()}</Typography>
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
              <Box>
                {renderForecastTable()}
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart key={`detail-${forecastPeriod}-${selectedBloodType}`} data={currentData}>
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
              </Box>
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
            {filteredRecommendations.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No recommended actions are available for {selectedBloodType === 'all' ? 'the current forecast selection' : selectedBloodType}.
                </Typography>
              </Box>
            ) : (
            <Grid container spacing={2}>
              {filteredRecommendations.map((rec) => (
                <Grid item xs={12} key={rec.bloodType}>
                  <Paper sx={{ p: 2, borderLeft: `4px solid ${getSeverityColor(rec.priority)}` }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Chip label={rec.bloodType} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', mb: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{rec.action}</Typography>
                        <Typography variant="body2" color="text.secondary">Suggested donors: {rec.suggestedDonors}+</Typography>
                        <Typography variant="body2" color="text.secondary">Priority: {String(rec.priority || 'medium').toUpperCase()}</Typography>
                        <Typography variant="body2" color="text.secondary">Confidence: {String(rec.confidenceLabel || 'medium').toUpperCase()}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Shortage probability: {Math.round(Number(rec.shortageProbability || 0) * 100)}%
                        </Typography>
                        {Array.isArray(rec.actionPlan) && rec.actionPlan.map((actionLine, index) => (
                          <Typography key={`${rec.bloodType}-action-${index}`} variant="body2" color="text.secondary">
                            {index + 1}. {actionLine}
                          </Typography>
                        ))}
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleRecommendationAction(rec)}
                        disabled={activeRecommendation === rec.bloodType}
                        sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                      >
                        {activeRecommendation === rec.bloodType ? 'Sending...' : 'Notify Donors'}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            )}
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
            <Typography variant="subtitle2" gutterBottom>Accuracy By Model</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#fff5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Model</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>MAPE</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>MAE</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>RMSE</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(modelMetrics).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No model metrics available yet.</TableCell>
                    </TableRow>
                  ) : Object.entries(modelMetrics).map(([modelName, metrics]) => (
                    <TableRow key={modelName}>
                      <TableCell>{modelName}</TableCell>
                      <TableCell>{metrics?.mape ?? 'N/A'}</TableCell>
                      <TableCell>{metrics?.mae ?? 'N/A'}</TableCell>
                      <TableCell>{metrics?.rmse ?? 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {selectedModelBreakdown.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom>Forecast Model Breakdown For {selectedBloodType}</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#fff5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Model</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Weight</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Average Daily Demand</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Total Predicted Demand</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Confidence</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedModelBreakdown.map((model) => (
                        <TableRow key={model.label}>
                          <TableCell>{model.label}</TableCell>
                          <TableCell>{model.weight}</TableCell>
                          <TableCell>{model.average_daily_demand}</TableCell>
                          <TableCell>{model.total_predicted_demand}</TableCell>
                          <TableCell>{Math.round(Number(model.confidence_level || 0) * 100)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>Methodology Summary</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ensemble model combining ARIMA (trend), Prophet (seasonality and holidays), and LSTM (complex sequence patterns).
                  </Typography>
                  {selectedMethodology && (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Strategy: {selectedMethodology.ensemble_strategy || 'weighted_average'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Training window: {selectedMethodology.training_window_months || 24} months
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Forecast horizon days: {selectedMethodology.forecast_horizon_days || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Confidence note: {selectedMethodology.confidence_interval_note}
                      </Typography>
                    </>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>Evaluation Targets</Typography>
                  <Typography variant="body2" color="text.secondary">
                    MAPE target: {evaluationTargets.mape_target || '< 20%'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    MAE target: {evaluationTargets.mae_target || '< 15%'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Shortage prediction rate target: {evaluationTargets.shortage_prediction_rate_target || '> 80%'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Wastage reduction target: {evaluationTargets.wastage_reduction_target || '> 25%'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
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
