import prisma from '../server/config/db.js';

async function checkDb() {
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, name: true, slug: true, mainImage: true, heroImage: true, gallery: true }
  });
  console.log('--- VEHICLES ---');
  console.log(JSON.stringify(vehicles, null, 2));

  const pageContents = await prisma.pageContent.findMany();
  console.log('--- PAGE CONTENTS ---');
  console.log(JSON.stringify(pageContents, null, 2));

  const heroImages = await prisma.heroImage.findMany();
  console.log('--- HERO IMAGES ---');
  console.log(JSON.stringify(heroImages, null, 2));

  const uploadedFiles = await prisma.uploadedFile.findMany({
    select: { id: true, filename: true, url: true, mimeType: true }
  });
  console.log('--- UPLOADED FILES ---');
  console.log(JSON.stringify(uploadedFiles, null, 2));

  const teamMembers = await prisma.teamMember.findMany();
  console.log('--- TEAM MEMBERS ---');
  console.log(JSON.stringify(teamMembers, null, 2));

  await prisma.$disconnect();
}

checkDb();
