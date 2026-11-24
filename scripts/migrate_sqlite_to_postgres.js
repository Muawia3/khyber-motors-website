import dotenv from 'dotenv';
dotenv.config();

import { DatabaseSync } from 'node:sqlite';
import prisma from '../backend/config/db.js';

async function migrate() {
  console.log('🔄 Starting data sync from SQLite dev.db to PostgreSQL...');
  
  const sqlite = new DatabaseSync('database/prisma/dev.db');

  // 1. Vehicles
  const vehicles = sqlite.prepare('SELECT * FROM Vehicle').all();
  console.log(`Found ${vehicles.length} vehicles in SQLite.`);
  for (const v of vehicles) {
    // Convert boolean integers from SQLite (0/1) to booleans
    const data = {
      id: v.id,
      name: v.name,
      fullTitle: v.fullTitle,
      slug: v.slug,
      tagline: v.tagline,
      category: v.category,
      subcategory: v.subcategory,
      subSubcategory: v.subSubcategory,
      brand: v.brand,
      displayOrder: v.displayOrder ?? 0,
      categoryLabel: v.categoryLabel,
      price: v.price ? parseFloat(v.price) : null,
      formattedPrice: v.formattedPrice,
      priceLabel: v.priceLabel,
      isPriceOnRequest: Boolean(v.isPriceOnRequest),
      status: v.status || 'Published',
      stockStatus: v.stockStatus || 'in_stock',
      stockQuantity: v.stockQuantity ?? 1,
      isFlagship: Boolean(v.isFlagship),
      isNew: Boolean(v.isNew),
      mainImage: v.mainImage,
      heroImage: v.heroImage,
      altText: v.altText,
      gallery: v.gallery || '[]',
      colorOptions: v.colorOptions || '[]',
      overview: v.overview || '',
      specs: v.specs || '{}',
      features: v.features || '[]',
      whyT9Benefits: v.whyT9Benefits || '[]',
      warranty: v.warranty,
      brochureAvailable: Boolean(v.brochureAvailable),
      brochureUrl: v.brochureUrl,
      seoTitle: v.seoTitle,
      metaDescription: v.metaDescription,
      createdAt: v.createdAt ? new Date(Number(v.createdAt)) : new Date(),
      updatedAt: v.updatedAt ? new Date(Number(v.updatedAt)) : new Date(),
    };

    await prisma.vehicle.upsert({
      where: { slug: v.slug },
      update: data,
      create: data,
    });
    console.log(`  ✓ Synced vehicle: ${v.name} (${v.slug})`);
  }

  // 2. PageContent
  const pageContents = sqlite.prepare('SELECT * FROM PageContent').all();
  console.log(`Found ${pageContents.length} page contents in SQLite.`);
  for (const p of pageContents) {
    await prisma.pageContent.upsert({
      where: { key: p.key },
      update: {
        data: p.data,
        updatedAt: p.updatedAt ? new Date(Number(p.updatedAt)) : new Date(),
      },
      create: {
        id: p.id,
        key: p.key,
        data: p.data,
        updatedAt: p.updatedAt ? new Date(Number(p.updatedAt)) : new Date(),
      },
    });
    console.log(`  ✓ Synced page content: ${p.key}`);
  }

  // 3. TeamMember
  try {
    const teamMembers = sqlite.prepare('SELECT * FROM TeamMember').all();
    console.log(`Found ${teamMembers.length} team members in SQLite.`);
    for (const tm of teamMembers) {
      await prisma.teamMember.upsert({
        where: { id: tm.id },
        update: {
          name: tm.name,
          designation: tm.designation,
          department: tm.department,
          shortDescription: tm.shortDescription,
          imageUrl: tm.imageUrl,
          parentId: tm.parentId,
          displayOrder: tm.displayOrder ?? 0,
          isActive: Boolean(tm.isActive),
        },
        create: {
          id: tm.id,
          name: tm.name,
          designation: tm.designation,
          department: tm.department,
          shortDescription: tm.shortDescription,
          imageUrl: tm.imageUrl,
          parentId: tm.parentId,
          displayOrder: tm.displayOrder ?? 0,
          isActive: Boolean(tm.isActive),
        },
      });
      console.log(`  ✓ Synced team member: ${tm.name}`);
    }
  } catch (err) {
    console.log('TeamMember sync notice:', err.message);
  }

  // 4. DepartmentContact
  try {
    const depContacts = sqlite.prepare('SELECT * FROM DepartmentContact').all();
    console.log(`Found ${depContacts.length} department contacts in SQLite.`);
    for (const dc of depContacts) {
      await prisma.departmentContact.upsert({
        where: { id: dc.id },
        update: {
          name: dc.name,
          phone: dc.phone,
          email: dc.email,
          timing: dc.timing,
          displayOrder: dc.displayOrder ?? 0,
          isActive: Boolean(dc.isActive),
        },
        create: {
          id: dc.id,
          name: dc.name,
          phone: dc.phone,
          email: dc.email,
          timing: dc.timing,
          displayOrder: dc.displayOrder ?? 0,
          isActive: Boolean(dc.isActive),
        },
      });
      console.log(`  ✓ Synced department contact: ${dc.name}`);
    }
  } catch (err) {
    console.log('DepartmentContact sync notice:', err.message);
  }

  // 5. SocialLink
  try {
    const socialLinks = sqlite.prepare('SELECT * FROM SocialLink').all();
    console.log(`Found ${socialLinks.length} social links in SQLite.`);
    for (const sl of socialLinks) {
      await prisma.socialLink.upsert({
        where: { id: sl.id },
        update: {
          platform: sl.platform,
          url: sl.url,
          icon: sl.icon,
          displayOrder: sl.displayOrder ?? 0,
          isActive: Boolean(sl.isActive),
        },
        create: {
          id: sl.id,
          platform: sl.platform,
          url: sl.url,
          icon: sl.icon,
          displayOrder: sl.displayOrder ?? 0,
          isActive: Boolean(sl.isActive),
        },
      });
      console.log(`  ✓ Synced social link: ${sl.platform}`);
    }
  } catch (err) {
    console.log('SocialLink sync notice:', err.message);
  }

  // 6. AdminUser (ensure admin exists)
  try {
    const admins = sqlite.prepare('SELECT * FROM AdminUser').all();
    for (const a of admins) {
      await prisma.adminUser.upsert({
        where: { email: a.email },
        update: {
          passwordHash: a.passwordHash,
          name: a.name,
          role: a.role || 'SUPER_ADMIN',
          isActive: Boolean(a.isActive),
          isPrimary: Boolean(a.isPrimary),
        },
        create: {
          id: a.id,
          email: a.email,
          passwordHash: a.passwordHash,
          name: a.name,
          role: a.role || 'SUPER_ADMIN',
          isActive: Boolean(a.isActive),
          isPrimary: Boolean(a.isPrimary),
        },
      });
      console.log(`  ✓ Synced admin: ${a.email}`);
    }
  } catch (err) {
    console.log('Admin sync notice:', err.message);
  }

  console.log('🎉 Database sync to PostgreSQL completed successfully!');
  await prisma.$disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
