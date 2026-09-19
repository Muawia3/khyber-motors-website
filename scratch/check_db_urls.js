import prisma from '../server/config/db.js';

async function checkDatabaseUrls() {
  console.log('=== INSPECTING CURRENT DATABASE RECORDS FOR VEHICLES & MEDIA ===\n');

  // 1. Vehicles
  const vehicles = await prisma.vehicle.findMany();
  console.log(`Found ${vehicles.length} vehicles in database:\n`);

  vehicles.forEach((vh, idx) => {
    console.log(`[Vehicle #${idx + 1}] ID: ${vh.id} | Name: ${vh.name}`);
    console.log(`   heroImage:  "${vh.heroImage}"`);
    console.log(`   mainImage:  "${vh.mainImage}"`);
    console.log(`   brochureUrl: "${vh.brochureUrl}"`);
    console.log(`   gallery:    ${vh.gallery}`);
    console.log('---------------------------------------------------------');
  });

  // 2. Hero Images
  const heroImages = await prisma.heroImage.findMany();
  console.log(`\nFound ${heroImages.length} hero image records in database:\n`);
  heroImages.forEach((hi, idx) => {
    console.log(`[HeroImage #${idx + 1}] ID: ${hi.id} | Title: "${hi.title}"`);
    console.log(`   url: "${hi.url}"`);
  });

  // 3. Team Members
  const team = await prisma.teamMember.findMany();
  console.log(`\nFound ${team.length} team member records in database:\n`);
  team.forEach((tm, idx) => {
    console.log(`[TeamMember #${idx + 1}] ID: ${tm.id} | Name: "${tm.name}"`);
    console.log(`   imageUrl: "${tm.imageUrl}"`);
  });

  process.exit(0);
}

checkDatabaseUrls().catch((err) => {
  console.error('Database query error:', err);
  process.exit(1);
});
