const API_BASE = 'http://localhost:5000/api';

async function runTest() {
  console.log('=== Starting Admin Notifications System End-to-End Test ===');

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
  console.log('✔ Admin login successful. Token acquired.');

  // 2. Submit Contact Form (triggers CONTACT_FORM notification)
  console.log('\n2. Submitting public Contact Form...');
  const contactRes = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Customer Contact',
      phone: '0300 9998877',
      email: 'testcustomer@example.com',
      department: 'Showroom & Sales',
      subject: 'Inquiring about T9 Hunter Pricing',
      message: 'Can you please send me price list and warranty details?',
    }),
  });
  const contactJson = await contactRes.json();
  if (!contactRes.ok || !contactJson.data?.id) {
    throw new Error(`Contact form submission failed: ${JSON.stringify(contactJson)}`);
  }
  const contactLeadId = contactJson.data.id;
  console.log(`✔ Contact form submitted. Lead ID: ${contactLeadId}`);

  // 3. Submit Test Drive Request (triggers TEST_DRIVE notification)
  console.log('\n3. Submitting public Test Drive Booking...');
  const driveRes = await fetch(`${API_BASE}/test-drives`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Drive Applicant',
      phone: '0333 1122334',
      email: 'applicant@example.com',
      vehicleId: 't9-hunter',
      preferredDate: '2026-09-22',
      preferredTime: '11:00 AM',
      message: 'Automated test drive request for notification test.',
    }),
  });
  const driveJson = await driveRes.json();
  if (!driveRes.ok || !driveJson.data?.id) {
    throw new Error(`Test drive submission failed: ${JSON.stringify(driveJson)}`);
  }
  const driveBookingId = driveJson.data.id;
  console.log(`✔ Test drive submitted. Booking ID: ${driveBookingId}`);

  // 4. GET Admin Notifications
  console.log('\n4. Fetching Admin notifications (GET /api/notifications)...');
  const notifRes = await fetch(`${API_BASE}/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const notifJson = await notifRes.json();
  if (!notifRes.ok || !Array.isArray(notifJson.data)) {
    throw new Error(`GET notifications failed: ${JSON.stringify(notifJson)}`);
  }
  const notifications = notifJson.data;
  console.log(`✔ Found ${notifications.length} total notifications in database.`);
  console.log(`✔ Unread count reported: ${notifJson.unreadCount}`);

  const contactNotif = notifications.find((n) => n.relatedId === contactLeadId);
  const driveNotif = notifications.find((n) => n.relatedId === driveBookingId);

  if (!contactNotif) throw new Error('CONTACT_FORM notification was not created in database!');
  if (!driveNotif) throw new Error('TEST_DRIVE notification was not created in database!');

  console.log('✔ Contact Form Notification verified:', {
    type: contactNotif.type,
    title: contactNotif.title,
    isRead: contactNotif.isRead,
  });
  console.log('✔ Test Drive Notification verified:', {
    type: driveNotif.type,
    title: driveNotif.title,
    isRead: driveNotif.isRead,
  });

  // 5. Check unread count API
  console.log('\n5. Checking unread count endpoint (GET /api/notifications/unread-count)...');
  const countRes = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const countJson = await countRes.json();
  console.log(`✔ Unread count API returned: ${countJson.count}`);

  // 6. Mark single notification as read
  console.log('\n6. Marking single notification as read...');
  const markReadRes = await fetch(`${API_BASE}/notifications/${contactNotif.id}/read`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const markReadJson = await markReadRes.json();
  if (!markReadRes.ok || markReadJson.data.isRead !== true) {
    throw new Error(`Mark as read failed: ${JSON.stringify(markReadJson)}`);
  }
  console.log('✔ Single notification marked as read.');

  // 7. Mark all as read
  console.log('\n7. Marking all notifications as read...');
  const markAllRes = await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!markAllRes.ok) {
    throw new Error(`Mark all as read failed: ${await markAllRes.text()}`);
  }

  const afterAllRes = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const afterAllJson = await afterAllRes.json();
  if (afterAllJson.count !== 0) {
    throw new Error(`Expected unread count 0 after mark-all-as-read, got ${afterAllJson.count}`);
  }
  console.log('✔ All notifications successfully marked as read (Unread Count = 0).');

  // 8. Delete notification
  console.log('\n8. Deleting test notification...');
  const delRes = await fetch(`${API_BASE}/notifications/${contactNotif.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!delRes.ok) {
    throw new Error(`Delete notification failed: ${await delRes.text()}`);
  }
  console.log('✔ Notification deleted from PostgreSQL database.');

  console.log('\n=== ALL ADMIN NOTIFICATION SYSTEM TESTS PASSED SUCCESSFULLY! ===');
}

runTest().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
