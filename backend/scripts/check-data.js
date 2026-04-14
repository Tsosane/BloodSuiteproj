// scripts/check-data.js
const { sequelize } = require('../src/config/database');
const { Request } = require('../src/models');

const checkData = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const count = await Request.count();
    console.log(`📊 Found ${count} total requests in database`);

    const fulfilledCount = await Request.count({
      where: { status: 'fulfilled' }
    });
    console.log(`📊 Found ${fulfilledCount} fulfilled requests in database`);

    const pendingCount = await Request.count({
      where: { status: 'pending' }
    });
    console.log(`📊 Found ${pendingCount} pending requests in database`);

    if (fulfilledCount > 0) {
      const sample = await Request.findOne({
        where: { status: 'fulfilled' },
        order: [['created_at', 'DESC']]
      });
      console.log('Latest fulfilled request:', {
        blood_type: sample.blood_type,
        quantity_ml: sample.quantity_ml,
        created_at: sample.created_at
      });

      const oldest = await Request.findOne({
        where: { status: 'fulfilled' },
        order: [['created_at', 'ASC']]
      });
      console.log('Oldest fulfilled request:', {
        blood_type: oldest.blood_type,
        created_at: oldest.created_at
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkData();