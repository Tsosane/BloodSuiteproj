// src/pages/Donor/DonorProfile.js
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import donorService from '../../services/donorService';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['male', 'female', 'other'];

const defaultProfile = {
  id: '',
  fullName: '',
  email: '',
  phone: '',
  bloodType: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  latitude: '',
  longitude: '',
  lastDonation: '',
  totalDonations: 0,
  isEligible: true,
  nextEligibleDate: null,
  daysRemaining: 0,
  notificationsEnabled: true,
  emergencyAlertsEnabled: true,
};

const notificationPreferenceKey = (donorId) => `bloodSuiteDonorPrefs:${donorId}`;

const mapProfileFromApi = (payload = {}) => {
  const eligibility = payload.eligibility || {};
  return {
    id: payload.id || '',
    fullName: payload.full_name || '',
    email: payload.user?.email || '',
    phone: payload.phone || '',
    bloodType: payload.blood_type || '',
    dateOfBirth: payload.date_of_birth || '',
    gender: payload.gender || '',
    address: payload.address || '',
    latitude: payload.latitude ?? '',
    longitude: payload.longitude ?? '',
    lastDonation: payload.last_donation_date || '',
    totalDonations: Number(payload.donation_count || 0),
    isEligible: eligibility.is_eligible ?? payload.is_eligible ?? true,
    nextEligibleDate: eligibility.next_eligible_date || null,
    daysRemaining: Number(eligibility.days_remaining || 0),
    notificationsEnabled: true,
    emergencyAlertsEnabled: true,
  };
};

const DonorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(defaultProfile);
  const [originalProfile, setOriginalProfile] = useState(defaultProfile);

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await donorService.getMyProfile();
      const mappedProfile = mapProfileFromApi(response.data || {});
      const savedPreferences = mappedProfile.id
        ? JSON.parse(localStorage.getItem(notificationPreferenceKey(mappedProfile.id)) || '{}')
        : {};
      const mergedProfile = {
        ...mappedProfile,
        notificationsEnabled: savedPreferences.notificationsEnabled ?? true,
        emergencyAlertsEnabled: savedPreferences.emergencyAlertsEnabled ?? true,
      };

      setProfile(mergedProfile);
      setOriginalProfile(mergedProfile);
    } catch (loadError) {
      setError(loadError.error || loadError.message || 'Unable to load your donor profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleEdit = () => {
    setOriginalProfile(profile);
    setIsEditing(true);
    setSuccess('');
    setError('');
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
    setSuccess('');
    setError('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handlePreferenceChange = (name, checked) => {
    setProfile((current) => ({ ...current, [name]: checked }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProfile((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setLocating(false);
        setSuccess('Current location captured successfully.');
      },
      () => {
        setLocating(false);
        setError('Unable to read your current location. Please allow location access and try again.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const validateProfile = () => {
    if (!profile.fullName || !profile.bloodType || !profile.phone) {
      return 'Full name, phone number, and blood type are required.';
    }

    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      return 'Please enter a valid email address.';
    }

    if (profile.phone && !/^[+\d][\d\s()-]{6,19}$/.test(profile.phone)) {
      return 'Please enter a valid phone number.';
    }

    return '';
  };

  const handleSave = async () => {
    const validationError = validateProfile();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await donorService.updateDonorProfile({
        email: profile.email,
        full_name: profile.fullName,
        blood_type: profile.bloodType,
        date_of_birth: profile.dateOfBirth || null,
        gender: profile.gender || null,
        phone: profile.phone,
        address: profile.address || null,
        latitude: profile.latitude || null,
        longitude: profile.longitude || null,
      });

      const mappedProfile = mapProfileFromApi(response.data || {});
      const mergedProfile = {
        ...mappedProfile,
        notificationsEnabled: profile.notificationsEnabled,
        emergencyAlertsEnabled: profile.emergencyAlertsEnabled,
      };

      if (mergedProfile.id) {
        localStorage.setItem(
          notificationPreferenceKey(mergedProfile.id),
          JSON.stringify({
            notificationsEnabled: mergedProfile.notificationsEnabled,
            emergencyAlertsEnabled: mergedProfile.emergencyAlertsEnabled,
          })
        );
      }

      setProfile(mergedProfile);
      setOriginalProfile(mergedProfile);
      setIsEditing(false);
      setSuccess('Profile updated successfully.');
    } catch (saveError) {
      setError(saveError.error || saveError.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getDaysUntilEligible = () => Number(profile.daysRemaining || 0);

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
              disabled={saving}
              sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
            >
              {saving ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Save Changes'}
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
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, height: '100%' }}>
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
              {profile.fullName?.charAt(0) || 'D'}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {profile.fullName || 'Donor'}
            </Typography>
            <Chip
              label={`Blood Type: ${profile.bloodType || 'Unknown'}`}
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
                  Eligible on: {profile.nextEligibleDate || 'Unavailable'}
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
                    {genders.map((gender) => (
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
                  helperText="Use your device location to fill coordinates automatically."
                  InputProps={{
                    endAdornment: isEditing && (
                      <InputAdornment position="end">
                        <IconButton onClick={handleUseCurrentLocation} disabled={locating}>
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
                  control={(
                    <Switch
                      checked={profile.notificationsEnabled}
                      onChange={(event) => handlePreferenceChange('notificationsEnabled', event.target.checked)}
                      disabled={!isEditing}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#d32f2f' } }}
                    />
                  )}
                  label="Receive General Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={(
                    <Switch
                      checked={profile.emergencyAlertsEnabled}
                      onChange={(event) => handlePreferenceChange('emergencyAlertsEnabled', event.target.checked)}
                      disabled={!isEditing}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#d32f2f' } }}
                    />
                  )}
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
