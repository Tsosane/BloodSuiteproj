const axios = require('axios');

// Test script for donor notification system
async function testDonorNotifications() {
  try {
    console.log('Testing donor notification system...');

    // First, let's check if we can get shortage alerts
    console.log('\n1. Checking shortage alerts...');
    const alertsResponse = await axios.get('http://localhost:3001/api/forecast/alerts', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTY4MzA0NjQwMCwiZXhwIjoxNjgzMDUwMDAwfQ.example_token'
      }
    });

    console.log('Shortage alerts:', alertsResponse.data);

    // Now test manual donor notification trigger
    console.log('\n2. Testing manual donor notification trigger...');
    const notificationResponse = await axios.post('http://localhost:3001/api/forecast/notify-donors', {
      bloodType: 'A+',
      shortageAmount: 5
    }, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTY4MzA0NjQwMCwiZXhwIjoxNjgzMDUwMDAwfQ.example_token'
      }
    });

    console.log('Donor notification result:', notificationResponse.data);

    // Check notifications to see if they were created
    console.log('\n3. Checking created notifications...');
    const notificationsResponse = await axios.get('http://localhost:3001/api/notifications', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTY4MzA0NjQwMCwiZXhwIjoxNjgzMDUwMDAwfQ.example_token'
      }
    });

    console.log('Recent notifications:', notificationsResponse.data.data?.slice(0, 5));

    console.log('\n✅ Donor notification system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testDonorNotifications();