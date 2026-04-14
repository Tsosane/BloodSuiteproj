// src/pages/Hospital/InventoryTable.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Bloodtype as BloodIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ExpiryWarning from '../../components/Common/ExpiryWarning';
import StatusBadge from '../../components/Common/StatusBadge';

const InventoryTable = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const statuses = ['available', 'reserved', 'used', 'expired'];

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [searchTerm, bloodTypeFilter, statusFilter, inventory]);

  const loadInventory = () => {
    setLoading(true);
    // Demo data with FEFO ordering
    setTimeout(() => {
      const demoInventory = [
        { id: 1, bloodType: 'O-', quantityMl: 450, collectionDate: '2024-02-20', expiryDate: '2024-04-02', status: 'available', storageLocation: 'Fridge A1', donorId: 'DON-001', testingStatus: 'passed' },
        { id: 2, bloodType: 'O-', quantityMl: 450, collectionDate: '2024-02-25', expiryDate: '2024-04-07', status: 'available', storageLocation: 'Fridge A1', donorId: 'DON-002', testingStatus: 'passed' },
        { id: 3, bloodType: 'A+', quantityMl: 450, collectionDate: '2024-03-01', expiryDate: '2024-04-12', status: 'available', storageLocation: 'Fridge B2', donorId: 'DON-003', testingStatus: 'passed' },
        { id: 4, bloodType: 'A+', quantityMl: 450, collectionDate: '2024-03-05', expiryDate: '2024-04-16', status: 'available', storageLocation: 'Fridge B2', donorId: 'DON-004', testingStatus: 'passed' },
        { id: 5, bloodType: 'B+', quantityMl: 450, collectionDate: '2024-02-28', expiryDate: '2024-04-10', status: 'reserved', storageLocation: 'Fridge C3', donorId: 'DON-005', testingStatus: 'passed' },
        { id: 6, bloodType: 'O+', quantityMl: 450, collectionDate: '2024-03-10', expiryDate: '2024-04-21', status: 'available', storageLocation: 'Fridge A2', donorId: 'DON-006', testingStatus: 'passed' },
        { id: 7, bloodType: 'AB+', quantityMl: 450, collectionDate: '2024-03-15', expiryDate: '2024-04-26', status: 'available', storageLocation: 'Fridge D1', donorId: 'DON-007', testingStatus: 'pending' },
        { id: 8, bloodType: 'O-', quantityMl: 450, collectionDate: '2024-03-18', expiryDate: '2024-04-29', status: 'available', storageLocation: 'Fridge A1', donorId: 'DON-008', testingStatus: 'passed' },
        { id: 9, bloodType: 'A-', quantityMl: 450, collectionDate: '2024-03-20', expiryDate: '2024-05-01', status: 'available', storageLocation: 'Fridge E1', donorId: 'DON-009', testingStatus: 'passed' },
        { id: 10, bloodType: 'O+', quantityMl: 900, collectionDate: '2024-03-22', expiryDate: '2024-05-03', status: 'available', storageLocation: 'Fridge A2', donorId: 'DON-010', testingStatus: 'passed' },
      ].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)); // FEFO ordering
      
      setInventory(demoInventory);
      setFilteredInventory(demoInventory);
      setLoading(false);
    }, 500);
  };

  const filterInventory = () => {
    let filtered = [...inventory];
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.bloodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storageLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.donorId && item.donorId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (bloodTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.bloodType === bloodTypeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    // Maintain FEFO ordering
    filtered.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    setFilteredInventory(filtered);
  };

  const handleDeleteUnit = (id) => {
    if (window.confirm('Are you sure you want to remove this blood unit?')) {
      setInventory(inventory.filter(item => item.id !== id));
      setSnackbar({ open: true, message: 'Blood unit removed', severity: 'info' });
    }
  };

  const handleViewDetails = (unit) => {
    setSelectedUnit(unit);
    setOpenDialog(true);
  };

  const getExpiryStatusColor = (expiryDate) => {
    const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 3) return '#f44336';
    if (daysLeft < 7) return '#ff9800';
    return '#4caf50';
  };

  const getTestingStatusChip = (status) => {
    switch(status) {
      case 'passed':
        return <Chip label="Passed" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />;
      case 'pending':
        return <Chip label="Pending" size="small" sx={{ bgcolor: '#fff3e0', color: '#ed6c02' }} />;
      case 'failed':
        return <Chip label="Failed" size="small" sx={{ bgcolor: '#ffebee', color: '#c62828' }} />;
      default:
        return null;
    }
  };

  const stats = {
    total: inventory.length,
    available: inventory.filter(i => i.status === 'available').length,
    reserved: inventory.filter(i => i.status === 'reserved').length,
    expiringSoon: inventory.filter(i => {
      const daysLeft = Math.ceil((new Date(i.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 7 && daysLeft > 0 && i.status === 'available';
    }).length,
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Blood Inventory
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/inventory/add')}
          sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
        >
          Add Blood Unit
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderTop: '4px solid #d32f2f' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.total}</Typography>
            <Typography variant="body2" color="text.secondary">Total Units</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderTop: '4px solid #4caf50' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>{stats.available}</Typography>
            <Typography variant="body2" color="text.secondary">Available</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderTop: '4px solid #ff9800' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>{stats.reserved}</Typography>
            <Typography variant="body2" color="text.secondary">Reserved</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderTop: '4px solid #f44336' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>{stats.expiringSoon}</Typography>
            <Typography variant="body2" color="text.secondary">Expiring Soon</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Alert for expiring units */}
      {stats.expiringSoon > 0 && (
        <Alert severity="warning" sx={{ mb: 3, bgcolor: '#fff3e0' }}>
          <Typography variant="body2">
            {stats.expiringSoon} unit(s) are expiring within 7 days. Please prioritize their use.
          </Typography>
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by blood type, location, or donor ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Blood Type</InputLabel>
              <Select
                value={bloodTypeFilter}
                onChange={(e) => setBloodTypeFilter(e.target.value)}
                label="Blood Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                {bloodTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadInventory}
              sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Inventory Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'auto' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Blood Type</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Collection Date</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Testing</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress sx={{ color: '#d32f2f' }} />
                  </TableCell>
                </TableRow>
              ) : filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No blood units found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => (
                  <TableRow 
                    key={item.id} 
                    hover
                    sx={{
                      bgcolor: getExpiryStatusColor(item.expiryDate) === '#f44336' ? '#ffebee' :
                               getExpiryStatusColor(item.expiryDate) === '#ff9800' ? '#fff3e0' : 'inherit',
                    }}
                  >
                    <TableCell>
                      <Chip 
                        label={item.bloodType} 
                        size="small" 
                        sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', fontWeight: 600 }} 
                      />
                    </TableCell>
                    <TableCell align="right">{item.quantityMl} ml</TableCell>
                    <TableCell>{item.collectionDate}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {item.expiryDate}
                        <ExpiryWarning expiryDate={item.expiryDate} showLabel={false} />
                      </Box>
                    </TableCell>
                    <TableCell>{item.storageLocation}</TableCell>
                    <TableCell>{getTestingStatusChip(item.testingStatus)}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} type="bloodUnit" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewDetails(item)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {item.status === 'available' && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteUnit(item.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        {selectedUnit && (
          <>
            <DialogTitle sx={{ bgcolor: '#fff5f5', color: '#d32f2f' }}>
              Blood Unit Details
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} display="flex" justifyContent="center">
                  <Avatar sx={{ bgcolor: '#d32f2f', width: 80, height: 80 }}>
                    <BloodIcon sx={{ fontSize: 48 }} />
                  </Avatar>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Blood Type</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedUnit.bloodType}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Quantity</Typography>
                  <Typography variant="body1">{selectedUnit.quantityMl} ml</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Collection Date</Typography>
                  <Typography variant="body1">{selectedUnit.collectionDate}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Expiry Date</Typography>
                  <Typography variant="body1">{selectedUnit.expiryDate}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Storage Location</Typography>
                  <Typography variant="body1">{selectedUnit.storageLocation}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Donor ID</Typography>
                  <Typography variant="body1">{selectedUnit.donorId || 'Not recorded'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Testing Status</Typography>
                  <Box mt={0.5}>{getTestingStatusChip(selectedUnit.testingStatus)}</Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Current Status</Typography>
                  <Box mt={0.5}><StatusBadge status={selectedUnit.status} type="bloodUnit" /></Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} sx={{ color: '#d32f2f' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default InventoryTable;