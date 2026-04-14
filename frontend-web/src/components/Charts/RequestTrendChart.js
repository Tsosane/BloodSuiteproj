// src/components/Charts/RequestTrendChart.js
import React, { useState } from 'react';
import { Box, Paper, Typography, FormControl, Select, MenuItem, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon, BarChart as BarChartIcon, ShowChart as LineChartIcon } from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const RequestTrendChart = ({ data, title = 'Request Trends', height = 300 }) => {
  const [chartType, setChartType] = useState('line');
  const [period, setPeriod] = useState('6months');

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#d32f2f' }}>
            {title}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center" height={height - 80}>
          <Typography variant="body2" color="text.secondary">No data available</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#d32f2f' }}>
          {title}
        </Typography>
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Line Chart">
            <IconButton size="small" onClick={() => setChartType('line')} sx={{ color: chartType === 'line' ? '#d32f2f' : '#999' }}>
              <LineChartIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bar Chart">
            <IconButton size="small" onClick={() => setChartType('bar')} sx={{ color: chartType === 'bar' ? '#d32f2f' : '#999' }}>
              <BarChartIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <ResponsiveContainer width="100%" height={height - 80}>
        {chartType === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="requests" stroke="#d32f2f" strokeWidth={2} />
            <Line type="monotone" dataKey="fulfilled" stroke="#4caf50" strokeWidth={2} />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="requests" fill="#d32f2f" radius={[4, 4, 0, 0]} />
            <Bar dataKey="fulfilled" fill="#4caf50" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Paper>
  );
};

export default RequestTrendChart;