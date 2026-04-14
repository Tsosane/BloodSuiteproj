// server.js
require('dotenv').config();
const app = require('./src/app');

// This file is just a wrapper - the app starts in app.js
// But keeping for compatibility with some deployment setups

if (require.main === module) {
  console.log('Starting Blood Suite Backend...');
}

module.exports = app;