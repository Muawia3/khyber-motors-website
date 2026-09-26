import prisma from '../server/config/db.js';

async function testServicesAndAboutContent() {
  console.log('🔍 Testing Services and About DB integration...');

  try {
    // 1. Fetch Services content
    let services = await prisma.pageContent.findUnique({
      where: { key: 'services' },
    });
    console.log('✅ Services DB record found:', Boolean(services));

    // 2. Fetch About content
    let about = await prisma.pageContent.findUnique({
      where: { key: 'about' },
    });
    console.log('✅ About DB record found:', Boolean(about));

    console.log('🎉 DB verification complete!');
  } catch (err) {
    console.error('❌ DB test error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testServicesAndAboutContent();
