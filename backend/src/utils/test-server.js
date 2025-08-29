const express = require('express');
require('dotenv').config();

console.log('🔧 Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

const app = express();
const PORT = process.env.PORT || 8000;

app.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log('🛑 Shutting down in 3 seconds...');
  setTimeout(() => {
    server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  }, 3000);
});
