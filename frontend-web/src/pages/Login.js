// src/pages/Login.js - CONSISTENT RED/WHITE DESIGN WITH PROFESSIONAL CARDS FOR ALL ROLES
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
  Card,
  CardContent,
  Fade,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Badge as BadgeIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
  NotificationsActive as NotificationsIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('hospital');
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    hospitalCode: '',
    employeeId: '',
  });

  const hospitals = [
    { code: 'LS-BB-001', name: 'Queen Elizabeth II Hospital', location: 'Maseru' },
    { code: 'LS-BB-002', name: 'Scott Hospital', location: 'Maseru' },
    { code: 'LS-BB-003', name: 'Maseru Private Hospital', location: 'Maseru' },
    { code: 'LS-BB-004', name: 'Mokhotlong Hospital', location: 'Mokhotlong' },
    { code: 'LS-BB-005', name: 'Butha-Buthe Hospital', location: 'Butha-Buthe' },
  ];

  // Demo credentials for each role
  const demoCredentials = {
    hospital: { email: 'hospital@bloodsuite.org', password: 'hospital123', hospitalCode: 'LS-BB-001' },
    donor: { email: 'donor@bloodsuite.org', password: 'donor123' },
    blood_bank_manager: { email: 'manager@bloodsuite.org', password: 'manager123', employeeId: 'BBM-001' },
    admin: { email: 'admin@bloodsuite.org', password: 'admin123', employeeId: 'ADMIN-001' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!credentials.email || !credentials.password) {
        throw new Error('Please fill in email and password');
      }

      if (userRole === 'hospital') {
        if (!credentials.hospitalCode) {
          throw new Error('Please enter hospital code');
        }
        
        const hospital = hospitals.find(h => h.code === credentials.hospitalCode);
        if (!hospital) {
          throw new Error('Invalid hospital code. Please use format: LS-BB-001 to LS-BB-005');
        }
        
        localStorage.setItem('bloodSuiteToken', 'jwt-token-' + Date.now());
        localStorage.setItem('bloodSuiteHospital', hospital.name);
        localStorage.setItem('bloodSuiteHospitalCode', credentials.hospitalCode);
        localStorage.setItem('bloodSuiteHospitalId', hospital.code);
        localStorage.setItem('bloodSuiteUserEmail', credentials.email);
        localStorage.setItem('bloodSuiteUserRole', 'hospital');
        localStorage.setItem('bloodSuiteUserRoleDisplay', 'Hospital Staff');
        localStorage.setItem('bloodSuiteLastUser', credentials.email?.split('@')[0] || 'Hospital Staff');
        
      } else if (userRole === 'donor') {
        localStorage.setItem('bloodSuiteToken', 'jwt-token-' + Date.now());
        localStorage.setItem('bloodSuiteUserEmail', credentials.email);
        localStorage.setItem('bloodSuiteUserRole', 'donor');
        localStorage.setItem('bloodSuiteUserRoleDisplay', 'Donor');
        localStorage.setItem('bloodSuiteHospital', 'Donor Portal');
        localStorage.setItem('bloodSuiteLastUser', credentials.email?.split('@')[0] || 'Donor');
        
      } else if (userRole === 'blood_bank_manager') {
        if (!credentials.employeeId) {
          throw new Error('Please enter employee ID');
        }
        
        if (!credentials.employeeId.match(/^BBM-\d{3}$/)) {
          throw new Error('Invalid Employee ID format. Use format: BBM-001 to BBM-999');
        }
        
        localStorage.setItem('bloodSuiteToken', 'jwt-token-' + Date.now());
        localStorage.setItem('bloodSuiteUserEmail', credentials.email);
        localStorage.setItem('bloodSuiteEmployeeId', credentials.employeeId);
        localStorage.setItem('bloodSuiteUserRole', 'blood_bank_manager');
        localStorage.setItem('bloodSuiteUserRoleDisplay', 'Blood Bank Manager');
        localStorage.setItem('bloodSuiteHospital', 'Maseru Central Blood Bank');
        localStorage.setItem('bloodSuiteLastUser', credentials.email?.split('@')[0] || 'Manager');
        
      } else if (userRole === 'admin') {
        if (!credentials.employeeId) {
          throw new Error('Please enter employee ID');
        }
        
        if (!credentials.employeeId.match(/^ADMIN-\d{3}$/)) {
          throw new Error('Invalid Employee ID format. Use format: ADMIN-001 to ADMIN-999');
        }
        
        localStorage.setItem('bloodSuiteToken', 'jwt-token-' + Date.now());
        localStorage.setItem('bloodSuiteUserEmail', credentials.email);
        localStorage.setItem('bloodSuiteEmployeeId', credentials.employeeId);
        localStorage.setItem('bloodSuiteUserRole', 'admin');
        localStorage.setItem('bloodSuiteUserRoleDisplay', 'System Administrator');
        localStorage.setItem('bloodSuiteHospital', 'Blood Suite System Administration');
        localStorage.setItem('bloodSuiteLastUser', credentials.email?.split('@')[0] || 'Admin');
      }
      
      setIsAuthenticated(true);
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role, prefillData = null) => {
    if (prefillData) {
      setCredentials(prefillData);
      setUserRole(role);
      setTimeout(() => {
        handleSubmit(new Event('submit'));
      }, 300);
    } else {
      const demo = demoCredentials[role];
      if (demo) {
        setCredentials({
          email: demo.email,
          password: demo.password,
          hospitalCode: demo.hospitalCode || '',
          employeeId: demo.employeeId || '',
        });
        setUserRole(role);
        setTimeout(() => {
          handleSubmit(new Event('submit'));
        }, 300);
      }
    }
  };

  const handleHospitalQuickLogin = (hospitalCode) => {
    const hospital = hospitals.find(h => h.code === hospitalCode);
    setCredentials({
      email: `hospital@${hospitalCode.toLowerCase()}.org`,
      password: 'hospital123',
      hospitalCode: hospitalCode,
      employeeId: '',
    });
    setUserRole('hospital');
    
    setTimeout(() => {
      localStorage.setItem('bloodSuiteToken', 'jwt-token-' + hospitalCode + '-' + Date.now());
      localStorage.setItem('bloodSuiteHospital', hospital.name);
      localStorage.setItem('bloodSuiteHospitalCode', hospitalCode);
      localStorage.setItem('bloodSuiteHospitalId', hospitalCode);
      localStorage.setItem('bloodSuiteUserEmail', `hospital@${hospitalCode.toLowerCase()}.org`);
      localStorage.setItem('bloodSuiteUserRole', 'hospital');
      localStorage.setItem('bloodSuiteUserRoleDisplay', 'Hospital Staff');
      localStorage.setItem('bloodSuiteLastUser', 'Hospital Staff');
      setIsAuthenticated(true);
      navigate('/dashboard');
    }, 500);
  };

  // Role-specific professional card content
  const getRoleCards = () => {
    switch(userRole) {
      case 'hospital':
        return (
          <>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, color: '#d32f2f' }}>
              Select Your Hospital
            </Typography>
            <Grid container spacing={2}>
              {hospitals.map((hospital) => (
                <Grid item xs={12} key={hospital.code}>
                  <Card
                    elevation={2}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      border: '1px solid #e0e0e0',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                        borderColor: '#d32f2f',
                      },
                    }}
                    onClick={() => handleHospitalQuickLogin(hospital.code)}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: '#d32f2f' }}>
                          <LocalHospitalIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {hospital.name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                            <Typography variant="body2" color="text.secondary">
                              Code: {hospital.code}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <LocationIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                              {hospital.location}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label="Quick Login"
                          size="small"
                          sx={{ bgcolor: '#d32f2f', color: 'white' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        );

      case 'donor':
        return (
          <>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, color: '#d32f2f' }}>
              Donor Portal Features
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#d32f2f' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Eligibility Tracking
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Track your 56-day donation eligibility and next donation date
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#d32f2f' }}>
                        <HistoryIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Donation History
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          View your complete donation history and contribution impact
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#d32f2f' }}>
                        <NotificationsIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Emergency Alerts
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Receive notifications when your blood type is urgently needed
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        );

      case 'blood_bank_manager':
        return (
          <>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, color: '#d32f2f' }}>
              Manager Dashboard Features
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#d32f2f' }}>
                        <DashboardIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Real-time Analytics
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Monitor inventory levels, request trends, and donor statistics
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#d32f2f' }}>
                        <TimelineIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Demand Forecasting
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          AI-powered 7, 30, and 90-day demand predictions
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#d32f2f' }}>
                        <PeopleIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Donor Insights
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Analyze donor demographics and engagement patterns
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        );

      case 'admin':
        return (
          <>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, color: '#d32f2f' }}>
              Administration Features
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#d32f2f' }}>
                        <PeopleIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          User Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Create, edit, and manage all system users
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#d32f2f' }}>
                        <LocalHospitalIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Hospital Approvals
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Approve or reject new hospital registrations
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#d32f2f' }}>
                        <AssessmentIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          System Analytics
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Full system reports, audit logs, and performance metrics
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        );

      default:
        return null;
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
        <Grid container spacing={4} maxWidth="lg">
          {/* Left side - Login Form */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={4}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Logo */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: '#d32f2f',
                    mx: 'auto',
                    mb: 2,
                    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                  }}
                >
                  <BloodtypeIcon sx={{ fontSize: 48 }} />
                </Avatar>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#d32f2f', mb: 1 }}>
                  BloodSuite
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Smart Blood Bank Management System
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lesotho National Blood Service
                </Typography>
              </Box>

              {/* Error Message */}
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3, borderRadius: 2 }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                {/* Role Selection */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="role-select-label" sx={{ fontSize: 14 }}>
                    Login As
                  </InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={userRole}
                    onChange={(e) => {
                      setUserRole(e.target.value);
                      setCredentials({
                        email: '',
                        password: '',
                        hospitalCode: '',
                        employeeId: '',
                      });
                      setError('');
                    }}
                    label="Login As"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="hospital">
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <LocalHospitalIcon sx={{ fontSize: 20, color: '#d32f2f' }} />
                        <Typography>Hospital Staff</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="donor">
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <PersonIcon sx={{ fontSize: 20, color: '#d32f2f' }} />
                        <Typography>Donor</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="blood_bank_manager">
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <BusinessIcon sx={{ fontSize: 20, color: '#d32f2f' }} />
                        <Typography>Blood Bank Manager</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="admin">
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <AdminIcon sx={{ fontSize: 20, color: '#d32f2f' }} />
                        <Typography>System Administrator</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Hospital Code - Only for Hospital Staff */}
                {userRole === 'hospital' && (
                  <TextField
                    fullWidth
                    label="Hospital Code"
                    value={credentials.hospitalCode}
                    onChange={(e) => setCredentials({ ...credentials, hospitalCode: e.target.value })}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalHospitalIcon sx={{ color: '#d32f2f' }} />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="e.g., LS-BB-001"
                    helperText="Enter your hospital code (LS-BB-001 to LS-BB-005)"
                    required
                    sx={{ mb: 2 }}
                  />
                )}

                {/* Employee ID - Only for Manager and Admin */}
                {(userRole === 'blood_bank_manager' || userRole === 'admin') && (
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={credentials.employeeId}
                    onChange={(e) => setCredentials({ ...credentials, employeeId: e.target.value })}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ color: '#d32f2f' }} />
                        </InputAdornment>
                      ),
                    }}
                    placeholder={userRole === 'blood_bank_manager' ? "BBM-001" : "ADMIN-001"}
                    helperText={userRole === 'blood_bank_manager' ? "Format: BBM-001 to BBM-999" : "Format: ADMIN-001 to ADMIN-999"}
                    required
                    sx={{ mb: 2 }}
                  />
                )}

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#d32f2f' }} />
                      </InputAdornment>
                    ),
                  }}
                  placeholder={userRole === 'hospital' ? "hospital@bloodsuite.org" : 
                               userRole === 'donor' ? "donor@bloodsuite.org" :
                               userRole === 'blood_bank_manager' ? "manager@bloodsuite.org" : 
                               "admin@bloodsuite.org"}
                  required
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#d32f2f' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  required
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={isLoading}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    bgcolor: '#d32f2f',
                    '&:hover': {
                      bgcolor: '#b71c1c',
                    },
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    `Sign In as ${userRole === 'hospital' ? 'Hospital Staff' : 
                                 userRole === 'donor' ? 'Donor' : 
                                 userRole === 'blood_bank_manager' ? 'Blood Bank Manager' : 
                                 'System Administrator'}`
                  )}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    QUICK DEMO ACCESS
                  </Typography>
                </Divider>

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => handleDemoLogin('hospital')}
                      sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                    >
                      Hospital Demo
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => handleDemoLogin('donor')}
                      sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                    >
                      Donor Demo
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => handleDemoLogin('blood_bank_manager')}
                      sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                    >
                      Manager Demo
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => handleDemoLogin('admin')}
                      sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                    >
                      Admin Demo
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          {/* Right side - Professional Cards for All Roles */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%' }}>
              {/* Role-specific header */}
              <Paper
                elevation={2}
                sx={{
                  p: 2.5,
                  mb: 3,
                  borderRadius: 2,
                  bgcolor: '#fff5f5',
                  border: '1px solid #ffe0e0',
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  {userRole === 'hospital' && <LocalHospitalIcon sx={{ fontSize: 32, color: '#d32f2f' }} />}
                  {userRole === 'donor' && <PersonIcon sx={{ fontSize: 32, color: '#d32f2f' }} />}
                  {userRole === 'blood_bank_manager' && <BusinessIcon sx={{ fontSize: 32, color: '#d32f2f' }} />}
                  {userRole === 'admin' && <AdminIcon sx={{ fontSize: 32, color: '#d32f2f' }} />}
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                      {userRole === 'hospital' && 'Hospital Staff Portal'}
                      {userRole === 'donor' && 'Donor Portal'}
                      {userRole === 'blood_bank_manager' && 'Blood Bank Manager Portal'}
                      {userRole === 'admin' && 'System Administrator Portal'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {userRole === 'hospital' && 'Manage blood inventory, submit requests, and track donations'}
                      {userRole === 'donor' && 'Track eligibility, view donation history, and receive emergency alerts'}
                      {userRole === 'blood_bank_manager' && 'Monitor inventory, view analytics, and manage blood supply'}
                      {userRole === 'admin' && 'Full system administration, user management, and configuration'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Role-specific professional cards */}
              {getRoleCards()}

              {/* Security Footer - Consistent for all roles */}
              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: 2.5,
                  bgcolor: '#fafafa',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <SecurityIcon sx={{ color: '#d32f2f' }} />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                      Secure & HIPAA Compliant
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      All data is encrypted and protected. Secure authentication and authorization protocols ensure system integrity.
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Features Row */}
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BloodtypeIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                    <Typography variant="caption" color="text.secondary">Real-time Inventory</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                    <Typography variant="caption" color="text.secondary">Donor Matching</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocalHospitalIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                    <Typography variant="caption" color="text.secondary">Emergency Alerts</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AnalyticsIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                    <Typography variant="caption" color="text.secondary">Smart Analytics</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Fade>
    </Box>
  );
};

export default Login;