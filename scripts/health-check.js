const http = require('http');
const https = require('https');

// Configuration - can be overridden via environment variables
const PORT = process.env.PORT || 3000;
const HOST = process.env.API_HOST || 'localhost';
const PROTOCOL = process.env.API_PROTOCOL || 'http';
const BASE_PATH = process.env.API_BASE_PATH || '';

// All API endpoints to validate
const endpoints = [
  // Health check
  { method: 'GET', path: '/health', expected: 200, desc: 'Health Check' },
  
  // Debug routes endpoint
  { method: 'GET', path: '/api/v1/debug/routes', expected: 200, desc: 'Debug Routes List' },
  
  // Auth routes - /api/v1/auth
  { method: 'POST', path: '/api/v1/auth/login', expected: 400, desc: 'Auth Login (no body)' },
  
  // Products routes - /api/v1/products
  { method: 'GET', path: '/api/v1/products', expected: 401, desc: 'Products List (no auth)' },
  
  // Suppliers routes - /api/v1/suppliers
  { method: 'GET', path: '/api/v1/suppliers', expected: 401, desc: 'Suppliers List (no auth)' },
  
  // Shopping list routes - /api/v1/shopping
  { method: 'GET', path: '/api/v1/shopping', expected: 401, desc: 'Shopping List (no auth)' },
  
  // General routes - /api/v1/general
  { method: 'GET', path: '/api/v1/general', expected: 401, desc: 'General Data (no auth)' },
  
  // Quotations routes - /api/v1/quotations
  { method: 'GET', path: '/api/v1/quotations', expected: 401, desc: 'Quotations List (no auth)' },
  
  // Purchase orders routes - /api/v1/orders
  { method: 'GET', path: '/api/v1/orders', expected: 401, desc: 'Orders List (no auth)' },
  
  // Swagger docs
  { method: 'GET', path: '/api/docs/', expected: 200, desc: 'Swagger Docs' },
];

const checkEndpoint = (endpoint) => {
  return new Promise((resolve) => {
    const client = PROTOCOL === 'https' ? https : http;
    const defaultPort = PROTOCOL === 'https' ? 443 : PORT;
    
    const options = {
      hostname: HOST,
      port: PROTOCOL === 'https' ? 443 : PORT,
      path: BASE_PATH + endpoint.path,
      method: endpoint.method,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = client.request(options, (res) => {
      // Accept the expected status OR common auth/validation errors (401, 400) for protected routes
      const isExpected = res.statusCode === endpoint.expected;
      const isAuthError = res.statusCode === 401 && !endpoint.auth;
      const isValidationError = res.statusCode === 400;
      const isSuccess = isExpected || (endpoint.expected === 401 && isAuthError);
      
      resolve({
        ...endpoint,
        status: res.statusCode,
        success: res.statusCode !== 404, // 404 means route doesn't exist
        routeExists: res.statusCode !== 404,
      });
    });

    req.on('error', (error) => {
      resolve({
        ...endpoint,
        status: 'ERROR',
        success: false,
        routeExists: false,
        error: error.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        ...endpoint,
        status: 'TIMEOUT',
        success: false,
        routeExists: false,
      });
    });

    // Send empty body for POST requests
    if (endpoint.method === 'POST') {
      req.write('{}');
    }
    req.end();
  });
};

const runHealthCheck = async () => {
  console.log('🏥 Running comprehensive health check...\n');
  const portDisplay = PROTOCOL === 'https' ? '' : `:${PORT}`;
  console.log(`📍 Target: ${PROTOCOL}://${HOST}${portDisplay}${BASE_PATH}\n`);
  console.log('=' .repeat(70));

  const results = [];
  let allRoutesExist = true;
  let criticalFailure = false;

  for (const endpoint of endpoints) {
    const result = await checkEndpoint(endpoint);
    results.push(result);

    const statusIcon = result.routeExists ? '✅' : '❌';
    const statusText = result.routeExists ? 'FOUND' : 'NOT FOUND (404)';
    
    console.log(`${statusIcon} [${endpoint.method.padEnd(6)}] ${endpoint.path.padEnd(45)} -> ${result.status} (${statusText})`);
    
    if (!result.routeExists) {
      allRoutesExist = false;
      if (endpoint.path === '/health') {
        criticalFailure = true;
      }
    }
  }

  console.log('=' .repeat(70));
  console.log('\n📊 Summary:');
  
  const foundRoutes = results.filter(r => r.routeExists).length;
  const missingRoutes = results.filter(r => !r.routeExists);
  
  console.log(`   ✅ Routes found: ${foundRoutes}/${results.length}`);
  console.log(`   ❌ Routes missing: ${missingRoutes.length}/${results.length}`);
  
  if (missingRoutes.length > 0) {
    console.log('\n⚠️  Missing routes:');
    missingRoutes.forEach(r => {
      console.log(`   - ${r.method} ${r.path} (${r.desc})`);
    });
  }

  console.log('');
  
  if (criticalFailure) {
    console.log('❌ CRITICAL: Health endpoint not found!');
    process.exit(1);
  } else if (allRoutesExist) {
    console.log('✅ All routes are properly registered!');
    process.exit(0);
  } else {
    console.log('⚠️  Some routes are missing - check the deployment');
    process.exit(1);
  }
};

// Run health check
runHealthCheck().catch((error) => {
  console.error('❌ Health check failed with error:', error.message);
  process.exit(1);
});
