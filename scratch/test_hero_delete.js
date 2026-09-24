import prisma from '../server/config/db.js';

async function testCreateAndDelete() {
  console.log('1. Creating test hero image...');
  const created = await prisma.heroImage.create({
    data: {
      url: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/test_hero.jpg',
      title: 'Temporary Test Hero Image',
      altText: 'Test Alt',
      displayOrder: 99,
      isActive: true,
    },
  });
  console.log('Created hero image:', created.id);

  console.log('2. Finding test hero image using findUnique...');
  const found = await prisma.heroImage.findUnique({ where: { id: created.id } });
  console.log('Found hero image:', found?.id);

  console.log('3. Deleting test hero image...');
  const deleted = await prisma.heroImage.delete({ where: { id: created.id } });
  console.log('Successfully deleted hero image:', deleted.id);

  await prisma.$disconnect();
  console.log('🎉 Full Create -> findUnique -> Delete test passed without any SQLite Error 14!');
}

testCreateAndDelete().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
