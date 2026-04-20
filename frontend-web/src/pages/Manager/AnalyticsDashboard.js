import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  Bloodtype as BloodIcon,
  CheckCircle as CheckIcon,
  LocalHospital as HospitalIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import analyticsService from '../../services/analyticsService';

const BLOOD_COLORS = {
  'O+': '#d32f2f',
  'O-': '#8e0000',
  'A+': '#ef6c00',
  'A-': '#ff9800',
  'B+': '#1976d2',
  'B-': '#42a5f5',
  'AB+': '#2e7d32',
  'AB-': '#66bb6a',
};

const URGENCY_COLORS = {
  routine: '#1976d2',
  urgent: '#fb8c00',
  emergency: '#d32f2f',
};

const formatShortDate = (value) => {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <Card sx={{ borderTop: `4px solid ${color}`, height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        {icon}
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30days');
  const [chartType, setChartType] = useState('line');
  const [activeTab, setActiveTab] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [inventorySummary, setInventorySummary] = useState([]);
  const [requestTrends, setRequestTrends] = useState([]);
  const [donorStats, setDonorStats] = useState({
    byBloodType: [],
    donationFrequency: [],
  });

  const loadData = async (selectedRange = timeRange) => {
    setLoading(true);
    setError('');

    try {
      const [dashboardResponse, inventoryResponse, requestTrendResponse, donorStatsResponse] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getInventorySummary(),
        analyticsService.getRequestTrends(selectedRange),
        analyticsService.getDonorStats(),
      ]);

      setDashboard(dashboardResponse.data || null);
      setInventorySummary(inventoryResponse.data || []);
      setRequestTrends(requestTrendResponse.data || []);
      setDonorStats(
        donorStatsResponse.data || {
          byBloodType: [],
          donationFrequency: [],
        }
      );
    } catch (loadError) {
      console.error('Failed to load analytics dashboard', loadError);
      setError(loadError.error || loadError.message || 'Unable to load analytics dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(timeRange);
  }, [timeRange]);

  const requestTrendChart = requestTrends.map((item) => ({
    date: formatShortDate(item.date),
    requests: Number(item.total || 0),
    fulfilled: Number(item.fulfilled || 0),
  }));

  const inventoryChart = inventorySummary.map((item) => ({
    name: item.blood_type,
    value: Number(item.available_units || item.count || 0),
    totalMl: Number(item.total_ml || 0),
    color: BLOOD_COLORS[item.blood_type] || '#9e9e9e',
  }));

  const donorBloodTypeChart = (donorStats.byBloodType || []).map((item) => ({
    name: item.blood_type,
    value: Number(item.count || 0),
    averageDonations: Number(item.avg_donations || 0).toFixed(1),
    color: BLOOD_COLORS[item.blood_type] || '#9e9e9e',
  }));

  const donationFrequencyChart = (donorStats.donationFrequency || []).map((item) => ({
    month: formatShortDate(item.month),
    donations: Number(item.donations || 0),
  }));

  const urgencyDistribution = Object.entries(
    (dashboard?.requestTrends || []).reduce((accumulator, item) => {
      const urgency = item.urgency || 'routine';
      accumulator[urgency] = (accumulator[urgency] || 0) + Number(item.count || 0);
      return accumulator;
    }, {})
  ).map(([name, value]) => ({
    name,
    value,
    color: URGENCY_COLORS[name] || '#9e9e9e',
  }));

  const lowStockTypes = inventoryChart.filter((item) => item.value < 3).length;
  const totalUnits = inventoryChart.reduce((total, item) => total + item.value, 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress sx={{ color: '#d32f2f' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Live KPIs and charts backed by the analytics API
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(event) => setTimeRange(event.target.value)}
            >
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => loadData(timeRange)}
            sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Requests"
            value={dashboard?.requests?.total || 0}
            subtitle="All requests recorded in the database"
            icon={<TrendingUpIcon sx={{ color: '#d32f2f' }} />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Fulfillment Rate"
            value={`${dashboard?.requests?.fulfillmentRate || 0}%`}
            subtitle={`${dashboard?.requests?.fulfilled || 0} fulfilled requests`}
            icon={<CheckIcon sx={{ color: '#2e7d32' }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Donors"
            value={dashboard?.donors?.active || 0}
            subtitle={`${dashboard?.donors?.total || 0} total donor profiles`}
            icon={<PeopleIcon sx={{ color: '#fb8c00' }} />}
            color="#fb8c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Units"
            value={totalUnits}
            subtitle={`${lowStockTypes} low-stock blood types`}
            icon={<BloodIcon sx={{ color: '#1976d2' }} />}
            color="#1976d2"
          />
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(event, value) => setActiveTab(value)}
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
          <Tab label="System Overview" />
        </Tabs>

        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                Requests vs Fulfilled Requests
              </Typography>
              <ButtonGroup size="small">
                <Button
                  variant={chartType === 'line' ? 'contained' : 'outlined'}
                  onClick={() => setChartType('line')}
                  sx={chartType === 'line' ? { bgcolor: '#d32f2f' } : { color: '#d32f2f', borderColor: '#d32f2f' }}
                >
                  Line
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'contained' : 'outlined'}
                  onClick={() => setChartType('bar')}
                  sx={chartType === 'bar' ? { bgcolor: '#d32f2f' } : { color: '#d32f2f', borderColor: '#d32f2f' }}
                >
                  Bar
                </Button>
              </ButtonGroup>
            </Box>

            <Box sx={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={requestTrendChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="requests" stroke="#d32f2f" strokeWidth={3} />
                    <Line type="monotone" dataKey="fulfilled" stroke="#2e7d32" strokeWidth={3} />
                  </LineChart>
                ) : (
                  <BarChart data={requestTrendChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="requests" fill="#d32f2f" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fulfilled" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f', mb: 2 }}>
                  Available Units by Blood Type
                </Typography>
                <Box sx={{ height: 360 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {inventoryChart.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f', mb: 2 }}>
                  Inventory Distribution
                </Typography>
                <Box sx={{ height: 360 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={inventoryChart} dataKey="value" nameKey="name" outerRadius={120} label>
                        {inventoryChart.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f', mb: 2 }}>
                  Donors by Blood Type
                </Typography>
                <Box sx={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donorBloodTypeChart} dataKey="value" nameKey="name" outerRadius={110} label>
                        {donorBloodTypeChart.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f', mb: 2 }}>
                  Donation Frequency
                </Typography>
                <Box sx={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={donationFrequencyChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="donations" stroke="#d32f2f" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <HospitalIcon sx={{ color: '#d32f2f' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Hospitals
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Total registered hospitals
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                      {dashboard?.hospitals?.total || 0}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2">Approved: {dashboard?.hospitals?.approved || 0}</Typography>
                    <Typography variant="body2">Pending: {dashboard?.hospitals?.pending || 0}</Typography>
                    <Typography variant="body2">Rejected: {dashboard?.hospitals?.rejected || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <PeopleIcon sx={{ color: '#d32f2f' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Donors
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Current donor population
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                      {dashboard?.donors?.total || 0}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2">Eligible: {dashboard?.donors?.eligible || 0}</Typography>
                    <Typography variant="body2">Active in last 30 days: {dashboard?.donors?.active || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <TrendingUpIcon sx={{ color: '#d32f2f' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Request Urgency
                      </Typography>
                    </Box>
                    {urgencyDistribution.map((item) => (
                      <Box key={item.name} display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Chip
                          label={item.name}
                          size="small"
                          sx={{ bgcolor: `${item.color}20`, color: item.color, textTransform: 'capitalize' }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                    {urgencyDistribution.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No recent urgency data is available yet.
                      </Typography>
                    )}
                  </CardContent>
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
