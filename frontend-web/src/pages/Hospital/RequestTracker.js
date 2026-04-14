// src/pages/Hospital/RequestTracker.js
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  LocalHospital as HospitalIcon,
  Bloodtype as BloodIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RequestTracker = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    // Demo requests
    const demoRequests = [
      { 
        id: 1, 
        requestId: 'REQ-001', 
        bloodType: 'O-', 
        quantityMl: 450, 
        urgency: 'emergency', 
        status: 'pending',
        patientName: 'John Doe',
        requiredDate: '2024-03-27',
        createdAt: '2024-03-26T10:30:00',
        hospital: 'Queen Elizabeth II Hospital',
      },
      { 
        id: 2, 
        requestId: 'REQ-002', 
        bloodType: 'A+', 
        quantityMl: 900, 
        urgency: 'urgent', 
        status: 'processing',
        patientName: 'Jane Smith',
        requiredDate: '2024-03-28',
        createdAt: '2024-03-25T14:15:00',
        hospital: 'Queen Elizabeth II Hospital',
      },
      { 
        id: 3, 
        requestId: 'REQ-003', 
        bloodType: 'B+', 
        quantityMl: 450, 
        urgency: 'routine', 
        status: 'fulfilled',
        patientName: 'Bob Johnson',
        requiredDate: '2024-03-29',
        createdAt: '2024-03-24T09:00:00',
        hospital: 'Queen Elizabeth II Hospital',
      },
      { 
        id: 4, 
        requestId: 'REQ-004', 
        bloodType: 'O+', 
        quantityMl: 1350, 
        urgency: 'urgent', 
        status: 'cancelled',
        patientName: 'Mary Williams',
        requiredDate: '2024-03-26',
        createdAt: '2024-03-23T11:45:00',
        hospital: 'Queen Elizabeth II Hospital',
      },
    ];
    setRequests(demoRequests);
    setFilteredRequests(demoRequests);
  };

  useEffect(() => {
    let filtered = requests;
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.requestId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(r => r.urgency === urgencyFilter);
    }
    
    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, urgencyFilter, requests]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return { bg: '#fff3e0', color: '#ed6c02', icon: <PendingIcon /> };
      case 'processing': return { bg: '#e3f2fd', color: '#1976d2', icon: <ScheduleIcon /> };
      case 'fulfilled': return { bg: '#e8f5e9', color: '#2e7d32', icon: <CheckIcon /> };
      case 'cancelled': return { bg: '#ffebee', color: '#c62828', icon: <CancelIcon /> };
      default: return { bg: '#f5f5f5', color: '#9e9e9e', icon: <PendingIcon /> };
    }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'emergency': return '#f44336';
      case 'urgent': return '#ff9800';
      default: return '#2196f3';
    }
  };

  const getStatusSteps = (status) => {
    const steps = ['Pending', 'Processing', 'Fulfilled'];
    let currentStep = 0;
    if (status === 'processing') currentStep = 1;
    if (status === 'fulfilled') currentStep = 2;
    if (status === 'cancelled') return null;
    return { steps, currentStep };
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    fulfilled: requests.filter(r => r.status === 'fulfilled').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
    urgent: requests.filter(r => r.urgency === 'urgent' || r.urgency === 'emergency').length,
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Blood Request Tracker
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={loadRequests}
          sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ textAlign: 'center', borderTop: '4px solid #d32f2f' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.total}</Typography>
              <Typography variant="caption" color="text.secondary">Total Requests</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ textAlign: 'center', borderTop: '4px solid #ed6c02' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ed6c02' }}>{stats.pending}</Typography>
              <Typography variant="caption" color="text.secondary">Pending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ textAlign: 'center', borderTop: '4px solid #1976d2' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>{stats.processing}</Typography>
              <Typography variant="caption" color="text.secondary">Processing</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ textAlign: 'center', borderTop: '4px solid #2e7d32' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>{stats.fulfilled}</Typography>
              <Typography variant="caption" color="text.secondary">Fulfilled</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ textAlign: 'center', borderTop: '4px solid #c62828' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#c62828' }}>{stats.cancelled}</Typography>
              <Typography variant="caption" color="text.secondary">Cancelled</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ textAlign: 'center', borderTop: '4px solid #f44336' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>{stats.urgent}</Typography>
              <Typography variant="caption" color="text.secondary">Urgent/Emergency</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by patient name or request ID..."
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
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="fulfilled">Fulfilled</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Urgency</InputLabel>
              <Select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                label="Urgency"
              >
                <MenuItem value="all">All Urgency</MenuItem>
                <MenuItem value="routine">Routine</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Requests Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Request ID</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Blood Type</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Urgency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Required By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.map((request) => {
                const statusInfo = getStatusColor(request.status);
                return (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {request.requestId}
                      </Typography>
                    </TableCell>
                    <TableCell>{request.patientName}</TableCell>
                    <TableCell>
                      <Chip label={request.bloodType} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f' }} />
                    </TableCell>
                    <TableCell>{request.quantityMl} ml</TableCell>
                    <TableCell>
                      <Chip
                        label={request.urgency.toUpperCase()}
                        size="small"
                        sx={{ bgcolor: `${getUrgencyColor(request.urgency)}20`, color: getUrgencyColor(request.urgency) }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusInfo.icon}
                        label={request.status.toUpperCase()}
                        size="small"
                        sx={{ bgcolor: statusInfo.bg, color: statusInfo.color }}
                      />
                    </TableCell>
                    <TableCell>{request.requiredDate}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewDetails(request)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {filteredRequests.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No requests found
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Request Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedRequest && (
          <>
            <DialogTitle sx={{ bgcolor: '#fff5f5', color: '#d32f2f' }}>
              Request Details - {selectedRequest.requestId}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Patient Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedRequest.patientName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Blood Type Required</Typography>
                  <Chip label={selectedRequest.bloodType} sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', mt: 0.5 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
                  <Typography>{selectedRequest.quantityMl} ml</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Urgency</Typography>
                  <Chip
                    label={selectedRequest.urgency.toUpperCase()}
                    size="small"
                    sx={{ bgcolor: `${getUrgencyColor(selectedRequest.urgency)}20`, color: getUrgencyColor(selectedRequest.urgency) }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Required By</Typography>
                  <Typography>{selectedRequest.requiredDate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Submitted On</Typography>
                  <Typography>{new Date(selectedRequest.createdAt).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    icon={getStatusColor(selectedRequest.status).icon}
                    label={selectedRequest.status.toUpperCase()}
                    sx={{ bgcolor: getStatusColor(selectedRequest.status).bg, color: getStatusColor(selectedRequest.status).color, mt: 0.5 }}
                  />
                </Grid>
                
                {getStatusSteps(selectedRequest.status) && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Progress</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={getStatusSteps(selectedRequest.status).currentStep / 2 * 100}
                      sx={{ height: 8, borderRadius: 4, bgcolor: '#ffe0e0', '& .MuiLinearProgress-bar': { bgcolor: '#d32f2f' } }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      {getStatusSteps(selectedRequest.status).steps.map((step, idx) => (
                        <Typography key={step} variant="caption" color={idx <= getStatusSteps(selectedRequest.status).currentStep ? '#d32f2f' : 'text.secondary'}>
                          {step}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                )}
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
    </Box>
  );
};

export default RequestTracker;