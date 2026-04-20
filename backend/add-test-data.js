// Quick data addition script
const { sequelize } = require('./src/config/database');
const { User, Donor, Hospital, BloodInventory, Request } = require('./src/models');
const bcrypt = require('bcryptjs');

async function addTestData() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Create manager user if not exists
    let manager = await User.findOne({ where: { email: 'manager@bloodsuite.org' } });
    if (!manager) {
      manager = await User.create({
        email: 'manager@bloodsuite.org',
        password_hash: await bcrypt.hash('manager123', 10),
        role: 'blood_bank_manager',
        is_active: true,
      });
      console.log('Manager user created');
    }

    // Get hospital
    const hospital = await Hospital.findOne();
    if (!hospital) {
      console.log('No hospital found, creating one...');
      const hospitalUser = await User.create({
        email: 'hospital@test.org',
        password_hash: await bcrypt.hash('hospital123', 10),
        role: 'hospital',
        is_active: true,
      });

      const newHospital = await Hospital.create({
        user_id: hospitalUser.id,
        hospital_name: 'Test Hospital',
        license_number: 'TEST-001',
        address: '123 Test Street',
        phone: '+1234567890',
        latitude: -29.3167,
        longitude: 27.4833,
        is_approved: true,
      });
      hospital = newHospital;
    }

    // Add blood inventory
    console.log('Adding blood inventory...');
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const today = new Date();

    for (let i = 0; i < 20; i++) {
      const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
      const collectionDate = new Date(today);
      collectionDate.setDate(today.getDate() - Math.floor(Math.random() * 30));

      const expiryDate = new Date(collectionDate);
      expiryDate.setDate(collectionDate.getDate() + 35);

      await BloodInventory.create({
        hospital_id: hospital.id,
        blood_type: bloodType,
        quantity_ml: 450,
        collection_date: collectionDate.toISOString().split('T')[0],
        expiry_date: expiryDate.toISOString().split('T')[0],
        storage_location: `Fridge ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}${Math.floor(Math.random() * 10) + 1}`,
        testing_status: 'passed',
        status: 'available',
      });
    }

    // Add blood requests
    console.log('Adding blood requests...');
    for (let i = 0; i < 10; i++) {
      const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
      const requiredDate = new Date(today);
      requiredDate.setDate(today.getDate() + Math.floor(Math.random() * 7) + 1);

      await Request.create({
        hospital_id: hospital.id,
        blood_type: bloodType,
        quantity_ml: Math.floor(Math.random() * 3 + 1) * 450,
        urgency: Math.random() > 0.7 ? 'emergency' : Math.random() > 0.4 ? 'urgent' : 'routine',
        status: 'pending',
        patient_name: `Patient ${i + 1}`,
        patient_age: Math.floor(Math.random() * 80) + 18,
        required_date: requiredDate.toISOString().split('T')[0],
      });
    }

    console.log('✅ Test data added successfully!');
    console.log('Manager login: manager@bloodsuite.org / manager123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding data:', error.message);
    process.exit(1);
  }
}

addTestData();