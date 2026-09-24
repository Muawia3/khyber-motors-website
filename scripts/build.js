import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || '';

if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  console.log('🚀 Synchronizing PostgreSQL database schema with Prisma db push...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  } catch (err) {
    console.warn('⚠️ db push warning:', err.message);
  }
} else {
  console.log('ℹ️ Local environment detected. Skipping remote PostgreSQL db push.');
}

console.log('⚡ Generating Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit' });

console.log('📦 Building Vite production bundle...');
execSync('npx vite build', { stdio: 'inherit' });
