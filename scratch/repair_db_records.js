import prisma from '../server/config/db.js';

const VALID_DEFAULTS = [
  {
    slug: 't9-hunter',
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/4/48/JAC_Hunter_facelift_002.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/4/48/JAC_Hunter_facelift_002.jpg',
    brochureUrl: '/brochures/jac-t9-hunter-brochure.pdf',
    gallery: JSON.stringify([
      'https://upload.wikimedia.org/wikipedia/commons/4/48/JAC_Hunter_facelift_002.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/1/12/JAC_Hunter_facelift_003.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/43/JAC_T9_EV_Auto_Zuerich_2024_DSC_6279.jpg',
    ]),
  },
  {
    slug: 't9-frison',
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/2018_JAC_Shuailing_T6%2C_front_8.7.18.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/2018_JAC_Shuailing_T6%2C_front_8.7.18.jpg',
    brochureUrl: '/brochures/jac-t9-frison-brochure.pdf',
    gallery: JSON.stringify([
      'https://upload.wikimedia.org/wikipedia/commons/4/4e/2018_JAC_Shuailing_T6%2C_front_8.7.18.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/0/03/2018_JAC_Shuailing_T6%2C_rear_8.7.18.jpg',
    ]),
  },
  {
    slug: 'x200',
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/2017_JAC_X200_CRDi.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/2017_JAC_X200_CRDi.jpg',
    brochureUrl: '/brochures/jac-x200-brochure.pdf',
    gallery: JSON.stringify([
      'https://upload.wikimedia.org/wikipedia/commons/e/ec/2017_JAC_X200_CRDi.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/0/07/2018_JAC_X200.jpg',
    ]),
  },
  {
    slug: 'jac-1020',
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/JAC_truck_2021052203.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/JAC_truck_2021052203.jpg',
    brochureUrl: '/brochures/jac-1020-brochure.pdf',
    gallery: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/b/ba/JAC_truck_2021052203.jpg']),
  },
  {
    slug: 'jac-1042',
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/4/47/JAC_Truck_Philippines.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/4/47/JAC_Truck_Philippines.jpg',
    brochureUrl: '/brochures/jac-1042-brochure.pdf',
    gallery: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/4/47/JAC_Truck_Philippines.jpg']),
  },
  {
    slug: 'jac-1091',
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/4/40/JAC_truck_in_Nha_Trang_01.JPG',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/4/40/JAC_truck_in_Nha_Trang_01.JPG',
    brochureUrl: '/brochures/jac-1091-brochure.pdf',
    gallery: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/4/40/JAC_truck_in_Nha_Trang_01.JPG']),
  },
  {
    slug: 'jac-1120',
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/JAC_pickup.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/JAC_pickup.jpg',
    brochureUrl: '/brochures/jac-1120-brochure.pdf',
    gallery: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/d/d4/JAC_pickup.jpg']),
  },
];

async function repairDatabaseRecords() {
  console.log('=== REPAIRING BROKEN DATABASE RECORDS IN POSTGRESQL ===\n');

  const vehicles = await prisma.vehicle.findMany();
  let repairedCount = 0;

  for (const vh of vehicles) {
    const slug = vh.slug || vh.id;
    const def = VALID_DEFAULTS.find((d) => d.slug === slug || slug.includes(d.slug));

    let heroImage = vh.heroImage;
    let mainImage = vh.mainImage;
    let brochureUrl = vh.brochureUrl;
    let gallery = vh.gallery;

    let needsRepair = false;

    if (!heroImage || heroImage.startsWith('blob:')) {
      heroImage = def ? def.heroImage : 'https://upload.wikimedia.org/wikipedia/commons/4/48/JAC_Hunter_facelift_002.jpg';
      needsRepair = true;
    }
    if (!mainImage || mainImage.startsWith('blob:')) {
      mainImage = def ? def.mainImage : heroImage;
      needsRepair = true;
    }
    if (!brochureUrl || brochureUrl.startsWith('blob:')) {
      brochureUrl = def ? def.brochureUrl : '/brochures/jac-t9-hunter-brochure.pdf';
      needsRepair = true;
    }

    try {
      let parsedGallery = JSON.parse(gallery);
      if (Array.isArray(parsedGallery)) {
        const cleaned = parsedGallery.filter((url) => typeof url === 'string' && !url.startsWith('blob:'));
        if (cleaned.length !== parsedGallery.length || cleaned.length === 0) {
          gallery = def ? def.gallery : JSON.stringify([mainImage]);
          needsRepair = true;
        }
      }
    } catch {
      if (def) {
        gallery = def.gallery;
        needsRepair = true;
      }
    }

    if (needsRepair) {
      await prisma.vehicle.update({
        where: { id: vh.id },
        data: {
          heroImage,
          mainImage,
          brochureUrl,
          brochureAvailable: Boolean(brochureUrl),
          gallery,
        },
      });
      console.log(`✔ Repaired vehicle record [${vh.name}] (${vh.id})`);
      repairedCount++;
    }
  }

  console.log(`\nSuccessfully repaired ${repairedCount} vehicle records in PostgreSQL database!`);
  process.exit(0);
}

repairDatabaseRecords().catch((err) => {
  console.error('Repair error:', err);
  process.exit(1);
});
