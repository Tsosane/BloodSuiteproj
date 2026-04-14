// src/components/Charts/DonorStatsChart.js
import React, { useState } from 'react';
import { Box, Paper, Typography, FormControl, Select, MenuItem, Tooltip, IconButton } from '@mui/material';
import { Refresh as RefreshIcon, Group as GroupIcon } from '@mui/icons-material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DonorStatsChart = ({ data, type = 'growth', title = 'Donor Statistics', height = 300 }) => {
  const [chartType, setChartType] = useState(type);

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#d32f2f' }}>
          {title}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center" height={height - 80}>
          <Typography variant="body2" color="text.secondary">No data available</Typography>
        </Box>
      </Paper>
    );
  }

  const colors = ['#d32f2f', '#ff9800', '#2196f3', '#4caf50', '#9c27b0'];

  const renderChart = () => {
    if (chartType === 'bloodType') {
      return (
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      );
    }

    return (
      <>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <RechartsTooltip />
        <Legend />
        <Bar dataKey="donors" fill="#d32f2f" radius={[4, 4, 0, 0]} />
      </>
    );
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#d32f2f' }}>
          {title}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value={chartType} onChange={(e) => setChartType(e.target.value)}>
            <MenuItem value="growth">Donor Growth</MenuItem>
            <MenuItem value="bloodType">By Blood Type</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <ResponsiveContainer width="100%" height={height - 80}>
        <BarChart data={data}>
          {renderChart()}
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default DonorStatsChart;