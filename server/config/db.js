import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let prismaInstance = null;

function getDatabaseUrl() {
  const cwd = process.cwd();
  const tmpDbPath = '/tmp/dev.db';

  // Check Vercel or AWS Lambda environment
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
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

      if (source && (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0)) {
        fs.copyFileSync(source, tmpDbPath);
        console.log(`✅ Copied SQLite database from ${source} to ${tmpDbPath}`);
      }

      if (fs.existsSync(tmpDbPath) && fs.statSync(tmpDbPath).size > 0) {
        return `file:${tmpDbPath}`;
      } else if (source) {
        return `file:${source}`;
      }
    } catch (err) {
      console.warn('Vercel SQLite copy warning:', err.message);
    }
  }

  let envUrl = process.env.DATABASE_URL;
  if (envUrl) {
    const rawPath = envUrl.replace(/^file:/, '').trim();
    let absolutePath = path.isAbsolute(rawPath) ? rawPath : path.resolve(cwd, rawPath);

    // If target path does not exist, check if prisma/dev.db exists
    try {
      if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).size === 0) {
        const fallbackPrismaPath = path.resolve(cwd, 'prisma', 'dev.db');
        if (fs.existsSync(fallbackPrismaPath) && fs.statSync(fallbackPrismaPath).size > 0) {
          absolutePath = fallbackPrismaPath;
        }
      }
    } catch {
      // Ignore stat error and fallback
    }

    return `file:${absolutePath}`;
  }

  const defaultPath = path.resolve(cwd, 'prisma', 'dev.db');
  return `file:${defaultPath}`;
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
