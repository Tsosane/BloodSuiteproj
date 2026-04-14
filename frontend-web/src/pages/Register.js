// src/pages/Register.js
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Grid,
  Fade,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material';
import {
  Bloodtype as BloodtypeIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Email as EmailIcon,
  LocalHospital as LocalHospitalIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  Settings as AdminIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [userRole, setUserRole] = useState('donor');
  
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    
    // Hospital fields
    hospitalCode: '',
    hospitalName: '',
    hospitalAddress: '',
    hospitalLatitude: '',
    hospitalLongitude: '',
    licenseNumber: '',
    
    // Donor fields
    bloodType: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    latitude: '',
    longitude: '',
    
    // Manager/Admin fields
    employeeId: '',
    department: '',
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['male', 'female', 'other'];
  const departments = ['Operations', 'Logistics', 'Administration', 'Medical', 'IT'];

  const steps = ['Select Role', 'Account Details', 'Profile Information'];

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    if (activeStep === 0) return true;
    
    if (activeStep === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all account details');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      setError('');
      return true;
    }
    
    if (activeStep === 2) {
      if (userRole === 'donor') {
        if (!formData.fullName || !formData.bloodType || !formData.dateOfBirth || !formData.phone) {
          setError('Please fill in all donor information');
          return false;
        }
      } else if (userRole === 'hospital') {
        if (!formData.hospitalName || !formData.licenseNumber || !formData.hospitalCode || !formData.phone) {
          setError('Please fill in all hospital information');
          return false;
        }
      } else if (userRole === 'blood_bank_manager' || userRole === 'admin') {
        if (!formData.fullName || !formData.employeeId || !formData.department || !formData.phone) {
          setError('Please fill in all employee information');
          return false;
        }
        if (userRole === 'blood_bank_manager' && !formData.employeeId.match(/^BBM-\d{3}$/)) {
          setError('Employee ID must be in format: BBM-001 to BBM-999');
          return false;
        }
        if (userRole === 'admin' && !formData.employeeId.match(/^ADMIN-\d{3}$/)) {
          setError('Employee ID must be in format: ADMIN-001 to ADMIN-999');
          return false;
        }
      }
      setError('');
      return true;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    if (activeStep < steps.length - 1) {
      handleNext();
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store user data based on role
      const userData = {
        email: formData.email,
        role: userRole,
        createdAt: new Date().toISOString(),
      };
      
      if (userRole === 'donor') {
        userData.fullName = formData.fullName;
        userData.bloodType = formData.bloodType;
        userData.dateOfBirth = formData.dateOfBirth;
        userData.gender = formData.gender;
        userData.phone = formData.phone;
        userData.address = formData.address;
        userData.latitude = formData.latitude;
        userData.longitude = formData.longitude;
      } else if (userRole === 'hospital') {
        userData.hospitalName = formData.hospitalName;
        userData.hospitalCode = formData.hospitalCode;
        userData.licenseNumber = formData.licenseNumber;
        userData.address = formData.hospitalAddress;
        userData.phone = formData.phone;
        userData.latitude = formData.hospitalLatitude;
        userData.longitude = formData.hospitalLongitude;
        userData.isApproved = false;
      } else {
        userData.fullName = formData.fullName;
        userData.employeeId = formData.employeeId;
        userData.department = formData.department;
        userData.phone = formData.phone;
      }
      
      localStorage.setItem('bloodSuiteRegistration', JSON.stringify(userData));
      setSuccess('Registration successful! Please login.');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Select Your Role
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose the role that best describes you
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper
          elevation={userRole === 'donor' ? 4 : 1}
          sx={{
            p: 3,
            cursor: 'pointer',
            borderRadius: 2,
            border: userRole === 'donor' ? '2px solid #d32f2f' : '1px solid #e0e0e0',
            bgcolor: userRole === 'donor' ? '#fff5f5' : 'white',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
          }}
          onClick={() => setUserRole('donor')}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#d32f2f' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Donor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Register to donate blood and save lives
              </Typography>
            </Box>
          </Box>
          {userRole === 'donor' && (
            <CheckCircleIcon sx={{ color: '#d32f2f', position: 'absolute', top: 16, right: 16 }} />
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper
          elevation={userRole === 'hospital' ? 4 : 1}
          sx={{
            p: 3,
            cursor: 'pointer',
            borderRadius: 2,
            border: userRole === 'hospital' ? '2px solid #d32f2f' : '1px solid #e0e0e0',
            bgcolor: userRole === 'hospital' ? '#fff5f5' : 'white',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
          }}
          onClick={() => setUserRole('hospital')}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#d32f2f' }}>
              <LocalHospitalIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Hospital Staff
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage blood inventory and requests
              </Typography>
            </Box>
          </Box>
          {userRole === 'hospital' && (
            <CheckCircleIcon sx={{ color: '#d32f2f', position: 'absolute', top: 16, right: 16 }} />
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper
          elevation={userRole === 'blood_bank_manager' ? 4 : 1}
          sx={{
            p: 3,
            cursor: 'pointer',
            borderRadius: 2,
            border: userRole === 'blood_bank_manager' ? '2px solid #d32f2f' : '1px solid #e0e0e0',
            bgcolor: userRole === 'blood_bank_manager' ? '#fff5f5' : 'white',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
          }}
          onClick={() => setUserRole('blood_bank_manager')}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#d32f2f' }}>
              <BusinessIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Blood Bank Manager
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor analytics and forecast demand
              </Typography>
            </Box>
          </Box>
          {userRole === 'blood_bank_manager' && (
            <CheckCircleIcon sx={{ color: '#d32f2f', position: 'absolute', top: 16, right: 16 }} />
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper
          elevation={userRole === 'admin' ? 4 : 1}
          sx={{
            p: 3,
            cursor: 'pointer',
            borderRadius: 2,
            border: userRole === 'admin' ? '2px solid #d32f2f' : '1px solid #e0e0e0',
            bgcolor: userRole === 'admin' ? '#fff5f5' : 'white',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
          }}
          onClick={() => setUserRole('admin')}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#d32f2f' }}>
              <AdminIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                System Administrator
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Full system management and configuration
              </Typography>
            </Box>
          </Box>
          {userRole === 'admin' && (
            <CheckCircleIcon sx={{ color: '#d32f2f', position: 'absolute', top: 16, right: 16 }} />
          )}
        </Paper>
      </Grid>
    </Grid>
  );

  const renderAccountDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Account Information
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
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
                <EmailIcon sx={{ color: '#d32f2f' }} />
              </InputAdornment>
            ),
          }}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: '#d32f2f' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: '#d32f2f' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          required
        />
      </Grid>
    </Grid>
  );

  const renderDonorProfile = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Donor Information
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Full Name"
          name="fullName"
          value={formData.fullName}
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
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon sx={{ color: '#d32f2f' }} />
              </InputAdornment>
            ),
          }}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Blood Type</InputLabel>
          <Select
            name="bloodType"
            value={formData.bloodType}
            onChange={handleChange}
            label="Blood Type"
            required
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
          value={formData.dateOfBirth}
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
        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            label="Gender"
          >
            {genders.map(gender => (
              <MenuItem key={gender} value={gender}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Latitude"
          name="latitude"
          value={formData.latitude}
          onChange={handleChange}
          placeholder="e.g., -29.3167"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Longitude"
          name="longitude"
          value={formData.longitude}
          onChange={handleChange}
          placeholder="e.g., 27.4833"
        />
      </Grid>
    </Grid>
  );

  const renderHospitalProfile = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Hospital Information
        </Typography>
        <Alert severity="info" sx={{ mb: 2, bgcolor: '#fff5f5' }}>
          Registration requires admin approval. You will be notified once approved.
        </Alert>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Hospital Name"
          name="hospitalName"
          value={formData.hospitalName}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocalHospitalIcon sx={{ color: '#d32f2f' }} />
              </InputAdornment>
            ),
          }}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Hospital Code"
          name="hospitalCode"
          value={formData.hospitalCode}
          onChange={handleChange}
          placeholder="e.g., LS-BB-001"
          helperText="Format: LS-BB-001 to LS-BB-999"
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="License Number"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleChange}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon sx={{ color: '#d32f2f' }} />
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
          name="hospitalAddress"
          value={formData.hospitalAddress}
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
          name="hospitalLatitude"
          value={formData.hospitalLatitude}
          onChange={handleChange}
          placeholder="e.g., -29.3167"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Longitude"
          name="hospitalLongitude"
          value={formData.hospitalLongitude}
          onChange={handleChange}
          placeholder="e.g., 27.4833"
        />
      </Grid>
    </Grid>
  );

  const renderEmployeeProfile = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Employee Information
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Full Name"
          name="fullName"
          value={formData.fullName}
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
          label="Employee ID"
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          placeholder={userRole === 'blood_bank_manager' ? "BBM-001" : "ADMIN-001"}
          helperText={userRole === 'blood_bank_manager' ? "Format: BBM-001 to BBM-999" : "Format: ADMIN-001 to ADMIN-999"}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Department</InputLabel>
          <Select
            name="department"
            value={formData.department}
            onChange={handleChange}
            label="Department"
            required
          >
            {departments.map(dept => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon sx={{ color: '#d32f2f' }} />
              </InputAdornment>
            ),
          }}
          required
        />
      </Grid>
    </Grid>
  );

  const renderProfileInformation = () => {
    switch(userRole) {
      case 'donor':
        return renderDonorProfile();
      case 'hospital':
        return renderHospitalProfile();
      default:
        return renderEmployeeProfile();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50',
        p: 3,
        backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
      }}
    >
      <Fade in={true} timeout={800}>
        <Paper
          elevation={4}
          sx={{
            maxWidth: 800,
            width: '100%',
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 3,
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: '#d32f2f',
                mx: 'auto',
                mb: 2,
              }}
            >
              <BloodtypeIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f', mb: 1 }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join BloodSuite to help save lives
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Form Content */}
          {activeStep === 0 && renderRoleSelection()}
          {activeStep === 1 && renderAccountDetails()}
          {activeStep === 2 && renderProfileInformation()}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading}
              sx={{
                bgcolor: '#d32f2f',
                '&:hover': { bgcolor: '#b71c1c' },
                px: 4,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : activeStep === steps.length - 1 ? (
                'Register'
              ) : (
                'Next'
              )}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ color: '#d32f2f', textTransform: 'none' }}
              >
                Sign In
              </Button>
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              <SecurityIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
              Your information is secure and encrypted
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Register;