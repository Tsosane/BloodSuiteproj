// src/components/Common/ExpiryWarning.js
import React from 'react';
import { Chip, Tooltip, Box, Typography } from '@mui/material';
import { Warning as WarningIcon, Error as ErrorIcon, CheckCircle as CheckIcon } from '@mui/icons-material';

const ExpiryWarning = ({ expiryDate, showLabel = true, size = 'small' }) => {
  const calculateDaysUntilExpiry = () => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = calculateDaysUntilExpiry();
  
  const getStatus = () => {
    if (daysLeft < 0) return { status: 'expired', color: '#9e9e9e', icon: <ErrorIcon />, label: 'Expired' };
    if (daysLeft < 3) return { status: 'critical', color: '#f44336', icon: <ErrorIcon />, label: `Expires in ${daysLeft} days` };
    if (daysLeft < 7) return { status: 'warning', color: '#ff9800', icon: <WarningIcon />, label: `Expires in ${daysLeft} days` };
    return { status: 'good', color: '#4caf50', icon: <CheckIcon />, label: `${daysLeft} days remaining` };
  };

  const status = getStatus();

  const getChipColor = () => {
    if (status.status === 'critical') return { bg: '#ffebee', color: '#f44336' };
    if (status.status === 'warning') return { bg: '#fff3e0', color: '#ff9800' };
    if (status.status === 'expired') return { bg: '#f5f5f5', color: '#9e9e9e' };
    return { bg: '#e8f5e9', color: '#4caf50' };
  };

  const chipColor = getChipColor();

  if (!showLabel) {
    return (
      <Tooltip title={status.label}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', color: status.color }}>
          {status.icon}
        </Box>
      </Tooltip>
    );
  }

  return (
    <Chip
      icon={status.icon}
      label={status.label}
      size={size}
      sx={{
        bgcolor: chipColor.bg,
        color: chipColor.color,
        fontWeight: 500,
        '& .MuiChip-icon': { color: chipColor.color },
      }}
    />
  );
};

export default ExpiryWarning;