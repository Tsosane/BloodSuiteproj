// Demo authentication utility for development
export const setupDemoUser = (role = 'donor') => {
  const demoUsers = {
    admin: {
      id: '1',
      name: 'Admin User',
      email: 'admin@bloodsuite.com',
      role: 'admin',
      roleDisplay: 'System Administrator',
      hospitalName: null,
      hospitalId: null,
    },
    hospital: {
      id: '2',
      name: 'Dr. Sarah Johnson',
      email: 'hospital@bloodsuite.com',
      role: 'hospital',
      roleDisplay: 'Hospital Staff',
      hospitalName: 'Queen Elizabeth II Hospital',
      hospitalId: 'LS-BB-001',
    },
    donor: {
      id: '3',
      name: 'John Doe',
      email: 'donor@bloodsuite.com',
      role: 'donor',
      roleDisplay: 'Blood Donor',
      hospitalName: null,
      hospitalId: null,
    },
    blood_bank_manager: {
      id: '4',
      name: 'Manager User',
      email: 'manager@bloodsuite.com',
      role: 'blood_bank_manager',
      roleDisplay: 'Blood Bank Manager',
      hospitalName: 'National Blood Bank',
      hospitalId: 'LS-BB-MAIN',
    },
  };

  const user = demoUsers[role];
  if (!user) return;

  // Set mock token
  localStorage.setItem('bloodSuiteToken', 'demo-token-' + Date.now());
  localStorage.setItem('bloodSuiteUserId', user.id);
  localStorage.setItem('bloodSuiteUserName', user.name);
  localStorage.setItem('bloodSuiteUserEmail', user.email);
  localStorage.setItem('bloodSuiteUserRole', user.role);
  localStorage.setItem('bloodSuiteUserRoleDisplay', user.roleDisplay);
  localStorage.setItem('bloodSuiteHospital', user.hospitalName);
  localStorage.setItem('bloodSuiteHospitalId', user.hospitalId);

  console.log(`Demo user setup complete: ${user.name} (${user.role})`);
  return user;
};

export const clearDemoUser = () => {
  localStorage.removeItem('bloodSuiteToken');
  localStorage.removeItem('bloodSuiteUserId');
  localStorage.removeItem('bloodSuiteUserName');
  localStorage.removeItem('bloodSuiteUserEmail');
  localStorage.removeItem('bloodSuiteUserRole');
  localStorage.removeItem('bloodSuiteUserRoleDisplay');
  localStorage.removeItem('bloodSuiteHospital');
  localStorage.removeItem('bloodSuiteHospitalId');
  console.log('Demo user cleared');
};

// Auto-setup demo user if no token exists
export const autoSetupDemo = () => {
  const token = localStorage.getItem('bloodSuiteToken');
  if (!token) {
    console.log('No token found, setting up demo donor user');
    return setupDemoUser('donor');
  }
  return null;
};
