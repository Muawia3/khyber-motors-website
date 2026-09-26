import app from '../server/app.js';
import http from 'http';
import fs from 'fs';
import path from 'path';

const server = http.createServer(app);

// Helper to send HTTP requests to test server
async function req(port, pathStr, options = {}) {
  const url = `http://localhost:${port}${pathStr}`;
  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, headers: res.headers, text, json };
}

server.listen(0, async () => {
  const port = server.address().port;
  console.log(`\n==================================================`);
  console.log(`🚀 Starting Full System Verification on port ${port}...`);
  console.log(`==================================================\n`);

  let testPassed = true;
  let adminToken = null;

  try {
    // 1. ADMIN AUTHENTICATION
    console.log('1️⃣  Testing Admin Login & Token Verification...');
    const loginRes = await req(port, '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || 'muawiakhan000@gmail.com',
        password: process.env.ADMIN_PASSWORD || 'Ameer100$',
      }),
    });

    if (loginRes.status === 200 && loginRes.json?.token) {
      adminToken = loginRes.json.token;
      console.log('   ✅ Admin Login SUCCESS (Token acquired)');
    } else {
      console.error('   ❌ Admin Login FAILED:', loginRes.text);
      testPassed = false;
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };

    // 2. IMAGE & BROCHURE UPLOAD
    console.log('\n2️⃣  Testing Image & PDF Brochure Upload to Cloudinary...');
    // Create a 1x1 test PNG image buffer
    const testImageBuffer = Buffer.from(
      'iVBOR00KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const testImgPath = path.resolve('scratch', 'sample_test_image.png');
    fs.writeFileSync(testImgPath, testImageBuffer);

    const formData = new FormData();
    const blob = new Blob([testImageBuffer], { type: 'image/png' });
    formData.append('file', blob, 'sample_test_image.png');

    const uploadRes = await fetch(`http://localhost:${port}/api/upload/single`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    const uploadText = await uploadRes.text();
    let uploadJson = null;
    try { uploadJson = JSON.parse(uploadText); } catch {}

    let uploadedImageUrl = null;
    if (uploadRes.status === 200 && uploadJson?.url) {
      uploadedImageUrl = uploadJson.url;
      console.log(`   ✅ Image Upload SUCCESS -> CDN URL: ${uploadedImageUrl}`);
    } else {
      console.error('   ❌ Image Upload FAILED:', uploadText);
      testPassed = false;
    }

    // 3. HERO IMAGE CRUD
    console.log('\n3️⃣  Testing Hero Image CRUD Operations...');
    const testHeroUrl = uploadedImageUrl || 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/test_hero.jpg';
    const createHeroRes = await req(port, '/api/hero-images', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        url: testHeroUrl,
        title: 'Temp System Verification Hero',
        altText: 'Verification Banner',
        displayOrder: 99,
        isActive: true,
      }),
    });

    let testHeroId = null;
    if (createHeroRes.status === 201 && createHeroRes.json?.data?.id) {
      testHeroId = createHeroRes.json.data.id;
      console.log(`   ✅ Hero Image Create SUCCESS -> ID: ${testHeroId}`);
    } else {
      console.error('   ❌ Hero Image Create FAILED:', createHeroRes.text);
      testPassed = false;
    }

    // GET Public Hero Images
    const getHeroRes = await req(port, '/api/hero-images?activeOnly=true');
    if (getHeroRes.status === 200 && Array.isArray(getHeroRes.json?.data)) {
      console.log(`   ✅ Public GET /api/hero-images SUCCESS -> Count: ${getHeroRes.json.data.length}`);
    } else {
      console.error('   ❌ Public GET /api/hero-images FAILED:', getHeroRes.text);
      testPassed = false;
    }

    // Clean up test hero image
    if (testHeroId) {
      const delHeroRes = await req(port, `/api/hero-images/${testHeroId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (delHeroRes.status === 200) {
        console.log('   ✅ Hero Image Cleanup/Delete SUCCESS');
      } else {
        console.error('   ❌ Hero Image Delete FAILED:', delHeroRes.text);
      }
    }

    // 4. VEHICLE CRUD
    console.log('\n4️⃣  Testing Vehicle CRUD & Lightweight Card View...');
    const createVehRes = await req(port, '/api/vehicles', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Temp Verification Truck',
        fullTitle: 'JAC Temp Verification Truck 4x4',
        slug: 'temp-verification-truck',
        tagline: 'Temporary Test Vehicle',
        category: 'PASSENGERS',
        categoryLabel: 'Passenger',
        mainImage: testHeroUrl,
        overview: 'Temporary test vehicle for system verification.',
        status: 'Published',
      }),
    });

    let testVehId = null;
    if (createVehRes.status === 201 && createVehRes.json?.data?.id) {
      testVehId = createVehRes.json.data.id;
      console.log(`   ✅ Vehicle Create SUCCESS -> ID: ${testVehId}`);
    } else {
      console.error('   ❌ Vehicle Create FAILED:', createVehRes.text);
      testPassed = false;
    }

    // GET /api/vehicles?view=cards
    const getVehCardsRes = await req(port, '/api/vehicles?view=cards');
    if (getVehCardsRes.status === 200 && Array.isArray(getVehCardsRes.json?.data)) {
      console.log(`   ✅ GET /api/vehicles?view=cards SUCCESS -> Count: ${getVehCardsRes.json.data.length}`);
    } else {
      console.error('   ❌ GET /api/vehicles?view=cards FAILED:', getVehCardsRes.text);
      testPassed = false;
    }

    // Clean up test vehicle
    if (testVehId) {
      const delVehRes = await req(port, `/api/vehicles/${testVehId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (delVehRes.status === 200) {
        console.log('   ✅ Vehicle Cleanup/Delete SUCCESS');
      } else {
        console.error('   ❌ Vehicle Delete FAILED:', delVehRes.text);
      }
    }

    // 5. NOTIFICATIONS API
    console.log('\n5️⃣  Testing Notifications API (GET /api/notifications?limit=30)...');
    const notifRes = await req(port, '/api/notifications?limit=30', {
      headers: authHeaders,
    });
    if (notifRes.status === 200 && notifRes.json?.success) {
      console.log(`   ✅ GET /api/notifications?limit=30 SUCCESS -> Unread: ${notifRes.json.unreadCount}, Count: ${notifRes.json.count}`);
    } else {
      console.error('   ❌ GET /api/notifications FAILED:', notifRes.text);
      testPassed = false;
    }

    // 6. PUBLIC CMS CONTENT & SETTINGS
    console.log('\n6️⃣  Testing Public CMS Content & Dealership Routes...');
    const publicEndpoints = [
      '/api/content/home',
      '/api/content/about',
      '/api/content/services',
      '/api/content/contact',
      '/api/social-links?activeOnly=true',
      '/api/departments',
      '/api/reviews',
      '/api/team',
    ];

    for (const ep of publicEndpoints) {
      const r = await req(port, ep);
      if (r.status === 200 && r.json?.success) {
        console.log(`   ✅ ${ep} -> Status: 200 OK`);
      } else {
        console.error(`   ❌ ${ep} -> Status: ${r.status}, Error: ${r.text}`);
        testPassed = false;
      }
    }

    console.log(`\n==================================================`);
    if (testPassed) {
      console.log(`🎉 ALL SYSTEM VERIFICATION CHECKS PASSED PERFECTLY!`);
    } else {
      console.error(`⚠️ SOME CHECKS FAILED - INSPECT LOGS ABOVE.`);
    }
    console.log(`==================================================\n`);

  } catch (err) {
    console.error('❌ System verification error:', err);
    testPassed = false;
  } finally {
    server.close(() => {
      process.exit(testPassed ? 0 : 1);
    });
  }
});
