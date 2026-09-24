import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded immediately before resolving database URL
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

let prismaInstance = null;

function getDatabaseUrl() {
  const cwd = process.cwd();
  const tmpDbPath = '/tmp/dev.db';

  // 1. Check Vercel or AWS Lambda serverless environment
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_BUILDER) {
    try {
      const candidatePaths = [
        path.join(cwd, 'prisma', 'dev.db'),
        path.join(cwd, 'dev.db'),
        path.resolve('prisma/dev.db'),
        path.resolve('dev.db'),
        path.join(__dirname, '../../prisma/dev.db'),
        path.join(__dirname, '../prisma/dev.db'),
        '/var/task/prisma/dev.db',
        '/var/task/dev.db',
      ];

      const source = candidatePaths.find((p) => {
        try {
          return fs.existsSync(p) && fs.statSync(p).size > 0;
        } catch {
          return false;
        }
      });

      if (source) {
        if (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0) {
          try {
            fs.copyFileSync(source, tmpDbPath);
            console.log(`✅ Copied SQLite database from ${source} to ${tmpDbPath}`);
          } catch (copyErr) {
            console.warn('Failed to copy SQLite DB to /tmp:', copyErr.message);
          }
        }
      }

      if (fs.existsSync(tmpDbPath) && fs.statSync(tmpDbPath).size > 0) {
        return `file:${tmpDbPath}`;
      } else if (source) {
        return `file:${source}`;
      }
    } catch (err) {
      console.warn('Vercel SQLite resolution warning:', err.message);
    }
  }

  // 2. Local / Standard Server environment
  let rootDir = cwd;
  if (!fs.existsSync(path.join(rootDir, 'prisma')) && fs.existsSync(path.resolve(__dirname, '../../prisma'))) {
    rootDir = path.resolve(__dirname, '../../');
  } else if (!fs.existsSync(path.join(rootDir, 'prisma')) && fs.existsSync(path.resolve(__dirname, '../prisma'))) {
    rootDir = path.resolve(__dirname, '../');
  }

  const dbPath = path.resolve(rootDir, 'prisma', 'dev.db').replace(/\\/g, '/');
  return `file:${dbPath}`;
}

export function getPrisma() {
  if (!prismaInstance) {
    try {
      let dbUrl = getDatabaseUrl();

      // Enforce file: prefix for SQLite compatibility
      if (!dbUrl.startsWith('file:')) {
        dbUrl = `file:${dbUrl}`;
      }

      // Overwrite process.env.DATABASE_URL so Prisma's internal schema validator never fails
      process.env.DATABASE_URL = dbUrl;

      prismaInstance = new PrismaClient({
        datasources: {
          db: {
            url: dbUrl,
          },
        },
      });
    } catch (err) {
      console.error('Failed to initialize PrismaClient:', err);
      prismaInstance = null;
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
      return function (...args) {
        try {
          return value.apply(client, args);
        } catch (err) {
          if (err.message && err.message.includes('Error code 14')) {
            console.warn('SQLite Error 14 encountered, resetting Prisma Client instance...');
            prismaInstance = null;
          }
          throw err;
        }
      };
    }
    return value;
  },
});

export default prisma;
