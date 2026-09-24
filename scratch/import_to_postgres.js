import prisma from '../server/config/db.js';
import fs from 'fs';
import path from 'path';

async function importToPostgres() {
  console.log('🚀 Starting import of backed up SQLite data to PostgreSQL...');

  const backupFile = path.resolve('scratch', 'db_backup.json');
  if (!fs.existsSync(backupFile)) {
    console.error(`❌ Backup file not found at: ${backupFile}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(backupFile, 'utf-8');
  const data = JSON.parse(raw);

  try {
    // 1. Admin Users
    if (Array.isArray(data.adminUsers)) {
      for (const u of data.adminUsers) {
        await prisma.adminUser.upsert({
          where: { email: u.email },
          update: { passwordHash: u.passwordHash, name: u.name, role: u.role, isActive: u.isActive, isPrimary: u.isPrimary },
          create: u,
        });
      }
      console.log(`✅ AdminUsers restored (${data.adminUsers.length})`);
    }

    // 2. Vehicles
    if (Array.isArray(data.vehicles)) {
      for (const v of data.vehicles) {
        const { id, createdAt, updatedAt, ...vehData } = v;
        await prisma.vehicle.upsert({
          where: { slug: v.slug },
          update: vehData,
          create: v,
        });
      }
      console.log(`✅ Vehicles restored (${data.vehicles.length})`);
    }

    // 3. PageContent
    if (Array.isArray(data.pageContents)) {
      for (const p of data.pageContents) {
        await prisma.pageContent.upsert({
          where: { key: p.key },
          update: { data: p.data },
          create: p,
        });
      }
      console.log(`✅ PageContents restored (${data.pageContents.length})`);
    }

    // 4. SocialLinks
    if (Array.isArray(data.socialLinks)) {
      for (const s of data.socialLinks) {
        const existing = await prisma.socialLink.findFirst({
          where: { platform: s.platform }
        });
        if (!existing) {
          await prisma.socialLink.create({ data: s });
        }
      }
      console.log(`✅ SocialLinks restored (${data.socialLinks.length})`);
    }

    // 5. DepartmentContacts
    if (Array.isArray(data.departmentContacts)) {
      for (const d of data.departmentContacts) {
        await prisma.departmentContact.upsert({
          where: { name: d.name },
          update: { phone: d.phone, contactPerson: d.contactPerson, whatsapp: d.whatsapp, email: d.email, displayOrder: d.displayOrder, isActive: d.isActive },
          create: d,
        });
      }
      console.log(`✅ DepartmentContacts restored (${data.departmentContacts.length})`);
    }

    // 6. TeamMembers
    if (Array.isArray(data.teamMembers)) {
      for (const t of data.teamMembers) {
        const { id, parentId, createdAt, updatedAt, ...tData } = t;
        const existing = await prisma.teamMember.findFirst({
          where: { name: t.name, designation: t.designation }
        });
        if (!existing) {
          await prisma.teamMember.create({ data: tData });
        }
      }
      console.log(`✅ TeamMembers restored (${data.teamMembers.length})`);
    }

    console.log('🎉 PostgreSQL migration & data import completed successfully!');
  } catch (err) {
    console.error('❌ Migration import error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

importToPostgres();
