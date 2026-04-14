// src/components/Charts/InventoryChart.js
import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const InventoryChart = ({ data, type = 'pie', title, height = 300 }) => {
  const theme = useTheme();
  const colors = ['#d32f2f', '#ff9800', '#2196f3', '#4caf50', '#9c27b0', '#795548', '#607d8b', '#e91e63'];

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#d32f2f' }}>
          {title || 'Inventory Distribution'}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center" height={height - 80}>
          <Typography variant="body2" color="text.secondary">No data available</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#d32f2f' }}>
        {title || 'Inventory Distribution'}
      </Typography>
      <ResponsiveContainer width="100%" height={height - 60}>
        {type === 'pie' ? (
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
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#d32f2f" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Paper>
  );
};

export default InventoryChart;