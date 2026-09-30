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
  const envPgUrl = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (envPgUrl) {
    return envPgUrl.trim();
  }

  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL.trim();
  }


  return process.env.DATABASE_URL;
}

export function getPrisma() {
  if (!prismaInstance) {
    try {
      let dbUrl = getDatabaseUrl();

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
