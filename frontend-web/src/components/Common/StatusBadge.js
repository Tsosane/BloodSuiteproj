// src/components/Common/StatusBadge.js
import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  Check as FulfilledIcon,
  Pending as ProcessingIcon,
} from '@mui/icons-material';

const StatusBadge = ({ status, type = 'default', size = 'small', showIcon = true }) => {
  const getStatusConfig = () => {
    const configs = {
      // Request statuses
      pending: { label: 'Pending', color: '#ff9800', bg: '#fff3e0', icon: <PendingIcon /> },
      processing: { label: 'Processing', color: '#2196f3', bg: '#e3f2fd', icon: <ProcessingIcon /> },
      fulfilled: { label: 'Fulfilled', color: '#4caf50', bg: '#e8f5e9', icon: <FulfilledIcon /> },
      cancelled: { label: 'Cancelled', color: '#9e9e9e', bg: '#f5f5f5', icon: <CancelIcon /> },
      
      // Blood unit statuses
      available: { label: 'Available', color: '#4caf50', bg: '#e8f5e9', icon: <CheckIcon /> },
      reserved: { label: 'Reserved', color: '#ff9800', bg: '#fff3e0', icon: <WarningIcon /> },
      used: { label: 'Used', color: '#2196f3', bg: '#e3f2fd', icon: <CheckIcon /> },
      expired: { label: 'Expired', color: '#9e9e9e', bg: '#f5f5f5', icon: <CancelIcon /> },
      
      // User statuses
      active: { label: 'Active', color: '#4caf50', bg: '#e8f5e9', icon: <CheckIcon /> },
      inactive: { label: 'Inactive', color: '#9e9e9e', bg: '#f5f5f5', icon: <CancelIcon /> },
      pending_approval: { label: 'Pending Approval', color: '#ff9800', bg: '#fff3e0', icon: <PendingIcon /> },
      approved: { label: 'Approved', color: '#4caf50', bg: '#e8f5e9', icon: <CheckIcon /> },
      rejected: { label: 'Rejected', color: '#f44336', bg: '#ffebee', icon: <CancelIcon /> },
      
      // Donor eligibility
      eligible: { label: 'Eligible', color: '#4caf50', bg: '#e8f5e9', icon: <CheckIcon /> },
      not_eligible: { label: 'Not Eligible', color: '#f44336', bg: '#ffebee', icon: <CancelIcon /> },
      
      // Testing status
      testing_pending: { label: 'Testing Pending', color: '#ff9800', bg: '#fff3e0', icon: <PendingIcon /> },
      testing_passed: { label: 'Passed', color: '#4caf50', bg: '#e8f5e9', icon: <CheckIcon /> },
      testing_failed: { label: 'Failed', color: '#f44336', bg: '#ffebee', icon: <CancelIcon /> },
      
      // Default
      default: { label: status, color: '#666', bg: '#f5f5f5', icon: null },
    };
    
    return configs[status] || configs.default;
  };

  const config = getStatusConfig();

  return (
    <Chip
      icon={showIcon && config.icon}
      label={config.label}
      size={size}
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 500,
        '& .MuiChip-icon': { color: config.color, fontSize: size === 'small' ? 16 : 20 },
      }}
    />
  );
};

export default StatusBadge;