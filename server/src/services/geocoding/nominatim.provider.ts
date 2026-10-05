import { z } from 'zod';
import { env } from '../../config/env';
import type { LocationResult } from '../../types/domain';
import { ProviderUnavailableError } from '../../utils/errors';
import { providerFetch, withNominatimSlot } from '../../utils/http';

const addressSchema = z.record(z.union([z.string(), z.number()])).optional();

const searchItemSchema = z.object({
  display_name: z.string(),
  lat: z.string(),
  lon: z.string(),
  address: addressSchema,
});

const reverseSchema = searchItemSchema.extend({
  error: z.string().optional(),
});

function readAddress(address: z.infer<typeof addressSchema>): LocationResult['address'] {
  if (!address) return undefined;
  const text = (key: string) => {
    const value = address[key];
    return value === undefined ? undefined : String(value);
  };
  return {
    road: text('road') ?? text('pedestrian'),
    suburb: text('suburb') ?? text('neighbourhood'),
    city: text('city') ?? text('town') ?? text('village') ?? text('county'),
    state: text('state'),
    country: text('country'),
    postcode: text('postcode'),
  };
}

function normalize(item: z.infer<typeof searchItemSchema>): LocationResult {
  const latitude = Number(item.lat);
  const longitude = Number(item.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new ProviderUnavailableError('nominatim', 'Nominatim returned coordinates that could not be parsed');
  }
  return {
    displayName: item.display_name,
    latitude,
    longitude,
    address: readAddress(item.address),
    source: 'OpenStreetMap Nominatim',
    attribution: '© OpenStreetMap contributors',
  };
}

async function nominatimGet(url: string): Promise<unknown> {
  return withNominatimSlot(async () => {
    const response = await providerFetch({
      provider: 'nominatim',
      url,
      headers: { 'Accept-Language': 'en' },
    });
    return response.json() as Promise<unknown>;
  });
}

export async function nominatimSearch(query: string): Promise<LocationResult[]> {
  const url = new URL('/search', env.NOMINATIM_BASE_URL);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');
  const payload = await nominatimGet(url.toString());
  const parsed = z.array(searchItemSchema).safeParse(payload);
  if (!parsed.success) {
    throw new ProviderUnavailableError('nominatim', 'Nominatim search response did not match the expected shape');
  }
  return parsed.data.map(normalize);
}

export async function nominatimReverse(latitude: number, longitude: number): Promise<LocationResult> {
  const url = new URL('/reverse', env.NOMINATIM_BASE_URL);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', String(latitude));
  url.searchParams.set('lon', String(longitude));
  url.searchParams.set('addressdetails', '1');
  const payload = await nominatimGet(url.toString());
  const parsed = reverseSchema.safeParse(payload);
  if (!parsed.success || parsed.data.error) {
    throw new ProviderUnavailableError('nominatim', 'Nominatim reverse geocoding did not return a place');
  }
  return normalize(parsed.data);
}
