import { PrismaClient } from '@prisma/client';
import path from 'path';

async function testFormats() {
  const cwd = process.cwd();
  console.log('CWD:', cwd);

  const formats = [
    `file:${path.resolve(cwd, 'prisma', 'dev.db')}`,
    `file:${path.resolve(cwd, 'prisma', 'dev.db').replace(/\\/g, '/')}`,
    `file:./prisma/dev.db`,
    `file:./dev.db`,
  ];

  for (const fmt of formats) {
    console.log(`\nTesting format: "${fmt}"`);
    try {
      process.env.DATABASE_URL = fmt;
      const client = new PrismaClient({
        datasources: { db: { url: fmt } }
      });
      const count = await client.vehicle.count();
      console.log(`✅ SUCCESS for "${fmt}" -> Vehicles count: ${count}`);
      await client.$disconnect();
    } catch (err) {
      console.error(`❌ FAILED for "${fmt}": ${err.message}`);
    }
  }
}

testFormats();
