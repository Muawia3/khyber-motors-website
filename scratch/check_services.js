import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const serviceLeads = await prisma.lead.findMany({
    where: {
      OR: [
        { department: { contains: 'service' } },
        { subject: { contains: 'service' } },
        { message: { contains: 'service' } },
      ]
    }
  });

  const serviceNotifs = await prisma.notification.findMany({
    where: {
      OR: [
        { type: 'SERVICE_REQUEST' },
        { title: { contains: 'Service' } },
        { message: { contains: 'service' } }
      ]
    }
  });

  const allLeads = await prisma.lead.findMany();
  const allNotifs = await prisma.notification.findMany();

  console.log('--- DB INSPECTION ---');
  console.log('Total Leads in DB:', allLeads.length);
  console.log('Service Leads in DB:', serviceLeads.length, serviceLeads);
  console.log('Total Notifications in DB:', allNotifs.length);
  console.log('Service Notifications in DB:', serviceNotifs.length, serviceNotifs);

  await prisma.$disconnect();
}

run();
