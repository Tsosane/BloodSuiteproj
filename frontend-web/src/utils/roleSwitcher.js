// Role switching utility for development testing
// Open browser console and use these functions to switch between user roles

import { setupDemoUser, clearDemoUser } from './demoAuth.js';

window.switchToRole = (role) => {
  clearDemoUser();
  setupDemoUser(role);
  window.location.reload();
};

window.switchToAdmin = () => window.switchToRole('admin');
window.switchToHospital = () => window.switchToRole('hospital');
window.switchToDonor = () => window.switchToRole('donor');
window.switchToManager = () => window.switchToRole('blood_bank_manager');

console.log('🎭 Role Switcher Loaded!');
console.log('Available commands:');
console.log('  switchToAdmin() - Switch to System Administrator');
console.log('  switchToHospital() - Switch to Hospital Staff');
console.log('  switchToDonor() - Switch to Blood Donor');
console.log('  switchToManager() - Switch to Blood Bank Manager');
console.log('  switchToRole("role") - Switch to specific role');
console.log('Current role:', localStorage.getItem('bloodSuiteUserRole'));
