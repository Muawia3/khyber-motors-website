import prisma from '../server/config/db.js';

async function resetSystem() {
  console.log('=====================================================');
  console.log('  RESETTING JAC DEALERSHIP SYSTEM FOR FRESH TESTING  ');
  console.log('=====================================================');

  console.log('\nDeleting test/demo records from database...');

  const deletedLeads = await prisma.lead.deleteMany();
  console.log(`✔ Deleted ${deletedLeads.count} Lead records.`);

  const deletedTestDrives = await prisma.testDrive.deleteMany();
  console.log(`✔ Deleted ${deletedTestDrives.count} TestDrive records.`);

  const deletedNotifs = await prisma.notification.deleteMany();
  console.log(`✔ Deleted ${deletedNotifs.count} Notification records.`);

  console.log('\nChecking remaining configuration records to preserve:');
  const adminCount = await prisma.adminUser.count();
  const vehicleCount = await prisma.vehicle.count();
  const pageContentCount = await prisma.pageContent.count();
  const heroImgCount = await prisma.heroImage.count();
  const socialCount = await prisma.socialLink.count();

  console.log(`  - Admin Accounts: ${adminCount}`);
  console.log(`  - Vehicles Preserved: ${vehicleCount}`);
  console.log(`  - Page Content Preserved: ${pageContentCount}`);
  console.log(`  - Hero Images Preserved: ${heroImgCount}`);
  console.log(`  - Social Media Links Preserved: ${socialCount}`);

  console.log('\n=====================================================');
  console.log('  DATABASE RESET COMPLETE - SYSTEM IN CLEAN STATE 0  ');
  console.log('=====================================================');

  await prisma.$disconnect();
}

resetSystem().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
