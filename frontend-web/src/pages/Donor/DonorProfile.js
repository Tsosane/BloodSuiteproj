// src/pages/Donor/DonorProfile.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Bloodtype as BloodIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';

const DonorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+266 1234 5678',
    bloodType: 'O+',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    address: 'Maseru, Lesotho',
    latitude: '-29.3167',
    longitude: '27.4833',
    lastDonation: '2024-02-15',
    totalDonations: 8,
    isEligible: true,
    nextEligibleDate: null,
    notificationsEnabled: true,
    emergencyAlertsEnabled: true,
  });

  const [originalProfile, setOriginalProfile] = useState({});

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['male', 'female', 'other'];

  useEffect(() => {
    setOriginalProfile(profile);
    calculateEligibility();
  }, []);

  const calculateEligibility = () => {
    if (!profile.lastDonation) {
      setProfile(prev => ({ ...prev, isEligible: true, nextEligibleDate: null }));
      return;
    }

    const lastDonationDate = new Date(profile.lastDonation);
    const today = new Date();
    const daysSinceDonation = Math.floor((today - lastDonationDate) / (1000 * 60 * 60 * 24));

    if (daysSinceDonation >= 56) {
      setProfile(prev => ({ ...prev, isEligible: true, nextEligibleDate: null }));
    } else {
      const nextDate = new Date(lastDonationDate);
      nextDate.setDate(lastDonationDate.getDate() + 56);
      setProfile(prev => ({ ...prev, isEligible: false, nextEligibleDate: nextDate.toISOString().split('T')[0] }));
    }
  };

  const handleEdit = () => {
    setOriginalProfile(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate phone number
      if (!profile.phone.match(/^\+266 \d{4} \d{4}$/)) {
        setError('Phone number must be in format: +266 1234 5678');
        setLoading(false);
        return;
      }
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setProfile({
          ...profile,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
      });
    }
  };

  const getDaysUntilEligible = () => {
    if (!profile.nextEligibleDate) return 0;
    const next = new Date(profile.nextEligibleDate);
    const today = new Date();
    return Math.ceil((next - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          My Profile
        </Typography>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            Edit Profile
          </Button>
        ) : (
          <Box>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              sx={{ mr: 1, borderColor: '#d32f2f', color: '#d32f2f' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Picture and Status */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: '#d32f2f',
                mx: 'auto',
                mb: 2,
                fontSize: 48,
              }}
            >
              {profile.fullName.charAt(0)}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {profile.fullName}
            </Typography>
            <Chip
              label={`Blood Type: ${profile.bloodType}`}
              sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', mt: 1 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Donation Status
            </Typography>
            {profile.isEligible ? (
              <Chip
                icon={<CheckIcon />}
                label="Eligible to Donate"
                sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
              />
            ) : (
              <Box>
                <Chip
                  icon={<WarningIcon />}
                  label={`Not Eligible - ${getDaysUntilEligible()} days remaining`}
                  sx={{ bgcolor: '#fff3e0', color: '#ed6c02' }}
                />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Eligible on: {profile.nextEligibleDate}
                </Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary">
              Total Donations
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#d32f2f' }}>
              {profile.totalDonations}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last Donation: {profile.lastDonation || 'Never'}
            </Typography>
          </Paper>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
              Personal Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+266 1234 5678"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Blood Type</InputLabel>
                  <Select
                    name="bloodType"
                    value={profile.bloodType}
                    onChange={handleChange}
                    label="Blood Type"
                  >
                    {bloodTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={handleChange}
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    label="Gender"
                  >
                    {genders.map(gender => (
                      <MenuItem key={gender} value={gender}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  name="latitude"
                  value={profile.latitude}
                  onChange={handleChange}
                  disabled={!isEditing}
                  InputProps={{
                    endAdornment: isEditing && (
                      <InputAdornment position="end">
                        <IconButton onClick={handleUseCurrentLocation}>
                          <MyLocationIcon />
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
                  value={profile.longitude}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
              Notification Preferences
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.notificationsEnabled}
                      onChange={(e) => setProfile({ ...profile, notificationsEnabled: e.target.checked })}
                      disabled={!isEditing}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#d32f2f' } }}
                    />
                  }
                  label="Receive General Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.emergencyAlertsEnabled}
                      onChange={(e) => setProfile({ ...profile, emergencyAlertsEnabled: e.target.checked })}
                      disabled={!isEditing}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#d32f2f' } }}
                    />
                  }
                  label="Receive Emergency Alerts"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DonorProfile;