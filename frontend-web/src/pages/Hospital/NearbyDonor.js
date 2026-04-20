import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Slider,
  Typography,
} from '@mui/material';
import {
  Bloodtype as BloodIcon,
  CheckCircle as CheckIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api';
import donorService from '../../services/donorService';
import hospitalService from '../../services/hospitalService';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DEFAULT_CENTER = { lat: -29.3167, lng: 27.4833 };

const normalizeCoordinate = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const FallbackMap = ({ hospitalLocation, donors, selectedDonor, onSelectDonor }) => {
  const points = useMemo(() => {
    const donorPoints = donors
      .filter((donor) => Number.isFinite(donor.latitude) && Number.isFinite(donor.longitude))
      .map((donor) => ({
        id: donor.id,
        latitude: donor.latitude,
        longitude: donor.longitude,
        donor,
      }));

    const allLats = [hospitalLocation.lat, ...donorPoints.map((point) => point.latitude)];
    const allLngs = [hospitalLocation.lng, ...donorPoints.map((point) => point.longitude)];

    const minLat = Math.min(...allLats);
    const maxLat = Math.max(...allLats);
    const minLng = Math.min(...allLngs);
    const maxLng = Math.max(...allLngs);

    const latSpan = Math.max(maxLat - minLat, 0.01);
    const lngSpan = Math.max(maxLng - minLng, 0.01);

    const project = (latitude, longitude) => ({
      left: `${((longitude - minLng) / lngSpan) * 100}%`,
      top: `${((maxLat - latitude) / latSpan) * 100}%`,
    });

    return {
      hospital: project(hospitalLocation.lat, hospitalLocation.lng),
      donors: donorPoints.map((point) => ({
        ...point,
        ...project(point.latitude, point.longitude),
      })),
    };
  }, [donors, hospitalLocation.lat, hospitalLocation.lng]);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 420,
        borderRadius: 3,
        overflow: 'hidden',
        background:
          'radial-gradient(circle at top left, rgba(211,47,47,0.12), transparent 40%), linear-gradient(180deg, #fffaf7 0%, #fff2f2 100%)',
        border: '1px solid #f0d9d9',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(211,47,47,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(211,47,47,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          left: points.hospital.left,
          top: points.hospital.top,
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
        }}
      >
        <Avatar sx={{ bgcolor: '#d32f2f', width: 42, height: 42 }}>
          <LocationIcon />
        </Avatar>
      </Box>

      {points.donors.map((point) => (
        <Box
          key={point.id}
          sx={{
            position: 'absolute',
            left: point.left,
            top: point.top,
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
          }}
        >
          <Button
            onClick={() => onSelectDonor(point.donor)}
            sx={{
              minWidth: 18,
              width: 18,
              height: 18,
              p: 0,
              borderRadius: '50%',
              bgcolor: selectedDonor?.id === point.id ? '#2e7d32' : '#4caf50',
              '&:hover': { bgcolor: '#2e7d32' },
            }}
          />
        </Box>
      ))}

      <Box sx={{ position: 'absolute', left: 16, bottom: 16, zIndex: 3 }}>
        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>
            Location Map Fallback
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Using a built-in coordinate view because no Google Maps key is configured.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

const NearbyDonors = () => {
  const [hospital, setHospital] = useState(null);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [radius, setRadius] = useState(10);
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [originOverride, setOriginOverride] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [locationWarning, setLocationWarning] = useState('');

  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey || 'missing-key',
  });

  const effectiveLocation = useMemo(() => {
    if (originOverride) {
      return originOverride;
    }

    return {
      lat: normalizeCoordinate(hospital?.latitude, DEFAULT_CENTER.lat),
      lng: normalizeCoordinate(hospital?.longitude, DEFAULT_CENTER.lng),
    };
  }, [hospital?.latitude, hospital?.longitude, originOverride]);

  const loadHospital = async () => {
    try {
      const response = await hospitalService.getMyHospital();
      const hospitalData = response.data || null;
      setHospital(hospitalData);

      const hospitalLat = normalizeCoordinate(hospitalData?.latitude, null);
      const hospitalLng = normalizeCoordinate(hospitalData?.longitude, null);

      if (hospitalLat != null && hospitalLng != null) {
        setMapCenter({ lat: hospitalLat, lng: hospitalLng });
        setLocationWarning('');
      } else {
        setMapCenter(DEFAULT_CENTER);
        setLocationWarning('This hospital profile has no saved coordinates yet. The page can still use your current browser location.');
      }
    } catch (loadError) {
      console.error('Failed to load hospital profile', loadError);
      setError(loadError.error || loadError.message || 'Unable to load hospital profile.');
      setLoading(false);
    }
  };

  const loadNearbyDonors = async (isInitialLoad = false) => {
    if (!hospital?.id) {
      return;
    }

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError('');

    try {
      const response = await donorService.getNearbyDonors({
        hospitalId: hospital.id,
        radiusKm: radius,
        bloodType: bloodTypeFilter === 'all' ? undefined : bloodTypeFilter,
        latitude: originOverride?.lat,
        longitude: originOverride?.lng,
      });

      const normalizedDonors = (response.data || []).map((donor) => ({
        ...donor,
        latitude: normalizeCoordinate(donor.latitude, NaN),
        longitude: normalizeCoordinate(donor.longitude, NaN),
        distance: Number(donor.distance || 0),
        email: donor.user?.email || '',
        name: donor.full_name || donor.user?.email || 'Donor',
      }));

      setDonors(normalizedDonors);
      setSelectedDonor((current) =>
        normalizedDonors.find((donor) => donor.id === current?.id) || normalizedDonors[0] || null
      );
      setSuccessMessage(`Loaded ${normalizedDonors.length} eligible donor${normalizedDonors.length === 1 ? '' : 's'} within ${radius} km.`);
    } catch (loadError) {
      console.error('Failed to load nearby donors', loadError);
      setError(loadError.error || loadError.message || 'Unable to load nearby donors.');
      setDonors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHospital();
  }, []);

  useEffect(() => {
    if (hospital?.id) {
      loadNearbyDonors(loading);
    }
  }, [hospital?.id, radius, bloodTypeFilter, originOverride]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const browserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setOriginOverride(browserLocation);
        setMapCenter(browserLocation);
        setLocationWarning('Using your current browser location for donor search and map placement.');
      },
      () => {
        setError('Unable to retrieve your current location.');
      }
    );
  };

  const handleResetHospitalLocation = () => {
    setOriginOverride(null);
    setMapCenter({
      lat: normalizeCoordinate(hospital?.latitude, DEFAULT_CENTER.lat),
      lng: normalizeCoordinate(hospital?.longitude, DEFAULT_CENTER.lng),
    });
  };

  const handleContactDonor = (donor) => {
    if (donor.email) {
      const subject = encodeURIComponent(`Blood donation request for ${donor.blood_type}`);
      const body = encodeURIComponent(
        `Hello ${donor.name},\n\nA hospital nearby is looking for eligible ${donor.blood_type} donors. Please respond if you are available to help.\n\nThank you.`
      );
      window.location.href = `mailto:${donor.email}?subject=${subject}&body=${body}`;
      return;
    }

    setError('This donor does not have an email address on file.');
  };

  const averageDistance = donors.length
    ? (donors.reduce((sum, donor) => sum + donor.distance, 0) / donors.length).toFixed(1)
    : '0.0';

  const renderMap = () => {
    if (!googleMapsApiKey || loadError) {
      return (
        <FallbackMap
          hospitalLocation={effectiveLocation}
          donors={donors}
          selectedDonor={selectedDonor}
          onSelectDonor={setSelectedDonor}
        />
      );
    }

    if (!isLoaded) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#d32f2f' }} />
        </Box>
      );
    }

    return (
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: 420, borderRadius: 16 }}
        center={mapCenter}
        zoom={12}
        options={{ disableDefaultUI: true, zoomControl: true }}
      >
        <Marker
          position={effectiveLocation}
          icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
        />

        {donors.map((donor) => (
          <Marker
            key={donor.id}
            position={{ lat: donor.latitude, lng: donor.longitude }}
            icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' }}
            onClick={() => setSelectedDonor(donor)}
          />
        ))}

        {selectedDonor && (
          <InfoWindow
            position={{ lat: selectedDonor.latitude, lng: selectedDonor.longitude }}
            onCloseClick={() => setSelectedDonor(null)}
          >
            <Box sx={{ minWidth: 220 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {selectedDonor.name}
              </Typography>
              <Typography variant="body2">Blood Type: {selectedDonor.blood_type}</Typography>
              <Typography variant="body2">Distance: {selectedDonor.distance.toFixed(1)} km</Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => handleContactDonor(selectedDonor)}
                sx={{ mt: 1, bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
              >
                Contact
              </Button>
            </Box>
          </InfoWindow>
        )}
      </GoogleMap>
    );
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
            Nearby Donors
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real nearby eligible donor search using hospital or browser location
          </Typography>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<MyLocationIcon />}
            onClick={handleUseCurrentLocation}
            sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
          >
            Use My Location
          </Button>
          <Button
            variant="contained"
            onClick={handleResetHospitalLocation}
            disabled={!originOverride}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            Use Hospital Location
          </Button>
        </Box>
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

      {locationWarning && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {locationWarning}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#d32f2f' }}>
              Filters
            </Typography>

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Search Radius
            </Typography>
            <Slider
              value={radius}
              onChange={(event, value) => setRadius(value)}
              min={1}
              max={50}
              step={1}
              marks={[
                { value: 1, label: '1km' },
                { value: 10, label: '10km' },
                { value: 25, label: '25km' },
                { value: 50, label: '50km' },
              ]}
              sx={{ color: '#d32f2f', mb: 3 }}
            />

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Blood Type
            </Typography>
            <Grid container spacing={1} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Chip
                  label="All"
                  onClick={() => setBloodTypeFilter('all')}
                  sx={{
                    width: '100%',
                    bgcolor: bloodTypeFilter === 'all' ? '#d32f2f' : '#f5f5f5',
                    color: bloodTypeFilter === 'all' ? 'white' : '#666',
                    cursor: 'pointer',
                  }}
                />
              </Grid>
              {BLOOD_TYPES.map((type) => (
                <Grid item xs={6} key={type}>
                  <Chip
                    label={type}
                    onClick={() => setBloodTypeFilter(type)}
                    sx={{
                      width: '100%',
                      bgcolor: bloodTypeFilter === type ? '#d32f2f' : '#f5f5f5',
                      color: bloodTypeFilter === type ? 'white' : '#666',
                      cursor: 'pointer',
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#d32f2f' }}>
              Stats
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hospital: <strong>{hospital?.hospital_name || 'Unknown'}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Eligible donors: <strong>{donors.length}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average distance: <strong>{averageDistance} km</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Source: <strong>{originOverride ? 'Browser location' : 'Hospital profile'}</strong>
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#d32f2f' }}>
              Donor Location Map
            </Typography>
            {renderMap()}
          </Paper>

          <Paper sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                Eligible Donors ({donors.length})
              </Typography>
              {refreshing && (
                <Typography variant="caption" color="text.secondary">
                  Refreshing donors...
                </Typography>
              )}
            </Box>
            <List>
              {donors.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No eligible donors were found for the current filters.
                  </Typography>
                </Box>
              ) : (
                donors.map((donor, index) => (
                  <React.Fragment key={donor.id}>
                    <ListItem
                      sx={{ py: 2, '&:hover': { bgcolor: '#fff5f5' } }}
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<SendIcon />}
                          onClick={() => handleContactDonor(donor)}
                          sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                        >
                          Contact
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#d32f2f' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {donor.name}
                            </Typography>
                            <Chip label={donor.blood_type} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f' }} />
                            <Chip
                              icon={<CheckIcon />}
                              label="Eligible"
                              size="small"
                              sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <LocationIcon sx={{ fontSize: 14, color: '#999' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {donor.distance.toFixed(1)} km away
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <PhoneIcon sx={{ fontSize: 14, color: '#999' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {donor.phone || 'No phone'}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <EmailIcon sx={{ fontSize: 14, color: '#999' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {donor.email || 'No email'}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <BloodIcon sx={{ fontSize: 14, color: '#999' }} />
                                <Typography variant="caption" color="text.secondary">
                                  Donations: {donor.donation_count || 0}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < donors.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NearbyDonors;
