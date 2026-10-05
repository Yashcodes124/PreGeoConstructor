import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export function databaseConfigured(): boolean {
  return Boolean(env.DATABASE_URL);
}

export function getPrisma(): PrismaClient {
  if (!env.DATABASE_URL) {
    throw new AppError(503, 'Database is not configured', 'database_unconfigured');
  }
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

export async function checkDatabase(): Promise<boolean> {
  if (!databaseConfigured()) return false;
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }
}
