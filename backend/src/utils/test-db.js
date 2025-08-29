const db = require('../config/database');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await db.raw('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tables = await db('information_schema.tables')
      .select('table_name')
      .where('table_schema', 'public');
    
    console.log('📋 Available tables:', tables.map(t => t.table_name));
    
    // Check users table
    const userCount = await db('users').count('id as count').first();
    console.log(`👥 Users in database: ${userCount.count}`);
    
    // Check campaigns table
    const campaignCount = await db('campaigns').count('id as count').first();
    console.log(`🎯 Campaigns in database: ${campaignCount.count}`);
    
    // Check leads table
    const leadCount = await db('leads').count('id as count').first();
    console.log(`📊 Leads in database: ${leadCount.count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
