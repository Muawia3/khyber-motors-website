import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFileStorageSystem() {
  console.log('=== VERIFYING PERSISTENT FILE STORAGE, UPLOAD, DB, AND SERVING SYSTEM ===\n');

  // 1. Authenticate as Admin
  console.log('1. Authenticating with Node API...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@jacmotors.pk', password: 'Admin@123456' }),
  });

  const loginData = await loginRes.json();
  const token = loginData.token || loginData.data?.token;
  if (!token) {
    throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
  }
  console.log('✔ Authenticated successfully. JWT token obtained.\n');

  // 2. Prepare test image & test PDF brochure files
  const testImgPath = path.join(__dirname, 'sample_test_image.jpg');
  const testPdfPath = path.join(__dirname, 'sample_test_brochure.pdf');

  // Create real test files if they don't exist
  if (!fs.existsSync(testImgPath)) {
    // 1x1 red pixel JPEG buffer
    const dummyJpg = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
    fs.writeFileSync(testImgPath, dummyJpg);
  }

  if (!fs.existsSync(testPdfPath)) {
    // Minimal valid PDF document buffer
    const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n173\n%%EOF', 'utf-8');
    fs.writeFileSync(testPdfPath, dummyPdf);
  }

  // 3. Test Uploading Image to /api/upload/single
  console.log('2. Uploading test image file to persistent storage...');
  const imgBlob = new Blob([fs.readFileSync(testImgPath)], { type: 'image/jpeg' });
  const imgFormData = new FormData();
  imgFormData.append('file', imgBlob, 'sample_test_image.jpg');

  const uploadImgRes = await fetch('http://localhost:5000/api/upload/single', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: imgFormData,
  });

  const uploadImgData = await uploadImgRes.json();
  if (!uploadImgData.success || !uploadImgData.url) {
    throw new Error(`Image upload failed: ${JSON.stringify(uploadImgData)}`);
  }
  const uploadedImgUrl = uploadImgData.url;
  console.log(`✔ Image uploaded successfully. Persistent URL: ${uploadedImgUrl}`);

  // Verify file exists physically on disk
  const imgFilename = path.basename(uploadedImgUrl);
  const physicalImgPath = path.join(__dirname, '../public/uploads', imgFilename);
  if (!fs.existsSync(physicalImgPath)) {
    throw new Error(`Physical image file does NOT exist on disk at: ${physicalImgPath}`);
  }
  console.log(`✔ Physical image verified on disk: ${physicalImgPath}\n`);

  // 4. Test Uploading PDF Brochure to /api/upload/single
  console.log('3. Uploading test PDF brochure file to persistent storage...');
  const pdfBlob = new Blob([fs.readFileSync(testPdfPath)], { type: 'application/pdf' });
  const pdfFormData = new FormData();
  pdfFormData.append('file', pdfBlob, 'sample_test_brochure.pdf');

  const uploadPdfRes = await fetch('http://localhost:5000/api/upload/single', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: pdfFormData,
  });

  const uploadPdfData = await uploadPdfRes.json();
  if (!uploadPdfData.success || !uploadPdfData.url) {
    throw new Error(`PDF upload failed: ${JSON.stringify(uploadPdfData)}`);
  }
  const uploadedPdfUrl = uploadPdfData.url;
  console.log(`✔ PDF Brochure uploaded successfully. Persistent URL: ${uploadedPdfUrl}`);

  // Verify file exists physically on disk
  const pdfFilename = path.basename(uploadedPdfUrl);
  const physicalPdfPath = path.join(__dirname, '../public/uploads', pdfFilename);
  if (!fs.existsSync(physicalPdfPath)) {
    throw new Error(`Physical PDF brochure file does NOT exist on disk at: ${physicalPdfPath}`);
  }
  console.log(`✔ Physical PDF brochure verified on disk: ${physicalPdfPath}\n`);

  // 5. Test Static File Serving (HTTP 200)
  console.log('4. Testing static HTTP serving for uploaded files...');
  const serveImgRes = await fetch(`http://localhost:5000${uploadedImgUrl}`);
  if (serveImgRes.status !== 200) {
    throw new Error(`Failed to serve image static file. Status: ${serveImgRes.status}`);
  }
  console.log(`✔ Static image served with HTTP ${serveImgRes.status} Content-Type: ${serveImgRes.headers.get('content-type')}`);

  const servePdfRes = await fetch(`http://localhost:5000${uploadedPdfUrl}`);
  if (servePdfRes.status !== 200) {
    throw new Error(`Failed to serve PDF static file. Status: ${servePdfRes.status}`);
  }
  console.log(`✔ Static PDF brochure served with HTTP ${servePdfRes.status} Content-Type: ${servePdfRes.headers.get('content-type')}\n`);

  // 6. Test Dedicated Download Endpoint
  console.log('5. Testing PDF Brochure Download Endpoint (/api/upload/download)...');
  const downloadUrl = `http://localhost:5000/api/upload/download?file=${encodeURIComponent(uploadedPdfUrl)}&name=T9-Hunter-Test-Brochure.pdf`;
  const downloadRes = await fetch(downloadUrl);

  if (downloadRes.status !== 200) {
    throw new Error(`Download endpoint failed with HTTP ${downloadRes.status}`);
  }
  const contentDisposition = downloadRes.headers.get('content-disposition');
  const contentType = downloadRes.headers.get('content-type');
  console.log(`✔ Download endpoint returned HTTP 200`);
  console.log(`   Content-Type: ${contentType}`);
  console.log(`   Content-Disposition: ${contentDisposition}\n`);

  // 7. Save persistent URLs to PostgreSQL vehicle database
  console.log('6. Saving vehicle record to PostgreSQL with persistent file URLs...');
  const vehiclePayload = {
    name: 'JAC T9 Hunter - Storage Test Model',
    category: 'passengers',
    subcategory: null,
    categoryLabel: 'Passenger',
    modelYear: '2026',
    status: 'Published',
    shortDescription: 'Persistent storage verification vehicle.',
    fullDescription: 'Verification for upload, database storage, static serving, and brochure download.',
    heroImage: uploadedImgUrl,
    mainImage: uploadedImgUrl,
    galleryImages: [uploadedImgUrl],
    brochureUrl: uploadedPdfUrl,
    brochureAvailable: true,
  };

  const createVehicleRes = await fetch('http://localhost:5000/api/vehicles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(vehiclePayload),
  });

  const createVehicleData = await createVehicleRes.json();
  if (!createVehicleData.success || !createVehicleData.data?.id) {
    throw new Error(`Failed to create vehicle: ${JSON.stringify(createVehicleData)}`);
  }
  const createdId = createVehicleData.data.id;
  console.log(`✔ Vehicle saved successfully in PostgreSQL with ID: ${createdId}`);

  // 8. Fetch vehicle back from API to verify DB persistence after refresh
  console.log('\n7. Verifying DB persistence after re-fetching from REST API...');
  const fetchVehicleRes = await fetch(`http://localhost:5000/api/vehicles/${createdId}`);
  const fetchVehicleData = await fetchVehicleRes.json();

  const fetchedVehicle = fetchVehicleData.data;
  if (!fetchedVehicle) {
    throw new Error('Failed to fetch created vehicle back from API.');
  }

  console.log(`✔ DB heroImage: ${fetchedVehicle.heroImage}`);
  console.log(`✔ DB brochureUrl: ${fetchedVehicle.brochureUrl}`);

  if (fetchedVehicle.heroImage !== uploadedImgUrl) {
    throw new Error(`Hero image URL mismatch! Expected ${uploadedImgUrl}, got ${fetchedVehicle.heroImage}`);
  }
  if (fetchedVehicle.brochureUrl !== uploadedPdfUrl) {
    throw new Error(`Brochure URL mismatch! Expected ${uploadedPdfUrl}, got ${fetchedVehicle.brochureUrl}`);
  }

  // Cleanup test vehicle
  await fetch(`http://localhost:5000/api/vehicles/${createdId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`\n✔ Cleaned up test vehicle ${createdId}.`);

  console.log('\n=== ALL STORAGE, UPLOAD, DB, PREVIEW & DOWNLOAD TESTS PASSED 100%! ===');
}

testFileStorageSystem().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
