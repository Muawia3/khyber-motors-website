import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runStockVerification() {
  console.log('=====================================================');
  console.log('  TESTING REAL POSTGRESQL VEHICLE STOCK MANAGEMENT   ');
  console.log('=====================================================');

  try {
    // Step 1: Admin Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@jacmotors.pk', password: 'Admin@123456' }),
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    console.log('✔ Authenticated Admin JWT Session');

    // Step 2: Fetch vehicles from DB
    const listRes = await fetch('http://localhost:5000/api/vehicles');
    const listData = await listRes.json();
    const vehicles = listData.data;

    if (!vehicles || vehicles.length === 0) {
      throw new Error('No vehicles found in database catalog.');
    }

    const t9Vehicle = vehicles.find((v) => v.name.includes('T9')) || vehicles[0];
    const t8Vehicle = vehicles.find((v) => v.name.includes('T8')) || vehicles[1] || vehicles[0];

    console.log(`Target Vehicle 1: ${t9Vehicle.name} (ID: ${t9Vehicle.id})`);
    console.log(`Target Vehicle 2: ${t8Vehicle.name} (ID: ${t8Vehicle.id})`);

    // Step 3: Set T9 quantity to 5
    console.log('\n--- TEST A: Set T9 Quantity to 5 ---');
    const updateT9Res = await fetch(`http://localhost:5000/api/vehicles/${t9Vehicle.id}/stock`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ stockQuantity: 5, stockStatus: 'in_stock' }),
    });
    const updateT9Data = await updateT9Res.json();
    console.log(`Updated T9 Stock Quantity: ${updateT9Data.data.stockQuantity}`);
    console.log(`Updated T9 Stock Status: ${updateT9Data.data.stockStatus}`);

    if (updateT9Data.data.stockQuantity !== 5 || updateT9Data.data.stockStatus !== 'in_stock') {
      throw new Error(`Expected T9 (5, in_stock), got (${updateT9Data.data.stockQuantity}, ${updateT9Data.data.stockStatus})`);
    }

    // Step 4: Set T9 quantity to 0 -> check automatic status logic (out_of_stock)
    console.log('\n--- TEST B: Set T9 Quantity to 0 (Automatic Out of Stock) ---');
    const updateT9ZeroRes = await fetch(`http://localhost:5000/api/vehicles/${t9Vehicle.id}/stock`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ stockQuantity: 0 }),
    });
    const updateT9ZeroData = await updateT9ZeroRes.json();
    console.log(`Updated T9 Stock Quantity: ${updateT9ZeroData.data.stockQuantity}`);
    console.log(`Updated T9 Stock Status: ${updateT9ZeroData.data.stockStatus}`);

    if (updateT9ZeroData.data.stockQuantity !== 0 || updateT9ZeroData.data.stockStatus !== 'out_of_stock') {
      throw new Error(`Expected T9 (0, out_of_stock), got (${updateT9ZeroData.data.stockQuantity}, ${updateT9ZeroData.data.stockStatus})`);
    }

    // Step 5: Update T8 vehicle stock and verify T9 is isolated
    console.log('\n--- TEST C: Update T8 Quantity to 12 (Isolation Test) ---');
    const updateT8Res = await fetch(`http://localhost:5000/api/vehicles/${t8Vehicle.id}/stock`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ stockQuantity: 12 }),
    });
    const updateT8Data = await updateT8Res.json();
    console.log(`Updated T8 Stock Quantity: ${updateT8Data.data.stockQuantity}`);
    console.log(`Updated T8 Stock Status: ${updateT8Data.data.stockStatus}`);

    // Verify T9 in DB directly via Prisma
    const t9FromDb = await prisma.vehicle.findUnique({ where: { id: t9Vehicle.id } });
    console.log(`Direct DB Query T9 Quantity: ${t9FromDb.stockQuantity}, Status: ${t9FromDb.stockStatus}`);

    if (t9FromDb.stockQuantity !== 0 || t9FromDb.stockStatus !== 'out_of_stock') {
      throw new Error(`Isolation check failed! T9 was mutated unexpectedly.`);
    }

    // Restore T9 to 5 units for live demonstration
    await fetch(`http://localhost:5000/api/vehicles/${t9Vehicle.id}/stock`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ stockQuantity: 5, stockStatus: 'in_stock' }),
    });

    console.log('\n=====================================================');
    console.log('  ✅ VERIFICATION SUCCESSFUL: STOCK MANAGEMENT REAL  ');
    console.log('=====================================================');
  } catch (err) {
    console.error('\n❌ Stock Verification Failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runStockVerification();
