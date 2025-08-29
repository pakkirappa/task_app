const axios = require('axios');

async function testFrontend() {
  try {
    console.log('🌐 Testing frontend server...');
    
    // Test if frontend is running
    const frontendResponse = await axios.get('http://localhost:3000', {
      timeout: 5000,
      validateStatus: () => true // Accept any status code
    });
    
    if (frontendResponse.status === 200) {
      console.log('✅ Frontend server is running');
      console.log('   Status:', frontendResponse.status);
    } else if (frontendResponse.status === 404) {
      console.log('⚠️ Frontend server running but page not found');
    } else {
      console.log('⚠️ Frontend server responding with status:', frontendResponse.status);
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Frontend server is NOT running');
      console.log('💡 Try running: npm run dev');
    } else {
      console.log('❌ Frontend test error:', error.message);
    }
  }
}

testFrontend();
