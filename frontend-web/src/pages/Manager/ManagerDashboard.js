// src/pages/Manager/ManagerDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Bloodtype as BloodIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const ManagerDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [forecast, setForecast] = useState([]);
  const [stats, setStats] = useState({
    totalBloodUnits: 342,
    totalDonors: 156,
    totalHospitals: 8,
    activeRequests: 12,
    fulfillmentRate: 94,
    wastageRate: 6,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setForecast([
      { bloodType: 'O-', currentStock: 28, predictedDemand7d: 35, predictedDemand30d: 120, predictedDemand90d: 350, shortageRisk: 'high' },
      { bloodType: 'O+', currentStock: 120, predictedDemand7d: 85, predictedDemand30d: 320, predictedDemand90d: 980, shortageRisk: 'low' },
      { bloodType: 'A+', currentStock: 62, predictedDemand7d: 55, predictedDemand30d: 210, predictedDemand90d: 640, shortageRisk: 'medium' },
      { bloodType: 'B+', currentStock: 45, predictedDemand7d: 48, predictedDemand30d: 180, predictedDemand90d: 550, shortageRisk: 'medium' },
      { bloodType: 'AB+', currentStock: 35, predictedDemand7d: 25, predictedDemand30d: 95, predictedDemand90d: 290, shortageRisk: 'low' },
    ]);
  };

  const inventoryByType = [
    { name: 'O+', value: 120, color: '#d32f2f' },
    { name: 'A+', value: 62, color: '#ff9800' },
    { name: 'B+', value: 45, color: '#2196f3' },
    { name: 'O-', value: 28, color: '#4caf50' },
    { name: 'AB+', value: 35, color: '#9c27b0' },
    { name: 'Others', value: 52, color: '#795548' },
  ];

  const requestTrends = [
    { month: 'Jan', requests: 42, fulfilled: 38 },
    { month: 'Feb', requests: 48, fulfilled: 45 },
    { month: 'Mar', requests: 55, fulfilled: 52 },
    { month: 'Apr', requests: 62, fulfilled: 58 },
    { month: 'May', requests: 58, fulfilled: 55 },
    { month: 'Jun', requests: 72, fulfilled: 68 },
  ];

  const StatCard = ({ title, value, icon, color, trend }) => (
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
            {trend && (
              <Typography variant="caption" color="success.main">
                {trend}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      default: return '#4caf50';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
            Blood Bank Manager Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Maseru Central Blood Bank • Read-Only Analytics
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Export Report">
            <IconButton sx={{ color: '#d32f2f' }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton sx={{ color: '#d32f2f' }} onClick={loadData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Shortage Alerts */}
      {forecast.filter(f => f.shortageRisk === 'high').length > 0 && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: '#ffebee' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Critical Shortage Alert
          </Typography>
          <Typography variant="body2">
            {forecast.filter(f => f.shortageRisk === 'high').map(f => f.bloodType).join(', ')} blood types are projected to be in shortage within 7 days.
            Immediate action recommended.
          </Typography>
        </Alert>
      )}

      {/* Stats Cards - READ-ONLY */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Blood Units" value={stats.totalBloodUnits} icon={<BloodIcon />} color="#d32f2f" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Donors" value={stats.totalDonors} icon={<PeopleIcon />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Hospitals" value={stats.totalHospitals} icon={<HospitalIcon />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Fulfillment Rate" value={`${stats.fulfillmentRate}%`} icon={<TrendingIcon />} color="#ff9800" />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
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

        {/* Overview Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Blood Inventory Distribution
                </Typography>
                <PieChart width={400} height={300}>
                  <Pie
                    data={inventoryByType}
                    cx={200}
                    cy={150}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {inventoryByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Request Trends (Last 6 Months)
                </Typography>
                <BarChart width={450} height={300} data={requestTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="requests" fill="#d32f2f" />
                  <Bar dataKey="fulfilled" fill="#4caf50" />
                </BarChart>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Demand Forecast Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f', mb: 3 }}>
              7-Day Demand Forecast
            </Typography>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Blood Type</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                    <TableCell align="right">Predicted Demand (7d)</TableCell>
                    <TableCell align="right">Predicted Demand (30d)</TableCell>
                    <TableCell align="right">Predicted Demand (90d)</TableCell>
                    <TableCell align="right">Shortage Risk</TableCell>
                    <TableCell align="right">Recommendation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {forecast.map((item) => (
                    <TableRow key={item.bloodType}>
                      <TableCell>
                        <Chip label={item.bloodType} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f' }} />
                      </TableCell>
                      <TableCell align="right">{item.currentStock} units</TableCell>
                      <TableCell align="right">{item.predictedDemand7d} units</TableCell>
                      <TableCell align="right">{item.predictedDemand30d} units</TableCell>
                      <TableCell align="right">{item.predictedDemand90d} units</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={item.shortageRisk === 'high' ? 'HIGH RISK' : item.shortageRisk === 'medium' ? 'Medium Risk' : 'Low Risk'}
                          size="small"
                          sx={{ bgcolor: `${getRiskColor(item.shortageRisk)}20`, color: getRiskColor(item.shortageRisk) }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {item.shortageRisk === 'high' && (
                          <Button size="small" variant="outlined" sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}>
                            Schedule Drive
                          </Button>
                        )}
                        {item.shortageRisk === 'medium' && (
                          <Typography variant="caption">Monitor Stock</Typography>
                        )}
                        {item.shortageRisk === 'low' && (
                          <Typography variant="caption">Adequate Supply</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Inventory Analytics Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Expiry Analysis
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">Expiring in &lt;7 days</Typography>
                    <Chip label="12 units" size="small" color="warning" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">Expiring in &lt;3 days</Typography>
                    <Chip label="4 units" size="small" color="error" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Wastage Rate (Last 30d)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff9800' }}>6%</Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Donor Demographics
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">Active Donors</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>156</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">New Donors (Last 30d)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>23</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Donation Frequency (Avg)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>2.3x/year</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Footer Note */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          <AnalyticsIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
          Data refreshed every 30 minutes • AI-powered forecasts based on historical trends
        </Typography>
      </Box>
    </Box>
  );
};

export default ManagerDashboard;