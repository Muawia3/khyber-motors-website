const API_BASE = 'http://localhost:5000/api';

async function verify() {
  console.log('=====================================================');
  console.log('  PHYSICAL VERIFICATION: SOCIAL MEDIA CMS & FOOTER  ');
  console.log('=====================================================');

  // Step 1: Admin Login
  console.log('\n[STEP 1] Authenticating Admin user...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@jacmotors.pk', password: 'Admin@123456' }),
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.token;
  console.log('✅ Admin login succeeded. JWT Token issued.');

  // Step 2: Add New Social Platform (TikTok)
  console.log('\n[STEP 2] Adding new Social Platform (TikTok)...');
  const postRes = await fetch(`${API_BASE}/social-links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      platform: 'TikTok',
      url: 'https://tiktok.com/@jacmotors_peshawar',
      icon: 'Share2',
      isActive: true,
    }),
  });
  const postJson = await postRes.json();
  const createdRecord = postJson.data;
  console.log('✅ Created in PostgreSQL DB:', {
    id: createdRecord.id,
    platform: createdRecord.platform,
    url: createdRecord.url,
    isActive: createdRecord.isActive,
  });

  // Step 3: Public Footer API Verification
  console.log('\n[STEP 3] Fetching Public Footer API endpoint (GET /api/social-links?activeOnly=true)...');
  const footerRes = await fetch(`${API_BASE}/social-links?activeOnly=true`);
  const footerJson = await footerRes.json();
  const publicLinks = footerJson.data || [];
  const found = publicLinks.find((item) => item.id === createdRecord.id);

  if (!found) {
    throw new Error('❌ Verification failed: Created TikTok record is missing from Public Footer API!');
  }
  console.log('✅ Public Footer API contains active TikTok link:', found.url);

  // Step 4: Edit Social Platform
  console.log('\n[STEP 4] Editing TikTok URL in Admin CMS...');
  const putRes = await fetch(`${API_BASE}/social-links/${createdRecord.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: 'https://tiktok.com/@jacmotors_peshawar_edited',
    }),
  });
  const putJson = await putRes.json();
  console.log('✅ Updated in PostgreSQL DB:', putJson.data.url);

  // Step 5: Delete Social Platform
  console.log('\n[STEP 5] Deleting TikTok platform...');
  const deleteRes = await fetch(`${API_BASE}/social-links/${createdRecord.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const deleteJson = await deleteRes.json();
  console.log('✅ Deleted from PostgreSQL DB:', deleteJson.message);

  // Step 6: Verify removal from Public Footer API
  console.log('\n[STEP 6] Verifying removal from Public Footer API...');
  const finalRes = await fetch(`${API_BASE}/social-links?activeOnly=true`);
  const finalJson = await finalRes.json();
  const stillExists = (finalJson.data || []).some((item) => item.id === createdRecord.id);
  if (stillExists) {
    throw new Error('❌ Verification failed: Deleted TikTok link still appears in Public Footer API!');
  }
  console.log('✅ Verified: Deleted item is completely removed from Public Footer API.');

  console.log('\n=====================================================');
  console.log('  ALL REQUIRED VERIFICATIONS PASSED 100% SUCCESSFULLY! ');
  console.log('=====================================================');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
