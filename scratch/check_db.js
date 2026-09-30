import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany();
  console.log('Total vehicles:', vehicles.length);
  if (vehicles.length > 0) {
    console.log('Sample:', vehicles[0].name);
  }
}

main().finally(() => prisma.$disconnect());
