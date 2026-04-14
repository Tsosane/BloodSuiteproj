// scripts/check-db-direct.js
const { sequelize } = require('../src/config/database');

const checkDB = async () => {
  try {
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as total, 
             MIN(created_at) as oldest_date, 
             MAX(created_at) as newest_date,
             COUNT(CASE WHEN status = 'fulfilled' THEN 1 END) as fulfilled_count
      FROM requests
    `);

    console.log('Database summary:', results[0]);

    const [sample] = await sequelize.query(`
      SELECT blood_type, quantity_ml, status, created_at, required_date
      FROM requests 
      WHERE status = 'fulfilled'
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log('Sample fulfilled requests:');
    sample.forEach((row, i) => {
      console.log(`${i+1}: ${row.blood_type} ${row.quantity_ml}ml ${row.status} ${row.created_at}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDB();