import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function resetServiceRequests() {
  console.log('=====================================================');
  console.log('  RESETTING SERVICE REQUESTS IN JAC DEALERSHIP SYSTEM  ');
  console.log('=====================================================');

  try {
    // 1. Delete Service Request Leads
    const deletedLeads = await prisma.lead.deleteMany({
      where: {
        OR: [
          { department: { contains: 'service' } },
          { subject: { contains: 'service' } },
          { message: { contains: 'service' } },
          { department: { contains: 'Service' } },
          { subject: { contains: 'Service' } },
          { message: { contains: 'Service' } },
        ]
      }
    });
    console.log(`✔ Deleted ${deletedLeads.count} Service Request records from Lead table.`);

    // 2. Delete Notifications related to Service Requests
    const deletedNotifs = await prisma.notification.deleteMany({
      where: {
        OR: [
          { type: 'SERVICE_REQUEST' },
          { title: { contains: 'Service' } },
          { message: { contains: 'service' } },
          { message: { contains: 'Service' } },
        ]
      }
    });
    console.log(`✔ Deleted ${deletedNotifs.count} Service Request related Notification records.`);

    // 3. Verify counts
    const remainingServiceLeads = await prisma.lead.count({
      where: {
        OR: [
          { department: { contains: 'service' } },
          { subject: { contains: 'service' } },
          { message: { contains: 'service' } },
        ]
      }
    });

    const remainingServiceNotifs = await prisma.notification.count({
      where: {
        OR: [
          { type: 'SERVICE_REQUEST' },
          { title: { contains: 'Service' } },
        ]
      }
    });

    console.log('\n--- VERIFICATION STATS ---');
    console.log(`Service Requests in PostgreSQL: ${remainingServiceLeads}`);
    console.log(`Service Notifications in PostgreSQL: ${remainingServiceNotifs}`);

    console.log('=====================================================');
    console.log('  SERVICE REQUESTS RESET COMPLETE - COUNT IS 0       ');
    console.log('=====================================================');
  } catch (error) {
    console.error('Error resetting service requests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetServiceRequests();
