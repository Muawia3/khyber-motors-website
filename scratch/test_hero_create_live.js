import prisma from '../server/config/db.js';

async function testLiveCreate() {
  console.log('Testing live HeroImage.create() in fresh Node process...');
  try {
    const created = await prisma.heroImage.create({
      data: {
        url: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/live_test.jpg',
        title: 'Live Hero Image Test',
        altText: 'Live Test Alt',
        displayOrder: 0,
        isActive: true,
      }
    });
    console.log('✅ SUCCESS! Created hero image ID:', created.id);

    // Clean up test image
    await prisma.heroImage.delete({ where: { id: created.id } });
    console.log('✅ SUCCESS! Cleaned up test hero image.');
  } catch (err) {
    console.error('❌ FAILED:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLiveCreate();
