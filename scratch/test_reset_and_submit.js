const API_BASE = 'http://localhost:5000/api';

async function runTestFlow() {
  console.log('=====================================================');
  console.log('  TESTING FRESH RESET & CONTACT FORM SUBMISSION FLOW ');
  console.log('=====================================================');

  // Step 1: Admin Login
  console.log('\n1. Logging in as Admin...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@jacmotors.pk', password: 'Admin@123456' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token;
  if (!token) throw new Error('Admin login failed!');
  console.log('✔ Admin token acquired.');

  // Step 2: Verify Initial Clean State (0 Leads, 0 Notifications)
  console.log('\n2. Verifying clean state (0 Leads, 0 Notifications)...');
  const initialLeadsRes = await fetch(`${API_BASE}/leads`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const initialLeadsJson = await initialLeadsRes.json();
  const initialLeadsCount = (initialLeadsJson.data || []).length;

  const initialNotifRes = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const initialNotifJson = await initialNotifRes.json();
  const initialUnreadCount = initialNotifJson.count;

  console.log(`  - Leads Count: ${initialLeadsCount}`);
  console.log(`  - Unread Notifications: ${initialUnreadCount}`);

  if (initialLeadsCount !== 0 || initialUnreadCount !== 0) {
    throw new Error(`Initial state is not clean! Leads=${initialLeadsCount}, UnreadNotifs=${initialUnreadCount}`);
  }
  console.log('✔ Clean State 0 Verified.');

  // Step 3: Submit 1 New Contact Form
  console.log('\n3. Submitting 1 New Contact Form...');
  const submitRes = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Fresh Customer Inquiry',
      phone: '0300 7776655',
      email: 'fresh@example.com',
      department: 'Showroom & Sales',
      subject: 'Fresh Contact Inquiry',
      message: 'Testing fresh reset submission and notification trigger.',
    }),
  });
  const submitJson = await submitRes.json();
  if (!submitRes.ok || !submitJson.data?.id) {
    throw new Error(`Submit failed: ${JSON.stringify(submitJson)}`);
  }
  console.log(`✔ New Contact Form submitted! Lead ID: ${submitJson.data.id}`);

  // Step 4: Verify Admin Updates (1 Lead, 1 Unread Notification)
  console.log('\n4. Verifying Admin dashboard & notification state updates...');
  const updatedLeadsRes = await fetch(`${API_BASE}/leads`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const updatedLeadsJson = await updatedLeadsRes.json();
  const updatedLeads = updatedLeadsJson.data || [];

  const updatedNotifRes = await fetch(`${API_BASE}/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const updatedNotifJson = await updatedNotifRes.json();
  const updatedNotifs = updatedNotifJson.data || [];
  const updatedUnread = updatedNotifJson.unreadCount;

  console.log(`  - New Leads Count: ${updatedLeads.length}`);
  console.log(`  - New Unread Notifications Count: ${updatedUnread}`);

  if (updatedLeads.length !== 1) {
    throw new Error(`Expected exactly 1 lead in DB, got ${updatedLeads.length}`);
  }
  if (updatedUnread !== 1) {
    throw new Error(`Expected exactly 1 unread notification in DB, got ${updatedUnread}`);
  }

  const newNotif = updatedNotifs[0];
  console.log('✔ PostgreSQL Notification created:', {
    id: newNotif.id,
    type: newNotif.type,
    title: newNotif.title,
    message: newNotif.message,
    isRead: newNotif.isRead,
  });

  console.log('\n=====================================================');
  console.log('  1 Lead → 1 Notification → Admin Updates VERIFIED! ');
  console.log('=====================================================');
}

runTestFlow().catch((err) => {
  console.error('Test Flow Failed:', err);
  process.exit(1);
});
