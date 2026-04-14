import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const Help = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f', mb: 2 }}>
      Help & Support
    </Typography>
    <Paper sx={{ p: 3 }}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Welcome to the support center for BloodSuite. Use the resources below to navigate the system.
      </Typography>
      <List>
        <ListItem>
          <ListItemText
            primary="Getting Started"
            secondary="Login or register, then navigate to your dashboard based on your role."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Blood Requests"
            secondary="Hospital staff can create and track blood requests. Managers can review forecast reports."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Forecast Reports"
            secondary="Forecasts are generated from historical demand data and inventory status."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Need more help?"
            secondary="Contact your system administrator or review the project documentation."
          />
        </ListItem>
      </List>
    </Paper>
  </Box>
);

export default Help;
