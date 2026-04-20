// src/pages/Hospital/RegisterDonor.js
import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Email as EmailIcon,
  MyLocation as MyLocationIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import donorService from '../../services/donorService';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const steps = ['Personal Info', 'Contact & Location'];
const allowedRoles = ['admin', 'blood_bank_manager', 'hospital'];

const RegisterDonor = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('bloodSuiteUserRole');
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    blood_type: '',
    date_of_birth: '',
    gender: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError('Unable to capture the current location. Please allow location access and try again.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const validateStep = () => {
    if (activeStep === 0 && (!formData.full_name || !formData.blood_type || !formData.email)) {
      setError('Please complete the donor name, blood type, and email fields.');
      return false;
    }

    if (activeStep === 1 && (!formData.phone || !formData.address)) {
      setError('Please provide the donor phone number and address.');
      return false;
    }

    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(1);
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setTemporaryPassword('');

    try {
      const response = await donorService.registerDonor({
        ...formData,
        password: formData.password || undefined,
      });

      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }

      setTemporaryPassword(response.temporaryPassword || '');
      setSuccess(`Donor ${formData.full_name} registered successfully.`);
      setTimeout(() => {
        if (userRole === 'hospital') {
          navigate('/donors/nearby');
          return;
        }

        if (userRole === 'admin') {
          navigate('/admin/dashboard');
          return;
        }

        navigate('/manager/dashboard');
      }, 2500);
    } catch (submitError) {
      setError(submitError.error || submitError.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (!allowedRoles.includes(userRole)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Only hospital staff, managers, and administrators can create donor accounts from this page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#d32f2f' }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Register Donor
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 760, mx: 'auto' }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        {temporaryPassword && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Temporary password for the new donor account: <strong>{temporaryPassword}</strong>
          </Alert>
        )}

        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Blood Type</InputLabel>
                <Select
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={handleChange}
                  label="Blood Type"
                >
                  {bloodTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  <MenuItem value="">Prefer not to say</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password (Optional)"
                name="password"
                type="text"
                value={formData.password}
                onChange={handleChange}
                helperText="Leave blank to use the system temporary password."
              />
            </Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                helperText="Use current location to fill coordinates automatically."
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleUseLocation} disabled={locating}>
                        {locating ? <CircularProgress size={18} /> : <MyLocationIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Location coordinates are optional, but they make nearby-donor routing and automatic donor matching work much better.
              </Alert>
            </Grid>
          </Grid>
        )}

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
              startIcon={!loading ? <PersonAddIcon /> : null}
              onClick={handleSubmit}
              disabled={loading}
              sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Create Donor'}
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
    </Box>
  );
};

export default RegisterDonor;
