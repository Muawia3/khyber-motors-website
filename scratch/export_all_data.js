import prisma from '../server/config/db.js';
import fs from 'fs';
import path from 'path';

async function exportData() {
  console.log('📦 Starting backup export of all current database records...');

  const data = {};

  try {
    data.adminUsers = await prisma.adminUser.findMany();
    data.vehicles = await prisma.vehicle.findMany();
    data.leads = await prisma.lead.findMany();
    data.pageContents = await prisma.pageContent.findMany();
    data.uploadedFiles = await prisma.uploadedFile.findMany();
    data.heroImages = await prisma.heroImage.findMany();
    data.socialLinks = await prisma.socialLink.findMany();
    data.notifications = await prisma.notification.findMany();
    data.reviews = await prisma.review.findMany();
    data.departmentContacts = await prisma.departmentContact.findMany();
    data.teamMembers = await prisma.teamMember.findMany();

    const backupPath = path.resolve('scratch', 'db_backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`✅ Data export completed! Backup saved to: ${backupPath}`);
    console.log(`Summary of backed up records:
    - AdminUsers: ${data.adminUsers.length}
    - Vehicles: ${data.vehicles.length}
    - Leads: ${data.leads.length}
    - PageContents: ${data.pageContents.length}
    - UploadedFiles: ${data.uploadedFiles.length}
    - HeroImages: ${data.heroImages.length}
    - SocialLinks: ${data.socialLinks.length}
    - Notifications: ${data.notifications.length}
    - Reviews: ${data.reviews.length}
    - DepartmentContacts: ${data.departmentContacts.length}
    - TeamMembers: ${data.teamMembers.length}
    `);
  } catch (err) {
    console.error('❌ Data export failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
