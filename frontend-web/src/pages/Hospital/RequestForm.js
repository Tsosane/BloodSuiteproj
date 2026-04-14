// src/pages/Hospital/RequestForm.js
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
  Chip,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Bloodtype as BloodIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Warning as EmergencyIcon,
  CheckCircle as CheckIcon,
  ArrowBack as BackIcon,
  Send as SendIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RequestForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    bloodType: '',
    quantityMl: 450,
    urgency: 'routine',
    patientName: '',
    patientAge: '',
    patientBloodType: '',
    requiredDate: '',
    notes: '',
    hospitalId: localStorage.getItem('bloodSuiteHospitalId') || 'LS-BB-001',
    hospitalName: localStorage.getItem('bloodSuiteHospital') || 'Queen Elizabeth II Hospital',
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'routine', label: 'Routine', color: '#2196f3', icon: <ScheduleIcon />, description: 'Standard request, fulfilled within 24-48 hours' },
    { value: 'urgent', label: 'Urgent', color: '#ff9800', icon: <WarningIcon />, description: 'Priority request, fulfilled within 4-8 hours' },
    { value: 'emergency', label: 'Emergency', color: '#f44336', icon: <EmergencyIcon />, description: 'Critical request, immediate fulfillment required' },
  ];
  const quantities = [450, 900, 1350, 1800, 2250, 2700];

  const steps = ['Patient Information', 'Request Details', 'Review & Submit'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!formData.patientName || !formData.patientAge || !formData.patientBloodType) {
        setError('Please fill in all patient information');
        return false;
      }
      if (formData.patientAge < 0 || formData.patientAge > 120) {
        setError('Please enter a valid age');
        return false;
      }
      setError('');
      return true;
    }
    
    if (activeStep === 1) {
      if (!formData.bloodType || !formData.quantityMl || !formData.urgency) {
        setError('Please fill in all request details');
        return false;
      }
      if (!formData.requiredDate) {
        setError('Please select required date');
        return false;
      }
      setError('');
      return true;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create request object
      const newRequest = {
        id: Date.now(),
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        requestId: `REQ-${Date.now()}`,
      };
      
      // Save to localStorage for demo
      const existingRequests = JSON.parse(localStorage.getItem('bloodSuiteRequests') || '[]');
      localStorage.setItem('bloodSuiteRequests', JSON.stringify([newRequest, ...existingRequests]));
      
      setSuccess('Blood request submitted successfully!');
      
      setTimeout(() => {
        navigate('/requests/track');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyInfo = () => {
    return urgencyLevels.find(u => u.value === formData.urgency) || urgencyLevels[0];
  };

  const renderPatientInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Patient Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter the patient details for whom blood is being requested
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Patient Full Name"
          name="patientName"
          value={formData.patientName}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: '#d32f2f' }} />
              </InputAdornment>
            ),
          }}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Patient Age"
          name="patientAge"
          type="number"
          value={formData.patientAge}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ScheduleIcon sx={{ color: '#d32f2f' }} />
              </InputAdornment>
            ),
            endAdornment: <InputAdornment position="end">years</InputAdornment>,
          }}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Patient Blood Type</InputLabel>
          <Select
            name="patientBloodType"
            value={formData.patientBloodType}
            onChange={handleChange}
            label="Patient Blood Type"
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
          label="Notes (Optional)"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          multiline
          rows={2}
          placeholder="Any additional information about the patient or medical condition"
        />
      </Grid>
    </Grid>
  );

  const renderRequestDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Blood Request Details
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Blood Type Required</InputLabel>
          <Select
            name="bloodType"
            value={formData.bloodType}
            onChange={handleChange}
            label="Blood Type Required"
          >
            {bloodTypes.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
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
              <MenuItem key={q} value={q}>{q} ml ({q/450} unit{q/450 > 1 ? 's' : ''})</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Urgency Level
        </Typography>
        <Grid container spacing={2}>
          {urgencyLevels.map((level) => (
            <Grid item xs={12} sm={4} key={level.value}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: formData.urgency === level.value ? `2px solid ${level.color}` : '1px solid #e0e0e0',
                  bgcolor: formData.urgency === level.value ? `${level.color}10` : 'white',
                  transition: 'all 0.3s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
                }}
                onClick={() => setFormData({ ...formData, urgency: level.value })}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: level.color, mb: 1 }}>
                    {React.cloneElement(level.icon, { sx: { fontSize: 40 } })}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: level.color }}>
                    {level.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {level.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Required By Date"
          name="requiredDate"
          type="date"
          value={formData.requiredDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ScheduleIcon sx={{ color: '#d32f2f' }} />
              </InputAdornment>
            ),
          }}
          required
        />
      </Grid>
    </Grid>
  );

  const renderReview = () => {
    const urgencyInfo = getUrgencyInfo();
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
            Review Request
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#fafafa' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Hospital Information
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <HospitalIcon sx={{ color: '#d32f2f' }} />
              <Typography>{formData.hospitalName}</Typography>
              <Chip label={formData.hospitalId} size="small" />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Patient Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Name</Typography>
                <Typography variant="body2">{formData.patientName}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Age</Typography>
                <Typography variant="body2">{formData.patientAge} years</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Blood Type</Typography>
                <Chip label={formData.patientBloodType} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f' }} />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Request Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Blood Type</Typography>
                <Chip label={formData.bloodType} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f', mt: 0.5 }} />
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Quantity</Typography>
                <Typography variant="body2">{formData.quantityMl} ml</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Urgency</Typography>
                <Chip 
                  label={urgencyInfo.label} 
                  size="small" 
                  sx={{ bgcolor: `${urgencyInfo.color}20`, color: urgencyInfo.color, mt: 0.5 }} 
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Required By</Typography>
                <Typography variant="body2">{formData.requiredDate}</Typography>
              </Grid>
            </Grid>
            
            {formData.notes && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Additional Notes
                </Typography>
                <Typography variant="body2" color="text.secondary">{formData.notes}</Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#d32f2f' }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Submit Blood Request
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

        {activeStep === 0 && renderPatientInfo()}
        {activeStep === 1 && renderRequestDetails()}
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
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit Request'}
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

export default RequestForm;