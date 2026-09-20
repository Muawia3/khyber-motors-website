import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

let prismaInstance = null;

function getDatabaseUrl() {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL;
  }

  const cwd = process.cwd();
  const tmpDbPath = '/tmp/dev.db';

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const candidatePaths = [
        path.join(cwd, 'prisma', 'dev.db'),
        path.join(cwd, 'dev.db'),
        path.resolve('prisma/dev.db'),
        path.resolve('dev.db'),
      ];

      const source = candidatePaths.find((p) => fs.existsSync(p));

      if (source && !fs.existsSync(tmpDbPath)) {
        fs.copyFileSync(source, tmpDbPath);
        console.log(`✅ Copied SQLite database from ${source} to ${tmpDbPath}`);
      }

      if (fs.existsSync(tmpDbPath)) {
        return `file:${tmpDbPath}`;
      } else if (source) {
        return `file:${source}`;
      }
    } catch (err) {
      console.warn('Vercel SQLite copy warning:', err.message);
    }
  }

  const defaultPath = path.join(cwd, 'prisma', 'dev.db');
  return `file:${defaultPath}`;
}

export function getPrisma() {
  if (!prismaInstance) {
    try {
      const dbUrl = getDatabaseUrl();
      prismaInstance = new PrismaClient({
        datasources: {
          db: {
            url: dbUrl,
          },
        },
      });
    } catch (err) {
      console.error('Failed to initialize PrismaClient:', err);
      throw err;
    }
  }
  return prismaInstance;
}

const prisma = new Proxy({}, {
  get(_target, prop) {
    const client = getPrisma();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
