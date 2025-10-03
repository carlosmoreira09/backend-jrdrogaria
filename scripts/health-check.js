const http = require('http');

const healthCheck = () => {
  const options = {
    hostname: 'localhost',
    port: process.env.PORT || 3000,
    path: '/health',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Health check passed - Server is running');
      process.exit(0);
    } else {
      console.log(`❌ Health check failed - Status: ${res.statusCode}`);
      process.exit(1);
    }
  });

  req.on('error', (error) => {
    console.log(`❌ Health check failed - Error: ${error.message}`);
    process.exit(1);
  });

  req.on('timeout', () => {
    console.log('❌ Health check failed - Timeout');
    req.destroy();
    process.exit(1);
  });

  req.end();
};

// Run health check
healthCheck();
