// src/pages/Hospital/NearbyDonors.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Slider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Bloodtype as BloodIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Send as SendIcon,
  MyLocation as MyLocationIcon,
  Search as SearchIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const NearbyDonors = () => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(10);
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [hospitalLocation, setHospitalLocation] = useState({
    lat: -29.3167,
    lng: 27.4833,
  });
  const [mapCenter, setMapCenter] = useState({ lat: -29.3167, lng: 27.4833 });
  const [geoError, setGeoError] = useState('');
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    loadDonors();
  }, []);

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const loadDonors = (location = hospitalLocation) => {
    // Demo donors with coordinates
    const demoDonors = [
      { 
        id: 1, 
        name: 'John Doe', 
        bloodType: 'O-', 
        phone: '+266 1234 5678', 
        email: 'john@email.com',
        latitude: -29.3100, 
        longitude: 27.4800,
        lastDonation: '2024-02-15',
        isEligible: true,
        donationsCount: 12,
      },
      { 
        id: 2, 
        name: 'Jane Smith', 
        bloodType: 'A+', 
        phone: '+266 2345 6789', 
        email: 'jane@email.com',
        latitude: -29.3200, 
        longitude: 27.4900,
        lastDonation: '2024-03-01',
        isEligible: true,
        donationsCount: 8,
      },
      { 
        id: 3, 
        name: 'Bob Johnson', 
        bloodType: 'B+', 
        phone: '+266 3456 7890', 
        email: 'bob@email.com',
        latitude: -29.3050, 
        longitude: 27.4750,
        lastDonation: '2024-01-10',
        isEligible: false,
        donationsCount: 5,
      },
      { 
        id: 4, 
        name: 'Mary Williams', 
        bloodType: 'O+', 
        phone: '+266 4567 8901', 
        email: 'mary@email.com',
        latitude: -29.3250, 
        longitude: 27.4850,
        lastDonation: '2024-02-28',
        isEligible: true,
        donationsCount: 15,
      },
      { 
        id: 5, 
        name: 'Peter Brown', 
        bloodType: 'AB+', 
        phone: '+266 5678 9012', 
        email: 'peter@email.com',
        latitude: -29.3150, 
        longitude: 27.4950,
        lastDonation: '2024-03-10',
        isEligible: true,
        donationsCount: 3,
      },
    ];

    // Calculate distance from hospital
    const donorsWithDistance = demoDonors.map(donor => ({
      ...donor,
      distance: haversineDistance(
        location.lat, location.lng,
        donor.latitude, donor.longitude
      ),
    })).sort((a, b) => a.distance - b.distance);

    setDonors(donorsWithDistance);
    setFilteredDonors(donorsWithDistance.filter(d => d.distance <= radius && d.isEligible));
    setLoading(false);
  };

  useEffect(() => {
    let filtered = donors.filter(d => d.distance <= radius && d.isEligible);
    if (bloodTypeFilter !== 'all') {
      filtered = filtered.filter(d => d.bloodType === bloodTypeFilter);
    }
    setFilteredDonors(filtered);
  }, [radius, bloodTypeFilter, donors]);

  const handleNotifyDonor = (donor) => {
    alert(`Notification sent to ${donor.name} for urgent blood donation request.`);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setHospitalLocation(newLocation);
          setMapCenter(newLocation);
          setGeoError('');
          loadDonors(newLocation);
        },
        () => {
          setGeoError('Unable to retrieve your current location.');
        }
      );
    } else {
      setGeoError('Geolocation is not supported by your browser.');
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px',
  };

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Nearby Donors
        </Typography>
        <Button
          variant="contained"
          startIcon={<MyLocationIcon />}
          onClick={handleUseCurrentLocation}
          sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
        >
          Use My Location
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
              Search Radius
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={radius}
                onChange={(e, v) => setRadius(v)}
                min={1}
                max={50}
                step={1}
                marks={[
                  { value: 1, label: '1km' },
                  { value: 10, label: '10km' },
                  { value: 25, label: '25km' },
                  { value: 50, label: '50km' },
                ]}
                sx={{ color: '#d32f2f' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
              Showing donors within {radius} km
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
              Blood Type Filter
            </Typography>
            <Grid container spacing={1}>
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
              {bloodTypes.map(type => (
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

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
              Statistics
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Donors: <strong>{filteredDonors.length}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Eligible Donors: <strong>{filteredDonors.filter(d => d.isEligible).length}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Distance: <strong>{(filteredDonors.reduce((sum, d) => sum + d.distance, 0) / filteredDonors.length || 0).toFixed(1)} km</strong>
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Map and Donors List */}
        <Grid item xs={12} md={9}>
          {/* Map */}
          <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
              Donor Location Map
            </Typography>
            {!googleMapsApiKey ? (
              <Box sx={{ p: 3, bgcolor: '#fff5f5', borderRadius: 2, textAlign: 'center' }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Google Maps API key is not configured. Add <strong>REACT_APP_GOOGLE_MAPS_API_KEY</strong> to <code>.env</code> and restart the app.
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  The map will display once a valid key is provided.
                </Typography>
              </Box>
            ) : loadError ? (
              <Alert severity="error">Unable to load Google Maps. Please check your API key and network.</Alert>
            ) : !isLoaded ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress sx={{ color: '#d32f2f' }} />
              </Box>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={12}
                options={mapOptions}
              >
                <Marker
                  position={hospitalLocation}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  }}
                />
                {filteredDonors.map((donor) => (
                  <Marker
                    key={donor.id}
                    position={{ lat: donor.latitude, lng: donor.longitude }}
                    onClick={() => setSelectedDonor(donor)}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    }}
                  />
                ))}
                {selectedDonor && (
                  <InfoWindow
                    position={{ lat: selectedDonor.latitude, lng: selectedDonor.longitude }}
                    onCloseClick={() => setSelectedDonor(null)}
                  >
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2">{selectedDonor.name}</Typography>
                      <Typography variant="caption" display="block">
                        Blood Type: {selectedDonor.bloodType}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Distance: {selectedDonor.distance.toFixed(1)} km
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleNotifyDonor(selectedDonor)}
                        sx={{ mt: 1, bgcolor: '#d32f2f' }}
                      >
                        Notify
                      </Button>
                    </Box>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </Paper>

          {/* Donors List */}
          <Paper sx={{ borderRadius: 2 }}>
            <Typography variant="h6" sx={{ p: 2, fontWeight: 600, color: '#d32f2f', borderBottom: '1px solid #e0e0e0' }}>
              Eligible Donors ({filteredDonors.length})
            </Typography>
            <List>
              {loading ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <CircularProgress sx={{ color: '#d32f2f' }} />
                </Box>
              ) : filteredDonors.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No eligible donors found within {radius} km
                  </Typography>
                </Box>
              ) : (
                filteredDonors.map((donor, index) => (
                  <React.Fragment key={donor.id}>
                    <ListItem
                      sx={{
                        py: 2,
                        '&:hover': { bgcolor: '#fff5f5' },
                      }}
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<SendIcon />}
                          onClick={() => handleNotifyDonor(donor)}
                          sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                        >
                          Notify
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
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {donor.name}
                            </Typography>
                            <Chip
                              label={donor.bloodType}
                              size="small"
                              sx={{ bgcolor: '#d32f2f20', color: '#d32f2f' }}
                            />
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
                                  {donor.phone}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <EmailIcon sx={{ fontSize: 14, color: '#999' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {donor.email}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <TimeIcon sx={{ fontSize: 14, color: '#999' }} />
                                <Typography variant="caption" color="text.secondary">
                                  Last Donation: {donor.lastDonation}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < filteredDonors.length - 1 && <Divider />}
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