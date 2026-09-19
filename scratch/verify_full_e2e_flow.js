import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyFullE2EFlow() {
  console.log('===================================================================');
  console.log('      FULL END-TO-END FILE UPLOAD & SERVING DIAGNOSIS & VERIFICATION');
  console.log('===================================================================\n');

  // Step 1: Authenticate Admin
  console.log('Step 1: Authenticating Admin User...');
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
  console.log('✔ Authenticated successfully. Token acquired.\n');

  // Step 2: Create local test image and test PDF
  const testImgPath = path.join(__dirname, 'e2e_test_image.png');
  const testPdfPath = path.join(__dirname, 'e2e_test_brochure.pdf');

  if (!fs.existsSync(testImgPath)) {
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testImgPath, pngBuffer);
  }

  if (!fs.existsSync(testPdfPath)) {
    const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n173\n%%EOF', 'utf-8');
    fs.writeFileSync(testPdfPath, pdfBuffer);
  }

  // Step 3: Upload Image File to backend
  console.log('Step 2: Uploading NEW Vehicle Image to Backend...');
  const imgBlob = new Blob([fs.readFileSync(testImgPath)], { type: 'image/png' });
  const imgFormData = new FormData();
  imgFormData.append('file', imgBlob, 'e2e_test_image.png');

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
  console.log(`✔ Uploaded image API URL: ${uploadedImgUrl}`);

  // Verify physical existence on server disk
  const imgFilename = path.basename(uploadedImgUrl);
  const physicalImgPath = path.join(__dirname, '../public/uploads/images', imgFilename);
  if (!fs.existsSync(physicalImgPath)) {
    throw new Error(`Physical image file NOT found on disk at: ${physicalImgPath}`);
  }
  console.log(`✔ Physical image verified on disk: ${physicalImgPath}\n`);

  // Step 4: Upload PDF Brochure to backend
  console.log('Step 3: Uploading NEW PDF Brochure to Backend...');
  const pdfBlob = new Blob([fs.readFileSync(testPdfPath)], { type: 'application/pdf' });
  const pdfFormData = new FormData();
  pdfFormData.append('file', pdfBlob, 'e2e_test_brochure.pdf');

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
  console.log(`✔ Uploaded brochure API URL: ${uploadedPdfUrl}`);

  // Verify physical existence on server disk
  const pdfFilename = path.basename(uploadedPdfUrl);
  const physicalPdfPath = path.join(__dirname, '../public/uploads/brochures', pdfFilename);
  if (!fs.existsSync(physicalPdfPath)) {
    throw new Error(`Physical PDF brochure NOT found on disk at: ${physicalPdfPath}`);
  }
  console.log(`✔ Physical PDF brochure verified on disk: ${physicalPdfPath}\n`);

  // Step 5: Test Image GET Request
  console.log('Step 4: Testing GET Image Request (GET /api/files/images/:filename)...');
  const getImgRes = await fetch(`http://localhost:5000${uploadedImgUrl}`);
  console.log(`✔ HTTP Status: ${getImgRes.status} ${getImgRes.statusText}`);
  console.log(`✔ Content-Type: ${getImgRes.headers.get('content-type')}`);
  if (getImgRes.status !== 200 || !getImgRes.headers.get('content-type').includes('image/')) {
    throw new Error(`Image GET request failed! Status: ${getImgRes.status}`);
  }
  console.log();

  // Step 6: Test PDF Preview GET Request
  console.log('Step 5: Testing PDF Brochure Preview GET Request (GET /api/files/brochures/:filename)...');
  const getPreviewRes = await fetch(`http://localhost:5000${uploadedPdfUrl}`);
  console.log(`✔ HTTP Status: ${getPreviewRes.status} ${getPreviewRes.statusText}`);
  console.log(`✔ Content-Type: ${getPreviewRes.headers.get('content-type')}`);
  console.log(`✔ Content-Disposition: ${getPreviewRes.headers.get('content-disposition')}`);
  if (getPreviewRes.status !== 200 || !getPreviewRes.headers.get('content-type').includes('application/pdf')) {
    throw new Error(`Brochure preview GET request failed! Status: ${getPreviewRes.status}`);
  }
  console.log();

  // Step 7: Test PDF Download GET Request
  console.log('Step 6: Testing PDF Brochure Download GET Request (GET /api/files/download/:filename)...');
  const downloadApiUrl = `http://localhost:5000/api/files/download/${pdfFilename}?name=JAC-T9-E2E-Brochure.pdf`;
  const getDownloadRes = await fetch(downloadApiUrl);
  console.log(`✔ HTTP Status: ${getDownloadRes.status} ${getDownloadRes.statusText}`);
  console.log(`✔ Content-Type: ${getDownloadRes.headers.get('content-type')}`);
  console.log(`✔ Content-Disposition: ${getDownloadRes.headers.get('content-disposition')}`);
  if (getDownloadRes.status !== 200 || !getDownloadRes.headers.get('content-disposition').includes('attachment')) {
    throw new Error(`Brochure download GET request failed! Status: ${getDownloadRes.status}`);
  }
  console.log();

  // Step 8: Create Vehicle Record in PostgreSQL
  console.log('Step 7: Creating Vehicle Record in PostgreSQL Database...');
  const vehiclePayload = {
    name: 'JAC T9 Hunter - E2E Verified Vehicle',
    category: 'passengers',
    subcategory: null,
    categoryLabel: 'Passenger',
    modelYear: '2026',
    status: 'Published',
    shortDescription: 'Verified vehicle record with uploaded media.',
    fullDescription: 'Verification test for complete upload, database storage, static serving, and brochure download.',
    heroImage: uploadedImgUrl,
    mainImage: uploadedImgUrl,
    galleryImages: [uploadedImgUrl],
    brochureUrl: uploadedPdfUrl,
    brochureAvailable: true,
  };

  const createRes = await fetch('http://localhost:5000/api/vehicles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(vehiclePayload),
  });

  const createData = await createRes.json();
  if (!createData.success || !createData.data?.id) {
    throw new Error(`Failed to create vehicle: ${JSON.stringify(createData)}`);
  }
  const createdId = createData.data.id;
  console.log(`✔ Vehicle record created in PostgreSQL. Vehicle ID: ${createdId}\n`);

  // Step 9: Re-fetch Vehicle Record from Database
  console.log('Step 8: Fetching Vehicle Record back from REST API...');
  const fetchRes = await fetch(`http://localhost:5000/api/vehicles/${createdId}`);
  const fetchData = await fetchRes.json();
  const fetchedVh = fetchData.data;

  console.log(`✔ Database heroImage: ${fetchedVh.heroImage}`);
  console.log(`✔ Database brochureUrl: ${fetchedVh.brochureUrl}`);

  if (fetchedVh.heroImage !== uploadedImgUrl || fetchedVh.brochureUrl !== uploadedPdfUrl) {
    throw new Error('Database record path mismatch!');
  }

  // Clean up test vehicle
  await fetch(`http://localhost:5000/api/vehicles/${createdId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`✔ Cleaned up test vehicle ${createdId}.\n`);

  console.log('===================================================================');
  console.log('🎉 FULL END-TO-END DIAGNOSIS & VERIFICATION COMPLETED WITH 100% SUCCESS!');
  console.log('===================================================================');
}

verifyFullE2EFlow().catch((err) => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
