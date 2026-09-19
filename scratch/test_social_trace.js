const API_BASE = 'http://localhost:5000/api';

async function runTrace() {
  console.log('=== TRACING SOCIAL MEDIA END-TO-END ===');

  // 1. Admin login
  console.log('\n1. Admin Login...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@jacmotors.pk', password: 'Admin@123456' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token;
  console.log('✔ Auth Token received.');

  // 2. Add Instagram via POST API
  console.log('\n2. Admin adds Instagram profile...');
  const postRes = await fetch(`${API_BASE}/social-links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      platform: 'Instagram',
      url: 'https://instagram.com/jacmotorspeshawar_official_test',
      icon: 'Instagram',
      isActive: true,
      displayOrder: 99
    })
  });
  const postData = await postRes.json();
  const newInsta = postData.data;
  console.log('✔ Admin Save response:', postData.success ? 'Success' : 'Failed', '- ID:', newInsta?.id);

  // 3. Query PostgreSQL via GET /api/social-links?activeOnly=true (what Public Footer calls)
  console.log('\n3. Public Footer calls GET /api/social-links?activeOnly=true...');
  const footerRes = await fetch(`${API_BASE}/social-links?activeOnly=true`);
  const footerData = await footerRes.json();
  const publicLinks = footerData.data || [];

  const foundInFooter = publicLinks.find(item => item.id === newInsta.id);
  if (!foundInFooter) {
    throw new Error('Newly created Instagram link was NOT found in public footer response!');
  }
  console.log('✔ Verified: Public Footer response contains Instagram with URL:', foundInFooter.url);

  // 4. Cleanup test entry
  console.log('\n4. Cleaning up test entry...');
  await fetch(`${API_BASE}/social-links/${newInsta.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('✔ Test entry cleaned up.');

  console.log('\n=== END-TO-END TRACE VERIFIED SUCCESSFULLY! ===');
}

runTrace().catch(err => {
  console.error('Trace Failed:', err);
  process.exit(1);
});
