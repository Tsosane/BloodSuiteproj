import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';

const Settings = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f', mb: 2 }}>
      Settings
    </Typography>
    <Paper sx={{ p: 3 }}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        This area contains system preferences, account settings, and notification controls.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Settings are not yet fully customized in this demo, but the navigation and page structure are complete.
        Use this screen to add user profile settings, notification preferences, and system options.
      </Typography>
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Account Management</Typography>
      <Typography variant="body2" color="text.secondary">
        You can extend this page to allow password changes, email verification, and role-specific controls.
      </Typography>
    </Paper>
  </Box>
);

export default Settings;
