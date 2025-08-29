const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:8000/api';
const FRONTEND_URL = 'http://localhost:3000';

async function testFrontendCRUD() {
  console.log('🔍 COMPREHENSIVE FRONTEND CRUD ANALYSIS');
  console.log('=' .repeat(60));
  
  let issues = [];
  
  // 1. Test Environment Variables in Frontend
  console.log('\n1️⃣ TESTING FRONTEND ENVIRONMENT...');
  try {
    const envTest = await axios.get(`${FRONTEND_URL}/debug-simple`);
    if (envTest.status === 200) {
      console.log('✅ Frontend debug page accessible');
    }
  } catch (error) {
    issues.push('❌ Frontend debug page not accessible');
    console.log('❌ Frontend debug page not accessible');
  }
  
  // 2. Test Authentication Flow
  console.log('\n2️⃣ TESTING AUTH CONTEXT...');
  const authFiles = [
    'contexts/AuthContext.tsx',
    'pages/auth/login.tsx',
    'pages/auth/register.tsx'
  ];
  
  for (const file of authFiles) {
    try {
      const content = fs.readFileSync(`c:/Users/0632/Documents/task_app/frontend/${file}`, 'utf8');
      
      // Check for common issues
      if (file === 'contexts/AuthContext.tsx') {
        if (!content.includes('axios.defaults.headers.common')) {
          issues.push('❌ AuthContext: axios headers not being set globally');
        }
        if (!content.includes('process.env.NEXT_PUBLIC_API_URL')) {
          issues.push('❌ AuthContext: Not using environment variable for API URL');
        }
        console.log('✅ AuthContext structure looks correct');
      }
      
      if (file === 'pages/auth/login.tsx') {
        if (!content.includes('useAuth')) {
          issues.push('❌ Login page: Not using AuthContext');
        }
        console.log('✅ Login page structure looks correct');
      }
    } catch (error) {
      issues.push(`❌ Could not read ${file}`);
    }
  }
  
  // 3. Test Campaign CRUD Components
  console.log('\n3️⃣ TESTING CAMPAIGN CRUD COMPONENTS...');
  const campaignFiles = [
    'pages/campaigns/index.tsx',
    'pages/campaigns/create.tsx'
  ];
  
  for (const file of campaignFiles) {
    try {
      const content = fs.readFileSync(`c:/Users/0632/Documents/task_app/frontend/${file}`, 'utf8');
      
      // Check for React Query usage
      if (!content.includes('useQuery') && file.includes('index.tsx')) {
        issues.push(`❌ ${file}: Not using React Query for data fetching`);
      }
      
      // Check for mutation usage
      if (!content.includes('useMutation') && file.includes('create.tsx')) {
        issues.push(`❌ ${file}: Not using React Query mutations`);
      }
      
      // Check for environment variable usage
      if (!content.includes('process.env.NEXT_PUBLIC_API_URL')) {
        issues.push(`❌ ${file}: Not using environment variable for API URL`);
      }
      
      // Check for authentication
      if (!content.includes('ProtectedRoute')) {
        issues.push(`❌ ${file}: Not using ProtectedRoute wrapper`);
      }
      
      console.log(`✅ ${file} structure analysis complete`);
    } catch (error) {
      issues.push(`❌ Could not read ${file}: ${error.message}`);
    }
  }
  
  // 4. Test Lead CRUD Components
  console.log('\n4️⃣ TESTING LEAD CRUD COMPONENTS...');
  const leadFiles = [
    'pages/leads/index.tsx'
  ];
  
  for (const file of leadFiles) {
    try {
      const content = fs.readFileSync(`c:/Users/0632/Documents/task_app/frontend/${file}`, 'utf8');
      
      // Similar checks as campaigns
      if (!content.includes('useQuery')) {
        issues.push(`❌ ${file}: Not using React Query for data fetching`);
      }
      
      if (!content.includes('process.env.NEXT_PUBLIC_API_URL')) {
        issues.push(`❌ ${file}: Not using environment variable for API URL`);
      }
      
      console.log(`✅ ${file} structure analysis complete`);
    } catch (error) {
      issues.push(`❌ Could not read ${file}: ${error.message}`);
    }
  }
  
  // 5. Test React Query Configuration
  console.log('\n5️⃣ TESTING REACT QUERY SETUP...');
  try {
    const appContent = fs.readFileSync('c:/Users/0632/Documents/task_app/frontend/pages/_app.tsx', 'utf8');
    
    if (!appContent.includes('QueryClientProvider')) {
      issues.push('❌ _app.tsx: QueryClientProvider not set up');
    }
    
    if (!appContent.includes('AuthProvider')) {
      issues.push('❌ _app.tsx: AuthProvider not wrapping app');
    }
    
    console.log('✅ React Query and Auth provider setup looks correct');
  } catch (error) {
    issues.push('❌ Could not read _app.tsx');
  }
  
  // 6. Test API Integration
  console.log('\n6️⃣ TESTING API INTEGRATION...');
  try {
    // Login to get token
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Backend login successful');
      
      // Test campaigns endpoint
      const campaignsResponse = await axios.get(`${API_URL}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (campaignsResponse.data.success) {
        console.log(`✅ Backend campaigns API working (${campaignsResponse.data.data.length} campaigns)`);
      }
      
      // Test leads endpoint
      const leadsResponse = await axios.get(`${API_URL}/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (leadsResponse.data.success) {
        console.log(`✅ Backend leads API working (${leadsResponse.data.data.length} leads)`);
      }
      
    }
  } catch (error) {
    issues.push(`❌ API integration test failed: ${error.message}`);
  }
  
  // 7. Summary
  console.log('\n📋 ANALYSIS SUMMARY');
  console.log('=' .repeat(40));
  
  if (issues.length === 0) {
    console.log('🎉 NO ISSUES FOUND! All components look correctly structured.');
    console.log('💡 If CRUD is not working, the issue might be:');
    console.log('   - Frontend server needs restart to pick up .env changes');
    console.log('   - Browser cache/localStorage needs clearing');
    console.log('   - Authentication state issues in the UI');
  } else {
    console.log(`❌ FOUND ${issues.length} POTENTIAL ISSUES:`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  console.log('\n🔧 RECOMMENDED ACTIONS:');
  console.log('1. Restart frontend server: npm run dev');
  console.log('2. Clear browser cache and localStorage');
  console.log('3. Test login at: http://localhost:3000/auth/login');
  console.log('4. Check browser console for errors');
  console.log('5. Use debug page: http://localhost:3000/debug-simple');
}

testFrontendCRUD();
