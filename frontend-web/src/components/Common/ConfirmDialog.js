// src/components/Common/ConfirmDialog.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // warning, danger, info, success
  loading = false,
}) => {
  const getTypeConfig = () => {
    switch(type) {
      case 'danger':
        return {
          icon: <ErrorIcon sx={{ fontSize: 40, color: '#f44336' }} />,
          confirmColor: '#f44336',
          confirmHover: '#d32f2f',
          bgColor: '#ffebee',
        };
      case 'warning':
        return {
          icon: <WarningIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
          confirmColor: '#ff9800',
          confirmHover: '#ed6c02',
          bgColor: '#fff3e0',
        };
      case 'success':
        return {
          icon: <CheckIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
          confirmColor: '#4caf50',
          confirmHover: '#2e7d32',
          bgColor: '#e8f5e9',
        };
      default:
        return {
          icon: <InfoIcon sx={{ fontSize: 40, color: '#2196f3' }} />,
          confirmColor: '#2196f3',
          confirmHover: '#1976d2',
          bgColor: '#e3f2fd',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: config.bgColor, pb: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          {config.icon}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <DialogContentText color="text.secondary">
          {message}
        </DialogContentText>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{
            borderColor: '#d32f2f',
            color: '#d32f2f',
            '&:hover': { borderColor: '#b71c1c', backgroundColor: '#fff5f5' },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: config.confirmColor,
            '&:hover': { bgcolor: config.confirmHover },
          }}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;