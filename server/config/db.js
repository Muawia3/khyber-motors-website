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

  // Find project root directory containing prisma/dev.db
  let rootDir = cwd;
  if (!fs.existsSync(path.join(rootDir, 'prisma')) && fs.existsSync(path.resolve(__dirname, '../../prisma'))) {
    rootDir = path.resolve(__dirname, '../../');
  } else if (!fs.existsSync(path.join(rootDir, 'prisma')) && fs.existsSync(path.resolve(__dirname, '../prisma'))) {
    rootDir = path.resolve(__dirname, '../');
  }

  const dbPath = path.resolve(rootDir, 'prisma', 'dev.db');
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
