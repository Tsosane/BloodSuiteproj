// src/pages/Donor/DonorDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  LinearProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Person as PersonIcon,
  Bloodtype as BloodIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  LocalHospital as HospitalIcon,
  LocationOn as LocationIcon,
  NotificationsActive as AlertIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

const DonorDashboard = () => {
  const [donor, setDonor] = useState({
    name: 'John Doe',
    bloodType: 'O+',
    lastDonation: '2024-02-15',
    isEligible: true,
    nextEligibleDate: null,
    totalDonations: 8,
    phone: '+266 1234 5678',
    email: 'john.doe@email.com',
    address: 'Maseru, Lesotho',
    latitude: '-29.3167',
    longitude: '27.4833',
  });

  const [donations, setDonations] = useState([
    { id: 1, date: '2024-02-15', hospital: 'Queen Elizabeth II Hospital', quantity: 450, status: 'completed' },
    { id: 2, date: '2023-12-20', hospital: 'Scott Hospital', quantity: 450, status: 'completed' },
    { id: 3, date: '2023-10-25', hospital: 'Maseru Private Hospital', quantity: 450, status: 'completed' },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const hospitals = [
    { id: 1, name: 'Queen Elizabeth II Hospital', code: 'LS-BB-001', location: 'Maseru', distance: 2.5 },
    { id: 2, name: 'Scott Hospital', code: 'LS-BB-002', location: 'Maseru', distance: 5.8 },
    { id: 3, name: 'Maseru Private Hospital', code: 'LS-BB-003', location: 'Maseru', distance: 3.2 },
  ];

  useEffect(() => {
    calculateEligibility();
  }, []);

  const calculateEligibility = () => {
    if (!donor.lastDonation) {
      setDonor(prev => ({ ...prev, isEligible: true, nextEligibleDate: null }));
      return;
    }

    const lastDonationDate = new Date(donor.lastDonation);
    const today = new Date();
    const daysSinceDonation = Math.floor((today - lastDonationDate) / (1000 * 60 * 60 * 24));

    if (daysSinceDonation >= 56) {
      setDonor(prev => ({ ...prev, isEligible: true, nextEligibleDate: null }));
    } else {
      const nextDate = new Date(lastDonationDate);
      nextDate.setDate(lastDonationDate.getDate() + 56);
      setDonor(prev => ({ ...prev, isEligible: false, nextEligibleDate: nextDate.toISOString().split('T')[0] }));
    }
  };

  const handleScheduleDonation = () => {
    setOpenDialog(true);
  };

  const handleConfirmDonation = () => {
    const newDonation = {
      id: donations.length + 1,
      date: new Date().toISOString().split('T')[0],
      hospital: selectedHospital.name,
      quantity: 450,
      status: 'scheduled',
    };
    setDonations([newDonation, ...donations]);
    setOpenDialog(false);
    setSelectedHospital(null);
    setActiveStep(0);
  };

  const getDaysUntilEligible = () => {
    if (!donor.nextEligibleDate) return 0;
    const next = new Date(donor.nextEligibleDate);
    const today = new Date();
    return Math.ceil((next - today) / (1000 * 60 * 60 * 24));
  };

  const steps = ['Select Hospital', 'Confirm Details', 'Schedule'];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Donor Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<ScheduleIcon />}
          onClick={handleScheduleDonation}
          disabled={!donor.isEligible}
          sx={{
            bgcolor: donor.isEligible ? '#d32f2f' : '#9e9e9e',
            '&:hover': { bgcolor: donor.isEligible ? '#b71c1c' : '#9e9e9e' },
          }}
        >
          {donor.isEligible ? 'Schedule Donation' : `Eligible in ${getDaysUntilEligible()} days`}
        </Button>
      </Box>

      {/* Profile Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#d32f2f', mx: 'auto', mb: 2 }}>
              <PersonIcon sx={{ fontSize: 48 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {donor.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {donor.email}
            </Typography>
            <Chip
              label={`Blood Type: ${donor.bloodType}`}
              sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', fontWeight: 600, mt: 1 }}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Donations: <strong>{donor.totalDonations}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last Donation: <strong>{donor.lastDonation || 'Never'}</strong>
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
              Eligibility Status
            </Typography>
            
            {donor.isEligible ? (
              <Alert severity="success" sx={{ mb: 2, bgcolor: '#e8f5e9' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  You are eligible to donate blood!
                </Typography>
                <Typography variant="body2">
                  Your last donation was {donor.lastDonation ? `on ${donor.lastDonation}` : 'never'}. 
                  You can save up to 3 lives with one donation.
                </Typography>
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 2, bgcolor: '#fff3e0' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  You are not yet eligible to donate
                </Typography>
                <Typography variant="body2">
                  You last donated on {donor.lastDonation}. 
                  You will be eligible again on {donor.nextEligibleDate} ({getDaysUntilEligible()} days remaining).
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(56 - getDaysUntilEligible()) / 56 * 100}
                  sx={{ mt: 1, height: 8, borderRadius: 4, bgcolor: '#ffe0e0', '& .MuiLinearProgress-bar': { bgcolor: '#d32f2f' } }}
                />
              </Alert>
            )}

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <HistoryIcon sx={{ color: '#d32f2f' }} />
                  <Typography variant="body2">
                    Donations: <strong>{donor.totalDonations}</strong>
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <BloodIcon sx={{ color: '#d32f2f' }} />
                  <Typography variant="body2">
                    Blood Type: <strong>{donor.bloodType}</strong>
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon sx={{ color: '#d32f2f' }} />
                  <Typography variant="body2">
                    Location: <strong>{donor.address}</strong>
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarIcon sx={{ color: '#d32f2f' }} />
                  <Typography variant="body2">
                    Next Eligible: <strong>{donor.nextEligibleDate || 'Now'}</strong>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Donation History */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Donation History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Date</TableCell>
                <TableCell>Hospital</TableCell>
                <TableCell align="right">Quantity (ml)</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation.id} hover>
                  <TableCell>{donation.date}</TableCell>
                  <TableCell>{donation.hospital}</TableCell>
                  <TableCell align="right">{donation.quantity}ml</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={donation.status}
                      size="small"
                      sx={{
                        bgcolor: donation.status === 'completed' ? '#e8f5e9' : '#fff3e0',
                        color: donation.status === 'completed' ? '#2e7d32' : '#ed6c02',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Nearby Hospitals */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Nearby Hospitals
        </Typography>
        <Grid container spacing={2}>
          {hospitals.map((hospital) => (
            <Grid item xs={12} md={4} key={hospital.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                  border: '1px solid #e0e0e0',
                }}
                onClick={() => {
                  if (donor.isEligible) {
                    setSelectedHospital(hospital);
                    setOpenDialog(true);
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Avatar sx={{ bgcolor: '#d32f2f' }}>
                      <HospitalIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {hospital.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {hospital.code}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                    <LocationIcon sx={{ fontSize: 14 }} />
                    {hospital.location} • {hospital.distance} km away
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Schedule Donation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#fff5f5', color: '#d32f2f' }}>
          Schedule Blood Donation
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ my: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && selectedHospital && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedHospital.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Code: {selectedHospital.code} | Location: {selectedHospital.location} | Distance: {selectedHospital.distance} km
              </Typography>
              <Alert severity="info" sx={{ mt: 2, bgcolor: '#fff5f5' }}>
                Please bring a valid ID and eat well before donating.
              </Alert>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Donor Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">Name: <strong>{donor.name}</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Blood Type: <strong>{donor.bloodType}</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Phone: <strong>{donor.phone}</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Email: <strong>{donor.email}</strong></Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Donation Scheduled!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You have scheduled a donation at {selectedHospital?.name}.
                Please arrive on time and bring your ID.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#d32f2f' }}>
            Cancel
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={() => setActiveStep(activeStep + 1)}
              sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleConfirmDonation}
              sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
            >
              Confirm
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DonorDashboard;