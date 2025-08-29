import axios from 'axios';

const testAPI = async () => {
  console.log('Testing API endpoints...');
  
  try {
    // Test campaigns endpoint
    console.log('\n1. Testing campaigns endpoint...');
    const campaignsResponse = await axios.get('http://localhost:5000/api/campaigns');
    console.log('Campaigns response structure:', {
      success: campaignsResponse.data.success,
      dataType: typeof campaignsResponse.data.data,
      dataLength: Array.isArray(campaignsResponse.data.data) ? campaignsResponse.data.data.length : 'Not array',
      firstItem: campaignsResponse.data.data[0] || 'No items'
    });

    // Test leads stats endpoint
    console.log('\n2. Testing leads stats endpoint...');
    const leadsStatsResponse = await axios.get('http://localhost:5000/api/leads/stats/overview');
    console.log('Leads stats response structure:', {
      success: leadsStatsResponse.data.success,
      dataType: typeof leadsStatsResponse.data.data,
      hasOverview: !!leadsStatsResponse.data.data?.overview,
      overviewKeys: leadsStatsResponse.data.data?.overview ? Object.keys(leadsStatsResponse.data.data.overview) : 'No overview',
      overviewData: leadsStatsResponse.data.data?.overview
    });

  } catch (error) {
    console.error('API Test Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
};

export default testAPI;
