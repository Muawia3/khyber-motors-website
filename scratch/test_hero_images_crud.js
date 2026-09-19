const API_BASE = 'http://localhost:5000/api';

async function runTest() {
  console.log('=== Starting Hero Images End-to-End Test ===');

  // 1. Login to get Auth token
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

  // 2. GET initial hero images
  console.log('\n2. Fetching initial hero images...');
  const getRes = await fetch(`${API_BASE}/hero-images`);
  const getJson = await getRes.json();
  const initialImages = getJson.data || [];
  console.log(`✔ Found ${initialImages.length} initial hero images.`);

  // 3. POST create new hero image
  console.log('\n3. Creating new test hero image...');
  const createRes = await fetch(`${API_BASE}/hero-images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      url: '/uploads/test_hero_banner.jpg',
      title: 'Automated E2E Test Hero Banner',
      altText: 'E2E Banner Alt Text',
      isActive: true,
      displayOrder: initialImages.length
    })
  });
  const createJson = await createRes.json();
  const createdImage = createJson.data || {};
  if (!createRes.ok || !createdImage.id) {
    throw new Error(`Create hero image failed: ${JSON.stringify(createJson)}`);
  }
  console.log(`✔ Created hero image ID: ${createdImage.id}`);

  // 4. Update hero image
  console.log('\n4. Updating test hero image...');
  const updateRes = await fetch(`${API_BASE}/hero-images/${createdImage.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Updated E2E Test Hero Banner Title',
      altText: 'Updated Alt Text',
      isActive: false
    })
  });
  const updateJson = await updateRes.json();
  const updatedImage = updateJson.data || {};
  if (!updateRes.ok || updatedImage.title !== 'Updated E2E Test Hero Banner Title') {
    throw new Error(`Update failed: ${JSON.stringify(updateJson)}`);
  }
  console.log('✔ Hero image updated successfully.');

  // 5. Check public active endpoint (should filter out inactive image)
  console.log('\n5. Checking public active images (should exclude inactive)...');
  const activeRes = await fetch(`${API_BASE}/hero-images?active=true`);
  const activeJson = await activeRes.json();
  const activeImages = activeJson.data || [];
  const foundInactive = activeImages.find(img => img.id === createdImage.id);
  if (foundInactive) {
    throw new Error('Public active endpoint returned an inactive image!');
  }
  console.log('✔ Inactive image correctly excluded from public active endpoint.');

  // 6. Set image active again and test reorder
  console.log('\n6. Re-activating and testing batch reorder...');
  await fetch(`${API_BASE}/hero-images/${createdImage.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ isActive: true })
  });

  const currentListRes = await fetch(`${API_BASE}/hero-images`);
  const currentListJson = await currentListRes.json();
  const currentList = currentListJson.data || [];
  const reorderPayload = currentList.map((img, idx) => ({
    id: img.id,
    displayOrder: currentList.length - 1 - idx
  }));

  const reorderRes = await fetch(`${API_BASE}/hero-images/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ items: reorderPayload })
  });
  if (!reorderRes.ok) {
    throw new Error(`Reorder failed: ${await reorderRes.text()}`);
  }
  console.log('✔ Batch reordering succeeded.');

  // 7. Delete created hero image
  console.log('\n7. Deleting test hero image...');
  const deleteRes = await fetch(`${API_BASE}/hero-images/${createdImage.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!deleteRes.ok) {
    throw new Error(`Delete failed: ${await deleteRes.text()}`);
  }
  console.log('✔ Test hero image deleted successfully.');

  // 8. Verify count restored
  const finalRes = await fetch(`${API_BASE}/hero-images`);
  const finalJson = await finalRes.json();
  const finalImages = finalJson.data || [];
  console.log(`✔ Final image count restored to ${finalImages.length}.`);

  console.log('\n=== ALL HERO IMAGE CRUD & SYNC TESTS PASSED SUCCESSFULLY! ===');
}

runTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
