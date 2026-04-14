// src/pages/Hospital/Requests.js
import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  List as ListIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

const Requests = () => {
  const navigate = useNavigate();

  const requestActions = [
    {
      title: 'New Blood Request',
      description: 'Create a new request for blood units',
      icon: <AddIcon sx={{ fontSize: 40, color: '#d32f2f' }} />,
      action: () => navigate('/requests/new'),
      color: '#d32f2f',
    },
    {
      title: 'Track Requests',
      description: 'View and track status of existing requests',
      icon: <ListIcon sx={{ fontSize: 40, color: '#2196f3' }} />,
      action: () => navigate('/requests/track'),
      color: '#2196f3',
    },
    {
      title: 'Request History',
      description: 'View historical blood request data',
      icon: <TimelineIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
      action: () => navigate('/requests/history'),
      color: '#4caf50',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f', mb: 3 }}>
        Blood Requests Management
      </Typography>

      <Grid container spacing={3}>
        {requestActions.map((action, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: `2px solid ${action.color}20`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  border: `2px solid ${action.color}`,
                },
              }}
              onClick={action.action}
            >
              <Box sx={{ mb: 2 }}>
                {action.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {action.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {action.description}
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  mt: 2,
                  borderColor: action.color,
                  color: action.color,
                  '&:hover': {
                    borderColor: action.color,
                    bgcolor: `${action.color}08`,
                  },
                }}
              >
                {action.title.includes('New') ? 'Create' : 
                 action.title.includes('Track') ? 'View' : 'Analyze'}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: '#fafafa' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Quick Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Requests
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Processing
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fulfilled Today
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total This Month
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Requests;
