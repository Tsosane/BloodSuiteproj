// src/pages/Donor/ScheduleDonation.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  Bloodtype as BloodIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Info as InfoIcon,
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ScheduleDonation = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [appointment, setAppointment] = useState({
    hospitalId: '',
    hospitalName: '',
    hospitalLocation: '',
    hospitalPhone: '',
    date: null,
    time: null,
    preferredTime: 'morning',
    notes: '',
  });
  const [donorInfo, setDonorInfo] = useState({
    name: 'John Doe',
    bloodType: 'O+',
    phone: '+266 1234 5678',
    email: 'john.doe@email.com',
    lastDonation: '2024-02-15',
    isEligible: true,
    nextEligibleDate: null,
  });

  const hospitals = [
    { 
      id: 1, 
      name: 'Queen Elizabeth II Hospital', 
      code: 'LS-BB-001', 
      location: 'Maseru', 
      address: '123 Main Street, Maseru',
      phone: '+266 2233 4455',
      email: 'bloodbank@qeh.org.ls',
      operatingHours: '8:00 AM - 4:00 PM',
      distance: 2.5,
      availableSlots: [8, 9, 10, 11, 13, 14, 15],
    },
    { 
      id: 2, 
      name: 'Scott Hospital', 
      code: 'LS-BB-002', 
      location: 'Maseru', 
      address: '45 Hospital Road, Maseru',
      phone: '+266 3344 5566',
      email: 'bloodbank@scott.org.ls',
      operatingHours: '8:30 AM - 3:30 PM',
      distance: 5.8,
      availableSlots: [8, 9, 10, 14, 15],
    },
    { 
      id: 3, 
      name: 'Maseru Private Hospital', 
      code: 'LS-BB-003', 
      location: 'Maseru', 
      address: '78 Kingsway, Maseru',
      phone: '+266 4455 6677',
      email: 'bloodbank@maseruprivate.co.ls',
      operatingHours: '9:00 AM - 5:00 PM',
      distance: 3.2,
      availableSlots: [9, 10, 11, 14, 15, 16],
    },
    { 
      id: 4, 
      name: 'Mokhotlong Hospital', 
      code: 'LS-BB-004', 
      location: 'Mokhotlong', 
      address: '12 Church Street, Mokhotlong',
      phone: '+266 5566 7788',
      email: 'bloodbank@mokhotlong.org.ls',
      operatingHours: '8:00 AM - 3:00 PM',
      distance: 120,
      availableSlots: [8, 9, 10, 13, 14],
    },
  ];

  const timeSlots = {
    morning: [
      { time: '08:00', available: true },
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: true },
    ],
    afternoon: [
      { time: '13:00', available: true },
      { time: '14:00', available: true },
      { time: '15:00', available: true },
      { time: '16:00', available: true },
    ],
  };

  const steps = ['Select Hospital', 'Choose Date & Time', 'Review & Confirm'];

  useEffect(() => {
    calculateEligibility();
  }, []);

  const calculateEligibility = () => {
    if (!donorInfo.lastDonation) {
      setDonorInfo(prev => ({ ...prev, isEligible: true, nextEligibleDate: null }));
      return;
    }

    const lastDonationDate = new Date(donorInfo.lastDonation);
    const today = new Date();
    const daysSinceDonation = Math.floor((today - lastDonationDate) / (1000 * 60 * 60 * 24));

    if (daysSinceDonation >= 56) {
      setDonorInfo(prev => ({ ...prev, isEligible: true, nextEligibleDate: null }));
    } else {
      const nextDate = new Date(lastDonationDate);
      nextDate.setDate(lastDonationDate.getDate() + 56);
      setDonorInfo(prev => ({ ...prev, isEligible: false, nextEligibleDate: nextDate.toISOString().split('T')[0] }));
    }
  };

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
    setAppointment({
      ...appointment,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      hospitalLocation: hospital.location,
      hospitalPhone: hospital.phone,
    });
    setActiveStep(1);
  };

  const handleDateChange = (date) => {
    setAppointment({ ...appointment, date });
  };

  const handleTimeChange = (time) => {
    setAppointment({ ...appointment, time });
  };

  const handlePreferenceChange = (e) => {
    setAppointment({ ...appointment, preferredTime: e.target.value });
  };

  const handleNext = () => {
    if (activeStep === 1 && (!appointment.date || !appointment.time)) {
      setError('Please select both date and time for your appointment');
      return;
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const handleConfirm = () => {
    setOpenConfirmDialog(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newAppointment = {
        id: Date.now(),
        ...appointment,
        donorName: donorInfo.name,
        donorBloodType: donorInfo.bloodType,
        donorPhone: donorInfo.phone,
        donorEmail: donorInfo.email,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        appointmentId: `APT-${Date.now()}`,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=APT-${Date.now()}`,
      };
      
      const existingAppointments = JSON.parse(localStorage.getItem('bloodSuiteAppointments') || '[]');
      localStorage.setItem('bloodSuiteAppointments', JSON.stringify([newAppointment, ...existingAppointments]));
      
      setSuccess('Appointment scheduled successfully!');
      setOpenConfirmDialog(false);
      
      setTimeout(() => {
        navigate('/donor/dashboard');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to schedule appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilEligible = () => {
    if (!donorInfo.nextEligibleDate) return 0;
    const next = new Date(donorInfo.nextEligibleDate);
    const today = new Date();
    return Math.ceil((next - today) / (1000 * 60 * 60 * 24));
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isDateValid = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 1);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);
    return date >= minDate && date <= maxDate;
  };

  const renderHospitalSelection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Select a Donation Center
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose a hospital or blood bank near you
        </Typography>
      </Grid>
      
      {hospitals.map((hospital) => (
        <Grid item xs={12} md={6} key={hospital.id}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '1px solid #e0e0e0',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
                borderColor: '#d32f2f',
              },
            }}
            onClick={() => handleHospitalSelect(hospital)}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: '#d32f2f' }}>
                  <HospitalIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {hospital.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Code: {hospital.code}
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationIcon sx={{ fontSize: 16, color: '#999' }} />
                    <Typography variant="body2">{hospital.address}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PhoneIcon sx={{ fontSize: 16, color: '#999' }} />
                    <Typography variant="body2">{hospital.phone}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TimeIcon sx={{ fontSize: 16, color: '#999' }} />
                    <Typography variant="body2">Hours: {hospital.operatingHours}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Chip
                    label={`${hospital.distance} km away`}
                    size="small"
                    sx={{ mt: 1, bgcolor: '#fff5f5', color: '#d32f2f' }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderDateTimeSelection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Schedule Your Donation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {selectedHospital?.name} - {selectedHospital?.location}
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Select Date"
            value={appointment.date}
            onChange={handleDateChange}
            minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
            maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
            disablePast
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon sx={{ color: '#d32f2f' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </LocalizationProvider>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <TimePicker
            label="Select Time"
            value={appointment.time}
            onChange={handleTimeChange}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimeIcon sx={{ color: '#d32f2f' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </LocalizationProvider>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Preferred Time of Day
        </Typography>
        <RadioGroup
          row
          value={appointment.preferredTime}
          onChange={handlePreferenceChange}
        >
          <FormControlLabel value="morning" control={<Radio sx={{ color: '#d32f2f' }} />} label="Morning (8 AM - 12 PM)" />
          <FormControlLabel value="afternoon" control={<Radio sx={{ color: '#d32f2f' }} />} label="Afternoon (1 PM - 5 PM)" />
        </RadioGroup>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Additional Notes (Optional)"
          multiline
          rows={3}
          value={appointment.notes}
          onChange={(e) => setAppointment({ ...appointment, notes: e.target.value })}
          placeholder="Any special requirements or questions for the staff..."
        />
      </Grid>
      
      <Grid item xs={12}>
        <Alert severity="info" sx={{ bgcolor: '#fff5f5' }}>
          <Typography variant="body2">
            <strong>Before You Donate:</strong> Please eat a healthy meal, drink plenty of water, 
            and bring a valid ID. Avoid alcohol 24 hours before donation.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );

  const renderReview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Review Your Appointment
        </Typography>
      </Grid>
      
      {/* Donor Information */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, bgcolor: '#fafafa' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
            Donor Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon sx={{ fontSize: 16, color: '#999' }} />
                <Typography variant="body2">{donorInfo.name}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <BloodIcon sx={{ fontSize: 16, color: '#999' }} />
                <Typography variant="body2">Blood Type: {donorInfo.bloodType}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <PhoneIcon sx={{ fontSize: 16, color: '#999' }} />
                <Typography variant="body2">{donorInfo.phone}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <EmailIcon sx={{ fontSize: 16, color: '#999' }} />
                <Typography variant="body2">{donorInfo.email}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      {/* Appointment Details */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, bgcolor: '#fafafa' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
            Appointment Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <HospitalIcon sx={{ fontSize: 16, color: '#999' }} />
                <Typography variant="body2">
                  <strong>{appointment.hospitalName}</strong> - {appointment.hospitalLocation}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarIcon sx={{ fontSize: 16, color: '#999' }} />
                <Typography variant="body2">
                  Date: {appointment.date ? appointment.date.toLocaleDateString() : 'Not selected'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <TimeIcon sx={{ fontSize: 16, color: '#999' }} />
                <Typography variant="body2">
                  Time: {appointment.time ? formatTime(appointment.time) : 'Not selected'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <InfoIcon sx={{ fontSize: 16, color: '#999' }} />
                <Typography variant="body2">
                  Please arrive 15 minutes before your scheduled time
                </Typography>
              </Box>
            </Grid>
            {appointment.notes && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Notes:</strong> {appointment.notes}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
      
      {/* Reminder */}
      <Grid item xs={12}>
        <Alert severity="warning" sx={{ bgcolor: '#fff3e0' }}>
          <Typography variant="body2">
            <strong>Donation Reminder:</strong> Please bring a valid ID, eat well before donation, 
            and stay hydrated. If you're feeling unwell, please reschedule.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );

  // Check eligibility
  if (!donorInfo.isEligible) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconButton onClick={() => navigate('/donor/dashboard')} sx={{ color: '#d32f2f' }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
            Schedule Donation
          </Typography>
        </Box>
        
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#ff9800', mx: 'auto', mb: 2 }}>
            <ScheduleIcon sx={{ fontSize: 48 }} />
          </Avatar>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#ff9800' }}>
            Not Yet Eligible to Donate
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            You last donated on {donorInfo.lastDonation}.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You will be eligible to donate again on {donorInfo.nextEligibleDate} 
            ({getDaysUntilEligible()} days remaining).
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(56 - getDaysUntilEligible()) / 56 * 100}
            sx={{ maxWidth: 300, mx: 'auto', mb: 3, height: 8, borderRadius: 4, bgcolor: '#ffe0e0', '& .MuiLinearProgress-bar': { bgcolor: '#ff9800' } }}
          />
          <Button
            variant="contained"
            onClick={() => navigate('/eligibility')}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            View Eligibility Status
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/donor/dashboard')} sx={{ color: '#d32f2f' }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Schedule Donation
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {activeStep === 0 && renderHospitalSelection()}
        {activeStep === 1 && renderDateTimeSelection()}
        {activeStep === 2 && renderReview()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleConfirm}
              sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' }, px: 4 }}
            >
              Confirm Appointment
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#fff5f5', color: '#d32f2f' }}>
          Confirm Appointment
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: '#d32f2f', mx: 'auto', mb: 2 }}>
              <CheckIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Schedule Your Donation?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please review your appointment details before confirming.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Hospital:</strong> {appointment.hospitalName}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Date:</strong> {appointment.date ? appointment.date.toLocaleDateString() : 'Not selected'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Time:</strong> {appointment.time ? formatTime(appointment.time) : 'Not selected'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} sx={{ color: '#d32f2f' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm & Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ScheduleDonation;