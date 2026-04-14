import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Chip,
} from '@mui/material';
import requestService from '../../services/requestService';

const statusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'fulfilled': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, processing: 0, fulfilled: 0, cancelled: 0 });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const result = await requestService.getAllRequests();
        if (result.success) {
          const data = result.data || [];
          setRequests(data.slice(0, 15));
          setStats({
            pending: data.filter((item) => item.status === 'pending').length,
            processing: data.filter((item) => item.status === 'processing').length,
            fulfilled: data.filter((item) => item.status === 'fulfilled').length,
            cancelled: data.filter((item) => item.status === 'cancelled').length,
          });
        }
      } catch (error) {
        console.error('Could not load request history', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f', mb: 3 }}>
        Request History
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: '#fce4ec' }}>
            <Typography variant="subtitle2" color="text.secondary">Pending</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.pending}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
            <Typography variant="subtitle2" color="text.secondary">Processing</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.processing}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
            <Typography variant="subtitle2" color="text.secondary">Fulfilled</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.fulfilled}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
            <Typography variant="subtitle2" color="text.secondary">Cancelled</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.cancelled}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Blood Type</TableCell>
                <TableCell>Quantity (ml)</TableCell>
                <TableCell>Urgency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Hospital</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{request.blood_type}</TableCell>
                  <TableCell>{request.quantity_ml}</TableCell>
                  <TableCell>{request.urgency}</TableCell>
                  <TableCell>
                    <Chip label={request.status} color={statusColor(request.status)} size="small" />
                  </TableCell>
                  <TableCell>{request.hospital?.hospital_name || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default RequestHistory;
