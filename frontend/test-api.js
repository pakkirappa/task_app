const axios = require('axios');

const API_URL = 'http://localhost:8000/api';

async function testAPI() {
  console.log('🔍 Testing API connectivity...\n');
  
  try {
    // Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:8000/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test auth endpoints
    console.log('\n2️⃣ Testing authentication...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.data.token;
      
      // Test protected campaigns endpoint
      console.log('\n3️⃣ Testing campaigns endpoint with auth...');
      const campaignResponse = await axios.get(`${API_URL}/campaigns`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (campaignResponse.data.success) {
        console.log('✅ Campaigns fetch successful');
        console.log(`   Found ${campaignResponse.data.data.length} campaigns`);
        
        // Test profile endpoint
        console.log('\n4️⃣ Testing profile endpoint...');
        const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (profileResponse.data.success) {
          console.log('✅ Profile fetch successful');
          console.log('   User:', profileResponse.data.data.email);
        }
      }
    }
    
    console.log('\n🎉 All API tests passed! The backend is working correctly.');
    
  } catch (error) {
    console.error('❌ API test failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('URL:', error.config?.url);
  }
}

testAPI();
