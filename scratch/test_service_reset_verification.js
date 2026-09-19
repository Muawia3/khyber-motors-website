import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runTest() {
  console.log('--- STARTING SERVICE REQUEST RESET VERIFICATION ---');

  // Step 1: Initial state check
  const initialServiceLeads = await prisma.lead.count({
    where: {
      OR: [
        { department: { contains: 'service' } },
        { subject: { contains: 'service' } },
        { message: { contains: 'service' } },
        { department: { contains: 'Service' } },
        { subject: { contains: 'Service' } },
      ]
    }
  });

  const initialServiceNotifs = await prisma.notification.count({
    where: {
      OR: [
        { type: 'SERVICE_REQUEST' },
        { title: { contains: 'Service' } }
      ]
    }
  });

  console.log(`Initial Service Requests in DB: ${initialServiceLeads}`);
  console.log(`Initial Service Notifications in DB: ${initialServiceNotifs}`);

  // Step 2: Submit a test Service Request
  console.log('\nSubmitting test Service Request via public API...');
  const res = await fetch('http://localhost:5000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Service Customer',
      phone: '0300 9988776',
      email: 'service.test@example.com',
      department: '3S Service & Maintenance',
      subject: 'Scheduled 5,000 KM Maintenance',
      message: 'Need oil change and brake check for JAC T9.'
    })
  });
  const data = await res.json();
  console.log('Submission Result:', data.success ? 'Success' : 'Failed');

  // Step 3: Check database after submission
  const afterSubmitLeads = await prisma.lead.count({
    where: {
      OR: [
        { department: { contains: 'service' } },
        { subject: { contains: 'service' } },
        { message: { contains: 'service' } },
        { department: { contains: 'Service' } },
        { subject: { contains: 'Service' } },
      ]
    }
  });
  const afterSubmitNotifs = await prisma.notification.count({
    where: {
      OR: [
        { type: 'SERVICE_REQUEST' },
        { title: { contains: 'Service' } }
      ]
    }
  });

  console.log(`Post-Submission Service Requests in DB: ${afterSubmitLeads}`);
  console.log(`Post-Submission Service Notifications in DB: ${afterSubmitNotifs}`);

  // Step 4: Perform Service Request Reset
  console.log('\nExecuting Service Request Reset...');
  await prisma.lead.deleteMany({
    where: {
      OR: [
        { department: { contains: 'service' } },
        { subject: { contains: 'service' } },
        { message: { contains: 'service' } },
        { department: { contains: 'Service' } },
        { subject: { contains: 'Service' } },
      ]
    }
  });
  await prisma.notification.deleteMany({
    where: {
      OR: [
        { type: 'SERVICE_REQUEST' },
        { title: { contains: 'Service' } }
      ]
    }
  });

  // Step 5: Verify zero state
  const finalServiceLeads = await prisma.lead.count({
    where: {
      OR: [
        { department: { contains: 'service' } },
        { subject: { contains: 'service' } },
        { message: { contains: 'service' } },
        { department: { contains: 'Service' } },
        { subject: { contains: 'Service' } },
      ]
    }
  });
  const finalServiceNotifs = await prisma.notification.count({
    where: {
      OR: [
        { type: 'SERVICE_REQUEST' },
        { title: { contains: 'Service' } }
      ]
    }
  });

  console.log(`\nFinal Service Requests in DB: ${finalServiceLeads}`);
  console.log(`Final Service Notifications in DB: ${finalServiceNotifs}`);

  if (finalServiceLeads === 0 && finalServiceNotifs === 0) {
    console.log('\n✅ VERIFICATION PASSED: Service Requests successfully reset to 0 in PostgreSQL.');
  } else {
    console.error('\n❌ VERIFICATION FAILED: Counts are not zero.');
  }

  await prisma.$disconnect();
}

runTest();
