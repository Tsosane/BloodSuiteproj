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
  Bar,
} from 'recharts';
import forecastService from '../../services/forecastService';

const ForecastReports = () => {
  const [forecastPeriod, setForecastPeriod] = useState('7day');
  const [selectedBloodType, setSelectedBloodType] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [forecastDataItems, setForecastDataItems] = useState([]);
  const [shortageAlerts, setShortageAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [modelAccuracy, setModelAccuracy] = useState({ mape: 0, mae: 0, rmse: 0, lastUpdated: null });
  const [isRetraining, setIsRetraining] = useState(false);

  const fetchForecastData = async () => {
    setIsLoading(true);
    try {
      const forecastResponse = selectedBloodType === 'all'
        ? await forecastService.getForecasts({ horizon: forecastPeriod })
        : await forecastService.getForecastByBloodType(selectedBloodType, forecastPeriod);

      if (forecastResponse?.success) {
        const data = forecastResponse.data || {};
        setForecastDataItems(data.forecasts || data.forecast || []);
      }

      const alertsResponse = await forecastService.getShortageAlerts();
      if (alertsResponse?.success) {
        setShortageAlerts(alertsResponse.data || []);
      }

      try {
        const recommendationsResponse = await forecastService.getRecommendedStock();
        if (recommendationsResponse?.success) {
          setRecommendations(recommendationsResponse.data || []);
        }
      } catch (recError) {
        console.warn('Recommendations endpoint unavailable', recError);
        setRecommendations([]);
      }

      const accuracyResponse = await forecastService.getForecastAccuracy();
      if (accuracyResponse?.success) {
        setModelAccuracy(accuracyResponse.data || {});
      }
    } catch (error) {
      console.error('Unable to load forecast data', error);
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

  const xKey = forecastPeriod === '7day' ? 'day' : forecastPeriod === '30day' ? 'week' : 'month';
  const currentData = forecastDataItems;
  const hasShortage = shortageAlerts.length > 0;
  const showBounds = currentData.some((item) => item.lowerBound != null);

  const handleExport = async (format) => {
    setAnchorEl(null);
    setExportStatus('loading');
    try {
      const response = await forecastService.exportForecastReport(format);
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
            <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
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
      {exportStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Forecast export request submitted successfully.
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
                <LinearProgress variant="determinate" value={(alert.currentStock / alert.predictedDemand) * 100} sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: '#ffe0e0', '& .MuiLinearProgress-bar': { bgcolor: getSeverityColor(alert.severity) } }} />
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
              {forecastPeriod === '7day' ? '7-Day Demand Forecast' : forecastPeriod === '30day' ? '30-Day Demand Forecast' : '90-Day Demand Forecast'}
            </Typography>
            {isLoading ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress sx={{ color: '#d32f2f' }} />
              </Box>
            ) : currentData.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No forecast data available for the selected filters.</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={forecastPeriod === '7day' ? 'day' : forecastPeriod === '30day' ? 'week' : 'month'} />
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