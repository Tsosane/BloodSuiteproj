// src/utils/constants.js

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const URGENCY_LEVELS = [
  { value: 'routine', label: 'Routine', color: '#2196f3', description: 'Standard request, fulfilled within 24-48 hours' },
  { value: 'urgent', label: 'Urgent', color: '#ff9800', description: 'Priority request, fulfilled within 4-8 hours' },
  { value: 'emergency', label: 'Emergency', color: '#f44336', description: 'Critical request, immediate fulfillment required' },
];

export const REQUEST_STATUSES = [
  { value: 'pending', label: 'Pending', color: '#ff9800' },
  { value: 'processing', label: 'Processing', color: '#2196f3' },
  { value: 'fulfilled', label: 'Fulfilled', color: '#4caf50' },
  { value: 'cancelled', label: 'Cancelled', color: '#9e9e9e' },
];

export const INVENTORY_STATUSES = [
  { value: 'available', label: 'Available', color: '#4caf50' },
  { value: 'reserved', label: 'Reserved', color: '#ff9800' },
  { value: 'used', label: 'Used', color: '#2196f3' },
  { value: 'expired', label: 'Expired', color: '#9e9e9e' },
];

export const TESTING_STATUSES = [
  { value: 'pending', label: 'Pending Testing', color: '#ff9800' },
  { value: 'passed', label: 'Passed', color: '#4caf50' },
  { value: 'failed', label: 'Failed', color: '#f44336' },
];

export const USER_ROLES = [
  { value: 'admin', label: 'System Administrator', icon: 'AdminPanelSettings' },
  { value: 'hospital', label: 'Hospital Staff', icon: 'LocalHospital' },
  { value: 'donor', label: 'Donor', icon: 'Person' },
  { value: 'blood_bank_manager', label: 'Blood Bank Manager', icon: 'Business' },
];

export const NOTIFICATION_TYPES = [
  { type: 'low_stock', label: 'Low Stock Alert', priority: 'high' },
  { type: 'expiry', label: 'Expiry Warning', priority: 'high' },
  { type: 'request', label: 'Blood Request', priority: 'critical' },
  { type: 'donor_match', label: 'Donor Match', priority: 'high' },
  { type: 'eligibility', label: 'Eligibility Restored', priority: 'medium' },
  { type: 'forecast', label: 'Forecast Alert', priority: 'critical' },
  { type: 'registration', label: 'New Registration', priority: 'medium' },
];

export const DONATION_RULES = {
  MIN_DAYS_BETWEEN_DONATIONS: 56,
  MAX_DONATIONS_PER_YEAR: 6,
  UNITS_PER_DONATION_ML: 450,
  LIVES_SAVED_PER_DONATION: 3,
  BLOOD_SHELF_LIFE_DAYS: 42,
};

export const STOCK_THRESHOLDS = {
  CRITICAL: 3,
  LOW: 5,
  OPTIMAL: 10,
};

export const EXPIRY_WARNINGS = {
  CRITICAL_DAYS: 3,
  WARNING_DAYS: 7,
};

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  INVENTORY: '/inventory',
  DONORS: '/donors',
  REQUESTS: '/requests',
  HOSPITALS: '/hospitals',
  NOTIFICATIONS: '/notifications',
  ANALYTICS: '/analytics',
  FORECAST: '/forecast',
};