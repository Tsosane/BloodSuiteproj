import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Bloodtype as BloodIcon,
  Download as DownloadIcon,
  LocalHospital as HospitalIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import analyticsService from '../../services/analyticsService';
import forecastService from '../../services/forecastService';

const StatCard = ({ title, value, icon, color, helper }) => (
  <Card sx={{ height: '100%', borderTop: `4px solid ${color}` }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          {helper && (
            <Typography variant="caption" color="text.secondary">
              {helper}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, color, width: 48, height: 48 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const ManagerDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [forecastSummary, setForecastSummary] = useState([]);
  const [shortageAlerts, setShortageAlerts] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [analyticsResponse, forecastResponse, alertsResponse] = await Promise.all([
        analyticsService.getDashboard(),
        forecastService.getForecasts({ horizon: '30day' }),
        forecastService.getShortageAlerts(),
      ]);

      setAnalytics(analyticsResponse.data || null);
      setForecastSummary(forecastResponse.data?.forecasts || []);

      const alerts = Array.isArray(alertsResponse.data)
        ? alertsResponse.data
        : alertsResponse.data?.alerts || [];

      setShortageAlerts(alerts.map((alert) => ({
        bloodType: alert.bloodType || alert.blood_type,
        currentStock: alert.currentStock || alert.current_stock || 0,
        predictedDemand: alert.predictedDemand || alert.predicted_demand_7d || 0,
        shortage: alert.shortage || 0,
        severity: alert.severity || 'medium',
      })));
    } catch (loadError) {
      console.error('Failed to load manager dashboard', loadError);
      setError(loadError.error || loadError.message || 'Unable to load manager dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    if (!analytics) {
      return {
        totalBloodUnits: 0,
        totalDonors: 0,
        totalHospitals: 0,
        activeRequests: 0,
        fulfillmentRate: 0,
        criticalStock: shortageAlerts.length,
      };
    }

    return {
      totalBloodUnits: (analytics.inventory || []).reduce((sum, item) => sum + Number(item.count || 0), 0),
      totalDonors: analytics.donors?.total || 0,
      totalHospitals: analytics.hospitals?.approved || analytics.hospitals?.total || 0,
      activeRequests: (analytics.requests?.total || 0) - (analytics.requests?.fulfilled || 0),
      fulfillmentRate: analytics.requests?.fulfillmentRate || 0,
      criticalStock: shortageAlerts.filter((alert) => alert.severity === 'high').length,
    };
  }, [analytics, shortageAlerts]);

  const inventoryByType = useMemo(() => (
    (analytics?.inventory || []).map((item, index) => ({
      name: item.blood_type,
      value: Number(item.count || 0),
      color: ['#d32f2f', '#ff9800', '#2196f3', '#4caf50', '#9c27b0', '#795548', '#607d8b', '#e91e63'][index % 8],
    }))
  ), [analytics]);

  const requestTrends = useMemo(() => {
    const grouped = new Map();

    (analytics?.requestTrends || []).forEach((item) => {
      const key = new Date(item.date).toISOString().split('T')[0];
      const current = grouped.get(key) || { date: key, requests: 0, urgent: 0 };
      current.requests += Number(item.count || 0);
      if (item.urgency === 'urgent' || item.urgency === 'emergency') {
        current.urgent += Number(item.count || 0);
      }
      grouped.set(key, current);
    });

    return [...grouped.values()].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10);
  }, [analytics]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#d32f2f' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
            Blood Bank Manager Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Live operational overview from inventory, requests, donors, and forecast services
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Export is not yet wired for this page">
            <span>
              <IconButton sx={{ color: '#d32f2f' }} disabled>
                <DownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton sx={{ color: '#d32f2f' }} onClick={loadData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {shortageAlerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3, bgcolor: '#fff5f5' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Shortage Risk Detected
          </Typography>
          <Typography variant="body2">
            {shortageAlerts.map((alert) => alert.bloodType).join(', ')} currently have forecasted supply pressure.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Blood Units" value={stats.totalBloodUnits} icon={<BloodIcon />} color="#d32f2f" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Donors" value={stats.totalDonors} icon={<PeopleIcon />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Approved Hospitals" value={stats.totalHospitals} icon={<HospitalIcon />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Fulfillment Rate" value={`${stats.fulfillmentRate}%`} icon={<TrendingIcon />} color="#ff9800" helper={`${stats.activeRequests} active requests`} />
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={(event, value) => setTabValue(value)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: '#fff5f5',
            '& .MuiTab-root.Mui-selected': { color: '#d32f2f' },
            '& .MuiTabs-indicator': { bgcolor: '#d32f2f' },
          }}
        >
          <Tab label="Overview" />
          <Tab label="Demand Forecast" />
          <Tab label="Inventory Analytics" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Blood Inventory Distribution
                </Typography>
                {inventoryByType.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No inventory data available.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={inventoryByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {inventoryByType.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Request Trends
                </Typography>
                {requestTrends.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No request trend data available.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={requestTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="requests" fill="#d32f2f" />
                      <Bar dataKey="urgent" fill="#ff9800" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f', mb: 3 }}>
              Forecast Summary by Blood Type
            </Typography>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Blood Type</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                    <TableCell align="right">Predicted Demand (30d)</TableCell>
                    <TableCell align="right">Shortage Alert</TableCell>
                    <TableCell align="right">Available Models</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {forecastSummary.map((item) => (
                    <TableRow key={item.blood_type}>
                      <TableCell>
                        <Chip label={item.blood_type} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f' }} />
                      </TableCell>
                      <TableCell align="right">{item.current_stock}</TableCell>
                      <TableCell align="right">{item.total_predicted_demand}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={item.shortage_alert ? 'High risk' : 'Stable'}
                          size="small"
                          color={item.shortage_alert ? 'warning' : 'success'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {Object.entries(item.models_available || {})
                          .filter(([, enabled]) => enabled)
                          .map(([name]) => name.toUpperCase())
                          .join(', ') || 'Fallback'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {forecastSummary.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Forecast data is not available yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Daily Request Volume
                </Typography>
                {requestTrends.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No request trend data available.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={requestTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="requests" stroke="#d32f2f" strokeWidth={2} />
                      <Line type="monotone" dataKey="urgent" stroke="#ff9800" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Current Shortage Alerts
                </Typography>
                {shortageAlerts.length === 0 ? (
                  <Alert severity="success">No active shortage alerts right now.</Alert>
                ) : (
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    {shortageAlerts.map((alert) => (
                      <Paper key={alert.bloodType} sx={{ p: 2, borderLeft: `4px solid ${alert.severity === 'high' ? '#f44336' : '#ff9800'}` }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {alert.bloodType}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Stock {alert.currentStock} vs demand {alert.predictedDemand}
                            </Typography>
                          </Box>
                          <Avatar sx={{ bgcolor: '#fff5f5', color: alert.severity === 'high' ? '#f44336' : '#ff9800' }}>
                            <WarningIcon />
                          </Avatar>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          <AnalyticsIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
          Live metrics sourced from PostgreSQL and the forecast service
        </Typography>
      </Box>
    </Box>
  );
};

export default ManagerDashboard;
