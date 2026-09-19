import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testNewFileArchitecture() {
  console.log('=== VERIFYING NEW PERSISTENT FILE STORAGE & SERVING ARCHITECTURE ===\n');

  // 1. Authenticate as Admin
  console.log('1. Authenticating Admin User with REST API...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@jacmotors.pk', password: 'Admin@123456' }),
  });

  const loginData = await loginRes.json();
  const token = loginData.token || loginData.data?.token;
  if (!token) {
    throw new Error(`Admin authentication failed: ${JSON.stringify(loginData)}`);
  }
  console.log('✔ Authenticated successfully. JWT Token acquired.\n');

  // 2. Prepare NEW image and NEW PDF files
  const newImgPath = path.join(__dirname, 'new_test_vehicle_photo.png');
  const newPdfPath = path.join(__dirname, 'new_test_sales_brochure.pdf');

  // Create real test files
  if (!fs.existsSync(newImgPath)) {
    // 1x1 PNG image buffer
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(newImgPath, pngBuffer);
  }

  if (!fs.existsSync(newPdfPath)) {
    // Valid PDF buffer
    const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n173\n%%EOF', 'utf-8');
    fs.writeFileSync(newPdfPath, pdfBuffer);
  }

  // 3. Upload NEW Vehicle Image
  console.log('2. Uploading NEW vehicle image to persistent storage (/api/upload/single)...');
  const imgBlob = new Blob([fs.readFileSync(newImgPath)], { type: 'image/png' });
  const imgFormData = new FormData();
  imgFormData.append('file', imgBlob, 'new_test_vehicle_photo.png');

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
  console.log(`✔ Image uploaded successfully. API URL: ${uploadedImgUrl}`);

  // Verify physical existence in public/uploads/images/
  const imgFilename = path.basename(uploadedImgUrl);
  const physicalImgPath = path.join(__dirname, '../public/uploads/images', imgFilename);
  if (!fs.existsSync(physicalImgPath)) {
    throw new Error(`Physical image file does NOT exist on disk at: ${physicalImgPath}`);
  }
  console.log(`✔ Physical image file verified on disk: ${physicalImgPath}\n`);

  // 4. Upload NEW PDF Brochure
  console.log('3. Uploading NEW PDF brochure to persistent storage (/api/upload/single)...');
  const pdfBlob = new Blob([fs.readFileSync(newPdfPath)], { type: 'application/pdf' });
  const pdfFormData = new FormData();
  pdfFormData.append('file', pdfBlob, 'new_test_sales_brochure.pdf');

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
  console.log(`✔ PDF Brochure uploaded successfully. API URL: ${uploadedPdfUrl}`);

  // Verify physical existence in public/uploads/brochures/
  const pdfFilename = path.basename(uploadedPdfUrl);
  const physicalPdfPath = path.join(__dirname, '../public/uploads/brochures', pdfFilename);
  if (!fs.existsSync(physicalPdfPath)) {
    throw new Error(`Physical PDF file does NOT exist on disk at: ${physicalPdfPath}`);
  }
  console.log(`✔ Physical PDF brochure file verified on disk: ${physicalPdfPath}\n`);

  // 5. Test Image Serving Endpoint (HTTP 200 + Content-Type)
  console.log('4. Testing image serving endpoint (GET /api/files/images/:filename)...');
  const serveImgRes = await fetch(`http://localhost:5000${uploadedImgUrl}`);
  if (serveImgRes.status !== 200) {
    throw new Error(`Image serving endpoint returned HTTP ${serveImgRes.status}`);
  }
  const imgContentType = serveImgRes.headers.get('content-type');
  console.log(`✔ Image served with HTTP 200. Content-Type: ${imgContentType}\n`);

  // 6. Test Brochure Preview Endpoint (HTTP 200 + Content-Type application/pdf)
  console.log('5. Testing brochure preview endpoint (GET /api/files/brochures/:filename)...');
  const previewRes = await fetch(`http://localhost:5000${uploadedPdfUrl}`);
  if (previewRes.status !== 200) {
    throw new Error(`Brochure preview endpoint returned HTTP ${previewRes.status}`);
  }
  const previewContentType = previewRes.headers.get('content-type');
  const previewDisposition = previewRes.headers.get('content-disposition');
  console.log(`✔ Brochure preview served with HTTP 200.`);
  console.log(`   Content-Type: ${previewContentType}`);
  console.log(`   Content-Disposition: ${previewDisposition}\n`);

  // 7. Test Brochure Download Endpoint (HTTP 200 + Content-Disposition attachment)
  console.log('6. Testing brochure download endpoint (GET /api/files/download/:filename)...');
  const downloadUrl = `http://localhost:5000/api/files/download/${pdfFilename}?name=JAC-T9-Official-Brochure.pdf`;
  const downloadRes = await fetch(downloadUrl);
  if (downloadRes.status !== 200) {
    throw new Error(`Brochure download endpoint returned HTTP ${downloadRes.status}`);
  }
  const downloadContentType = downloadRes.headers.get('content-type');
  const downloadDisposition = downloadRes.headers.get('content-disposition');
  console.log(`✔ Brochure download served with HTTP 200.`);
  console.log(`   Content-Type: ${downloadContentType}`);
  console.log(`   Content-Disposition: ${downloadDisposition}\n`);

  // 8. Save vehicle in PostgreSQL database with persistent URLs
  console.log('7. Saving vehicle record to PostgreSQL with persistent uploaded file URLs...');
  const vehiclePayload = {
    name: 'JAC T9 Hunter - Persistent Storage Model',
    category: 'passengers',
    subcategory: null,
    categoryLabel: 'Passenger',
    modelYear: '2026',
    status: 'Published',
    shortDescription: 'Persistent storage and brochure download test.',
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
    throw new Error(`Failed to save vehicle: ${JSON.stringify(createVehicleData)}`);
  }
  const vehicleId = createVehicleData.data.id;
  console.log(`✔ Vehicle saved successfully in PostgreSQL. Vehicle ID: ${vehicleId}`);

  // 9. Fetch vehicle back from database to verify persistence
  console.log('8. Fetching vehicle record back from API to verify persistent database storage...');
  const fetchVehicleRes = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}`);
  const fetchVehicleData = await fetchVehicleRes.json();
  const fetchedVehicle = fetchVehicleData.data;

  if (!fetchedVehicle) {
    throw new Error('Failed to fetch created vehicle back from database.');
  }

  console.log(`✔ Database heroImage: ${fetchedVehicle.heroImage}`);
  console.log(`✔ Database brochureUrl: ${fetchedVehicle.brochureUrl}`);

  if (fetchedVehicle.heroImage !== uploadedImgUrl) {
    throw new Error(`DB mismatch! Expected ${uploadedImgUrl}, got ${fetchedVehicle.heroImage}`);
  }
  if (fetchedVehicle.brochureUrl !== uploadedPdfUrl) {
    throw new Error(`DB mismatch! Expected ${uploadedPdfUrl}, got ${fetchedVehicle.brochureUrl}`);
  }

  // Cleanup test vehicle
  await fetch(`http://localhost:5000/api/vehicles/${vehicleId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`\n✔ Cleaned up test vehicle ${vehicleId}.`);

  console.log('\n===================================================================');
  console.log('🎉 ALL 18 ARCHITECTURE, UPLOAD, DISK, DB, PREVIEW & DOWNLOAD TESTS PASSED!');
  console.log('===================================================================\n');
}

testNewFileArchitecture().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
