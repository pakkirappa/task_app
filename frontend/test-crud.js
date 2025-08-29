const axios = require('axios');

const API_URL = 'http://localhost:8000/api';
let authToken = '';

async function login() {
  console.log('🔐 Logging in...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login successful');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testCampaignCRUD() {
  console.log('\n📋 TESTING CAMPAIGN CRUD OPERATIONS\n');
  
  const headers = { Authorization: `Bearer ${authToken}` };
  let campaignId = null;

  try {
    // 1. CREATE Campaign
    console.log('1️⃣ Testing CREATE Campaign...');
    const createData = {
      name: 'Test Campaign ' + Date.now(),
      description: 'This is a test campaign for CRUD testing',
      status: 'draft',
      budget: 5000,
      start_date: '2024-09-01',
      end_date: '2024-12-31'
    };
    
    const createResponse = await axios.post(`${API_URL}/campaigns`, createData, { headers });
    
    if (createResponse.data.success) {
      campaignId = createResponse.data.data.id;
      console.log('✅ CREATE successful - ID:', campaignId);
    } else {
      console.error('❌ CREATE failed:', createResponse.data.message);
      return;
    }

    // 2. READ All Campaigns
    console.log('\n2️⃣ Testing READ All Campaigns...');
    const readAllResponse = await axios.get(`${API_URL}/campaigns`, { headers });
    
    if (readAllResponse.data.success) {
      console.log('✅ READ ALL successful - Count:', readAllResponse.data.data.length);
    } else {
      console.error('❌ READ ALL failed:', readAllResponse.data.message);
    }

    // 3. READ Single Campaign
    console.log('\n3️⃣ Testing READ Single Campaign...');
    const readOneResponse = await axios.get(`${API_URL}/campaigns/${campaignId}`, { headers });
    
    if (readOneResponse.data.success) {
      console.log('✅ READ ONE successful - Name:', readOneResponse.data.data.name);
    } else {
      console.error('❌ READ ONE failed:', readOneResponse.data.message);
    }

    // 4. UPDATE Campaign
    console.log('\n4️⃣ Testing UPDATE Campaign...');
    const updateData = {
      name: 'Updated Test Campaign ' + Date.now(),
      status: 'active',
      budget: 7500
    };
    
    const updateResponse = await axios.put(`${API_URL}/campaigns/${campaignId}`, updateData, { headers });
    
    if (updateResponse.data.success) {
      console.log('✅ UPDATE successful - New name:', updateResponse.data.data.name);
    } else {
      console.error('❌ UPDATE failed:', updateResponse.data.message);
    }

    // 5. DELETE Campaign
    console.log('\n5️⃣ Testing DELETE Campaign...');
    const deleteResponse = await axios.delete(`${API_URL}/campaigns/${campaignId}`, { headers });
    
    if (deleteResponse.data.success) {
      console.log('✅ DELETE successful');
    } else {
      console.error('❌ DELETE failed:', deleteResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Campaign CRUD Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
  }
}

async function testLeadCRUD() {
  console.log('\n👥 TESTING LEAD CRUD OPERATIONS\n');
  
  const headers = { Authorization: `Bearer ${authToken}` };
  let leadId = null;

  try {
    // Get a campaign ID first
    const campaignsResponse = await axios.get(`${API_URL}/campaigns`, { headers });
    const campaignId = campaignsResponse.data.data[0]?.id;

    // 1. CREATE Lead
    console.log('1️⃣ Testing CREATE Lead...');
    const createData = {
      first_name: 'Test',
      last_name: 'Lead',
      email: `testlead${Date.now()}@example.com`,
      phone: '+1234567890',
      company: 'Test Company',
      position: 'Manager',
      status: 'new',
      source: 'website',
      value: 1000,
      notes: 'This is a test lead',
      campaign_id: campaignId
    };
    
    const createResponse = await axios.post(`${API_URL}/leads`, createData, { headers });
    
    if (createResponse.data.success) {
      leadId = createResponse.data.data.id;
      console.log('✅ CREATE successful - ID:', leadId);
    } else {
      console.error('❌ CREATE failed:', createResponse.data.message);
      return;
    }

    // 2. READ All Leads
    console.log('\n2️⃣ Testing READ All Leads...');
    const readAllResponse = await axios.get(`${API_URL}/leads`, { headers });
    
    if (readAllResponse.data.success) {
      console.log('✅ READ ALL successful - Count:', readAllResponse.data.data.length);
    } else {
      console.error('❌ READ ALL failed:', readAllResponse.data.message);
    }

    // 3. READ Single Lead
    console.log('\n3️⃣ Testing READ Single Lead...');
    const readOneResponse = await axios.get(`${API_URL}/leads/${leadId}`, { headers });
    
    if (readOneResponse.data.success) {
      console.log('✅ READ ONE successful - Email:', readOneResponse.data.data.email);
    } else {
      console.error('❌ READ ONE failed:', readOneResponse.data.message);
    }

    // 4. UPDATE Lead
    console.log('\n4️⃣ Testing UPDATE Lead...');
    const updateData = {
      status: 'contacted',
      value: 1500,
      notes: 'Updated test lead with new status'
    };
    
    const updateResponse = await axios.put(`${API_URL}/leads/${leadId}`, updateData, { headers });
    
    if (updateResponse.data.success) {
      console.log('✅ UPDATE successful - New status:', updateResponse.data.data.status);
    } else {
      console.error('❌ UPDATE failed:', updateResponse.data.message);
    }

    // 5. DELETE Lead
    console.log('\n5️⃣ Testing DELETE Lead...');
    const deleteResponse = await axios.delete(`${API_URL}/leads/${leadId}`, { headers });
    
    if (deleteResponse.data.success) {
      console.log('✅ DELETE successful');
    } else {
      console.error('❌ DELETE failed:', deleteResponse.data.message);
    }

    // 6. Test CSV Export
    console.log('\n6️⃣ Testing CSV Export...');
    const csvResponse = await axios.get(`${API_URL}/leads/export/csv`, { headers });
    
    if (csvResponse.status === 200) {
      console.log('✅ CSV Export successful - Length:', csvResponse.data.length);
    } else {
      console.error('❌ CSV Export failed');
    }

  } catch (error) {
    console.error('❌ Lead CRUD Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
  }
}

async function testAnalytics() {
  console.log('\n📊 TESTING ANALYTICS ENDPOINTS\n');
  
  const headers = { Authorization: `Bearer ${authToken}` };

  try {
    // Test leads stats
    console.log('1️⃣ Testing Leads Analytics...');
    const leadsStatsResponse = await axios.get(`${API_URL}/leads/stats/overview`, { headers });
    
    if (leadsStatsResponse.data.success) {
      console.log('✅ Leads Analytics successful');
      console.log('   Total leads:', leadsStatsResponse.data.data.overview.total_leads);
    } else {
      console.error('❌ Leads Analytics failed:', leadsStatsResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Analytics Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
  }
}

async function runAllTests() {
  console.log('🧪 COMPREHENSIVE CRUD TESTING STARTED\n');
  console.log('=' .repeat(50));
  
  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('Cannot proceed without authentication');
    return;
  }
  
  // Run all tests
  await testCampaignCRUD();
  await testLeadCRUD();
  await testAnalytics();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 ALL CRUD TESTS COMPLETED');
}

runAllTests();
