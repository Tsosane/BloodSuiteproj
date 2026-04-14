// src/pages/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  Bloodtype as BloodIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalHospitals: 0,
    pendingApprovals: 0,
    totalBloodUnits: 0,
    totalRequests: 0,
    fulfillmentRate: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Demo data - replace with API calls
    setUsers([
      { id: 1, name: 'John Doe', email: 'john@bloodsuite.org', role: 'donor', status: 'active', createdAt: '2024-01-15' },
      { id: 2, name: 'Queen Elizabeth Hospital', email: 'hospital@qeh.org', role: 'hospital', status: 'active', createdAt: '2024-01-20' },
      { id: 3, name: 'Jane Smith', email: 'jane@bloodsuite.org', role: 'blood_bank_manager', status: 'active', createdAt: '2024-02-01' },
      { id: 4, name: 'Admin User', email: 'admin@bloodsuite.org', role: 'admin', status: 'active', createdAt: '2024-01-01' },
    ]);

    setHospitals([
      { id: 1, name: 'Queen Elizabeth II Hospital', code: 'LS-BB-001', location: 'Maseru', status: 'approved', requests: 45, fulfilled: 42 },
      { id: 2, name: 'Scott Hospital', code: 'LS-BB-002', location: 'Maseru', status: 'approved', requests: 38, fulfilled: 35 },
      { id: 3, name: 'Maseru Private Hospital', code: 'LS-BB-003', location: 'Maseru', status: 'pending', requests: 0, fulfilled: 0 },
      { id: 4, name: 'Mokhotlong Hospital', code: 'LS-BB-004', location: 'Mokhotlong', status: 'approved', requests: 22, fulfilled: 20 },
    ]);

    setStats({
      totalUsers: 156,
      totalDonors: 142,
      totalHospitals: 8,
      pendingApprovals: 2,
      totalBloodUnits: 342,
      totalRequests: 127,
      fulfillmentRate: 94,
    });
  };

  const handleApproveHospital = (id) => {
    setHospitals(hospitals.map(h => 
      h.id === id ? { ...h, status: 'approved' } : h
    ));
    setStats({ ...stats, pendingApprovals: stats.pendingApprovals - 1 });
  };

  const handleRejectHospital = (id) => {
    setHospitals(hospitals.filter(h => h.id !== id));
    setStats({ ...stats, pendingApprovals: stats.pendingApprovals - 1 });
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
    setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return '#ed6c02';
      case 'hospital': return '#d32f2f';
      case 'donor': return '#1976d2';
      case 'blood_bank_manager': return '#2e7d32';
      default: return '#9e9e9e';
    }
  };

  const getRoleDisplay = (role) => {
    switch(role) {
      case 'admin': return 'Admin';
      case 'hospital': return 'Hospital';
      case 'donor': return 'Donor';
      case 'blood_bank_manager': return 'Manager';
      default: return role;
    }
  };

  const pieData = [
    { name: 'A+', value: 85, color: '#d32f2f' },
    { name: 'O+', value: 120, color: '#ff9800' },
    { name: 'B+', value: 62, color: '#2196f3' },
    { name: 'AB+', value: 35, color: '#4caf50' },
    { name: 'O-', value: 28, color: '#9c27b0' },
    { name: 'Others', value: 12, color: '#795548' },
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Users" value={stats.totalUsers} icon={<PeopleIcon />} color="#d32f2f" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Donors" value={stats.totalDonors} icon={<BloodIcon />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Hospitals" value={stats.totalHospitals} icon={<HospitalIcon />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Fulfillment Rate" value={`${stats.fulfillmentRate}%`} icon={<TrendingIcon />} color="#ff9800" trend="+5% vs last month" />
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
          <Tab label="User Management" />
          <Tab label="Hospital Approvals" />
          <Tab label="Analytics" />
        </Tabs>

        {/* User Management Tab */}
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
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ bgcolor: getRoleColor(user.role), width: 32, height: 32 }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleDisplay(user.role)}
                          size="small"
                          sx={{ bgcolor: `${getRoleColor(user.role)}20`, color: getRoleColor(user.role) }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          sx={{ bgcolor: user.status === 'active' ? '#e8f5e9' : '#ffebee', color: user.status === 'active' ? '#2e7d32' : '#c62828' }}
                        />
                      </TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => setSelectedUser(user)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Hospital Approvals Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            {hospitals.filter(h => h.status === 'pending').length === 0 ? (
              <Alert severity="info" sx={{ bgcolor: '#fff5f5' }}>
                No pending hospital approvals
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {hospitals.filter(h => h.status === 'pending').map((hospital) => (
                  <Grid item xs={12} key={hospital.id}>
                    <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: '#d32f2f' }}>
                            <HospitalIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {hospital.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Code: {hospital.code} | Location: {hospital.location}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleApproveHospital(hospital.id)}
                            sx={{ bgcolor: '#2e7d32', mr: 1, '&:hover': { bgcolor: '#1b5e20' } }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => handleRejectHospital(hospital.id)}
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

        {/* Analytics Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                    Blood Inventory by Type
                  </Typography>
                  <PieChart width={400} height={300}>
                    <Pie
                      data={pieData}
                      cx={200}
                      cy={150}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                    Request Trends
                  </Typography>
                  <BarChart width={450} height={300} data={requestTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="requests" fill="#d32f2f" />
                    <Bar dataKey="fulfilled" fill="#2e7d32" />
                  </BarChart>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* User Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#fff5f5', color: '#d32f2f' }}>
          User Details
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedUser && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Name" value={selectedUser.name} disabled />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" value={selectedUser.email} disabled />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Role" value={getRoleDisplay(selectedUser.role)} disabled />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Status" value={selectedUser.status} disabled />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#d32f2f' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;