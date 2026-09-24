import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../server/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const CLOUDINARY_VEHICLE_DEFAULTS = {
  't9-hunter': {
    mainImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_t9-hunter_main.jpg',
    heroImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_t9-hunter_hero.jpg',
    gallery: [
      'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_t9-hunter_main.jpg',
      'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_t9-hunter_gal_2.jpg',
      'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_t9-hunter_gal_3.jpg',
    ],
  },
  't9-frison': {
    mainImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_t9-frison_main.jpg',
    heroImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_t9-frison_hero.jpg',
    gallery: [
      'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_t9-frison_main.jpg',
      'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_t9-frison_gal_2.jpg',
    ],
  },
  'jac-x200': {
    mainImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-x200_main.jpg',
    heroImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-x200_hero.jpg',
    gallery: [
      'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-x200_main.jpg',
      'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-x200_gal_2.jpg',
    ],
  },
  'jac-1020': {
    mainImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-1020_main.jpg',
    heroImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-1020_hero.jpg',
    gallery: ['https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-1020_main.jpg'],
  },
  'jac-1042': {
    mainImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-1042_main.jpg',
    heroImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-1042_hero.jpg',
    gallery: ['https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-1042_main.jpg'],
  },
  'jac-1091': {
    mainImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-1091_main.jpg',
    heroImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-1091_hero.jpg',
    gallery: ['https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-1091_main.jpg'],
  },
  'jac-1120': {
    mainImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-1120_main.jpg',
    heroImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-1120_hero.jpg',
    gallery: ['https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_jac-1120_main.jpg'],
  },
};

const HERO_CDN_URL = 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/Gemini_Generated_Image_9aiio29aiio29aii.jpg';
const LOGO_CDN_URL = 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056667/jac_motors/JAC1.jpg';

async function syncCloudinaryToDbAndFiles() {
  console.log('=== SYNCING CLOUDINARY CDN URLS TO DB & SOURCE DEFAULTS ===\n');

  // 1. Sync Vehicles in Prisma SQLite DB
  const vehicles = await prisma.vehicle.findMany();
  for (const v of vehicles) {
    const slugKey = v.slug;
    const def = CLOUDINARY_VEHICLE_DEFAULTS[slugKey] || CLOUDINARY_VEHICLE_DEFAULTS['t9-hunter'];

    await prisma.vehicle.update({
      where: { id: v.id },
      data: {
        mainImage: def.mainImage,
        heroImage: def.heroImage,
        gallery: JSON.stringify(def.gallery),
      },
    });
    console.log(`  ✓ Updated DB Vehicle [${v.name}] -> ${def.mainImage}`);
  }

  // 2. Sync PageContent in Prisma SQLite DB
  const homeContent = {
    hero: {
      eyebrow: 'KHYBER MOTORS',
      title: 'Built for Work. Ready for More.',
      description: 'Discover powerful, dependable commercial vehicles and double cabin pickups designed to perform on every road.',
      primaryCtaText: 'Explore Vehicles',
      primaryCtaLink: '/vehicles',
      secondaryCtaText: 'Contact Us',
      secondaryCtaLink: '/contact',
      heroImage: HERO_CDN_URL,
      heroImages: [HERO_CDN_URL, LOGO_CDN_URL],
    },
  };

  await prisma.pageContent.upsert({
    where: { key: 'home' },
    update: { data: JSON.stringify(homeContent) },
    create: { key: 'home', data: JSON.stringify(homeContent) },
  });
  console.log('  ✓ Updated DB PageContent [home]');

  // 3. Sync HeroImage & UploadedFile in Prisma SQLite DB
  const heroImages = await prisma.heroImage.findMany();
  for (const hi of heroImages) {
    await prisma.heroImage.update({
      where: { id: hi.id },
      data: { url: HERO_CDN_URL },
    });
    console.log(`  ✓ Updated DB HeroImage [${hi.title}]`);
  }

  const uploadedFiles = await prisma.uploadedFile.findMany();
  for (const uf of uploadedFiles) {
    await prisma.uploadedFile.update({
      where: { id: uf.id },
      data: { url: HERO_CDN_URL },
    });
    console.log(`  ✓ Updated DB UploadedFile [${uf.filename}]`);
  }

  console.log('\n=== ALL CLOUDINARY URLS SYNCHRONIZED SUCCESSFULLY! ===');
  await prisma.$disconnect();
}

syncCloudinaryToDbAndFiles().catch(async (err) => {
  console.error('\n❌ SYNC FAILED:', err);
  await prisma.$disconnect();
  process.exit(1);
});
