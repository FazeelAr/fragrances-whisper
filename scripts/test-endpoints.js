const http = require('http');

const BASE_URL = 'http://localhost:3000';

function fetchUrl(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'FragranceWhisper-Tester/1.0',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runEndpointTests() {
  console.log('=====================================================');
  console.log('       FRAGRANCE WHISPER ENDPOINT TEST SUITE         ');
  console.log('=====================================================\n');

  const tests = [
    {
      name: 'Homepage (GET /)',
      path: '/',
      expectedStatus: [200],
      checkContent: (body) => body.includes('Fragrance Whisper') || body.includes('Whisper')
    },
    {
      name: 'Product Catalog (GET /products)',
      path: '/products',
      expectedStatus: [200],
      checkContent: (body) => body.includes('Products') || body.includes('Fragrance')
    },
    {
      name: 'Category Detail (GET /categories/eau-de-parfum)',
      path: '/categories/eau-de-parfum',
      expectedStatus: [200],
      checkContent: (body) => body.includes('Eau de Parfum') || body.includes('Parfum')
    },
    {
      name: 'Shopping Cart Page (GET /cart)',
      path: '/cart',
      expectedStatus: [200],
      checkContent: (body) => body.includes('Cart')
    },
    {
      name: 'Admin Login Portal (GET /login)',
      path: '/login',
      expectedStatus: [200],
      checkContent: (body) => body.includes('Admin') || body.includes('Portal') || body.includes('Sign In')
    },
    {
      name: 'Admin Dashboard Security Guard (GET /admin)',
      path: '/admin',
      expectedStatus: [307, 308, 302],
      checkHeader: (headers) => headers.location && headers.location.includes('/login')
    },
    {
      name: 'Admin Products Security Guard (GET /admin/products)',
      path: '/admin/products',
      expectedStatus: [307, 308, 302],
      checkHeader: (headers) => headers.location && headers.location.includes('/login')
    },
    {
      name: 'Admin Categories Security Guard (GET /admin/categories)',
      path: '/admin/categories',
      expectedStatus: [307, 308, 302],
      checkHeader: (headers) => headers.location && headers.location.includes('/login')
    },
    {
      name: 'Admin Orders Security Guard (GET /admin/orders)',
      path: '/admin/orders',
      expectedStatus: [307, 308, 302],
      checkHeader: (headers) => headers.location && headers.location.includes('/login')
    },
    {
      name: 'Disabled Sign-Up Endpoint Check (GET /register -> 404)',
      path: '/register',
      expectedStatus: [404],
      checkContent: () => true
    },
    {
      name: 'Non-Existent Route Check (GET /random-404-check -> 404)',
      path: '/random-404-check',
      expectedStatus: [404],
      checkContent: () => true
    },
    {
      name: 'NextAuth CSRF Token API (GET /api/auth/csrf)',
      path: '/api/auth/csrf',
      expectedStatus: [200],
      checkContent: (body) => body.includes('csrfToken')
    },
    {
      name: 'NextAuth Session API (GET /api/auth/session)',
      path: '/api/auth/session',
      expectedStatus: [200],
      checkContent: () => true
    },
    {
      name: 'Favicon Brand Icon (GET /icon.svg)',
      path: '/icon.svg',
      expectedStatus: [200],
      checkContent: (body) => body.includes('<svg')
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    process.stdout.write(`Testing: ${test.name.padEnd(52)} ... `);
    try {
      const res = await fetchUrl(test.path);
      const statusOk = test.expectedStatus.includes(res.statusCode);
      const contentOk = test.checkContent ? test.checkContent(res.body) : true;
      const headerOk = test.checkHeader ? test.checkHeader(res.headers) : true;

      if (statusOk && contentOk && headerOk) {
        console.log(`\x1b[32mPASS\x1b[0m (Status: ${res.statusCode})`);
        passed++;
      } else {
        console.log(`\x1b[31mFAIL\x1b[0m (Got Status: ${res.statusCode}, expected: ${test.expectedStatus.join('/')})`);
        failed++;
      }
    } catch (err) {
      console.log(`\x1b[31mERROR\x1b[0m (${err.message})`);
      failed++;
    }
  }

  console.log('\n-----------------------------------------------------');
  console.log(`Results: \x1b[32m${passed} Passed\x1b[0m, \x1b[${failed > 0 ? '31' : '32'}m${failed} Failed\x1b[0m out of ${tests.length} endpoints`);
  console.log('-----------------------------------------------------\n');

  if (failed > 0) process.exit(1);
}

runEndpointTests().catch(console.error);
