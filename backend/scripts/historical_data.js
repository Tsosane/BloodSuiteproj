// scripts/generate-historical-data.js
const { sequelize } = require('../src/config/database');
const { User, Donor, Hospital, BloodInventory, Request } = require('../src/models');

const generateHistoricalData = async () => {
  try {
    console.log('Generating historical blood request data for AI forecasting...');

    // Get existing hospital
    const hospital = await Hospital.findOne();
    if (!hospital) {
      console.log('❌ No hospital found. Run seed.js first.');
      process.exit(1);
    }

    console.log(`Found hospital ID: ${hospital.id}`);

    // Generate historical requests for the past 2 years
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);
    console.log(`Generating data from ${startDate.toISOString()} to now...`);

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const requests = [];

    console.log('Generating request data...');
    for (let i = 0; i < 730; i++) { // 2 years of daily data
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // Generate 0-3 requests per day with some randomness
      const numRequests = Math.floor(Math.random() * 4);

      for (let j = 0; j < numRequests; j++) {
        const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
        const quantity = (Math.floor(Math.random() * 3) + 1) * 450; // 1-3 units
        const urgency = Math.random() < 0.1 ? 'emergency' : Math.random() < 0.3 ? 'urgent' : 'routine';

        requests.push({
          hospital_id: hospital.id,
          blood_type: bloodType,
          quantity_ml: quantity,
          urgency: urgency,
          status: 'fulfilled', // All historical requests are fulfilled
          patient_name: `Patient ${i}-${j}`,
          required_date: date,
          created_at: date,
          updated_at: date
        });
      }
    }

    console.log(`Generated ${requests.length} requests. Inserting into database...`);

    // Insert in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      await Request.bulkCreate(batch);
      console.log(`Inserted ${Math.min(i + batchSize, requests.length)}/${requests.length} historical requests...`);
    }

    console.log(`✅ Generated ${requests.length} historical blood requests`);
    console.log('   Data spans 2 years for accurate AI forecasting');

    process.exit(0);
  } catch (error) {
    console.error('❌ Historical data generation failed:', error);
    process.exit(1);
  }
};

generateHistoricalData();