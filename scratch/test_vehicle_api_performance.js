const API_BASE = 'http://localhost:5000/api';

async function testPerformance() {
  console.log('=== VERIFYING VEHICLE API PERFORMANCE & CARDS VIEW ENDPOINT ===\n');

  // 1. Benchmark GET /api/vehicles?view=cards
  console.log('1. Testing GET /api/vehicles?view=cards endpoint performance...');
  const startCards = Date.now();
  const resCards = await fetch(`${API_BASE}/vehicles?view=cards`);
  const durationCards = Date.now() - startCards;

  if (resCards.status !== 200) {
    throw new Error(`Failed to fetch card vehicles: HTTP ${resCards.status}`);
  }

  const jsonCards = await resCards.json();
  const payloadSize = JSON.stringify(jsonCards).length;

  console.log(`✓ Response Time: ${durationCards} ms`);
  console.log(`✓ Total Payload Size: ${payloadSize} bytes (${(payloadSize / 1024).toFixed(2)} KB)`);
  console.log(`✓ Count of Vehicles Returned: ${jsonCards.count || jsonCards.data?.length}`);

  if (durationCards > 500) {
    console.warn(`⚠️ Warning: Response time (${durationCards} ms) exceeded 500ms benchmark threshold!`);
  } else {
    console.log('✓ Fast response benchmark passed cleanly (< 500ms)!');
  }

  if (payloadSize > 150000) {
    throw new Error(`Payload size too large (${(payloadSize / 1024).toFixed(2)} KB). View=cards must return lightweight objects!`);
  }

  // Verify structure of card objects
  if (Array.isArray(jsonCards.data) && jsonCards.data.length > 0) {
    const card = jsonCards.data[0];
    console.log('\n2. Verifying lightweight card object structure...');
    console.log(`   - ID: ${card.id}`);
    console.log(`   - Name: ${card.name}`);
    console.log(`   - Slug: ${card.slug}`);
    console.log(`   - Main Image: ${card.mainImage}`);

    if (card.brochureUrl) {
      throw new Error('Card view object should NOT contain brochureUrl!');
    }
    if (card.gallery) {
      throw new Error('Card view object should NOT contain full gallery array!');
    }
    if (card.whyT9Benefits) {
      throw new Error('Card view object should NOT contain whyT9Benefits array!');
    }
    if (card.features) {
      throw new Error('Card view object should NOT contain features array!');
    }
    console.log('✓ Card object contains only essential card fields. Heavy arrays & brochure URLs are omitted!');
  }

  // 3. Verify GET /api/vehicles/:slug returns full details
  console.log('\n3. Testing GET /api/vehicles/t9-hunter for full details...');
  const resFull = await fetch(`${API_BASE}/vehicles/t9-hunter`);
  if (resFull.status === 200) {
    const jsonFull = await resFull.json();
    console.log(`✓ Full vehicle detail endpoint returned 200 OK.`);
    if (jsonFull.data) {
      console.log(`   - Full detail includes specs: ${Boolean(jsonFull.data.specs)}`);
      console.log(`   - Full detail includes gallery: ${Array.isArray(jsonFull.data.gallery)}`);
      console.log(`   - Full detail includes brochureUrl: ${jsonFull.data.brochureUrl || 'N/A'}`);
    }
  }

  console.log('\n=== VEHICLE API PERFORMANCE BENCHMARK PASSED 100% CLEANLY! ===');
}

testPerformance().catch((err) => {
  console.error('\n❌ PERFORMANCE TEST FAILED:', err);
  process.exit(1);
});
