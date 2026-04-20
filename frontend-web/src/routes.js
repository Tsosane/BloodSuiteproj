// src/routes.js
export const ROUTES = {
  // Public Routes
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_HOSPITALS_PENDING: '/admin/hospitals/pending',
  ADMIN_DATA_IMPORT: '/admin/data-import',
  
  // Hospital Routes
  HOSPITAL_DASHBOARD: '/hospital/dashboard',
  INVENTORY: '/inventory',
  INVENTORY_ADD: '/inventory/add',
  REQUESTS_NEW: '/requests/new',
  REQUESTS_TRACK: '/requests/track',
  REQUESTS_HISTORY: '/requests/history',
  DONORS_NEARBY: '/donors/nearby',
  
  // Donor Routes
  DONOR_DASHBOARD: '/donor/dashboard',
  PROFILE: '/profile',
  DONATIONS: '/donations',
  ELIGIBILITY: '/eligibility',
  SCHEDULE_DONATION: '/schedule-donation',
  
  // Manager Routes
  MANAGER_DASHBOARD: '/manager/dashboard',
  ANALYTICS: '/analytics',
  FORECAST: '/analytics/forecast',
  EXPORT: '/analytics/export',
  SETTINGS: '/settings',
  HELP: '/help',
  
  // Common
  DASHBOARD: '/dashboard',
};

export const getDashboardRoute = (role) => {
  switch(role) {
    case 'admin':
      return ROUTES.ADMIN_DASHBOARD;
    case 'hospital':
      return ROUTES.HOSPITAL_DASHBOARD;
    case 'donor':
      return ROUTES.DONOR_DASHBOARD;
    case 'blood_bank_manager':
      return ROUTES.MANAGER_DASHBOARD;
    default:
      return ROUTES.LOGIN;
  }
};

export const isRouteAccessible = (route, role) => {
  const adminRoutes = [ROUTES.ADMIN_DASHBOARD, ROUTES.ADMIN_USERS, ROUTES.ADMIN_HOSPITALS_PENDING, ROUTES.ADMIN_DATA_IMPORT];
  const hospitalRoutes = [ROUTES.HOSPITAL_DASHBOARD, ROUTES.INVENTORY, ROUTES.INVENTORY_ADD, ROUTES.REQUESTS_NEW, ROUTES.REQUESTS_TRACK, ROUTES.REQUESTS_HISTORY, ROUTES.DONORS_NEARBY, ROUTES.SETTINGS, ROUTES.HELP];
  const donorRoutes = [ROUTES.DONOR_DASHBOARD, ROUTES.PROFILE, ROUTES.DONATIONS, ROUTES.ELIGIBILITY, ROUTES.SCHEDULE_DONATION, ROUTES.SETTINGS, ROUTES.HELP];
  const managerRoutes = [ROUTES.MANAGER_DASHBOARD, ROUTES.ANALYTICS, ROUTES.FORECAST, ROUTES.EXPORT, ROUTES.SETTINGS, ROUTES.HELP];
  const commonRoutes = [ROUTES.SETTINGS, ROUTES.HELP];
  
  if (role === 'admin') return true;
  if (commonRoutes.includes(route)) return true;
  if (role === 'hospital') return hospitalRoutes.includes(route);
  if (role === 'donor') return donorRoutes.includes(route);
  if (role === 'blood_bank_manager') return managerRoutes.includes(route);
  return false;
};