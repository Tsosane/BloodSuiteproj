// src/pages/Hospital/HospitalDashboard.js
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Avatar,
  LinearProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Bloodtype as BloodIcon,
  Add as AddIcon,
  LocalHospital as HospitalIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  NotificationsActive as AlertIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

const HospitalDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [newUnit, setNewUnit] = useState({
    bloodType: '',
    quantityMl: 450,
    collectionDate: '',
    expiryDate: '',
    storageLocation: '',
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const hospitalName = localStorage.getItem('bloodSuiteHospital') || 'Queen Elizabeth II Hospital';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Demo inventory with FEFO ordering
    const demoInventory = [
      { id: 1, bloodType: 'O-', quantityMl: 450, expiryDate: '2024-04-15', status: 'available', collectionDate: '2024-03-20', storageLocation: 'Fridge A1' },
      { id: 2, bloodType: 'A+', quantityMl: 450, expiryDate: '2024-04-10', status: 'available', collectionDate: '2024-03-15', storageLocation: 'Fridge B2' },
      { id: 3, bloodType: 'B+', quantityMl: 450, expiryDate: '2024-03-28', status: 'available', collectionDate: '2024-03-01', storageLocation: 'Fridge C3' },
      { id: 4, bloodType: 'O+', quantityMl: 450, expiryDate: '2024-03-25', status: 'available', collectionDate: '2024-02-28', storageLocation: 'Fridge A2' },
      { id: 5, bloodType: 'AB+', quantityMl: 450, expiryDate: '2024-04-20', status: 'reserved', collectionDate: '2024-03-25', storageLocation: 'Fridge D1' },
    ].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)); // FEFO ordering
    
    setInventory(demoInventory);
    
    setRequests([
      { id: 1, bloodType: 'O-', quantityMl: 450, urgency: 'emergency', status: 'pending', patientName: 'John Doe', requiredDate: '2024-03-27', createdAt: '2024-03-26' },
      { id: 2, bloodType: 'A+', quantityMl: 900, urgency: 'urgent', status: 'processing', patientName: 'Jane Smith', requiredDate: '2024-03-28', createdAt: '2024-03-25' },
      { id: 3, bloodType: 'B+', quantityMl: 450, urgency: 'routine', status: 'fulfilled', patientName: 'Bob Johnson', requiredDate: '2024-03-29', createdAt: '2024-03-20' },
    ]);
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 3) return { label: 'Expiring Soon', color: '#f44336', variant: 'error' };
    if (daysLeft < 7) return { label: 'Near Expiry', color: '#ff9800', variant: 'warning' };
    return { label: 'Good', color: '#4caf50', variant: 'success' };
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'emergency': return '#f44336';
      case 'urgent': return '#ff9800';
      default: return '#2196f3';
    }
  };

  const handleAddUnit = () => {
    const newId = inventory.length + 1;
    const unit = {
      id: newId,
      ...newUnit,
      status: 'available',
    };
    setInventory([...inventory, unit].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)));
    setOpenDialog(false);
    setNewUnit({ bloodType: '', quantityMl: 450, collectionDate: '', expiryDate: '', storageLocation: '' });
    setSnackbar({ open: true, message: 'Blood unit added successfully', severity: 'success' });
  };

  const handleDeleteUnit = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
    setSnackbar({ open: true, message: 'Blood unit removed', severity: 'info' });
  };

  const inventoryColumns = [
    { field: 'bloodType', headerName: 'Blood Type', width: 120, renderCell: (params) => (
      <Chip label={params.value} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', fontWeight: 600 }} />
    )},
    { field: 'quantityMl', headerName: 'Quantity (ml)', width: 120 },
    { field: 'collectionDate', headerName: 'Collection Date', width: 130 },
    { 
      field: 'expiryDate', 
      headerName: 'Expiry Date', 
      width: 130,
      renderCell: (params) => {
        const status = getExpiryStatus(params.value);
        return (
          <Chip 
            label={`${params.value} (${status.label})`} 
            size="small" 
            sx={{ bgcolor: `${status.color}20`, color: status.color }}
          />
        );
      }
    },
    { field: 'storageLocation', headerName: 'Location', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          sx={{ bgcolor: params.value === 'available' ? '#e8f5e9' : '#fff3e0', color: params.value === 'available' ? '#2e7d32' : '#ed6c02' }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <IconButton size="small" color="error" onClick={() => handleDeleteUnit(params.row.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      )
    },
  ];

  const requestColumns = [
    { field: 'bloodType', headerName: 'Blood Type', width: 120 },
    { field: 'quantityMl', headerName: 'Quantity (ml)', width: 120 },
    {
      field: 'urgency',
      headerName: 'Urgency',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          sx={{ bgcolor: `${getUrgencyColor(params.value)}20`, color: getUrgencyColor(params.value) }}
        />
      )
    },
    { field: 'patientName', headerName: 'Patient', width: 150 },
    { field: 'requiredDate', headerName: 'Required By', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          sx={{ 
            bgcolor: params.value === 'fulfilled' ? '#e8f5e9' : params.value === 'pending' ? '#fff3e0' : '#e3f2fd',
            color: params.value === 'fulfilled' ? '#2e7d32' : params.value === 'pending' ? '#ed6c02' : '#1976d2'
          }}
        />
      )
    },
  ];

  const lowStockItems = inventory.filter(item => {
    const status = getExpiryStatus(item.expiryDate);
    return status.variant === 'warning' || status.variant === 'error';
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
            Hospital Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hospitalName}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setDialogType('unit');
            setOpenDialog(true);
          }}
          sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
        >
          Add Blood Unit
        </Button>
      </Box>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3, bgcolor: '#fff5f5' }}>
          <Typography variant="subtitle2">Expiring Blood Units Alert</Typography>
          <Typography variant="body2">
            {lowStockItems.length} unit(s) are expiring within 7 days. Please prioritize their use.
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: '4px solid #d32f2f' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Blood Units</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{inventory.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: '4px solid #ff9800' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Pending Requests</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {requests.filter(r => r.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: '4px solid #4caf50' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Fulfillment Rate</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>94%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: '4px solid #2196f3' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Expiring Soon</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {lowStockItems.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
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
          <Tab label="Blood Inventory" />
          <Tab label="Blood Requests" />
          <Tab label="Quick Stats" />
        </Tabs>

        {/* Inventory Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <DataGrid
              rows={inventory}
              columns={inventoryColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              autoHeight
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-columnHeaders': { bgcolor: '#f5f5f5' },
                '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
              }}
            />
          </Box>
        )}

        {/* Requests Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <DataGrid
              rows={requests}
              columns={requestColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              autoHeight
              disableSelectionOnClick
            />
          </Box>
        )}

        {/* Quick Stats Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Inventory by Blood Type
                </Typography>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Blood Type</TableCell>
                        <TableCell align="right">Available Units</TableCell>
                        <TableCell align="right">Expiring Soon</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bloodTypes.map(type => {
                        const units = inventory.filter(i => i.bloodType === type);
                        const expiringSoon = units.filter(u => getExpiryStatus(u.expiryDate).variant !== 'success').length;
                        return (
                          <TableRow key={type}>
                            <TableCell>
                              <Chip label={type} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f' }} />
                            </TableCell>
                            <TableCell align="right">{units.length}</TableCell>
                            <TableCell align="right">
                              {expiringSoon > 0 && (
                                <Chip label={`${expiringSoon} expiring`} size="small" color="warning" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Recent Activity
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {requests.slice(0, 5).map((req, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, borderBottom: idx < 4 ? '1px solid #e0e0e0' : 'none' }}>
                      <Avatar sx={{ bgcolor: `${getUrgencyColor(req.urgency)}20`, width: 32, height: 32 }}>
                        {req.urgency === 'emergency' ? <AlertIcon fontSize="small" /> : <ScheduleIcon fontSize="small" />}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {req.bloodType} - {req.quantityMl}ml
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {req.patientName} • {req.urgency} • {req.createdAt}
                        </Typography>
                      </Box>
                      <Chip label={req.status} size="small" />
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Add Unit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#fff5f5', color: '#d32f2f' }}>
          Add Blood Unit
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Blood Type"
                value={newUnit.bloodType}
                onChange={(e) => setNewUnit({ ...newUnit, bloodType: e.target.value })}
              >
                {bloodTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity (ml)"
                type="number"
                value={newUnit.quantityMl}
                onChange={(e) => setNewUnit({ ...newUnit, quantityMl: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Collection Date"
                type="date"
                value={newUnit.collectionDate}
                onChange={(e) => setNewUnit({ ...newUnit, collectionDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={newUnit.expiryDate}
                onChange={(e) => setNewUnit({ ...newUnit, expiryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Storage Location"
                value={newUnit.storageLocation}
                onChange={(e) => setNewUnit({ ...newUnit, storageLocation: e.target.value })}
                placeholder="e.g., Fridge A1"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#d32f2f' }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddUnit}
            variant="contained"
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            Add Unit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HospitalDashboard;