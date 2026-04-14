// src/pages/Donor/EligibilityStatus.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Bloodtype as BloodIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const EligibilityStatus = () => {
  const [eligibility, setEligibility] = useState({
    isEligible: true,
    lastDonation: '2024-02-15',
    nextEligibleDate: null,
    daysUntilEligible: 0,
    totalDonations: 8,
    bloodType: 'O+',
    deferralReason: null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEligibilityStatus();
  }, []);

  const loadEligibilityStatus = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setEligibility({
          isEligible: true,
          lastDonation: '2024-02-15',
          nextEligibleDate: null,
          daysUntilEligible: 0,
          totalDonations: 8,
          bloodType: 'O+',
          deferralReason: null,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading eligibility status:', error);
      setLoading(false);
    }
  };

  const eligibilityCriteria = [
    { label: 'Minimum 56 days between donations', met: true },
    { label: 'Weight at least 50kg', met: true },
    { label: 'Hemoglobin level adequate', met: true },
    { label: 'No recent illnesses or medications', met: true },
    { label: 'No recent tattoos or piercings', met: true },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
        Blood Donation Eligibility Status
      </Typography>

      <Grid container spacing={3}>
        {/* Status Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {eligibility.isEligible ? (
                  <CheckIcon sx={{ color: 'success.main', mr: 1, fontSize: 28 }} />
                ) : (
                  <CancelIcon sx={{ color: 'error.main', mr: 1, fontSize: 28 }} />
                )}
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {eligibility.isEligible ? 'Eligible to Donate' : 'Not Eligible to Donate'}
                </Typography>
              </Box>

              <Chip
                label={eligibility.isEligible ? 'Eligible' : 'Not Eligible'}
                color={eligibility.isEligible ? 'success' : 'error'}
                sx={{ mb: 2 }}
              />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Donation
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {new Date(eligibility.lastDonation).toLocaleDateString()}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Blood Type
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BloodIcon sx={{ color: '#d32f2f', mr: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {eligibility.bloodType}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Donations
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {eligibility.totalDonations}
                </Typography>
              </Box>

              {!eligibility.isEligible && eligibility.nextEligibleDate && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Next eligible date: {new Date(eligibility.nextEligibleDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Days remaining: {eligibility.daysUntilEligible}
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Eligibility Criteria */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Eligibility Criteria
              </Typography>

              <List>
                {eligibilityCriteria.map((criteria, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {criteria.met ? (
                        <CheckIcon sx={{ color: 'success.main' }} />
                      ) : (
                        <CancelIcon sx={{ color: 'error.main' }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={criteria.label}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: criteria.met ? 'text.primary' : 'text.secondary',
                          textDecoration: criteria.met ? 'none' : 'line-through',
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <InfoIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  Eligibility is determined based on your medical history, recent donations, and current health status.
                  Please consult with medical staff before donating.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EligibilityStatus;