import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
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
  TextField,
  Typography,
} from '@mui/material';
import {
  Bloodtype as BloodIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  History as HistoryIcon,
  LocalHospital as HospitalIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import donorService from '../../services/donorService';
import hospitalService from '../../services/hospitalService';

const DonorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hospitalWarning, setHospitalWarning] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [donor, setDonor] = useState(null);
  const [donations, setDonations] = useState([]);
  const [approvedHospitals, setApprovedHospitals] = useState([]);
  const [donationForm, setDonationForm] = useState({
    hospitalId: '',
    quantityMl: 450,
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    setHospitalWarning('');

    try {
      const [profileResult, historyResult, hospitalsResult] = await Promise.allSettled([
        donorService.getMyProfile(),
        donorService.getDonationHistory(),
        hospitalService.getApprovedHospitals(),
      ]);

      if (profileResult.status !== 'fulfilled' || historyResult.status !== 'fulfilled') {
        throw (profileResult.reason || historyResult.reason);
      }

      setDonor(profileResult.value.data || null);
      setDonations(historyResult.value.data || []);

      if (hospitalsResult.status === 'fulfilled') {
        setApprovedHospitals(hospitalsResult.value.data || []);
      } else {
        setApprovedHospitals([]);
        setHospitalWarning('Approved hospitals are temporarily unavailable. Restart the backend to refresh the newest route set.');
      }
    } catch (loadError) {
      console.error('Failed to load donor dashboard', loadError);
      setError(loadError.error || loadError.message || 'Unable to load donor dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const eligibility = donor?.eligibility || {
    is_eligible: donor?.is_eligible ?? true,
    next_eligible_date: null,
    days_remaining: 0,
  };

  const handleRecordDonation = async () => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      await donorService.recordDonation(donationForm);
      setSuccessMessage('Donation recorded successfully. Inventory has been updated with the new blood unit.');
      setOpenDialog(false);
      setDonationForm({
        hospitalId: '',
        quantityMl: 450,
        notes: '',
      });
      await loadData();
    } catch (saveError) {
      setError(saveError.error || saveError.message || 'Unable to record donation.');
    } finally {
      setSaving(false);
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
            Donor Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real donor profile, eligibility, and donation history
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<BloodIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={!eligibility.is_eligible || approvedHospitals.length === 0}
          sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
        >
          {eligibility.is_eligible ? 'Record Donation' : `Eligible In ${eligibility.days_remaining || 0} Days`}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {hospitalWarning && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {hospitalWarning}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, height: '100%' }}>
            <Avatar sx={{ width: 84, height: 84, bgcolor: '#d32f2f', mx: 'auto', mb: 2 }}>
              <PersonIcon sx={{ fontSize: 48 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {donor?.full_name || 'Donor'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {donor?.user?.email || 'No email available'}
            </Typography>
            <Chip
              label={`Blood Type: ${donor?.blood_type || 'Unknown'}`}
              sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', fontWeight: 600, mt: 2 }}
            />
            <Box sx={{ mt: 2, textAlign: 'left' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Phone: <strong>{donor?.phone || 'Not provided'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Donations: <strong>{donor?.donation_count || 0}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last Donation: <strong>{donor?.last_donation_date || 'Never'}</strong>
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#d32f2f' }}>
              Eligibility Status
            </Typography>

            {eligibility.is_eligible ? (
              <Alert severity="success" sx={{ mb: 3, bgcolor: '#edf7ed' }}>
                You are eligible to donate now. Recording a donation here writes directly to the live system and creates a blood inventory unit.
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 3, bgcolor: '#fff4e5' }}>
                You are not eligible yet. Your next eligible date is {eligibility.next_eligible_date || 'not available'}.
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CheckIcon sx={{ color: '#2e7d32' }} />
                      <Typography variant="body2" color="text.secondary">
                        Eligibility
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {eligibility.is_eligible ? 'Eligible' : 'Waiting Period'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CalendarIcon sx={{ color: '#d32f2f' }} />
                      <Typography variant="body2" color="text.secondary">
                        Next Eligible Date
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {eligibility.next_eligible_date || 'Now'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <HistoryIcon sx={{ color: '#d32f2f' }} />
                      <Typography variant="body2" color="text.secondary">
                        Recorded Donations
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {donations.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <LocationIcon sx={{ color: '#d32f2f' }} />
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {donor?.address || 'Not provided'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#d32f2f' }}>
              Donation History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Date</TableCell>
                    <TableCell>Hospital</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Testing</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id} hover>
                      <TableCell>{donation.collection_date}</TableCell>
                      <TableCell>{donation.hospital?.hospital_name || 'Unknown hospital'}</TableCell>
                      <TableCell align="right">{donation.quantity_ml} ml</TableCell>
                      <TableCell>
                        <Chip
                          label={donation.status}
                          size="small"
                          color={donation.status === 'available' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{donation.testing_status}</TableCell>
                    </TableRow>
                  ))}
                  {donations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No donation records found yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#d32f2f' }}>
              Approved Hospitals
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These are live approved hospitals pulled from the backend approval workflow.
            </Typography>
            {approvedHospitals.slice(0, 6).map((hospital) => (
              <Box
                key={hospital.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1.5,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <HospitalIcon sx={{ color: '#d32f2f' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {hospital.hospital_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {hospital.license_number || 'No license shown'}
                  </Typography>
                </Box>
              </Box>
            ))}
            {approvedHospitals.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No approved hospitals are available yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#fff5f5', color: '#d32f2f' }}>
          Record Donation
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            This action immediately records a real donation in the system and adds inventory to the selected hospital.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Hospital"
                value={donationForm.hospitalId}
                onChange={(event) => setDonationForm({ ...donationForm, hospitalId: event.target.value })}
              >
                {approvedHospitals.map((hospital) => (
                  <MenuItem key={hospital.id} value={hospital.id}>
                    {hospital.hospital_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Quantity (ml)"
                value={donationForm.quantityMl}
                onChange={(event) => setDonationForm({ ...donationForm, quantityMl: Number(event.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Notes"
                value={donationForm.notes}
                onChange={(event) => setDonationForm({ ...donationForm, notes: event.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#d32f2f' }}>
            Cancel
          </Button>
          <Button
            onClick={handleRecordDonation}
            variant="contained"
            disabled={!donationForm.hospitalId || saving}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            {saving ? 'Saving...' : 'Save Donation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DonorDashboard;
