// scripts/seed.js
const { sequelize } = require('../src/config/database');
const { User, Donor, Hospital, BloodInventory, Request } = require('../src/models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create admin user
    const admin = await User.create({
      email: 'admin@bloodsuite.org',
      password_hash: await bcrypt.hash('admin123', 10),
      role: 'admin',
      is_active: true,
    });

    // Create hospital user
    const hospitalUser = await User.create({
      email: 'hospital@qeh.org.ls',
      password_hash: await bcrypt.hash('hospital123', 10),
      role: 'hospital',
      is_active: true,
    });

    const hospital = await Hospital.create({
      user_id: hospitalUser.id,
      hospital_name: 'Queen Elizabeth II Hospital',
      license_number: 'LS-HOS-001',
      address: '123 Main Street, Maseru',
      phone: '+266 2233 4455',
      latitude: -29.3167,
      longitude: 27.4833,
      is_approved: true,
    });

    // Create donor user
    const donorUser = await User.create({
      email: 'donor@example.com',
      password_hash: await bcrypt.hash('donor123', 10),
      role: 'donor',
      is_active: true,
    });

    const donor = await Donor.create({
      user_id: donorUser.id,
      full_name: 'John Doe',
      blood_type: 'O+',
      phone: '+266 1234 5678',
      latitude: -29.3100,
      longitude: 27.4800,
      donation_count: 5,
    });

    // Create blood inventory
    await BloodInventory.create({
      hospital_id: hospital.id,
      donor_id: donor.id,
      blood_type: 'O+',
      quantity_ml: 450,
      collection_date: '2024-03-01',
      expiry_date: '2024-04-12',
      status: 'available',
      testing_status: 'passed',
    });

    await BloodInventory.create({
      hospital_id: hospital.id,
      blood_type: 'A+',
      quantity_ml: 450,
      collection_date: '2024-03-05',
      expiry_date: '2024-04-16',
      status: 'available',
      testing_status: 'passed',
    });

    // Create blood request
    await Request.create({
      hospital_id: hospital.id,
      blood_type: 'O-',
      quantity_ml: 450,
      urgency: 'emergency',
      status: 'pending',
      patient_name: 'Test Patient',
      required_date: '2024-04-01',
    });

    console.log('✅ Seed data inserted successfully');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@bloodsuite.org / admin123');
    console.log('Hospital: hospital@qeh.org.ls / hospital123');
    console.log('Donor: donor@example.com / donor123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();