const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'healthy',
      timestamp: expect.any(String),
      version: expect.any(String)
    });
  });
});

describe('404 Handler', () => {
  test('GET /non-existent-route should return 404', async () => {
    const response = await request(app).get('/non-existent-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Endpoint not found'
    });
  });
});
