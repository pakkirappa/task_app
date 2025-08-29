const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('leads').del();
  await knex('campaigns').del();
  await knex('users').del();

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const [user] = await knex('users').insert([
    {
      email: 'admin@example.com',
      password_hash: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      is_active: true
    }
  ]).returning('*');

  // Create sample campaigns
  const campaigns = await knex('campaigns').insert([
    {
      name: 'Q4 Product Launch',
      description: 'Launch campaign for our new product line',
      status: 'active',
      budget: 50000.00,
      start_date: '2024-10-01',
      end_date: '2024-12-31',
      created_by: user.id
    },
    {
      name: 'Summer Promotion',
      description: 'Summer discount campaign',
      status: 'completed',
      budget: 25000.00,
      start_date: '2024-06-01',
      end_date: '2024-08-31',
      created_by: user.id
    },
    {
      name: 'Holiday Sales',
      description: 'Holiday season sales campaign',
      status: 'draft',
      budget: 75000.00,
      start_date: '2024-11-15',
      end_date: '2024-12-25',
      created_by: user.id
    }
  ]).returning('*');

  // Create sample leads
  await knex('leads').insert([
    {
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@example.com',
      phone: '+1-555-0101',
      company: 'TechCorp Inc',
      position: 'CTO',
      status: 'qualified',
      source: 'website',
      value: 15000.00,
      notes: 'Interested in enterprise solution',
      campaign_id: campaigns[0].id,
      assigned_to: user.id
    },
    {
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.j@company.com',
      phone: '+1-555-0102',
      company: 'StartupXYZ',
      position: 'CEO',
      status: 'contacted',
      source: 'referral',
      value: 8500.00,
      notes: 'Referral from existing client',
      campaign_id: campaigns[0].id,
      assigned_to: user.id
    },
    {
      first_name: 'Mike',
      last_name: 'Davis',
      email: 'mike.davis@retail.com',
      phone: '+1-555-0103',
      company: 'Retail Solutions',
      position: 'Marketing Director',
      status: 'new',
      source: 'social',
      value: 12000.00,
      notes: 'Found us through LinkedIn',
      campaign_id: campaigns[1].id,
      assigned_to: user.id
    },
    {
      first_name: 'Emily',
      last_name: 'Brown',
      email: 'emily.brown@finance.com',
      phone: '+1-555-0104',
      company: 'Finance Plus',
      position: 'VP Finance',
      status: 'proposal',
      source: 'email',
      value: 25000.00,
      notes: 'Proposal sent, waiting for response',
      campaign_id: campaigns[0].id,
      assigned_to: user.id
    },
    {
      first_name: 'David',
      last_name: 'Wilson',
      email: 'david.w@logistics.com',
      phone: '+1-555-0105',
      company: 'Logistics Pro',
      position: 'Operations Manager',
      status: 'won',
      source: 'website',
      value: 18500.00,
      notes: 'Deal closed successfully',
      campaign_id: campaigns[1].id,
      assigned_to: user.id
    }
  ]);

  console.log('Database seeded successfully!');
  console.log('Test user: admin@example.com / password123');
};
