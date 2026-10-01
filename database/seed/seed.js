import bcrypt from 'bcryptjs';
import prisma from '../../backend/config/db.js';
import { PRODUCTS } from '../../frontend/src/data/vehicles.js';

const defaultVehicles = PRODUCTS.map((p) => ({
  name: p.name,
  fullTitle: p.fullTitle || p.name,
  slug: p.slug,
  tagline: p.tagline,
  category: p.category,
  subcategory: p.subcategory,
  subSubcategory: p.subSubcategory,
  brand: p.brand || (p.category === 'dongfeng' ? 'Dongfeng' : 'JAC'),
  displayOrder: p.displayOrder,
  categoryLabel: p.categoryLabel,
  status: p.status || 'Published',
  isFlagship: p.isFlagship || false,
  isNew: p.isNew || false,
  mainImage: p.mainImage,
  heroImage: p.heroImage,
  altText: p.altText || p.name,
  gallery: JSON.stringify(p.gallery || []),
  colorOptions: JSON.stringify(p.colorOptions || []),
  overview: p.overview || '',
  specs: JSON.stringify(p.specs || {}),
  features: JSON.stringify(p.features || []),
  whyT9Benefits: JSON.stringify(p.whyT9Benefits || []),
  warranty: p.warranty,
  brochureAvailable: p.brochureAvailable ?? true,
  brochureUrl: p.brochureUrl,
  seoTitle: p.seoTitle,
  metaDescription: p.metaDescription,
}));

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Seed Primary Admin User using environment variables ADMIN_EMAIL and ADMIN_PASSWORD
    const adminEmail = (process.env.ADMIN_EMAIL || 'muawiakhan000@gmail.com').toLowerCase().trim();
    const rawPassword = process.env.ADMIN_PASSWORD || 'Ameer100$';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const admin = await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: {
        passwordHash,
        isPrimary: true,
        isActive: true,
      },
      create: {
        email: adminEmail,
        passwordHash,
        name: 'Primary Super Admin',
        role: 'SUPER_ADMIN',
        isPrimary: true,
        isActive: true,
      },
    });
    console.log(`✅ Primary Admin user seeded: ${admin.email}`);

    // 2. Seed Vehicles: Upsert to ensure all 10 real vehicles exist with valid images & Published status
    for (const v of defaultVehicles) {
      await prisma.vehicle.upsert({
        where: { slug: v.slug },
        update: {}, // DO NOT OVERWRITE EXISTING DATA
        create: v,
      });
      console.log(`✅ Vehicle seeded/updated: ${v.name} (${v.slug})`);
    }

    // 3. Seed Page Content
    const homeContent = {
      hero: {
        eyebrow: 'KHYBER MOTORS',
        title: 'Built for Work. Ready for More.',
        description: 'Discover powerful, dependable commercial vehicles and double cabin pickups designed to perform on every road.',
        primaryCtaText: 'Explore Vehicles',
        primaryCtaLink: '/vehicles',
        secondaryCtaText: 'Contact Us',
        secondaryCtaLink: '/contact',
        heroImage: '',
        heroImages: [],
      },
    };

    await prisma.pageContent.upsert({
      where: { key: 'home' },
      update: {}, // DO NOT OVERWRITE EXISTING DATA
      create: { key: 'home', data: JSON.stringify(homeContent) },
    });
    console.log('✅ Home page content seeded.');

    const contactContent = {
      name: 'Khyber Motors',
      shortName: 'Khyber Motors',
      status: 'Authorized 3S Dealership (Sales, Service & Spare Parts)',
      tagline: 'Engineered for Performance. Built for Pakistan.',
      footerText: 'Khyber Pakhtunkhwa’s premier 3S Dealership for double cabin pickup trucks, commercial logistics vehicles, and modern crossover SUVs.',
      address: 'XHQQ+8GV, Ring Road Sohailabad, near Kakakhel CNG, Hazara Khawani, Peshawar, 25000, Pakistan',
      mapLink: 'https://www.google.com/maps/search/?api=1&query=XHQQ%2B8GV%2C+Ring+Road+Sohailabad%2C+near+Kakakhel+CNG%2C+Hazara+Khawani%2C+Peshawar%2C+25000%2C+Pakistan',
      mapEmbedUrl: 'https://maps.google.com/maps?q=XHQQ%2B8GV%2C+Ring+Road+Sohailabad%2C+near+Kakakhel+CNG%2C+Hazara+Khawani%2C+Peshawar%2C+25000%2C+Pakistan&t=&z=16&ie=UTF8&iwloc=&output=embed',
      plusCode: 'XHQQ+8GV, Peshawar',
      city: 'Peshawar',
      province: 'Khyber Pakhtunkhwa',
      postalCode: '25000',
      phone: '+92 (091) 5840900',
      salesDirect: '+92 300 1234567',
      serviceDirect: '+92 300 7654321',
      whatsapp: '+92 300 0000000',
      email: 'muawiakhan000@gmail.com',
      social: {
        tiktok: 'https://tiktok.com/@khybermotors',
        instagram: 'https://instagram.com/khybermotors',
        facebook: 'https://facebook.com/khybermotors',
        whatsapp: 'https://wa.me/923000000000',
      },
      businessHours: [
        { days: 'Monday – Saturday', hours: '9:00 AM – 7:00 PM' },
        { days: 'Sunday', hours: 'Emergency Service Only (10:00 AM – 4:00 PM)' },
      ],
      departments: [
        { name: 'Showroom & Sales', contact: '+92 (091) 5840901', timing: '9:00 AM – 7:00 PM' },
        { name: 'Authorized 3S Workshop', contact: '+92 (091) 5840902', timing: '8:30 AM – 5:30 PM' },
        { name: 'Genuine Spare Parts', contact: '+92 (091) 5840903', timing: '9:00 AM – 6:00 PM' },
        { name: 'Fleet & Corporate Sales', contact: '+92 (091) 5840904', timing: '9:00 AM – 6:00 PM' },
      ],
    };

    await prisma.pageContent.upsert({
      where: { key: 'contact' },
      update: {}, // DO NOT OVERWRITE EXISTING DATA
      create: { key: 'contact', data: JSON.stringify(contactContent) },
    });
    console.log('✅ Contact page content seeded.');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding notice:', error.message);
  } finally {
    if (prisma && typeof prisma.$disconnect === 'function') {
      await prisma.$disconnect().catch(() => null);
    }
  }
}

seed();
