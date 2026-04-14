// src/pages/Admin/HospitalApproval.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

const HospitalApproval = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  useEffect(() => {
    loadHospitals();
  }, []);

  useEffect(() => {
    filterHospitals();
  }, [searchTerm, hospitals]);

  const loadHospitals = () => {
    setLoading(true);
    // Demo data - replace with API call
    setTimeout(() => {
      const demoHospitals = [
        {
          id: 1,
          name: 'Maseru Private Hospital',
          code: 'LS-BB-003',
          location: 'Maseru',
          address: '123 Main Street, Maseru',
          phone: '+266 2233 4455',
          email: 'admin@maseruprivate.co.ls',
          licenseNumber: 'HOS-2024-001',
          status: 'pending',
          submittedAt: '2024-03-25',
          capacity: 150,
          facilities: ['ICU', 'Emergency', 'Blood Bank', 'Surgery'],
          contactPerson: 'Dr. Michael Brown',
          contactPhone: '+266 1234 5678',
          documents: ['license.pdf', 'certificate.pdf'],
        },
        {
          id: 2,
          name: 'Butha-Buthe District Hospital',
          code: 'LS-BB-005',
          location: 'Butha-Buthe',
          address: '45 Hospital Road, Butha-Buthe',
          phone: '+266 3344 5566',
          email: 'admin@bbdh.org.ls',
          licenseNumber: 'HOS-2024-002',
          status: 'pending',
          submittedAt: '2024-03-28',
          capacity: 80,
          facilities: ['Emergency', 'Blood Bank', 'Maternity'],
          contactPerson: 'Dr. Sarah Johnson',
          contactPhone: '+266 2345 6789',
          documents: ['license.pdf'],
        },
        {
          id: 3,
          name: 'Mokhotlong Hospital',
          code: 'LS-BB-004',
          location: 'Mokhotlong',
          address: '12 Church Street, Mokhotlong',
          phone: '+266 4455 6677',
          email: 'admin@mokhotlong.org.ls',
          licenseNumber: 'HOS-2024-003',
          status: 'pending',
          submittedAt: '2024-03-26',
          capacity: 60,
          facilities: ['Emergency', 'Outpatient'],
          contactPerson: 'Dr. Peter Lesotho',
          contactPhone: '+266 3456 7890',
          documents: ['license.pdf', 'registration.pdf'],
        },
      ];
      setHospitals(demoHospitals);
      setFilteredHospitals(demoHospitals);
      setLoading(false);
    }, 500);
  };

  const filterHospitals = () => {
    let filtered = [...hospitals];
    if (searchTerm) {
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredHospitals(filtered);
  };

  const handleApprove = (hospital) => {
    setSelectedHospital(hospital);
    setApprovalNote('');
    setOpenDialog(true);
  };

  const handleConfirmApprove = () => {
    setHospitals(hospitals.map(h =>
      h.id === selectedHospital.id
        ? { ...h, status: 'approved', approvedAt: new Date().toISOString().split('T')[0], approvalNote }
        : h
    ));
    setOpenDialog(false);
  };

  const handleReject = (hospital) => {
    if (window.confirm(`Are you sure you want to reject ${hospital.name}?`)) {
      setHospitals(hospitals.map(h =>
        h.id === hospital.id
          ? { ...h, status: 'rejected', rejectedAt: new Date().toISOString().split('T')[0] }
          : h
      ));
    }
  };

  const handleViewDetails = (hospital) => {
    setSelectedHospital(hospital);
    setOpenDialog(true);
  };

  const StatCard = ({ title, value, icon }) => (
    <Card sx={{ textAlign: 'center', borderTop: '4px solid #d32f2f' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Avatar sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', width: 36, height: 36 }}>{icon}</Avatar>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{value}</Typography>
      </CardContent>
    </Card>
  );

  const pendingCount = hospitals.filter(h => h.status === 'pending').length;
  const approvedCount = hospitals.filter(h => h.status === 'approved').length;
  const rejectedCount = hospitals.filter(h => h.status === 'rejected').length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Hospital Approvals
        </Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={loadHospitals} sx={{ color: '#d32f2f' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export">
            <IconButton sx={{ color: '#d32f2f' }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Pending Approvals" value={pendingCount} icon={<AssignmentIcon />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Approved" value={approvedCount} icon={<CheckIcon />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Rejected" value={rejectedCount} icon={<CancelIcon />} />
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by hospital name, code, or location..."
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
      </Paper>

      {/* Hospital Cards */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress sx={{ color: '#d32f2f' }} />
        </Box>
      ) : filteredHospitals.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">No pending hospital registrations</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredHospitals.map((hospital) => (
            <Grid item xs={12} md={6} key={hospital.id}>
              <Card
                sx={{
                  border: hospital.status === 'pending' ? '2px solid #ff9800' : '1px solid #e0e0e0',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                {hospital.status === 'pending' && (
                  <Chip
                    label="Pending Approval"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      right: 16,
                      bgcolor: '#ff9800',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                )}
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: '#d32f2f', width: 56, height: 56 }}>
                        <HospitalIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {hospital.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Code: {hospital.code} | Location: {hospital.location}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewDetails(hospital)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon sx={{ fontSize: 16, color: '#999' }} />
                        <Typography variant="body2">{hospital.email}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon sx={{ fontSize: 16, color: '#999' }} />
                        <Typography variant="body2">{hospital.phone}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationIcon sx={{ fontSize: 16, color: '#999' }} />
                        <Typography variant="body2">{hospital.address}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BusinessIcon sx={{ fontSize: 16, color: '#999' }} />
                        <Typography variant="body2">License: {hospital.licenseNumber}</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Submitted: {hospital.submittedAt}
                    </Typography>
                    {hospital.status === 'pending' && (
                      <Box>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CheckIcon />}
                          onClick={() => handleApprove(hospital)}
                          sx={{ bgcolor: '#2e7d32', mr: 1, '&:hover': { bgcolor: '#1b5e20' } }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CancelIcon />}
                          color="error"
                          onClick={() => handleReject(hospital)}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                    {hospital.status === 'approved' && (
                      <Chip label="Approved" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                    )}
                    {hospital.status === 'rejected' && (
                      <Chip label="Rejected" size="small" sx={{ bgcolor: '#ffebee', color: '#c62828' }} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* View/Approve Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedHospital && (
          <>
            <DialogTitle sx={{ bgcolor: '#fff5f5', color: '#d32f2f' }}>
              {selectedHospital.status === 'pending' ? 'Review Hospital Application' : 'Hospital Details'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: '#d32f2f', width: 64, height: 64 }}>
                    <HospitalIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {selectedHospital.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Code: {selectedHospital.code} | Location: {selectedHospital.location}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1, color: '#d32f2f' }}>
                    Contact Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Email:</strong> {selectedHospital.email}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Phone:</strong> {selectedHospital.phone}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="body2"><strong>Address:</strong> {selectedHospital.address}</Typography></Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#d32f2f' }}>
                    Registration Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><Typography variant="body2"><strong>License Number:</strong> {selectedHospital.licenseNumber}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Submitted:</strong> {selectedHospital.submittedAt}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Capacity:</strong> {selectedHospital.capacity} beds</Typography></Grid>
                    <Grid item xs={12}><Typography variant="body2"><strong>Facilities:</strong> {selectedHospital.facilities?.join(', ')}</Typography></Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#d32f2f' }}>
                    Contact Person
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Name:</strong> {selectedHospital.contactPerson}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Phone:</strong> {selectedHospital.contactPhone}</Typography></Grid>
                  </Grid>
                </Grid>

                {selectedHospital.status === 'pending' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Approval Notes (Optional)"
                      multiline
                      rows={3}
                      value={approvalNote}
                      onChange={(e) => setApprovalNote(e.target.value)}
                      placeholder="Add any notes about this approval..."
                    />
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} sx={{ color: '#d32f2f' }}>
                Close
              </Button>
              {selectedHospital.status === 'pending' && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      handleReject(selectedHospital);
                      setOpenDialog(false);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleConfirmApprove}
                    sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
                  >
                    Approve Hospital
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default HospitalApproval;