// src/utils/formatters.js

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatNumber = (number, decimals = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatPercentage = (value, decimals = 1) => {
  return `${formatNumber(value, decimals)}%`;
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

export const formatBloodTypeWithIcon = (bloodType) => {
  const type = bloodType?.toUpperCase() || '';
  const base = type[0] || '';
  const rh = type[1] === '-' ? 'Negative' : 'Positive';
  return { type: base, rh, full: type };
};

export const formatUrgency = (urgency) => {
  const urgencies = {
    routine: { label: 'Routine', color: '#2196f3', bg: '#e3f2fd' },
    urgent: { label: 'Urgent', color: '#ff9800', bg: '#fff3e0' },
    emergency: { label: 'Emergency', color: '#f44336', bg: '#ffebee' },
  };
  return urgencies[urgency] || { label: urgency, color: '#666', bg: '#f5f5f5' };
};

export const formatStatus = (status, type = 'default') => {
  const statuses = {
    // Request statuses
    pending: { label: 'Pending', color: '#ff9800', bg: '#fff3e0' },
    processing: { label: 'Processing', color: '#2196f3', bg: '#e3f2fd' },
    fulfilled: { label: 'Fulfilled', color: '#4caf50', bg: '#e8f5e9' },
    cancelled: { label: 'Cancelled', color: '#9e9e9e', bg: '#f5f5f5' },
    // Blood unit statuses
    available: { label: 'Available', color: '#4caf50', bg: '#e8f5e9' },
    reserved: { label: 'Reserved', color: '#ff9800', bg: '#fff3e0' },
    used: { label: 'Used', color: '#2196f3', bg: '#e3f2fd' },
    expired: { label: 'Expired', color: '#9e9e9e', bg: '#f5f5f5' },
    // Default
    default: { label: status, color: '#666', bg: '#f5f5f5' },
  };
  return statuses[status] || statuses.default;
};