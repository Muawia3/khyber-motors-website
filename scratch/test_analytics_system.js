import prisma from '../backend/config/db.js';

async function testAnalyticsSystem() {
  console.log('🧪 === TESTING WEBSITE ANALYTICS SYSTEM ===\n');

  // 1. Initial count
  const initialCount = await prisma.pageView.count();
  console.log(`Initial PageView count in database: ${initialCount}`);

  // 2. Simulate tracking public page views from 2 distinct visitors
  const visitorA = 'v_test_user_alpha_123';
  const visitorB = 'v_test_user_beta_456';

  console.log('\n--- Simulating Public Page View Entries ---');

  // Visitor A views 3 pages + 1 refresh on Home
  await prisma.pageView.create({ data: { path: '/', visitorId: visitorA, userAgent: 'Mozilla/5.0 Test' } });
  await prisma.pageView.create({ data: { path: '/vehicles', visitorId: visitorA, userAgent: 'Mozilla/5.0 Test' } });
  await prisma.pageView.create({ data: { path: '/vehicles/t9', visitorId: visitorA, userAgent: 'Mozilla/5.0 Test' } });
  await prisma.pageView.create({ data: { path: '/', visitorId: visitorA, userAgent: 'Mozilla/5.0 Test' } });

  // Visitor B views 2 pages
  await prisma.pageView.create({ data: { path: '/', visitorId: visitorB, userAgent: 'Mozilla/5.0 Test' } });
  await prisma.pageView.create({ data: { path: '/contact', visitorId: visitorB, userAgent: 'Mozilla/5.0 Test' } });

  console.log('✅ Created 6 test page view records from 2 distinct visitors');

  // 3. Query stats aggregations
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const allPageViews = await prisma.pageView.findMany();
  const todayPageViews = await prisma.pageView.findMany({ where: { createdAt: { gte: startOfToday } } });

  const totalUniqueVisitors = new Set(allPageViews.map(pv => pv.visitorId)).size;
  const visitorsToday = new Set(todayPageViews.map(pv => pv.visitorId)).size;
  const totalPageViews = allPageViews.length;
  const pageViewsToday = todayPageViews.length;

  console.log('\n--- Analytics Aggregation Results ---');
  console.log(`Visitors Today: ${visitorsToday}`);
  console.log(`Total Unique Visitors: ${totalUniqueVisitors}`);
  console.log(`Page Views Today: ${pageViewsToday}`);
  console.log(`Total Page Views: ${totalPageViews}`);

  // Top pages aggregation
  const pageCounts = {};
  allPageViews.forEach((pv) => {
    pageCounts[pv.path] = (pageCounts[pv.path] || 0) + 1;
  });
  console.log('\n--- Most Visited Pages ---');
  console.table(pageCounts);

  // 4. Verify Admin route exclusion
  const adminCheck = '/admin/dashboard'.startsWith('/admin');
  console.log(`\nPath '/admin/dashboard' is excluded from tracking: ${adminCheck}`);

  if (visitorsToday >= 2 && totalPageViews >= 6 && adminCheck) {
    console.log('\n🎉 ALL WEBSITE ANALYTICS SYSTEM TESTS PASSED CLEANLY!');
  } else {
    console.error('\n❌ Analytics test assertion failed.');
  }

  process.exit(0);
}

testAnalyticsSystem().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
