import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Bloodtype as BloodIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import hospitalService from '../../services/hospitalService';
import inventoryService from '../../services/inventoryService';
import requestService from '../../services/requestService';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const StatCard = ({ title, value, color }) => (
  <Card sx={{ borderTop: `4px solid ${color}` }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const HospitalDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hospital, setHospital] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUnit, setNewUnit] = useState({
    blood_type: '',
    quantity_ml: 450,
    collection_date: '',
    expiry_date: '',
    storage_location: '',
    testing_status: 'passed',
  });

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [hospitalResponse, inventoryResponse, requestsResponse] = await Promise.all([
        hospitalService.getMyHospital(),
        inventoryService.getAllInventory(),
        requestService.getAllRequests(),
      ]);

      setHospital(hospitalResponse.data || null);
      setInventory(inventoryResponse.data || []);
      setRequests(requestsResponse.data || []);
    } catch (loadError) {
      console.error('Failed to load hospital dashboard', loadError);
      setError(loadError.error || loadError.message || 'Unable to load hospital dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const expiringUnits = useMemo(() => {
    const today = new Date();
    return inventory.filter((item) => {
      const expiry = new Date(item.expiry_date);
      const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      return item.status === 'available' && days <= 7;
    });
  }, [inventory]);

  const inventoryByType = useMemo(() => (
    bloodTypes.map((type) => ({
      bloodType: type,
      available: inventory.filter((item) => item.blood_type === type && item.status === 'available').length,
      expiring: expiringUnits.filter((item) => item.blood_type === type).length,
    }))
  ), [expiringUnits, inventory]);

  const handleAddUnit = async () => {
    if (!hospital?.id) {
      setError('Hospital profile is not available yet.');
      return;
    }

    try {
      await inventoryService.addBloodUnit({
        hospital_id: hospital.id,
        ...newUnit,
      });
      setOpenDialog(false);
      setNewUnit({
        blood_type: '',
        quantity_ml: 450,
        collection_date: '',
        expiry_date: '',
        storage_location: '',
        testing_status: 'passed',
      });
      await loadData();
    } catch (saveError) {
      setError(saveError.error || saveError.message || 'Unable to add blood unit.');
    }
  };

  const handleDeleteUnit = async (id) => {
    try {
      await inventoryService.deleteBloodUnit(id);
      await loadData();
    } catch (deleteError) {
      setError(deleteError.error || deleteError.message || 'Unable to remove blood unit.');
    }
  };

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
            Hospital Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hospital?.hospital_name || 'Hospital account'}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            Add Blood Unit
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {expiringUnits.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3, bgcolor: '#fff5f5' }}>
          {expiringUnits.length} unit(s) are expiring within 7 days. Prioritize their use.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Blood Units" value={inventory.length} color="#d32f2f" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Requests" value={requests.filter((item) => item.status === 'pending').length} color="#ff9800" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Available Units" value={inventory.filter((item) => item.status === 'available').length} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Expiring Soon" value={expiringUnits.length} color="#1976d2" />
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
          <Tab label="Blood Inventory" />
          <Tab label="Blood Requests" />
          <Tab label="Quick Stats" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Blood Type</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Collection</TableCell>
                    <TableCell>Expiry</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Chip label={item.blood_type} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f' }} />
                      </TableCell>
                      <TableCell>{item.quantity_ml} ml</TableCell>
                      <TableCell>{item.collection_date}</TableCell>
                      <TableCell>{item.expiry_date}</TableCell>
                      <TableCell>{item.storage_location || 'Unspecified'}</TableCell>
                      <TableCell>
                        <Chip label={item.status} size="small" color={item.status === 'available' ? 'success' : 'warning'} />
                      </TableCell>
                      <TableCell align="right">
                        <Button color="error" size="small" onClick={() => handleDeleteUnit(item.id)}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {inventory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No inventory records found.
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
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Blood Type</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Urgency</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Required By</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Chip label={request.blood_type} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f' }} />
                      </TableCell>
                      <TableCell>{request.quantity_ml} ml</TableCell>
                      <TableCell>
                        <Chip
                          label={request.urgency}
                          size="small"
                          color={request.urgency === 'emergency' ? 'error' : request.urgency === 'urgent' ? 'warning' : 'info'}
                        />
                      </TableCell>
                      <TableCell>{request.patient_name || 'Not provided'}</TableCell>
                      <TableCell>{request.required_date || 'Not set'}</TableCell>
                      <TableCell>
                        <Chip label={request.status} size="small" color={request.status === 'fulfilled' ? 'success' : request.status === 'pending' ? 'warning' : 'info'} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {requests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No request records found.
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
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Inventory by Blood Type
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Blood Type</TableCell>
                        <TableCell align="right">Available Units</TableCell>
                        <TableCell align="right">Expiring Soon</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inventoryByType.map((item) => (
                        <TableRow key={item.bloodType}>
                          <TableCell>{item.bloodType}</TableCell>
                          <TableCell align="right">{item.available}</TableCell>
                          <TableCell align="right">{item.expiring}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  Recent Activity
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {requests.slice(0, 5).map((request) => (
                    <Box key={request.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, borderBottom: '1px solid #f0f0f0' }}>
                      {request.urgency === 'emergency' ? <WarningIcon sx={{ color: '#f44336' }} /> : <ScheduleIcon sx={{ color: '#d32f2f' }} />}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {request.blood_type} - {request.quantity_ml} ml
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.patient_name || 'Unnamed patient'} • {request.status} • {new Date(request.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  {requests.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No recent request activity.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

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
                value={newUnit.blood_type}
                onChange={(event) => setNewUnit({ ...newUnit, blood_type: event.target.value })}
              >
                {bloodTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity (ml)"
                type="number"
                value={newUnit.quantity_ml}
                onChange={(event) => setNewUnit({ ...newUnit, quantity_ml: Number(event.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Collection Date"
                type="date"
                value={newUnit.collection_date}
                onChange={(event) => setNewUnit({ ...newUnit, collection_date: event.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={newUnit.expiry_date}
                onChange={(event) => setNewUnit({ ...newUnit, expiry_date: event.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Storage Location"
                value={newUnit.storage_location}
                onChange={(event) => setNewUnit({ ...newUnit, storage_location: event.target.value })}
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
            startIcon={<BloodIcon />}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            Add Unit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HospitalDashboard;
