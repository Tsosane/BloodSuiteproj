// src/pages/Hospital/RegisterDonor.js
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { ArrowBack as BackIcon, PersonAdd as PersonAddIcon, Phone as PhoneIcon, Email as EmailIcon, LocationOn as LocationIcon, MyLocation as MyLocationIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import donorService from '../../services/donorService';

const RegisterDonor = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: 'donor123',
    full_name: '',
    phone: '',
    blood_type: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const steps = ['Personal Info', 'Contact & Location'];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => setFormData({ ...formData, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
    }
  };

  const validateStep = () => {
    if (activeStep === 0 && (!formData.full_name || !formData.blood_type || !formData.email)) {
      setError('Please fill in all fields'); return false;
    }
    if (activeStep === 1 && (!formData.phone || !formData.address || !formData.latitude || !formData.longitude)) {
      setError('Please fill in all location fields'); return false;
    }
    setError(''); return true;
  };

  const handleNext = () => { if (validateStep()) setActiveStep(1); };
  const handleBack = () => setActiveStep(0);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await donorService.registerDonor(formData);
      if (response.success) {
        setSuccess(`Donor ${formData.full_name} registered successfully!`);
        setTimeout(() => navigate('/donors/nearby'), 2000);
      } else throw new Error(response.error);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#d32f2f' }}><BackIcon /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>Register Donor</Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 700, mx: 'auto' }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>{steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {activeStep === 0 && (<Grid container spacing={3}><Grid item xs={12}><TextField fullWidth label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} required /></Grid>
        <Grid item xs={12}><FormControl fullWidth><InputLabel>Blood Type</InputLabel><Select name="blood_type" value={formData.blood_type} onChange={handleChange} label="Blood Type">{bloodTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</Select></FormControl></Grid>
        <Grid item xs={12}><TextField fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }} required /></Grid></Grid>)}

        {activeStep === 1 && (<Grid container spacing={3}><Grid item xs={12}><TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }} required /></Grid>
        <Grid item xs={12}><TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} multiline rows={2} required /></Grid>
        <Grid item xs={6}><TextField fullWidth label="Latitude" name="latitude" value={formData.latitude} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={handleUseLocation}><MyLocationIcon /></IconButton></InputAdornment> }} /></Grid>
        <Grid item xs={6}><TextField fullWidth label="Longitude" name="longitude" value={formData.longitude} onChange={handleChange} /></Grid></Grid>)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0} sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}>Back</Button>
          {activeStep === steps.length - 1 ? (<Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{ bgcolor: '#d32f2f' }}>{loading ? <CircularProgress size={24} /> : 'Register'}</Button>) : (<Button variant="contained" onClick={handleNext} sx={{ bgcolor: '#d32f2f' }}>Next</Button>)}
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterDonor;