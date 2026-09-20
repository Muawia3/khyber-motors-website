import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

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
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/4/48/JAC_Hunter_facelift_002.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/4/48/JAC_Hunter_facelift_002.jpg',
    altText: 'JAC T9 Hunter Double Cabin Pickup',
    gallery: JSON.stringify([
      'https://upload.wikimedia.org/wikipedia/commons/4/48/JAC_Hunter_facelift_002.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/1/12/JAC_Hunter_facelift_003.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/43/JAC_T9_EV_Auto_Zuerich_2024_DSC_6279.jpg',
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
  {
    name: 'JAC T9 Frison',
    fullTitle: 'JAC T9 Frison Double Cabin Pickup',
    slug: 't9-frison',
    tagline: 'Reliable & Versatile Double Cabin Passenger Pickup',
    category: 'PASSENGERS',
    subcategory: null,
    categoryLabel: 'Passenger',
    status: 'Published',
    isFlagship: false,
    isNew: false,
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/2018_JAC_Shuailing_T6%2C_front_8.7.18.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/2018_JAC_Shuailing_T6%2C_front_8.7.18.jpg',
    altText: 'JAC T9 Frison Double Cabin Pickup',
    gallery: JSON.stringify([
      'https://upload.wikimedia.org/wikipedia/commons/4/4e/2018_JAC_Shuailing_T6%2C_front_8.7.18.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/0/03/2018_JAC_Shuailing_T6%2C_rear_8.7.18.jpg',
    ]),
    colorOptions: JSON.stringify([
      { name: 'Commercial White', hex: '#FFFFFF' },
      { name: 'Granite Gray', hex: '#4B5563' },
      { name: 'Onyx Black', hex: '#111827' },
    ]),
    overview: 'The versatile JAC T9 Frison double cabin pickup features a durable diesel powertrain, reinforced rear suspension, and a spacious 5-seater cabin arrangement for corporate fleet work and passenger transport.',
    specs: JSON.stringify({
      engine: '2.0L Turbo Diesel Engine',
      displacement: '1999 cc',
      horsepower: '138 HP @ 3600 RPM',
      torque: '320 Nm @ 2000 RPM',
      transmission: '5-Speed Manual',
      driveType: '4x2 / 4x4 Option',
      fuelType: 'Diesel',
      seatingCapacity: 5,
      payloadCapacityKg: 900,
      dimensions: '5165 mm (L) x 1750 mm (W) x 1815 mm (H)',
      wheelbase: '3090 mm',
      fuelTankCapacityLiters: 70,
      safetySummary: 'Disc Brakes, Hydraulic Brake Assist, ABS',
    }),
    features: JSON.stringify([
      {
        categoryName: 'Passenger Comfort & Design',
        features: [
          'Spacious 5-Seater Ergonomic Cabin',
          'Air Conditioning with Rear Air Vents',
          'Heavy-Duty Rear Suspension for Smooth Transport',
          'Power Windows & Central Door Locking',
        ],
      },
    ]),
    warranty: '3 Years / 100,000 KM Manufacturer Warranty',
    brochureAvailable: true,
    brochureUrl: '/brochures/jac-t9-frison-brochure.pdf',
    seoTitle: 'JAC T9 Frison Pickup | Khyber Motors',
    metaDescription: 'Explore the dependable JAC T9 Frison double cabin pickup for passenger and commercial fleet transport.',
  },
  {
    name: 'JAC X200',
    fullTitle: 'JAC X200 Light Commercial Truck',
    slug: 'jac-x200',
    tagline: 'Compact & Efficient 1.15-Ton Cargo Deck Light Truck',
    category: 'TRUCKS',
    subcategory: 'LIGHT',
    categoryLabel: 'Light Truck',
    status: 'Published',
    isFlagship: false,
    isNew: true,
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/2017_JAC_X200_CRDi.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/2017_JAC_X200_CRDi.jpg',
    altText: 'JAC X200 Light Commercial Truck',
    gallery: JSON.stringify([
      'https://upload.wikimedia.org/wikipedia/commons/e/ec/2017_JAC_X200_CRDi.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/0/07/2018_JAC_X200.jpg',
    ]),
    colorOptions: JSON.stringify([{ name: 'Commercial White', hex: '#FFFFFF' }]),
    overview: 'The JAC X200 is an agile 1.15-ton payload light commercial deck truck engineered for urban goods delivery, retail transport, and small business logistics.',
    specs: JSON.stringify({
      engine: '2.8L 2771cc Diesel Engine',
      displacement: '2771 cc',
      horsepower: '77 HP @ 3600 RPM',
      torque: '174 Nm @ 2000 RPM',
      transmission: '5-Speed Manual Transmission',
      driveType: '4x2 Rear-Wheel Drive',
      fuelType: 'Diesel',
      seatingCapacity: 3,
      payloadCapacityKg: 1150,
      dimensions: '4840 mm (L) x 1750 mm (W) x 2040 mm (H)',
      wheelbase: '2470 mm',
      fuelTankCapacityLiters: 65,
      safetySummary: 'Reinforced Front Cabin, Vacuum Assisted Hydraulic Brakes',
    }),
    features: JSON.stringify([
      {
        categoryName: 'Commercial Utility & Cabin',
        features: [
          'High Payload 1.15-Ton Cargo Deck',
          'Low Deck Loading Height for Rapid Cargo Transfer',
          'Ergonomic 3-Seater Cabin with Power Steering',
          'Heavy-Duty Leaf Spring Rear Suspension',
        ],
      },
    ]),
    warranty: '2 Years / 50,000 KM Manufacturer Warranty',
    brochureAvailable: true,
    brochureUrl: '/brochures/jac-x200-brochure.pdf',
    seoTitle: 'JAC X200 Light Truck | Khyber Motors',
    metaDescription: 'Efficient 1.15-ton deck light commercial truck for urban goods delivery and business logistics.',
  },
  {
    name: 'JAC 1020',
    fullTitle: 'JAC 1020 Light Commercial Truck',
    slug: 'jac-1020',
    tagline: 'Dependable 3.5-Ton Goods Transport Commercial Truck',
    category: 'TRUCKS',
    subcategory: 'LIGHT',
    categoryLabel: 'Light Truck',
    status: 'Published',
    isFlagship: false,
    isNew: false,
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/JAC_truck_2021052203.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/JAC_truck_2021052203.jpg',
    altText: 'JAC 1020 Light Commercial Truck',
    gallery: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/b/ba/JAC_truck_2021052203.jpg']),
    colorOptions: JSON.stringify([{ name: 'Commercial White', hex: '#FFFFFF' }]),
    overview: 'The JAC 1020 light-duty commercial truck is built for medium-distance freight transport and urban distribution with a 3.5-ton load capacity.',
    specs: JSON.stringify({
      engine: '2.8L 2771cc Turbocharged Diesel Engine',
      displacement: '2771 cc',
      horsepower: '92 HP @ 3600 RPM',
      torque: '220 Nm @ 2200 RPM',
      transmission: '5-Speed Manual',
      driveType: '4x2 Rear-Wheel Drive',
      fuelType: 'Diesel',
      seatingCapacity: 3,
      payloadCapacityKg: 3500,
      dimensions: '5995 mm (L) x 2030 mm (W) x 2240 mm (H)',
      wheelbase: '3308 mm',
      fuelTankCapacityLiters: 80,
      safetySummary: 'Exhaust Brake, Hydraulic Dual-Circuit Brakes',
    }),
    features: JSON.stringify([
      {
        categoryName: 'Chassis & Load Strength',
        features: [
          '3.5-Ton Rated Payload Capacity',
          'Heavy-Duty Riveted Steel Frame Chassis',
          'Tilting Driver Cabin for Quick Maintenance Access',
          'Dual Rear Wheels for Heavy Cargo Balance',
        ],
      },
    ]),
    warranty: '2 Years / 50,000 KM Manufacturer Warranty',
    brochureAvailable: true,
    brochureUrl: '/brochures/jac-1020-brochure.pdf',
    seoTitle: 'JAC 1020 3.5-Ton Commercial Truck | Khyber Motors',
    metaDescription: 'Workhorse 3.5-ton light commercial truck designed for freight and logistics.',
  },
  {
    name: 'JAC 1042',
    fullTitle: 'JAC 1042 14-Foot Cargo Deck Light Truck',
    slug: 'jac-1042',
    tagline: 'Heavy-Payload 14-Foot Cargo Deck Commercial Truck',
    category: 'TRUCKS',
    subcategory: 'LIGHT',
    categoryLabel: 'Light Truck',
    status: 'Published',
    isFlagship: false,
    isNew: true,
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/4/47/JAC_Truck_Philippines.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/4/47/JAC_Truck_Philippines.jpg',
    altText: 'JAC 1042 Light Commercial Truck',
    gallery: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/4/47/JAC_Truck_Philippines.jpg']),
    colorOptions: JSON.stringify([{ name: 'Commercial White', hex: '#FFFFFF' }]),
    overview: 'The JAC 1042 is a high-capacity 14-foot deck commercial truck built for heavy freight distribution across intercity and local routes.',
    specs: JSON.stringify({
      engine: '2.8L Turbocharged Intercooled Diesel',
      displacement: '2771 cc',
      horsepower: '108 HP @ 3600 RPM',
      torque: '260 Nm @ 2000 RPM',
      transmission: '5-Speed Heavy Duty Manual',
      driveType: '4x2 Rear-Wheel Drive',
      fuelType: 'Diesel',
      seatingCapacity: 3,
      payloadCapacityKg: 4000,
      dimensions: '5990 mm (L) x 2080 mm (W) x 2300 mm (H)',
      wheelbase: '3360 mm',
      fuelTankCapacityLiters: 100,
      safetySummary: 'Air-Over-Hydraulic Brake System',
    }),
    features: JSON.stringify([
      {
        categoryName: 'Transport & Drivetrain',
        features: [
          '14-Foot High Volume Cargo Deck Space',
          '4.0-Ton Rated Heavy Freight Payload',
          'Air-Over-Hydraulic Brakes for Safe Heavy Braking',
          'Spacious Driver Rest Cabin with Overhead Storage',
        ],
      },
    ]),
    warranty: '2 Years / 50,000 KM Manufacturer Warranty',
    brochureAvailable: true,
    brochureUrl: '/brochures/jac-1042-brochure.pdf',
    seoTitle: 'JAC 1042 14-Ft Deck Commercial Truck | Khyber Motors',
    metaDescription: '14-foot deck 4-ton commercial freight truck with turbocharged diesel engine.',
  },
  {
    name: 'JAC 1091',
    fullTitle: 'JAC 1091 17-Foot Commercial Cargo Truck',
    slug: 'jac-1091',
    tagline: 'High-Capacity 17-Foot Cargo Deck Transport Truck',
    category: 'TRUCKS',
    subcategory: 'LIGHT',
    categoryLabel: 'Light Truck',
    status: 'Published',
    isFlagship: false,
    isNew: false,
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/4/40/JAC_truck_in_Nha_Trang_01.JPG',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/4/40/JAC_truck_in_Nha_Trang_01.JPG',
    altText: 'JAC 1091 Commercial Truck',
    gallery: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/4/40/JAC_truck_in_Nha_Trang_01.JPG']),
    colorOptions: JSON.stringify([{ name: 'Commercial White', hex: '#FFFFFF' }]),
    overview: 'The JAC 1091 commercial truck features a 17-foot deck capacity designed for heavy logistics, agricultural freight, and building material transport.',
    specs: JSON.stringify({
      engine: '3.9L 4-Cylinder Turbocharged Diesel',
      displacement: '3920 cc',
      horsepower: '125 HP @ 2800 RPM',
      torque: '380 Nm @ 1600-2000 RPM',
      transmission: '6-Speed Manual Transmission',
      driveType: '4x2 Rear-Wheel Drive',
      fuelType: 'Diesel',
      seatingCapacity: 3,
      payloadCapacityKg: 5500,
      dimensions: '6990 mm (L) x 2250 mm (W) x 2450 mm (H)',
      wheelbase: '3815 mm',
      fuelTankCapacityLiters: 120,
      safetySummary: 'Full Air Brake System, ABS',
    }),
    features: JSON.stringify([
      {
        categoryName: 'Heavy Logistics Features',
        features: [
          '17-Foot Extended Length Cargo Deck',
          '5.5-Ton Rated Transport Payload Capacity',
          'Full Air Brake System for Maximum Safety',
          'Reinforced Dual Rear Axles & Heavy Leaf Springs',
        ],
      },
    ]),
    warranty: '2 Years / 50,000 KM Manufacturer Warranty',
    brochureAvailable: true,
    brochureUrl: '/brochures/jac-1091-brochure.pdf',
    seoTitle: 'JAC 1091 17-Ft Deck Truck | Khyber Motors',
    metaDescription: '17-foot cargo deck 5.5-ton commercial transport truck for heavy logistics.',
  },
  {
    name: 'JAC 1120',
    fullTitle: 'JAC 1120 20-Foot Heavy Duty Deck Truck',
    slug: 'jac-1120',
    tagline: 'Heavy Payload 20-Foot Commercial Transport Truck',
    category: 'TRUCKS',
    subcategory: 'LIGHT',
    categoryLabel: 'Light Truck',
    status: 'Published',
    isFlagship: false,
    isNew: true,
    mainImage: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/JAC_pickup.jpg',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/JAC_pickup.jpg',
    altText: 'JAC 1120 Commercial Truck',
    gallery: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/d/d4/JAC_pickup.jpg']),
    colorOptions: JSON.stringify([{ name: 'Commercial White', hex: '#FFFFFF' }]),
    overview: 'The JAC 1120 commercial truck provides maximum deck space with its 20-foot platform length for bulk cargo and high-tonnage regional transport.',
    specs: JSON.stringify({
      engine: '4.1L Turbocharged Diesel Engine',
      displacement: '4100 cc',
      horsepower: '140 HP @ 2600 RPM',
      torque: '450 Nm @ 1500-1800 RPM',
      transmission: '6-Speed Heavy Duty Manual',
      driveType: '4x2 Rear-Wheel Drive',
      fuelType: 'Diesel',
      seatingCapacity: 3,
      payloadCapacityKg: 8000,
      dimensions: '7990 mm (L) x 2350 mm (W) x 2550 mm (H)',
      wheelbase: '4500 mm',
      fuelTankCapacityLiters: 150,
      safetySummary: 'Dual Circuit Full Air Brake System',
    }),
    features: JSON.stringify([
      {
        categoryName: 'High Capacity Chassis',
        features: [
          '20-Foot Heavy Duty Commercial Platform Deck',
          '8.0-Ton Rated Heavy Freight Payload Capacity',
          'Dual-Circuit Full Air Brakes with ABS',
          'High Torque 4.1L Turbo Diesel Powertrain',
        ],
      },
    ]),
    warranty: '2 Years / 50,000 KM Manufacturer Warranty',
    brochureAvailable: true,
    brochureUrl: '/brochures/jac-1120-brochure.pdf',
    seoTitle: 'JAC 1120 20-Ft Deck Truck | Khyber Motors',
    metaDescription: '20-foot deck 8.0-ton commercial transport truck for high-tonnage regional freight.',
  },
];

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Seed Primary Admin User using environment variables ADMIN_EMAIL and ADMIN_PASSWORD
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@khybermotors.com.pk').toLowerCase().trim();
    const rawPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
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

    // 2. Seed Vehicles
    for (const v of defaultVehicles) {
      const vehicle = await prisma.vehicle.upsert({
        where: { slug: v.slug },
        update: v,
        create: v,
      });
      console.log(`✅ Vehicle seeded: ${vehicle.name} (${vehicle.slug})`);
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
        heroImage: '/Gemini_Generated_Image_9aiio29aiio29aii.jpeg',
        heroImages: [
          '/Gemini_Generated_Image_9aiio29aiio29aii.jpeg',
          '/JAC1.jpg',
          '/JAC.jpeg',
        ],
      },
    };

    await prisma.pageContent.upsert({
      where: { key: 'home' },
      update: { data: JSON.stringify(homeContent) },
      create: { key: 'home', data: JSON.stringify(homeContent) },
    });
    console.log('✅ Home page content seeded.');

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
