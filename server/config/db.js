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
  const envPgUrl = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
  if (envPgUrl && (envPgUrl.startsWith('postgres://') || envPgUrl.startsWith('postgresql://'))) {
    return envPgUrl.trim();
  }

  const cwd = process.cwd();
  const tmpDbPath = '/tmp/dev.db';

  // 1. Check Vercel or AWS Lambda serverless environment (for SQLite fallback)
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
            fs.chmodSync(tmpDbPath, 0o666);
            console.log(`✅ Copied SQLite database from ${source} to ${tmpDbPath}`);
          } catch (copyErr) {
            console.warn('Failed to copy SQLite DB to /tmp:', copyErr.message);
          }
        }
      }

      if (fs.existsSync(tmpDbPath)) {
        try { fs.chmodSync(tmpDbPath, 0o666); } catch {}
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

  const prismaDir = path.resolve(rootDir, 'prisma');
  if (!fs.existsSync(prismaDir)) {
    fs.mkdirSync(prismaDir, { recursive: true });
  }

  const dbPath = path.resolve(prismaDir, 'dev.db').replace(/\\/g, '/');
  return `file:${dbPath}`;
}

export function getPrisma() {
  if (!prismaInstance) {
    try {
      let dbUrl = getDatabaseUrl();

      // Enforce file: prefix ONLY for SQLite paths if not a PostgreSQL URL
      if (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('file:')) {
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

    // Intercept model delegates (e.g. prisma.heroImage, prisma.vehicle, etc.)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return new Proxy(value, {
        get(modelTarget, modelProp) {
          const modelMethod = modelTarget[modelProp];
          if (typeof modelMethod === 'function') {
            return async function (...args) {
              try {
                return await modelMethod.apply(modelTarget, args);
              } catch (err) {
                if (err && err.message && (err.message.includes('Error code 14') || err.message.includes('Unable to open the database file'))) {
                  console.warn(`⚠️ SQLite Error 14 caught in model.${String(modelProp)}, refreshing PrismaClient instance and retrying...`);
                  prismaInstance = null;
                  const freshClient = getPrisma();
                  const freshModel = freshClient[prop];
                  if (freshModel && typeof freshModel[modelProp] === 'function') {
                    return await freshModel[modelProp].apply(freshModel, args);
                  }
                }
                throw err;
              }
            };
          }
          return modelMethod;
        },
      });
    }

    if (typeof value === 'function') {
      return async function (...args) {
        try {
          return await value.apply(client, args);
        } catch (err) {
          if (err && err.message && (err.message.includes('Error code 14') || err.message.includes('Unable to open the database file'))) {
            console.warn(`⚠️ SQLite Error 14 caught in client.${String(prop)}, refreshing PrismaClient instance and retrying...`);
            prismaInstance = null;
            const freshClient = getPrisma();
            if (typeof freshClient[prop] === 'function') {
              return await freshClient[prop].apply(freshClient, args);
            }
          }
          throw err;
        }
      };
    }
    return value;
  },
});

export default prisma;
