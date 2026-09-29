import bcrypt from 'bcryptjs';
import prisma from '../../backend/config/db.js';

const defaultVehicles = [
  {
    name: 'JAC T9 Hunter',
    fullTitle: 'JAC T9 Hunter 4x4',
    slug: 't9-hunter',
    tagline: 'Flagship 2.0L Turbo Diesel 8-Speed Auto Pickup',
    category: 'PASSENGERS',
    subcategory: null,
    categoryLabel: 'Passenger',
    status: 'Published',
    isFlagship: true,
    isNew: true,
    mainImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_t9-hunter_main.jpg',
    heroImage: 'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_t9-hunter_hero.jpg',
    altText: 'JAC Vehicle',
    gallery: JSON.stringify([
      'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_t9-hunter_main.jpg',
      'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_t9-hunter_gal_2.jpg',
      'https://res.cloudinary.com/lg7mgh99/image/upload/v1790056540/jac_motors/vehicle_t9-hunter_gal_3.jpg',
    ]),
    colorOptions: JSON.stringify([
      { name: 'Titanium Metallic Gray', hex: '#374151' },
      { name: 'Crimson Red', hex: '#C8102E' },
      { name: 'Onyx Black', hex: '#111827' },
      { name: 'Polar White', hex: '#FFFFFF' },
    ]),
    overview: 'The JAC T9 Hunter double cabin pickup is designed for high-performance off-road capability, heavy payload towing, and executive passenger comfort. Powered by a 2.0L CTI Turbocharged Diesel engine paired with an 8-Speed ZF Automatic Transmission and Electronic 4WD, the T9 Hunter excels on tough terrain while providing a premium cabin experience.',
    specs: JSON.stringify({
      engine: '2.0L CTI 4-Cylinder Turbo Diesel',
      displacement: '1999 cc',
      horsepower: '170 HP @ 3600 RPM',
      torque: '410 Nm @ 1500-2500 RPM',
      transmission: '8-Speed Automatic',
      driveType: 'Electronic 4WD (2H / 4H / 4L)',
      fuelType: 'Diesel',
      seatingCapacity: 5,
      payloadCapacityKg: 1000,
      towingCapacityKg: 'To be confirmed by dealership',
      dimensions: '5330 mm (L) x 1965 mm (W) x 1920 mm (H)',
      wheelbase: '3110 mm',
      fuelTankCapacityLiters: 76,
      safetySummary: '7 Airbags, 360 Camera, Bosch 9.3 ESP, TPMS',
    }),
    features: JSON.stringify([
      {
        categoryName: 'Performance & Drivetrain',
        features: [
          '8-Speed ZF Automatic Transmission',
          'Electronic 4x4 Transfer Case',
          'Rear Differential Lock System',
          'Multi-Link Rear Suspension',
          '18" Alloy Wheels',
        ],
      },
      {
        categoryName: 'Safety & Electronics',
        features: [
          '7 Airbags (Front, Side, Curtain, Knee)',
          '360-Degree Panoramic View Camera',
          'Bosch Electronic Stability Program (ESP)',
          'Hill Descent Control & Hill Start Assist',
          'Tire Pressure Monitoring System (TPMS)',
        ],
      },
      {
        categoryName: 'Interior & Convenience',
        features: [
          '10.4-inch HD Touchscreen with Smartphone Connectivity',
          '7-inch Digital Driver Display Instrument Cluster',
          'Leather Seats with Power Adjustment',
          'Automatic Dual-Zone Climate Control',
          'Power Sunroof & Wireless Phone Charging Pad',
        ],
      },
    ]),
    whyT9Benefits: JSON.stringify([
      { title: 'Capability', description: 'Engineered for demanding terrain and passenger comfort with 410 Nm torque and Electronic 4WD.', icon: 'Truck' },
      { title: 'Comfort', description: 'Refined interior layout featuring quiet cabin noise insulation, leather seating, and digital controls.', icon: 'Sparkles' },
      { title: 'Practicality', description: '1,000 kg payload bed capacity paired with high-efficiency 2.0L diesel fuel economy.', icon: 'ShieldCheck' },
      { title: 'Modern Design', description: 'Bold front grille stance, sleek LED lighting signature, and aerodynamically optimized body profile.', icon: 'Wrench' },
    ]),
    warranty: '3 Years / 100,000 KM Manufacturer Warranty',
    brochureAvailable: true,
    brochureUrl: '/brochures/jac-t9-hunter-brochure.pdf',
    seoTitle: 'JAC T9 Hunter Double Cabin Pickup | Khyber Motors',
    metaDescription: 'Discover the flagship JAC T9 Hunter 2.0L Turbo Diesel 8-Speed 4x4 pickup. Experience top performance, luxury interior, and high payload capacity.',
  },
];

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

    // Clean up any previously seeded dummy vehicles that have empty images
    try {
      const deletedDummies = await prisma.vehicle.deleteMany({
        where: {
          slug: {
            in: [
              't9-frison',
              'jac-x200',
              'jac-1020',
              'jac-1042',
              'jac-1091',
              'jac-1120',
              'dongfeng-prime-mover',
              'dongfeng-rigid',
              'dongfeng-light',
            ],
          },
          mainImage: '',
          heroImage: '',
        },
      });
      if (deletedDummies.count > 0) {
        console.log(`🧹 Cleaned up ${deletedDummies.count} legacy dummy vehicles with empty images.`);
      }
    } catch (cleanupErr) {
      console.warn('Dummy vehicles cleanup notice:', cleanupErr.message);
    }

    // 2. Seed Vehicles (Do NOT overwrite existing vehicle data or images if already in DB)
    for (const v of defaultVehicles) {
      const existing = await prisma.vehicle.findUnique({ where: { slug: v.slug } });
      if (!existing) {
        const vehicle = await prisma.vehicle.create({ data: v });
        console.log(`✅ Vehicle seeded: ${vehicle.name} (${vehicle.slug})`);
      }
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
      update: { data: JSON.stringify(homeContent) },
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
      update: { data: JSON.stringify(contactContent) },
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
