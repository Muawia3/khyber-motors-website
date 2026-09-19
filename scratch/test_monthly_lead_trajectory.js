import { PrismaClient } from '@prisma/client';
import { getLast12MonthsLeadTrajectory } from '../src/utils/analytics.js';

const prisma = new PrismaClient();

async function runTrajectoryVerification() {
  console.log('=====================================================');
  console.log('  TESTING MONTHLY LEAD TRAJECTORY ANALYTICS ENGINE   ');
  console.log('=====================================================');

  try {
    // 1. Check initial state with zero leads
    const initialLeads = await prisma.lead.findMany();
    const initialTrajectory = getLast12MonthsLeadTrajectory(initialLeads);
    const currentMonthLabel = new Date().toLocaleString('en-US', { month: 'short' });
    const currentMonthItem = initialTrajectory.find((m) => m.month === currentMonthLabel);

    console.log('\n--- 1. INITIAL ZERO STATE ---');
    console.log(`Total 12 Months Count: ${initialTrajectory.length}`);
    console.log(`All Months Zero Check: ${initialTrajectory.every(m => m.count === 0)}`);
    console.log(`Current Month (${currentMonthLabel}) Count: ${currentMonthItem?.count}`);

    if (currentMonthItem?.count !== 0) {
      throw new Error(`Expected current month count 0, got ${currentMonthItem?.count}`);
    }

    // 2. Create 1 test lead
    console.log('\n--- 2. CREATING 1 TEST LEAD ---');
    const lead1 = await prisma.lead.create({
      data: {
        name: 'Trajectory Test Lead 1',
        phone: '0300 1112233',
        vehicleInterest: 'JAC T9 4x4',
        status: 'New',
      }
    });

    const leadsState1 = await prisma.lead.findMany();
    const trajectory1 = getLast12MonthsLeadTrajectory(leadsState1);
    const current1 = trajectory1.find((m) => m.month === currentMonthLabel);
    console.log(`Current Month (${currentMonthLabel}) Count after 1 lead: ${current1?.count}`);

    if (current1?.count !== 1) {
      throw new Error(`Expected current month count 1, got ${current1?.count}`);
    }

    // 3. Create another test lead
    console.log('\n--- 3. CREATING 2ND TEST LEAD ---');
    const lead2 = await prisma.lead.create({
      data: {
        name: 'Trajectory Test Lead 2',
        phone: '0300 4445566',
        vehicleInterest: 'JAC T8 Double Cabin',
        status: 'New',
      }
    });

    const leadsState2 = await prisma.lead.findMany();
    const trajectory2 = getLast12MonthsLeadTrajectory(leadsState2);
    const current2 = trajectory2.find((m) => m.month === currentMonthLabel);
    console.log(`Current Month (${currentMonthLabel}) Count after 2 leads: ${current2?.count}`);

    if (current2?.count !== 2) {
      throw new Error(`Expected current month count 2, got ${current2?.count}`);
    }

    // 4. Delete both test leads
    console.log('\n--- 4. DELETING BOTH TEST LEADS ---');
    await prisma.lead.deleteMany({
      where: {
        id: { in: [lead1.id, lead2.id] }
      }
    });

    const finalLeads = await prisma.lead.findMany();
    const finalTrajectory = getLast12MonthsLeadTrajectory(finalLeads);
    const finalCurrent = finalTrajectory.find((m) => m.month === currentMonthLabel);
    console.log(`Current Month (${currentMonthLabel}) Count after deleting leads: ${finalCurrent?.count}`);

    if (finalCurrent?.count !== 0) {
      throw new Error(`Expected current month count 0, got ${finalCurrent?.count}`);
    }

    console.log('\n=====================================================');
    console.log('  ✅ VERIFICATION SUCCESSFUL: TRAJECTORY ACCURATE 0->1->2->0');
    console.log('=====================================================');
  } catch (err) {
    console.error('\n❌ Trajectory Verification Failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runTrajectoryVerification();
