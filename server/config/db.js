import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

let dbUrl = process.env.DATABASE_URL;

// On Vercel / Serverless lambdas, the root directory is read-only.
// Copy dev.db to /tmp/dev.db so SQLite write operations (login history, last login time, user updates) succeed.
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  try {
    const tmpDbPath = '/tmp/dev.db';
    const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    if (!fs.existsSync(tmpDbPath) && fs.existsSync(sourceDbPath)) {
      fs.copyFileSync(sourceDbPath, tmpDbPath);
      console.log('✅ SQLite database copied to /tmp/dev.db for Vercel writable access.');
    }

    if (fs.existsSync(tmpDbPath)) {
      dbUrl = `file:${tmpDbPath}`;
    } else if (fs.existsSync(sourceDbPath)) {
      dbUrl = `file:${sourceDbPath}`;
    }
  } catch (err) {
    console.error('Vercel SQLite setup warning:', err.message);
  }
} else if (!dbUrl || dbUrl === 'file:./dev.db') {
  const absPath = path.join(process.cwd(), 'prisma', 'dev.db');
  dbUrl = `file:${absPath}`;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

export default prisma;
