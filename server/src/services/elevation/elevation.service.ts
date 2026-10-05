import { z } from 'zod';
import { env } from '../../config/env';
import { ELEVATION_OFFSET_M } from '../../config/constants';
import type { ElevationResult, ElevationSample } from '../../types/domain';
import { ProviderUnavailableError } from '../../utils/errors';
import { haversineMeters, offsetCoordinate } from '../../utils/geo';
import { joinProviderUrl, providerFetch } from '../../utils/http';
import { logger } from '../../utils/logger';
import { readProviderCache, writeProviderCache } from '../cache/providerCache';

const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface SampleRequest {
  latitude: number;
  longitude: number;
}

export function elevationSamplePlan(latitude: number, longitude: number, extra: SampleRequest[] = []): SampleRequest[] {
  const north = offsetCoordinate(latitude, longitude, ELEVATION_OFFSET_M, 0);
  const south = offsetCoordinate(latitude, longitude, -ELEVATION_OFFSET_M, 0);
  const east = offsetCoordinate(latitude, longitude, 0, ELEVATION_OFFSET_M);
  const west = offsetCoordinate(latitude, longitude, 0, -ELEVATION_OFFSET_M);
  return [{ latitude, longitude }, north, south, east, west, ...extra];
}

const openElevationSchema = z.object({
  results: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    elevation: z.number(),
  })).min(1),
});

const openMeteoElevationSchema = z.object({
  elevation: z.array(z.number()).min(1),
});

function alignSamples(points: SampleRequest[], samples: ElevationSample[], provider: string): ElevationSample[] {
  return points.map((point) => {
    let best: ElevationSample | undefined;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const sample of samples) {
      const distance = haversineMeters(point.latitude, point.longitude, sample.latitude, sample.longitude);
      if (distance < bestDistance) {
        best = sample;
        bestDistance = distance;
      }
    }
    if (!best || bestDistance > 500 || !Number.isFinite(best.elevationMeters)) {
      throw new ProviderUnavailableError(provider, 'Elevation samples could not be matched to the requested points');
    }
    return {
      latitude: point.latitude,
      longitude: point.longitude,
      elevationMeters: best.elevationMeters,
    };
  });
}

async function fromOpenElevation(points: SampleRequest[]): Promise<ElevationSample[]> {
  const response = await providerFetch({
    provider: 'open-elevation',
    url: `${env.OPEN_ELEVATION_BASE_URL.replace(/\/$/, '')}/lookup`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locations: points.map((point) => ({ latitude: point.latitude, longitude: point.longitude })),
    }),
  });
  const parsed = openElevationSchema.safeParse(await response.json());
  if (!parsed.success || parsed.data.results.length < points.length) {
    throw new ProviderUnavailableError('open-elevation', 'Open-Elevation response was incomplete');
  }
  return alignSamples(points, parsed.data.results.map((item) => ({
    latitude: item.latitude,
    longitude: item.longitude,
    elevationMeters: item.elevation,
  })), 'open-elevation');
}

async function fromOpenMeteo(points: SampleRequest[]): Promise<ElevationSample[]> {
  const url = joinProviderUrl(env.OPEN_METEO_BASE_URL, 'elevation');
  url.searchParams.set('latitude', points.map((point) => point.latitude).join(','));
  url.searchParams.set('longitude', points.map((point) => point.longitude).join(','));
  const response = await providerFetch({ provider: 'open-meteo-elevation', url: url.toString() });
  const parsed = openMeteoElevationSchema.safeParse(await response.json());
  if (!parsed.success || parsed.data.elevation.length < points.length) {
    throw new ProviderUnavailableError('open-meteo-elevation', 'Open-Meteo elevation response was incomplete');
  }
  return alignSamples(
    points,
    points.map((point, index) => ({
      latitude: point.latitude,
      longitude: point.longitude,
      elevationMeters: parsed.data.elevation[index] ?? Number.NaN,
    })),
    'open-meteo-elevation',
  );
}

export async function getElevation(points: SampleRequest[]): Promise<ElevationResult> {
  const cacheKey = `elevation:${points.map((point) => `${point.latitude.toFixed(4)},${point.longitude.toFixed(4)}`).join('|')}`;
  const cached = await readProviderCache<ElevationResult>(cacheKey);
  if (cached?.available) return cached;

  try {
    const samples = await fromOpenElevation(points);
    const result: ElevationResult = {
      available: true,
      source: 'Open-Elevation',
      attribution: 'Elevation samples via Open-Elevation (typically SRTM). Resolution is coarser than a site survey.',
      samples,
      center: samples[0] as ElevationSample,
    };
    await writeProviderCache('elevation', cacheKey, result, TTL_MS);
    return result;
  } catch (error) {
    logger.warn('Primary elevation provider failed', {
      provider: error instanceof ProviderUnavailableError ? error.provider : 'open-elevation',
    });
  }

  try {
    const samples = await fromOpenMeteo(points);
    if (!samples[0] || samples.length < 3) {
      throw new ProviderUnavailableError('open-meteo-elevation', 'Not enough elevation samples');
    }
    const result: ElevationResult = {
      available: true,
      source: 'Open-Meteo Elevation',
      attribution: 'Elevation samples via Open-Meteo elevation API, used because Open-Elevation was unavailable.',
      samples,
      center: samples[0],
    };
    await writeProviderCache('elevation', cacheKey, result, TTL_MS);
    return result;
  } catch (error) {
    logger.warn('Secondary elevation provider failed', {
      provider: error instanceof ProviderUnavailableError ? error.provider : 'open-meteo-elevation',
    });
    return {
      available: false,
      source: 'elevation',
      reason: 'Elevation providers did not return a usable sample set. Slope was not imputed.',
    };
  }
}
