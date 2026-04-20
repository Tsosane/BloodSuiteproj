import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Bloodtype as BloodIcon,
  CheckCircle as CheckIcon,
  History as HistoryIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import useAuth from '../hooks/useAuth';
import donorService from '../services/donorService';
import inventoryService from '../services/inventoryService';
import requestService from '../services/requestService';
import AnalyticsDashboard from './Manager/AnalyticsDashboard';

const BLOOD_COLORS = {
  'O+': '#d32f2f',
  'O-': '#8e0000',
  'A+': '#ef6c00',
  'A-': '#ff9800',
  'B+': '#1976d2',
  'B-': '#42a5f5',
  'AB+': '#2e7d32',
  'AB-': '#66bb6a',
};

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <Card sx={{ borderTop: `4px solid ${color}`, height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        {icon}
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

const HospitalAnalyticsView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [inventoryResponse, requestResponse] = await Promise.all([
          inventoryService.getAllInventory(),
          requestService.getAllRequests(),
        ]);

        setInventory(inventoryResponse.data || []);
        setRequests(requestResponse.data || []);
      } catch (loadError) {
        console.error('Failed to load hospital analytics', loadError);
        setError(loadError.error || loadError.message || 'Unable to load hospital analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const inventoryByType = useMemo(() => {
    const counts = inventory.reduce((accumulator, item) => {
      if (item.status !== 'available') {
        return accumulator;
      }

      accumulator[item.blood_type] = (accumulator[item.blood_type] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: BLOOD_COLORS[name] || '#9e9e9e',
    }));
  }, [inventory]);

  const requestTimeline = useMemo(() => (
    requests
      .slice()
      .sort((a, b) => new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at))
      .map((request) => ({
        date: new Date(request.createdAt || request.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        quantity: Number(request.quantity_ml || 0),
      }))
  ), [requests]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress sx={{ color: '#d32f2f' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f', mb: 1 }}>
        Hospital Analytics
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Real-time analytics generated from your hospital inventory and request records.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!error && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Analytics loaded successfully from live hospital data.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Units"
            value={inventory.filter((item) => item.status === 'available').length}
            subtitle="Current usable blood units"
            icon={<BloodIcon sx={{ color: '#d32f2f' }} />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Requests"
            value={requests.filter((item) => item.status === 'pending').length}
            subtitle="Requests still awaiting action"
            icon={<TimelineIcon sx={{ color: '#fb8c00' }} />}
            color="#fb8c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Fulfilled Requests"
            value={requests.filter((item) => item.status === 'fulfilled').length}
            subtitle="Completed request records"
            icon={<CheckIcon sx={{ color: '#2e7d32' }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inventory Types"
            value={inventoryByType.length}
            subtitle="Blood types currently in stock"
            icon={<AssessmentIcon sx={{ color: '#1976d2' }} />}
            color="#1976d2"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f', mb: 2 }}>
              Inventory By Blood Type
            </Typography>
            {inventoryByType.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No inventory data is available yet.
              </Typography>
            ) : (
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value">
                      {inventoryByType.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f', mb: 2 }}>
              Request Timeline
            </Typography>
            {requestTimeline.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No request data is available yet.
              </Typography>
            ) : (
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={requestTimeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="quantity" stroke="#d32f2f" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const DonorAnalyticsView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [profileResponse, historyResponse] = await Promise.all([
          donorService.getMyProfile(),
          donorService.getDonationHistory(),
        ]);

        setProfile(profileResponse.data || null);
        setHistory(historyResponse.data || []);
      } catch (loadError) {
        console.error('Failed to load donor analytics', loadError);
        setError(loadError.error || loadError.message || 'Unable to load donor analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const donationTrend = history
    .slice()
    .reverse()
    .map((item) => ({
      date: new Date(item.collection_date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
      quantity: Number(item.quantity_ml || 0),
    }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress sx={{ color: '#d32f2f' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f', mb: 1 }}>
        Donor Analytics
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Personal donation insights from your live donor record.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!error && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Donation analytics loaded successfully.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Blood Type"
            value={profile?.blood_type || 'Unknown'}
            subtitle="Your registered donor type"
            icon={<BloodIcon sx={{ color: '#d32f2f' }} />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Donation Count"
            value={profile?.donation_count || 0}
            subtitle="Recorded donations"
            icon={<HistoryIcon sx={{ color: '#1976d2' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Last Donation"
            value={profile?.last_donation_date || 'Never'}
            subtitle="Most recent recorded donation"
            icon={<TimelineIcon sx={{ color: '#fb8c00' }} />}
            color="#fb8c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Eligibility"
            value={profile?.eligibility?.is_eligible ? 'Eligible' : 'Waiting'}
            subtitle={profile?.eligibility?.next_eligible_date || 'Can donate now'}
            icon={<CheckIcon sx={{ color: '#2e7d32' }} />}
            color="#2e7d32"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f', mb: 2 }}>
          Donation Volume Trend
        </Typography>
        {donationTrend.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No donation records are available yet.
          </Typography>
        ) : (
          <Box sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="quantity" fill="#d32f2f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

const Analytics = () => {
  const { user } = useAuth();
  const role = user?.role || localStorage.getItem('bloodSuiteUserRole');

  if (role === 'admin' || role === 'blood_bank_manager') {
    return <AnalyticsDashboard />;
  }

  if (role === 'hospital') {
    return <HospitalAnalyticsView />;
  }

  if (role === 'donor') {
    return <DonorAnalyticsView />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="warning">Analytics are not available for this account yet.</Alert>
    </Box>
  );
};

export default Analytics;
