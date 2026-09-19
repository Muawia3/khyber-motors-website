import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'jac_motors_peshawar_super_secret_jwt_key_2026';
const token = jwt.sign({ id: 'admin-id', email: 'admin@jacmotors.com' }, JWT_SECRET, { expiresIn: '1h' });

async function testUpload() {
  const testFilePath = path.join(__dirname, 'test-avatar.png');
  fs.writeFileSync(testFilePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));

  const fileBuffer = fs.readFileSync(testFilePath);
  const fileBlob = new Blob([fileBuffer], { type: 'image/png' });

  const formData = new FormData();
  formData.append('file', fileBlob, 'test-avatar.png');

  console.log('Sending upload request to http://localhost:5000/api/upload/single...');
  const uploadRes = await fetch('http://localhost:5000/api/upload/single', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const uploadData = await uploadRes.json();
  console.log('Upload Response:', JSON.stringify(uploadData, null, 2));

  const uploadedUrl = uploadData?.url || uploadData?.data?.url;

  if (!uploadData.success || !uploadedUrl) {
    throw new Error('Upload failed!');
  }

  // Create review with uploaded image URL
  console.log('Creating review with avatar URL:', uploadedUrl);
  const createRes = await fetch('http://localhost:5000/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      customerName: 'Verified Fleet Owner',
      avatarUrl: uploadedUrl,
      rating: 5,
      reviewText: 'Outstanding fuel economy and payload durability across our transport fleet in KP.',
      reviewDate: 'September 2026',
      isActive: true,
    }),
  });

  const createData = await createRes.json();
  console.log('Created Review Result:', JSON.stringify(createData, null, 2));

  // Verify public GET /api/reviews returns review with avatarUrl
  const publicRes = await fetch('http://localhost:5000/api/reviews');
  const publicData = await publicRes.json();
  console.log('Public Reviews Count:', publicData.data.length);
  const createdInPublic = publicData.data.find(r => r.id === createData.data.id);
  console.log('Verified Review in Public API:', JSON.stringify(createdInPublic, null, 2));

  // Clean up scratch image
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
  }
}

testUpload().catch(console.error);
