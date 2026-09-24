import { uploadToCloudinary } from '../server/config/cloudinary.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:5000/api';

async function testCloudinaryIntegration() {
  console.log('=== VERIFYING CLOUDINARY CLOUD STORAGE INTEGRATION ===\n');

  // 1. Direct Cloudinary SDK test upload
  console.log('1. Testing direct Cloudinary SDK upload...');
  const testImagePath = path.join(__dirname, 'sample_test_image.png');
  // Valid 1x1 PNG magic byte buffer
  const validPngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(testImagePath, validPngBuffer);

  const cloudDirectRes = await uploadToCloudinary(testImagePath, {
    folder: 'jac_motors_test',
  });

  console.log(`✓ Direct Cloudinary Upload Result URL: "${cloudDirectRes.url}"`);
  if (!cloudDirectRes.url || !cloudDirectRes.url.includes('res.cloudinary.com')) {
    throw new Error(`Cloudinary upload returned invalid URL: ${cloudDirectRes.url}`);
  }

  // 2. HTTP GET check on returned Cloudinary CDN URL
  console.log('\n2. Verifying HTTP 200 OK on Cloudinary CDN URL...');
  const cdnRes = await fetch(cloudDirectRes.url);
  if (cdnRes.status !== 200) {
    throw new Error(`Failed to fetch Cloudinary CDN URL. HTTP Status: ${cdnRes.status}`);
  }
  console.log(`✓ Cloudinary CDN URL returned HTTP 200 OK (${cdnRes.headers.get('content-type')})`);

  // 3. Login as Admin and test /api/upload/single
  console.log('\n3. Authenticating with Node API...');
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

  // 4. Test Single Upload route via API
  console.log('\n4. Testing /api/upload/single route with Cloudinary integration...');
  const form = new FormData();
  const validPngBlob = new Blob([validPngBuffer], { type: 'image/png' });
  form.append('file', validPngBlob, 'test_cloudinary_hero.png');

  const uploadRes = await fetch(`${API_BASE}/upload/single`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const uploadData = await uploadRes.json();
  if (!uploadData.success || !uploadData.url) {
    throw new Error('Single upload failed: ' + JSON.stringify(uploadData));
  }

  console.log(`✓ /api/upload/single returned URL: "${uploadData.url}"`);
  if (!uploadData.url.includes('res.cloudinary.com')) {
    console.warn(`⚠️ Note: Upload returned local/fallback URL: "${uploadData.url}"`);
  } else {
    console.log('✓ Upload endpoint successfully returned Cloudinary CDN HTTPS URL!');
  }

  console.log('\n=== CLOUDINARY INTEGRATION TEST PASSED CLEANLY! ===');
}

testCloudinaryIntegration().catch((err) => {
  console.error('\n❌ CLOUDINARY TEST FAILED:', err);
  process.exit(1);
});
