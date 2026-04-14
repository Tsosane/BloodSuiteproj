// src/pages/Hospital/AddInventory.js
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
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Chip,
  Divider,
} from '@mui/material';
import {
  Bloodtype as BloodIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Science as ScienceIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AddInventory = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    bloodType: '',
    quantityMl: 450,
    collectionDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    storageLocation: '',
    testingStatus: 'pending',
    donorId: '',
    notes: '',
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const quantities = [450, 900, 1350, 1800, 2250, 2700];
  const storageLocations = ['Fridge A1', 'Fridge A2', 'Fridge B1', 'Fridge B2', 'Fridge C1', 'Cold Room 1', 'Cold Room 2'];
  const testingStatuses = [
    { value: 'pending', label: 'Pending Testing', color: '#ff9800' },
    { value: 'passed', label: 'Passed', color: '#4caf50' },
    { value: 'failed', label: 'Failed', color: '#f44336' },
  ];

  const steps = ['Blood Details', 'Storage & Testing', 'Review'];

  const calculateExpiryDate = (collectionDate) => {
    const date = new Date(collectionDate);
    date.setDate(date.getDate() + 42);
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'collectionDate') {
      setFormData(prev => ({ ...prev, expiryDate: calculateExpiryDate(value) }));
    }
  };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!formData.bloodType || !formData.quantityMl) {
        setError('Please select blood type and quantity');
        return false;
      }
      setError('');
      return true;
    }
    
    if (activeStep === 1) {
      if (!formData.storageLocation || !formData.testingStatus) {
        setError('Please fill in storage location and testing status');
        return false;
      }
      setError('');
      return true;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUnit = {
        id: Date.now(),
        ...formData,
        status: formData.testingStatus === 'passed' ? 'available' : 'quarantined',
        createdAt: new Date().toISOString(),
        unitId: `UNIT-${Date.now()}`,
      };
      
      const existingInventory = JSON.parse(localStorage.getItem('bloodSuiteInventory') || '[]');
      localStorage.setItem('bloodSuiteInventory', JSON.stringify([newUnit, ...existingInventory]));
      
      setSuccess('Blood unit added successfully!');
      
      setTimeout(() => {
        navigate('/inventory');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to add blood unit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTestingStatusColor = (status) => {
    return testingStatuses.find(s => s.value === status)?.color || '#999';
  };

  const renderBloodDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Blood Unit Details
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Blood Type</InputLabel>
          <Select
            name="bloodType"
            value={formData.bloodType}
            onChange={handleChange}
            label="Blood Type"
          >
            {bloodTypes.map(type => (
              <MenuItem key={type} value={type}>
                <Box display="flex" alignItems="center" gap={1}>
                  <BloodIcon sx={{ color: '#d32f2f' }} />
                  {type}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Quantity (ml)</InputLabel>
          <Select
            name="quantityMl"
            value={formData.quantityMl}
            onChange={handleChange}
            label="Quantity (ml)"
          >
            {quantities.map(q => (
              <MenuItem key={q} value={q}>
                {q} ml ({q/450} unit{q/450 > 1 ? 's' : ''})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Collection Date"
          name="collectionDate"
          type="date"
          value={formData.collectionDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarIcon sx={{ color: '#d32f2f' }} />
              </InputAdornment>
            ),
          }}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Expiry Date (Auto-calculated)"
          value={formData.expiryDate || 'Will be calculated'}
          disabled
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <WarningIcon sx={{ color: '#ff9800' }} />
              </InputAdornment>
            ),
          }}
          helperText="Red blood cells expire 42 days after collection"
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Donor ID (Optional)"
          name="donorId"
          value={formData.donorId}
          onChange={handleChange}
          placeholder="Enter donor ID if known"
          helperText="If this blood was donated by a registered donor"
        />
      </Grid>
    </Grid>
  );

  const renderStorageTesting = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Storage & Testing Information
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Storage Location</InputLabel>
          <Select
            name="storageLocation"
            value={formData.storageLocation}
            onChange={handleChange}
            label="Storage Location"
          >
            {storageLocations.map(location => (
              <MenuItem key={location} value={location}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon sx={{ color: '#d32f2f' }} />
                  {location}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Testing Status</InputLabel>
          <Select
            name="testingStatus"
            value={formData.testingStatus}
            onChange={handleChange}
            label="Testing Status"
          >
            {testingStatuses.map(status => (
              <MenuItem key={status.value} value={status.value}>
                <Box display="flex" alignItems="center" gap={1}>
                  <ScienceIcon sx={{ color: status.color }} />
                  {status.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Additional Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          multiline
          rows={3}
          placeholder="Any additional information about this blood unit"
        />
      </Grid>
      
      {formData.testingStatus === 'failed' && (
        <Grid item xs={12}>
          <Alert severity="error" sx={{ bgcolor: '#ffebee' }}>
            Units with failed testing will be marked as quarantined and cannot be used for transfusions.
          </Alert>
        </Grid>
      )}
    </Grid>
  );

  const renderReview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Review Blood Unit
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 3, bgcolor: '#fafafa' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">Blood Type</Typography>
              <Chip label={formData.bloodType || 'Not selected'} sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', mt: 0.5 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">Quantity</Typography>
              <Typography variant="body2">{formData.quantityMl} ml</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">Collection Date</Typography>
              <Typography variant="body2">{formData.collectionDate}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">Expiry Date</Typography>
              <Typography variant="body2">{formData.expiryDate}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">Storage Location</Typography>
              <Typography variant="body2">{formData.storageLocation || 'Not specified'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">Testing Status</Typography>
              <Chip 
                label={testingStatuses.find(s => s.value === formData.testingStatus)?.label || 'Pending'}
                size="small"
                sx={{ bgcolor: `${getTestingStatusColor(formData.testingStatus)}20`, color: getTestingStatusColor(formData.testingStatus), mt: 0.5 }}
              />
            </Grid>
            {formData.donorId && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Donor ID</Typography>
                <Typography variant="body2">{formData.donorId}</Typography>
              </Grid>
            )}
            {formData.notes && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Notes</Typography>
                <Typography variant="body2" color="text.secondary">{formData.notes}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Alert severity="info" sx={{ bgcolor: '#fff5f5' }}>
          <Typography variant="body2">
            Once added, this blood unit will be available for requests if testing status is "Passed".
            Units with "Pending" or "Failed" status will not be visible in available inventory.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#d32f2f' }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Add Blood Unit
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

        {activeStep === 0 && renderBloodDetails()}
        {activeStep === 1 && renderStorageTesting()}
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
              onClick={handleSubmit}
              disabled={isLoading}
              sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' }, px: 4 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Add Blood Unit'}
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

export default AddInventory;