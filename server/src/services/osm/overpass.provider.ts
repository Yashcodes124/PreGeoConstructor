import { z } from 'zod';
import { env } from '../../config/env';
import {
  FACILITY_SEARCH_RADIUS_M,
  ROAD_SEARCH_RADIUS_M,
  TRANSIT_SEARCH_RADIUS_M,
  WATER_SEARCH_RADIUS_M,
} from '../../config/constants';
import type { OsmFeature } from '../../types/domain';
import { ProviderUnavailableError } from '../../utils/errors';
import { providerFetch } from '../../utils/http';

const elementSchema = z.object({
  type: z.string(),
  id: z.number(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  tags: z.record(z.string()).optional(),
});

const overpassSchema = z.object({
  elements: z.array(elementSchema),
});

const DRIVABLE = new Set([
  'motorway',
  'trunk',
  'primary',
  'secondary',
  'tertiary',
  'unclassified',
  'residential',
  'service',
  'living_street',
]);

export function waterQuery(latitude: number, longitude: number): string {
  return `[out:json][timeout:20];(way(around:${WATER_SEARCH_RADIUS_M},${latitude},${longitude})["natural"="water"];way(around:${WATER_SEARCH_RADIUS_M},${latitude},${longitude})["waterway"~"river|stream|canal|drain"];node(around:${WATER_SEARCH_RADIUS_M},${latitude},${longitude})["natural"="water"];);out center;`;
}

export function roadQuery(latitude: number, longitude: number): string {
  return `[out:json][timeout:15];way(around:${ROAD_SEARCH_RADIUS_M},${latitude},${longitude})["highway"~"primary|secondary|tertiary|unclassified|residential|living_street"];out center;`;
}

export function facilityQuery(latitude: number, longitude: number): string {
  return `[out:json][timeout:15];(node(around:${FACILITY_SEARCH_RADIUS_M},${latitude},${longitude})["amenity"~"hospital|clinic|fire_station"];node(around:${FACILITY_SEARCH_RADIUS_M},${latitude},${longitude})["shop"~"hardware|doityourself"];node(around:${FACILITY_SEARCH_RADIUS_M},${latitude},${longitude})["power"="substation"];node(around:${FACILITY_SEARCH_RADIUS_M},${latitude},${longitude})["man_made"~"water_works|water_tower"];node(around:${FACILITY_SEARCH_RADIUS_M},${latitude},${longitude})["railway"="station"];node(around:${TRANSIT_SEARCH_RADIUS_M},${latitude},${longitude})["highway"="bus_stop"];);out center;`;
}

export function classifyFeature(tags: Record<string, string>): OsmFeature['kind'] | null {
  if (tags.natural === 'water' || tags.waterway || tags.water || tags.landuse === 'reservoir') return 'water';
  if (tags.highway && DRIVABLE.has(tags.highway)) return 'road';
  if (
    tags.amenity === 'hospital' ||
    tags.amenity === 'clinic' ||
    tags.amenity === 'fire_station' ||
    tags.amenity === 'bus_station' ||
    tags.shop === 'hardware' ||
    tags.shop === 'doityourself' ||
    tags.power === 'substation' ||
    tags.man_made === 'water_works' ||
    tags.man_made === 'water_tower' ||
    tags.railway === 'station' ||
    tags.highway === 'bus_stop'
  ) {
    return 'facility';
  }
  return null;
}

export function toFeatures(elements: z.infer<typeof elementSchema>[]): OsmFeature[] {
  const features: OsmFeature[] = [];
  for (const element of elements) {
    const tags = element.tags ?? {};
    const kind = classifyFeature(tags);
    const latitude = element.lat ?? element.center?.lat;
    const longitude = element.lon ?? element.center?.lon;
    if (!kind || latitude === undefined || longitude === undefined) continue;
    features.push({ id: element.id, latitude, longitude, tags, kind });
  }
  return features;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function queryOverpass(query: string): Promise<OsmFeature[]> {
  const body = new URLSearchParams({ data: query });
  let lastError: ProviderUnavailableError | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (attempt > 0) await sleep(2500);
    try {
      const response = await providerFetch({
        provider: 'overpass',
        url: env.OVERPASS_BASE_URL,
        method: 'POST',
        accept: '*/*',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        timeoutMs: env.OVERPASS_TIMEOUT_MS,
      });
      const parsed = overpassSchema.safeParse(await response.json());
      if (!parsed.success) {
        throw new ProviderUnavailableError('overpass', 'Overpass response did not match the expected shape');
      }
      return toFeatures(parsed.data.elements);
    } catch (error) {
      lastError = error instanceof ProviderUnavailableError
        ? error
        : new ProviderUnavailableError('overpass', 'Overpass request failed');
    }
  }

  throw lastError ?? new ProviderUnavailableError('overpass', 'Overpass request failed');
}
