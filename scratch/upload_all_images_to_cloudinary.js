import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadToCloudinary } from '../server/config/cloudinary.js';
import prisma from '../server/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

const DEFAULT_VEHICLE_IMAGES = {
  't9-hunter': {
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/4/48/JAC_Hunter_facelift_002.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/4/48/JAC_Hunter_facelift_002.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/4/48/JAC_Hunter_facelift_002.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/1/12/JAC_Hunter_facelift_003.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/43/JAC_T9_EV_Auto_Zuerich_2024_DSC_6279.jpg',
    ],
  },
  't9-frison': {
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/2018_JAC_Shuailing_T6%2C_front_8.7.18.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/2018_JAC_Shuailing_T6%2C_front_8.7.18.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/4/4e/2018_JAC_Shuailing_T6%2C_front_8.7.18.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/0/03/2018_JAC_Shuailing_T6%2C_rear_8.7.18.jpg',
    ],
  },
  'jac-x200': {
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/2017_JAC_X200_CRDi.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/2017_JAC_X200_CRDi.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/e/ec/2017_JAC_X200_CRDi.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/0/07/2018_JAC_X200.jpg',
    ],
  },
  'jac-1020': {
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/JAC_truck_2021052203.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/JAC_truck_2021052203.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/b/ba/JAC_truck_2021052203.jpg'],
  },
  'jac-1042': {
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/4/47/JAC_Truck_Philippines.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/4/47/JAC_Truck_Philippines.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/4/47/JAC_Truck_Philippines.jpg'],
  },
  'jac-1091': {
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/4/40/JAC_truck_in_Nha_Trang_01.JPG',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/4/40/JAC_truck_in_Nha_Trang_01.JPG',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/4/40/JAC_truck_in_Nha_Trang_01.JPG'],
  },
  'jac-1120': {
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/JAC_pickup.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/JAC_pickup.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/d/d4/JAC_pickup.jpg'],
  },
};

const urlCache = new Map();

async function getOrUploadCloudinaryUrl(source, publicIdHint = '') {
  if (!source) return '';
  if (urlCache.has(source)) return urlCache.get(source);

  // If already a valid Cloudinary URL, return as is
  if (typeof source === 'string' && source.includes('res.cloudinary.com')) {
    urlCache.set(source, source);
    return source;
  }

  try {
    console.log(`📤 Uploading to Cloudinary: ${source}`);
    const uploadOptions = {
      folder: 'jac_motors',
    };
    if (publicIdHint) {
      uploadOptions.public_id = publicIdHint;
    }

    const res = await uploadToCloudinary(source, uploadOptions);
    if (res && res.url) {
      console.log(`  ✓ Cloudinary CDN URL: ${res.url}`);
      urlCache.set(source, res.url);
      return res.url;
    }
  } catch (err) {
    console.warn(`  ⚠️ Failed to upload ${source} to Cloudinary: ${err.message}`);
  }

  return source;
}

async function uploadAllImages() {
  console.log('=== STARTING BULK CLOUDINARY IMAGE UPLOAD & DATABASE REPAIR ===\n');

  // 1. Upload default vehicle images (remote URLs)
  console.log('1. Uploading vehicle images to Cloudinary...');
  const cloudinaryVehiclesMap = {};

  for (const [slug, imgDef] of Object.entries(DEFAULT_VEHICLE_IMAGES)) {
    const mainCloud = await getOrUploadCloudinaryUrl(imgDef.mainImage, `vehicle_${slug}_main`);
    const heroCloud = await getOrUploadCloudinaryUrl(imgDef.heroImage, `vehicle_${slug}_hero`);
    const galleryCloud = [];

    for (let i = 0; i < imgDef.gallery.length; i++) {
      const galCloud = await getOrUploadCloudinaryUrl(imgDef.gallery[i], `vehicle_${slug}_gal_${i + 1}`);
      galleryCloud.push(galCloud);
    }

    cloudinaryVehiclesMap[slug] = {
      mainImage: mainCloud,
      heroImage: heroCloud,
      gallery: galleryCloud,
    };
  }

  // 2. Upload key site images (Gemini hero image, JAC logo)
  console.log('\n2. Uploading home hero and logo images...');
  const heroLocalPath = path.join(publicDir, 'Gemini_Generated_Image_9aiio29aiio29aii.jpeg');
  const jacLogoLocalPath = path.join(publicDir, 'JAC1.jpg');

  const mainHeroCloudUrl = await getOrUploadCloudinaryUrl(heroLocalPath, 'home_hero_banner');
  const jacLogoCloudUrl = await getOrUploadCloudinaryUrl(jacLogoLocalPath, 'jac_logo_banner');

  // 3. Update Vehicle DB records
  console.log('\n3. Updating Vehicle DB records with Cloudinary URLs...');
  const vehicles = await prisma.vehicle.findMany();

  for (const v of vehicles) {
    const slugKey = v.slug;
    const cloudMap = cloudinaryVehiclesMap[slugKey] || {};

    let mainImage = v.mainImage;
    if (!mainImage || !mainImage.includes('res.cloudinary.com')) {
      mainImage = cloudMap.mainImage || (await getOrUploadCloudinaryUrl(mainImage)) || cloudMap.heroImage || '';
    }

    let heroImage = v.heroImage;
    if (!heroImage || !heroImage.includes('res.cloudinary.com')) {
      heroImage = cloudMap.heroImage || (await getOrUploadCloudinaryUrl(heroImage)) || mainImage || '';
    }

    let galleryArr = [];
    try {
      galleryArr = JSON.parse(v.gallery || '[]');
    } catch {
      galleryArr = [];
    }

    if (!Array.isArray(galleryArr) || galleryArr.length === 0) {
      galleryArr = cloudMap.gallery || [mainImage];
    } else {
      const updatedGal = [];
      for (const item of galleryArr) {
        const u = await getOrUploadCloudinaryUrl(item);
        if (u) updatedGal.push(u);
      }
      galleryArr = updatedGal;
    }

    await prisma.vehicle.update({
      where: { id: v.id },
      data: {
        mainImage,
        heroImage,
        gallery: JSON.stringify(galleryArr),
      },
    });
    console.log(`  ✓ Vehicle updated: [${v.name}] (${v.slug})\n    -> Main: ${mainImage}\n    -> Hero: ${heroImage}`);
  }

  // 4. Update PageContent DB records
  console.log('\n4. Updating PageContent DB records with Cloudinary URLs...');
  const pageContents = await prisma.pageContent.findMany();
  for (const pc of pageContents) {
    try {
      const content = JSON.parse(pc.data);
      if (content.hero) {
        content.hero.heroImage = mainHeroCloudUrl;
        content.hero.heroImages = [mainHeroCloudUrl, jacLogoCloudUrl];
      }
      await prisma.pageContent.update({
        where: { id: pc.id },
        data: { data: JSON.stringify(content) },
      });
      console.log(`  ✓ PageContent updated: [${pc.key}]`);
    } catch (err) {
      console.warn(`  ⚠️ PageContent parse error for ${pc.key}:`, err.message);
    }
  }

  // 5. Update HeroImage DB records
  console.log('\n5. Updating HeroImage DB records with Cloudinary URLs...');
  const heroImages = await prisma.heroImage.findMany();
  for (const hi of heroImages) {
    await prisma.heroImage.update({
      where: { id: hi.id },
      data: { url: mainHeroCloudUrl },
    });
    console.log(`  ✓ HeroImage updated: [${hi.title}] -> ${mainHeroCloudUrl}`);
  }

  // 6. Update UploadedFile DB records
  console.log('\n6. Updating UploadedFile DB records with Cloudinary URLs...');
  const uploadedFiles = await prisma.uploadedFile.findMany();
  for (const uf of uploadedFiles) {
    if (uf.url && !uf.url.includes('res.cloudinary.com')) {
      await prisma.uploadedFile.update({
        where: { id: uf.id },
        data: { url: mainHeroCloudUrl },
      });
      console.log(`  ✓ UploadedFile updated: [${uf.filename}] -> ${mainHeroCloudUrl}`);
    }
  }

  console.log('\n=== BULK CLOUDINARY UPLOAD COMPLETED SUCCESSFULLY! ===');
  await prisma.$disconnect();
}

uploadAllImages().catch(async (err) => {
  console.error('\n❌ BULK UPLOAD FAILED:', err);
  await prisma.$disconnect();
  process.exit(1);
});
