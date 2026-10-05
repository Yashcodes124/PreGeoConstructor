import type { OsmFeature } from '../../types/domain';
import { logger } from '../../utils/logger';
import { readProviderCache, writeProviderCache } from '../cache/providerCache';
import { facilityQuery, queryOverpass, roadQuery, waterQuery } from './overpass.provider';

const TTL_MS = 24 * 60 * 60 * 1000;

export interface OsmContextResult {
  source: string;
  attribution: string;
  waterOk: boolean;
  roadsOk: boolean;
  facilitiesOk: boolean;
  features: OsmFeature[];
  reason?: string;
  searchedAt: string;
}

async function loadSubset(cacheKey: string, query: string): Promise<{ ok: boolean; features: OsmFeature[] }> {
  const cached = await readProviderCache<OsmFeature[]>(cacheKey);
  if (cached) return { ok: true, features: cached };
  try {
    const features = await queryOverpass(query);
    await writeProviderCache('osm', cacheKey, features, TTL_MS);
    return { ok: true, features };
  } catch (error) {
    logger.warn('OSM subset unavailable', {
      provider: 'overpass',
      reason: error instanceof Error ? error.name : 'unknown',
    });
    return { ok: false, features: [] };
  }
}

export async function getOsmContext(latitude: number, longitude: number): Promise<OsmContextResult> {
  const rounded = `${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
  const water = await loadSubset(`osm:water:${rounded}`, waterQuery(latitude, longitude));
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const roads = await loadSubset(`osm:roads:${rounded}`, roadQuery(latitude, longitude));
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const facilities = await loadSubset(`osm:facilities:${rounded}`, facilityQuery(latitude, longitude));

  const failed = [
    !water.ok ? 'surface water' : null,
    !roads.ok ? 'roads' : null,
    !facilities.ok ? 'facilities' : null,
  ].filter((item): item is string => item !== null);

  return {
    source: 'OpenStreetMap Overpass',
    attribution: '© OpenStreetMap contributors',
    waterOk: water.ok,
    roadsOk: roads.ok,
    facilitiesOk: facilities.ok,
    features: [...water.features, ...roads.features, ...facilities.features],
    searchedAt: new Date().toISOString(),
    ...(failed.length > 0
      ? { reason: `OpenStreetMap query failed for ${failed.join(', ')}. Those distances were not imputed.` }
      : {}),
  };
}
