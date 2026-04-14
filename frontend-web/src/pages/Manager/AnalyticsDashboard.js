// src/pages/Manager/AnalyticsDashboard.js
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
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Bloodtype as BloodIcon,
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [chartType, setChartType] = useState('line');
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const requestData = [
    { month: 'Jan', requests: 42, fulfilled: 38, donors: 28 },
    { month: 'Feb', requests: 48, fulfilled: 45, donors: 32 },
    { month: 'Mar', requests: 55, fulfilled: 52, donors: 35 },
    { month: 'Apr', requests: 62, fulfilled: 58, donors: 38 },
    { month: 'May', requests: 58, fulfilled: 55, donors: 36 },
    { month: 'Jun', requests: 72, fulfilled: 68, donors: 42 },
  ];

  const inventoryByType = [
    { name: 'O+', value: 120, color: '#d32f2f' },
    { name: 'A+', value: 62, color: '#ff9800' },
    { name: 'B+', value: 45, color: '#2196f3' },
    { name: 'O-', value: 28, color: '#4caf50' },
    { name: 'AB+', value: 35, color: '#9c27b0' },
    { name: 'A-', value: 18, color: '#795548' },
    { name: 'B-', value: 12, color: '#607d8b' },
    { name: 'AB-', value: 22, color: '#e91e63' },
  ];

  const urgencyDistribution = [
    { name: 'Routine', value: 45, color: '#2196f3' },
    { name: 'Urgent', value: 35, color: '#ff9800' },
    { name: 'Emergency', value: 20, color: '#f44336' },
  ];

  const weeklyTrends = [
    { day: 'Mon', demand: 28 },
    { day: 'Tue', demand: 32 },
    { day: 'Wed', demand: 35 },
    { day: 'Thu', demand: 38 },
    { day: 'Fri', demand: 42 },
    { day: 'Sat', demand: 48 },
    { day: 'Sun', demand: 52 },
  ];

  const stats = {
    totalRequests: 337,
    fulfillmentRate: 94,
    avgResponseTime: 2.4,
    wastageRate: 6,
    activeDonors: 156,
    newDonors: 42,
    totalHospitals: 8,
    criticalStock: 2,
  };

  const handleExport = () => {
    setAnchorEl(null);
    alert('Export functionality will be implemented');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Analytics Dashboard
        </Typography>
        <Box>
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
              size="small"
            >
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Export Data">
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ color: '#d32f2f' }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton sx={{ color: '#d32f2f' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={handleExport}>Export as CSV</MenuItem>
            <MenuItem onClick={handleExport}>Export as PDF</MenuItem>
            <MenuItem onClick={handleExport}>Export as Excel</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: '4px solid #d32f2f' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Requests
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.totalRequests}
              </Typography>
              <Chip
                icon={<TrendingUpIcon />}
                label="+12%"
                size="small"
                sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: '4px solid #2e7d32' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Fulfillment Rate
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.fulfillmentRate}%
              </Typography>
              <Chip
                icon={<TrendingUpIcon />}
                label="+5%"
                size="small"
                sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: '4px solid #ff9800' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Donors
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.activeDonors}
              </Typography>
              <Chip
                icon={<TrendingUpIcon />}
                label="+8"
                size="small"
                sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: '4px solid #f44336' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Critical Stock
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                {stats.criticalStock}
              </Typography>
              <Chip
                icon={<TrendingDownIcon />}
                label="Alert"
                size="small"
                sx={{ bgcolor: '#ffebee', color: '#c62828', mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: '#fff5f5',
            '& .MuiTab-root.Mui-selected': { color: '#d32f2f' },
            '& .MuiTabs-indicator': { bgcolor: '#d32f2f' },
          }}
        >
          <Tab label="Request Trends" />
          <Tab label="Inventory Analysis" />
          <Tab label="Donor Insights" />
          <Tab label="Performance Metrics" />
        </Tabs>

        {/* Request Trends Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                Request & Fulfillment Trends
              </Typography>
              <Box>
                <Tooltip title="Line Chart">
                  <IconButton
                    onClick={() => setChartType('line')}
                    sx={{ color: chartType === 'line' ? '#d32f2f' : '#999' }}
                  >
                    <LineChartIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Bar Chart">
                  <IconButton
                    onClick={() => setChartType('bar')}
                    sx={{ color: chartType === 'bar' ? '#d32f2f' : '#999' }}
                  >
                    <BarChartIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 'line' ? (
                <LineChart data={requestData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="requests" stroke="#d32f2f" strokeWidth={2} />
                  <Line type="monotone" dataKey="fulfilled" stroke="#2e7d32" strokeWidth={2} />
                </LineChart>
              ) : (
                <BarChart data={requestData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="requests" fill="#d32f2f" />
                  <Bar dataKey="fulfilled" fill="#2e7d32" />
                </BarChart>
              )}
            </ResponsiveContainer>

            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Urgency Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={urgencyDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {urgencyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Weekly Demand Pattern
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="demand" fill="#d32f2f" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Inventory Analysis Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Blood Inventory by Type
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={inventoryByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {inventoryByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Stock Status
                </Typography>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  {inventoryByType.slice(0, 8).map((item) => (
                    <Box key={item.name} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2">{item.name}</Typography>
                        <Typography variant="body2" fontWeight={600}>{item.value} units</Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 8,
                          bgcolor: '#e0e0e0',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${(item.value / 150) * 100}%`,
                            height: '100%',
                            bgcolor: item.value < 30 ? '#f44336' : item.value < 50 ? '#ff9800' : '#4caf50',
                            borderRadius: 4,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Donor Insights Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Donor Growth Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={requestData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="donors" stroke="#d32f2f" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Blood Type Distribution Among Donors
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#d32f2f" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Performance Metrics Tab */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Average Response Time
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                    {stats.avgResponseTime}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    hours
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Wastage Rate
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {stats.wastageRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    below target of 8%
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    New Donors (30d)
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                    {stats.newDonors}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    +15% from last month
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AnalyticsDashboard;