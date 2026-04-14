// src/pages/Donor/DonationHistory.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  History as HistoryIcon,
  Bloodtype as BloodIcon,
  LocalHospital as HospitalIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  GetApp as ExportIcon,
  TrendingUp as TrendingUpIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalVolume: 0,
    averageFrequency: 0,
    lastDonation: null,
    yearsActive: 0,
  });

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = () => {
    // Demo donation history
    const demoDonations = [
      { id: 1, date: '2024-02-15', hospital: 'Queen Elizabeth II Hospital', bloodType: 'O+', quantity: 450, status: 'completed', notes: 'Regular donation' },
      { id: 2, date: '2023-12-20', hospital: 'Scott Hospital', bloodType: 'O+', quantity: 450, status: 'completed', notes: 'Holiday drive' },
      { id: 3, date: '2023-10-25', hospital: 'Maseru Private Hospital', bloodType: 'O+', quantity: 450, status: 'completed', notes: 'Emergency response' },
      { id: 4, date: '2023-08-30', hospital: 'Queen Elizabeth II Hospital', bloodType: 'O+', quantity: 450, status: 'completed', notes: 'Regular donation' },
      { id: 5, date: '2023-06-15', hospital: 'Scott Hospital', bloodType: 'O+', quantity: 450, status: 'completed', notes: 'Regular donation' },
      { id: 6, date: '2023-04-10', hospital: 'Mokhotlong Hospital', bloodType: 'O+', quantity: 450, status: 'completed', notes: 'Mobile donation drive' },
      { id: 7, date: '2023-02-05', hospital: 'Queen Elizabeth II Hospital', bloodType: 'O+', quantity: 450, status: 'completed', notes: 'Regular donation' },
      { id: 8, date: '2022-12-01', hospital: 'Butha-Buthe Hospital', bloodType: 'O+', quantity: 450, status: 'completed', notes: 'Year-end campaign' },
    ];
    setDonations(demoDonations);
    setFilteredDonations(demoDonations);
    calculateStats(demoDonations);
  };

  const calculateStats = (data) => {
    const totalDonations = data.length;
    const totalVolume = data.reduce((sum, d) => sum + d.quantity, 0);
    const firstDonation = data[data.length - 1]?.date;
    const yearsActive = firstDonation ? Math.floor((new Date() - new Date(firstDonation)) / (1000 * 60 * 60 * 24 * 365)) : 0;
    const averageFrequency = yearsActive > 0 ? (totalDonations / yearsActive).toFixed(1) : 0;
    
    setStats({
      totalDonations,
      totalVolume,
      averageFrequency,
      lastDonation: data[0]?.date || null,
      yearsActive,
    });
  };

  useEffect(() => {
    let filtered = donations;
    
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.hospital.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (yearFilter !== 'all') {
      filtered = filtered.filter(d => d.date.startsWith(yearFilter));
    }
    
    setFilteredDonations(filtered);
  }, [searchTerm, yearFilter, donations]);

  const years = [...new Set(donations.map(d => d.date.split('-')[0]))].sort().reverse();

  const chartData = donations.reduce((acc, donation) => {
    const month = donation.date.substring(0, 7);
    const existing = acc.find(a => a.month === month);
    if (existing) {
      existing.donations++;
      existing.volume += donation.quantity;
    } else {
      acc.push({ month, donations: 1, volume: donation.quantity });
    }
    return acc;
  }, []).reverse();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f', mb: 3 }}>
        Donation History
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: '4px solid #d32f2f' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Donations</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalDonations}</Typography>
                </Box>
                <HistoryIcon sx={{ fontSize: 48, color: '#d32f2f', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: '4px solid #2e7d32' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Volume</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalVolume} ml</Typography>
                </Box>
                <BloodIcon sx={{ fontSize: 48, color: '#2e7d32', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: '4px solid #ff9800' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Avg. Frequency</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.averageFrequency}/year</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: '#ff9800', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: '4px solid #2196f3' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Last Donation</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.lastDonation || 'Never'}</Typography>
                </Box>
                <CalendarIcon sx={{ fontSize: 48, color: '#2196f3', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Donation Trend Chart */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Donation Trend
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <RechartsTooltip />
            <Line yAxisId="left" type="monotone" dataKey="donations" stroke="#d32f2f" name="Donations" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#2e7d32" name="Volume (ml)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                label="Year"
              >
                <MenuItem value="all">All Years</MenuItem>
                {years.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ExportIcon />}
              sx={{ borderColor: '#d32f2f', color: '#d32f2f' }}
            >
              Export History
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Donations Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Date</TableCell>
                <TableCell>Hospital</TableCell>
                <TableCell>Blood Type</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDonations.map((donation) => (
                <TableRow key={donation.id} hover>
                  <TableCell>{donation.date}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <HospitalIcon sx={{ fontSize: 16, color: '#d32f2f' }} />
                      {donation.hospital}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={donation.bloodType} size="small" sx={{ bgcolor: '#d32f2f20', color: '#d32f2f' }} />
                  </TableCell>
                  <TableCell align="right">{donation.quantity} ml</TableCell>
                  <TableCell>
                    <Chip
                      label={donation.status}
                      size="small"
                      sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                    />
                  </TableCell>
                  <TableCell>{donation.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {filteredDonations.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No donation records found
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Impact Message */}
      <Paper sx={{ mt: 3, p: 3, bgcolor: '#fff5f5', borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <FavoriteIcon sx={{ fontSize: 48, color: '#d32f2f' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#d32f2f' }}>
              Your Impact
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You have donated {stats.totalVolume} ml of blood, which can help save up to {Math.ceil(stats.totalVolume / 450) * 3} lives!
              Thank you for being a hero.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default DonationHistory;