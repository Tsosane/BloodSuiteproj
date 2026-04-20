import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
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
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  Bloodtype as BloodIcon,
  TrendingUp as TrendingIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Cancel as DisableIcon,
  CheckCircle as ActivateIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import analyticsService from '../../services/analyticsService';
import adminService from '../../services/adminService';
import hospitalService from '../../services/hospitalService';

const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return '#ed6c02';
    case 'hospital':
      return '#d32f2f';
    case 'donor':
      return '#1976d2';
    case 'blood_bank_manager':
      return '#2e7d32';
    default:
      return '#9e9e9e';
  }
};

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

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [usersResponse, pendingResponse, analyticsResponse] = await Promise.all([
        adminService.getUsers(),
        hospitalService.getPendingHospitals(),
        analyticsService.getDashboard(),
      ]);

      setUsers(usersResponse.data || []);
      setPendingHospitals(pendingResponse.data || []);
      setAnalytics(analyticsResponse.data || null);
    } catch (loadError) {
      console.error('Failed to load admin dashboard', loadError);
      setError(loadError.error || loadError.message || 'Failed to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUserStatusChange = async (user) => {
    try {
      await adminService.updateUserStatus(user.id, user.status !== 'active');
      await loadData();
    } catch (statusError) {
      setError(statusError.error || statusError.message || 'Unable to update user status.');
    }
  };

  const handleHospitalDecision = async (hospitalId, action) => {
    try {
      if (action === 'approve') {
        await hospitalService.approveHospital(hospitalId);
      } else {
        await hospitalService.rejectHospital(hospitalId);
      }
      await loadData();
    } catch (decisionError) {
      setError(decisionError.error || decisionError.message || `Unable to ${action} hospital.`);
    }
  };

  const stats = useMemo(() => {
    if (!analytics) {
      return {
        totalUsers: users.length,
        totalDonors: 0,
        totalHospitals: 0,
        pendingApprovals: pendingHospitals.length,
        totalBloodUnits: 0,
        totalRequests: 0,
        fulfillmentRate: 0,
      };
    }

    const totalBloodUnits = (analytics.inventory || []).reduce(
      (sum, item) => sum + Number(item.count || 0),
      0
    );

    return {
      totalUsers: users.length,
      totalDonors: analytics.donors?.total || 0,
      totalHospitals: analytics.hospitals?.total || 0,
      pendingApprovals: analytics.hospitals?.pending || pendingHospitals.length,
      totalBloodUnits,
      totalRequests: analytics.requests?.total || 0,
      fulfillmentRate: analytics.requests?.fulfillmentRate || 0,
    };
  }, [analytics, pendingHospitals.length, users.length]);

  const pieData = (analytics?.inventory || []).map((item, index) => ({
    name: item.blood_type,
    value: Number(item.count || 0),
    color: ['#d32f2f', '#ff9800', '#2196f3', '#4caf50', '#9c27b0', '#795548', '#607d8b', '#e91e63'][index % 8],
  }));

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
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Admin Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Users" value={stats.totalUsers} icon={<PeopleIcon />} color="#d32f2f" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Donors" value={stats.totalDonors} icon={<BloodIcon />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Hospitals" value={stats.totalHospitals} icon={<HospitalIcon />} color="#2e7d32" helper={`${stats.pendingApprovals} pending`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Fulfillment Rate" value={`${stats.fulfillmentRate}%`} icon={<TrendingIcon />} color="#ff9800" helper={`${stats.totalRequests} total requests`} />
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
          <Tab label="User Management" />
          <Tab label="Hospital Approvals" />
          <Tab label="Analytics" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ bgcolor: getRoleColor(user.role), width: 32, height: 32 }}>
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {user.name}
                            </Typography>
                            {user.hospitalName && (
                              <Typography variant="caption" color="text.secondary">
                                {user.hospitalName}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          sx={{ bgcolor: `${getRoleColor(user.role)}20`, color: getRoleColor(user.role) }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          color={user.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Tooltip title={user.status === 'active' ? 'Deactivate user' : 'Activate user'}>
                          <IconButton onClick={() => handleUserStatusChange(user)} size="small">
                            {user.status === 'active' ? <DisableIcon fontSize="small" /> : <ActivateIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View user details">
                          <IconButton size="small" disabled>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            {pendingHospitals.length === 0 ? (
              <Alert severity="info">No pending hospital approvals.</Alert>
            ) : (
              <Grid container spacing={2}>
                {pendingHospitals.map((hospital) => (
                  <Grid item xs={12} key={hospital.id}>
                    <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {hospital.hospital_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {hospital.user?.email} | License: {hospital.license_number}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {hospital.address || 'No address provided'}
                          </Typography>
                        </Box>
                        <Box>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleHospitalDecision(hospital.id, 'approve')}
                            sx={{ bgcolor: '#2e7d32', mr: 1, '&:hover': { bgcolor: '#1b5e20' } }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => handleHospitalDecision(hospital.id, 'reject')}
                          >
                            Reject
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                    Blood Inventory by Type
                  </Typography>
                  {pieData.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No inventory data available.
                    </Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                    Recent Request Trends
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
                        <Bar dataKey="requests" fill="#d32f2f" name="Requests" />
                        <Bar dataKey="urgent" fill="#ff9800" name="Urgent/Emergency" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
