const { knex } = require('knex');
const knexConfig = require('../knexfile');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Create test database connection
const testDb = knex(knexConfig.test);

// Global setup for tests
beforeAll(async () => {
  try {
    // Run migrations
    await testDb.migrate.latest();
    // Run seeds
    await testDb.seed.run();
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
});

// Clean up after each test
afterEach(async () => {
  try {
    // Clear all tables in reverse order to handle foreign keys
    await testDb('leads').del();
    await testDb('campaigns').del();
    await testDb('users').del();
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
});

// Global teardown
afterAll(async () => {
  try {
    await testDb.destroy();
  } catch (error) {
    console.error('Test teardown failed:', error);
  }
});
