import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Email as EmailIcon,
  LocalHospital as HospitalIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import hospitalService from '../../services/hospitalService';

const StatCard = ({ title, value, icon }) => (
  <Card sx={{ textAlign: 'center', borderTop: '4px solid #d32f2f' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Avatar sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', width: 36, height: 36 }}>
          {icon}
        </Avatar>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const HospitalApproval = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [error, setError] = useState('');

  const loadHospitals = async () => {
    setLoading(true);
    setError('');

    try {
      const [pendingResponse, allHospitalsResponse] = await Promise.all([
        hospitalService.getPendingHospitals(),
        hospitalService.getAllHospitals(),
      ]);

      const pending = pendingResponse.data || [];
      const allHospitals = allHospitalsResponse.data || [];
      const rejectedCount = allHospitals.filter((hospital) => hospital.approval_status === 'rejected').length;
      const approvedCount = allHospitals.filter((hospital) => hospital.approval_status === 'approved').length;

      setHospitals({
        pending,
        approvedCount,
        rejectedCount,
      });
    } catch (loadError) {
      console.error('Failed to load hospital approvals', loadError);
      setError(loadError.error || loadError.message || 'Unable to load hospital approvals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const filteredHospitals = useMemo(() => {
    const pending = hospitals.pending || [];
    if (!searchTerm) {
      return pending;
    }

    const query = searchTerm.toLowerCase();
    return pending.filter((hospital) =>
      [hospital.hospital_name, hospital.license_number, hospital.address, hospital.user?.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [hospitals.pending, searchTerm]);

  const handleDecision = async (hospitalId, action) => {
    try {
      if (action === 'approve') {
        await hospitalService.approveHospital(hospitalId);
      } else {
        await hospitalService.rejectHospital(hospitalId);
      }
      setSelectedHospital(null);
      await loadHospitals();
    } catch (decisionError) {
      setError(decisionError.error || decisionError.message || `Unable to ${action} hospital.`);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Hospital Approvals
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={loadHospitals} sx={{ color: '#d32f2f' }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Pending Approvals" value={(hospitals.pending || []).length} icon={<AssignmentIcon />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Approved" value={hospitals.approvedCount || 0} icon={<CheckIcon />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Rejected" value={hospitals.rejectedCount || 0} icon={<CancelIcon />} />
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by hospital name, license number, or email..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {filteredHospitals.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No pending hospital registrations found.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredHospitals.map((hospital) => (
            <Grid item xs={12} md={6} key={hospital.id}>
              <Card sx={{ border: '2px solid #ff9800', position: 'relative', overflow: 'visible' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#d32f2f', width: 56, height: 56 }}>
                        <HospitalIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {hospital.hospital_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          License: {hospital.license_number}
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => setSelectedHospital(hospital)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon sx={{ fontSize: 16, color: '#999' }} />
                        <Typography variant="body2">{hospital.user?.email || 'No email provided'}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon sx={{ fontSize: 16, color: '#999' }} />
                        <Typography variant="body2">{hospital.phone || 'No phone provided'}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationIcon sx={{ fontSize: 16, color: '#999' }} />
                        <Typography variant="body2">{hospital.address || 'No address provided'}</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                    <Typography variant="caption" color="text.secondary">
                      Submitted: {new Date(hospital.createdAt).toLocaleDateString()}
                    </Typography>
                    <Box>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckIcon />}
                        onClick={() => handleDecision(hospital.id, 'approve')}
                        sx={{ bgcolor: '#2e7d32', mr: 1, '&:hover': { bgcolor: '#1b5e20' } }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CancelIcon />}
                        color="error"
                        onClick={() => handleDecision(hospital.id, 'reject')}
                      >
                        Reject
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={Boolean(selectedHospital)} onClose={() => setSelectedHospital(null)} maxWidth="md" fullWidth>
        {selectedHospital && (
          <>
            <DialogTitle sx={{ bgcolor: '#fff5f5', color: '#d32f2f' }}>
              Review Hospital Application
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedHospital.hospital_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedHospital.user?.email || 'No email'} | License {selectedHospital.license_number}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Phone:</strong> {selectedHospital.phone || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Capacity:</strong> {selectedHospital.capacity || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Address:</strong> {selectedHospital.address || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Latitude:</strong> {selectedHospital.latitude || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Longitude:</strong> {selectedHospital.longitude || 'Not provided'}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedHospital(null)} sx={{ color: '#d32f2f' }}>
                Close
              </Button>
              <Button color="error" onClick={() => handleDecision(selectedHospital.id, 'reject')}>
                Reject
              </Button>
              <Button
                variant="contained"
                onClick={() => handleDecision(selectedHospital.id, 'approve')}
                sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
              >
                Approve
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default HospitalApproval;
