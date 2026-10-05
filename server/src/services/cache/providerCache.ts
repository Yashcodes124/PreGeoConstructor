import { Prisma } from '../../../../generated/prisma/client';
import { getPrisma } from '../db';
import { logger } from '../../utils/logger';

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function readProviderCache<T>(cacheKey: string): Promise<T | null> {
  try {
    const row = await getPrisma().providerCache.findUnique({ where: { cacheKey } });
    if (!row) return null;
    if (row.expiresAt.getTime() <= Date.now()) {
      await getPrisma().providerCache.delete({ where: { cacheKey } }).catch(() => undefined);
      return null;
    }
    return row.payload as T;
  } catch (error) {
    logger.warn('Provider cache read skipped', {
      reason: error instanceof Error ? error.name : 'unknown',
    });
    return null;
  }
}

export async function writeProviderCache(provider: string, cacheKey: string, payload: unknown, ttlMs: number): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttlMs);
    await getPrisma().providerCache.upsert({
      where: { cacheKey },
      create: { provider, cacheKey, payload: toJson(payload), expiresAt },
      update: { provider, payload: toJson(payload), expiresAt },
    });
  } catch (error) {
    logger.warn('Provider cache write skipped', {
      provider,
      reason: error instanceof Error ? error.name : 'unknown',
    });
  }
}
