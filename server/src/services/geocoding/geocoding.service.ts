import type { LocationResult } from '../../types/domain';
import { ProviderUnavailableError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { readProviderCache, writeProviderCache } from '../cache/providerCache';
import { nominatimReverse, nominatimSearch } from './nominatim.provider';

const SEARCH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const REVERSE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

function searchKey(query: string): string {
  return `nominatim:search:${query.trim().toLowerCase()}`;
}

function reverseKey(latitude: number, longitude: number): string {
  return `nominatim:reverse:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
}

export async function searchLocations(query: string): Promise<LocationResult[]> {
  const key = searchKey(query);
  const cached = await readProviderCache<LocationResult[]>(key);
  if (cached) return cached;

  try {
    const results = await nominatimSearch(query);
    await writeProviderCache('nominatim', key, results, SEARCH_TTL_MS);
    return results;
  } catch (error) {
    if (error instanceof ProviderUnavailableError) {
      logger.warn('Geocoding search unavailable', { provider: error.provider });
    }
    throw error;
  }
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<LocationResult | null> {
  const key = reverseKey(latitude, longitude);
  const cached = await readProviderCache<LocationResult>(key);
  if (cached) return cached;

  try {
    const result = await nominatimReverse(latitude, longitude);
    await writeProviderCache('nominatim', key, result, REVERSE_TTL_MS);
    return result;
  } catch (error) {
    logger.warn('Reverse geocoding unavailable', {
      provider: error instanceof ProviderUnavailableError ? error.provider : 'nominatim',
    });
    return null;
  }
}
