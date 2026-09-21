import { getFileUrl } from '../src/utils/urlHelper.js';

const API_BASE = 'http://localhost:5000/api';

async function runTest() {
  console.log('--- STARTING IMAGE SYNC & PERSISTENCE INTEGRATION TEST ---');

  // 1. Verify URL Helper sanitization
  console.log('1. Testing URL Helper sanitization...');
  const testLocalUrl = 'http://localhost:5000/api/files/images/file-123.jpg';
  const test127Url = 'http://127.0.0.1:5000/uploads/images/file-456.png';
  const testRelUrl = '/api/files/images/file-789.webp';
  const testExternalUrl = 'https://images.unsplash.com/photo-12345';

  const resLocal = getFileUrl(testLocalUrl);
  const res127 = getFileUrl(test127Url);
  const resRel = getFileUrl(testRelUrl);
  const resExt = getFileUrl(testExternalUrl);

  if (resLocal !== '/api/files/images/file-123.jpg') {
    throw new Error(`urlHelper failed to sanitize localhost URL: expected "/api/files/images/file-123.jpg", got "${resLocal}"`);
  }
  if (res127 !== '/uploads/images/file-456.png') {
    throw new Error(`urlHelper failed to sanitize 127.0.0.1 URL: expected "/uploads/images/file-456.png", got "${res127}"`);
  }
  if (resRel !== '/api/files/images/file-789.webp') {
    throw new Error(`urlHelper failed to preserve relative URL: got "${resRel}"`);
  }
  if (resExt !== testExternalUrl) {
    throw new Error(`urlHelper failed to preserve external URL: got "${resExt}"`);
  }
  console.log('✓ URL Helper sanitization passed cleanly!');

  // 2. Login as Admin
  console.log('\n2. Logging in as Admin...');
  let loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@jacmotors.pk',
      password: 'Admin@123456',
    }),
  });

  let loginData = await loginRes.json();
  if (!loginData.token && !loginData.data?.token) {
    loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'muawiakhan000@gmail.com',
        password: 'Ameer100$',
      }),
    });
    loginData = await loginRes.json();
  }

  const token = loginData.token || loginData.data?.token;
  if (!token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginData));
  }
  console.log('✓ Admin login successful!');

  // 3. Upload a sample image via /api/upload/single
  console.log('\n3. Uploading image to persistent server storage...');
  const form = new FormData();
  const dummyBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  const dummyBlob = new Blob([dummyBuffer], { type: 'image/gif' });
  form.append('file', dummyBlob, 'test_sync_image.gif');

  const uploadRes = await fetch(`${API_BASE}/upload/single`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const uploadData = await uploadRes.json();
  if (!uploadData.success || !uploadData.url) {
    throw new Error('Single image upload failed: ' + (uploadData.error || 'No URL returned'));
  }
  const uploadedUrl = uploadData.url;
  console.log(`✓ Image uploaded successfully to URL: "${uploadedUrl}"`);

  // 4. Test HTTP File serving & Cache-Control header
  console.log('\n4. Fetching uploaded image file to verify HTTP 200 & Cache-Control...');
  const fileServRes = await fetch(`http://localhost:5000${uploadedUrl}`);
  if (fileServRes.status !== 200) {
    throw new Error(`Failed to fetch uploaded image file from endpoint. HTTP status: ${fileServRes.status}`);
  }
  const cacheControl = fileServRes.headers.get('cache-control') || '';
  if (cacheControl.includes('immutable')) {
    throw new Error(`Cache-Control header contains "immutable" which prevents revalidation! Header: "${cacheControl}"`);
  }
  if (!cacheControl.includes('must-revalidate')) {
    throw new Error(`Cache-Control header expected to contain "must-revalidate". Got: "${cacheControl}"`);
  }
  console.log(`✓ Image endpoint returned HTTP 200 OK with valid revalidation Cache-Control header ("${cacheControl}")`);

  // 5. Hero Image CRUD & Public API verification
  console.log('\n5. Creating Hero Image record...');
  const heroCreateRes = await fetch(`${API_BASE}/hero-images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: uploadedUrl,
      title: 'E2E Image Sync Test Banner',
      altText: 'Test Banner Alt Text',
      isActive: true,
      displayOrder: 99,
    }),
  });
  const heroCreateData = await heroCreateRes.json();
  if (!heroCreateData.success || !heroCreateData.data?.id) {
    throw new Error('Hero image creation failed: ' + (heroCreateData.error || 'No record ID returned'));
  }
  const heroId = heroCreateData.data.id;
  console.log(`✓ Hero image created in DB with ID: "${heroId}"`);

  // Fetch public active hero images
  console.log('\n6. Fetching public active hero images from API...');
  const publicHeroRes = await fetch(`${API_BASE}/hero-images?activeOnly=true`);
  const publicHeroData = await publicHeroRes.json();
  if (!publicHeroData.success || !Array.isArray(publicHeroData.data)) {
    throw new Error('Failed to fetch public hero images');
  }
  const foundHero = publicHeroData.data.find((h) => h.id === heroId);
  if (!foundHero) {
    throw new Error('Newly created hero image record was not found in public active API response!');
  }
  if (foundHero.url !== uploadedUrl) {
    throw new Error(`Public hero image URL mismatch. Expected "${uploadedUrl}", got "${foundHero.url}"`);
  }
  console.log('✓ Public Hero Images API returned latest uploaded image URL!');

  // Clean up hero image
  await fetch(`${API_BASE}/hero-images/${heroId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('✓ Cleaned up test hero image.');

  console.log('\n=== ALL IMAGE SYNC & PERSISTENCE INTEGRATION TESTS PASSED CLEANLY! ===');
}

runTest().catch((err) => {
  console.error('\n❌ INTEGRATION TEST FAILED:', err);
  process.exit(1);
});
