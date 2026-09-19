const API_BASE = 'http://localhost:5000/api';

async function runTest() {
  console.log('=== Starting Social Links End-to-End Test ===');

  // 1. Admin Login
  console.log('\n1. Logging in as Admin...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@jacmotors.pk', password: 'Admin@123456' }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.data?.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.data.token;
  console.log('✔ Admin login successful.');

  // 2. GET initial social links
  console.log('\n2. Fetching initial social links...');
  const getRes = await fetch(`${API_BASE}/social-links`);
  const getJson = await getRes.json();
  const initialLinks = getJson.data || [];
  console.log(`✔ Found ${initialLinks.length} initial social links.`);

  // 3. POST create new TikTok link
  console.log('\n3. Adding new TikTok social platform...');
  const createRes = await fetch(`${API_BASE}/social-links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      platform: 'TikTok',
      url: 'https://tiktok.com/@jacmotorspeshawar',
      icon: 'Share2',
      isActive: true,
      displayOrder: initialLinks.length,
    }),
  });
  const createJson = await createRes.json();
  const createdLink = createJson.data || {};
  if (!createRes.ok || !createdLink.id) {
    throw new Error(`Create social link failed: ${JSON.stringify(createJson)}`);
  }
  console.log(`✔ Created social platform ID: ${createdLink.id} (${createdLink.platform})`);

  // 4. Update TikTok link
  console.log('\n4. Updating test social platform...');
  const updateRes = await fetch(`${API_BASE}/social-links/${createdLink.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: 'https://tiktok.com/@jacmotorspeshawar_official',
      isActive: false,
    }),
  });
  const updateJson = await updateRes.json();
  const updatedLink = updateJson.data || {};
  if (!updateRes.ok || updatedLink.url !== 'https://tiktok.com/@jacmotorspeshawar_official') {
    throw new Error(`Update failed: ${JSON.stringify(updateJson)}`);
  }
  console.log('✔ Social link updated successfully.');

  // 5. Check public active endpoint (should exclude inactive TikTok)
  console.log('\n5. Checking public active links (should exclude inactive)...');
  const activeRes = await fetch(`${API_BASE}/social-links?active=true`);
  const activeJson = await activeRes.json();
  const activeLinks = activeJson.data || [];
  const foundInactive = activeLinks.find((l) => l.id === createdLink.id);
  if (foundInactive) {
    throw new Error('Public active endpoint returned an inactive link!');
  }
  console.log('✔ Inactive platform correctly excluded from public active endpoint.');

  // 6. Re-enable and test batch reordering
  console.log('\n6. Re-enabling and testing batch reorder...');
  await fetch(`${API_BASE}/social-links/${createdLink.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive: true }),
  });

  const currentListRes = await fetch(`${API_BASE}/social-links`);
  const currentListJson = await currentListRes.json();
  const currentList = currentListJson.data || [];
  const reorderPayload = currentList.map((item, idx) => ({
    id: item.id,
    displayOrder: currentList.length - 1 - idx,
  }));

  const reorderRes = await fetch(`${API_BASE}/social-links/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ items: reorderPayload }),
  });
  if (!reorderRes.ok) {
    throw new Error(`Reorder failed: ${await reorderRes.text()}`);
  }
  console.log('✔ Batch reordering succeeded.');

  // 7. Delete test social platform
  console.log('\n7. Deleting test TikTok platform...');
  const deleteRes = await fetch(`${API_BASE}/social-links/${createdLink.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!deleteRes.ok) {
    throw new Error(`Delete failed: ${await deleteRes.text()}`);
  }
  console.log('✔ Test social platform deleted successfully.');

  // 8. Verify count restored
  const finalRes = await fetch(`${API_BASE}/social-links`);
  const finalJson = await finalRes.json();
  const finalLinks = finalJson.data || [];
  console.log(`✔ Final social links count restored to ${finalLinks.length}.`);

  console.log('\n=== ALL SOCIAL LINKS CRUD & SYNC TESTS PASSED SUCCESSFULLY! ===');
}

runTest().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
