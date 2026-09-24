import app from '../server/app.js';
import http from 'http';

const server = http.createServer(app);

const endpoints = [
  '/api/health',
  '/api/auth/me',
  '/api/vehicles',
  '/api/vehicles?view=cards',
  '/api/leads',
  '/api/content/home',
  '/api/content/about',
  '/api/content/services',
  '/api/content/contact',
  '/api/hero-images',
  '/api/social-links',
  '/api/notifications',
  '/api/reviews',
  '/api/departments',
  '/api/team',
];

server.listen(0, async () => {
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  for (const ep of endpoints) {
    try {
      const res = await fetch(`http://localhost:${port}${ep}`);
      const text = await res.text();
      let statusIcon = res.status === 200 || res.status === 401 ? '✅' : '❌';
      console.log(`${statusIcon} GET ${ep} -> Status: ${res.status}`);
      if (res.status >= 500) {
        console.error(`   ERROR RESPONSE: ${text}`);
      }
    } catch (err) {
      console.error(`❌ GET ${ep} -> Network/Fetch Error: ${err.message}`);
    }
  }

  server.close(() => {
    console.log('Test completed.');
    process.exit(0);
  });
});
