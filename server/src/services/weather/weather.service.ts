import { z } from 'zod';
import { env } from '../../config/env';
import type { AirQualityResult, ClimateResult, WindResult } from '../../types/domain';
import { ProviderUnavailableError } from '../../utils/errors';
import { circularMeanDegrees, roundTo } from '../../utils/geo';
import { joinProviderUrl, providerFetch } from '../../utils/http';
import { logger } from '../../utils/logger';
import { readProviderCache, writeProviderCache } from '../cache/providerCache';

const CLIMATE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const AIR_TTL_MS = 6 * 60 * 60 * 1000;
const WIND_TTL_MS = 12 * 60 * 60 * 1000;

const dailyClimateSchema = z.object({
  daily: z.object({
    temperature_2m_max: z.array(z.number().nullable()),
    temperature_2m_min: z.array(z.number().nullable()),
    precipitation_sum: z.array(z.number().nullable()),
  }),
});

const airSchema = z.object({
  current: z.object({
    us_aqi: z.number().nullable().optional(),
  }).optional(),
});

const windSchema = z.object({
  daily: z.object({
    wind_direction_10m_dominant: z.array(z.number().nullable()),
    wind_speed_10m_max: z.array(z.number().nullable()),
  }),
});

function numbers(values: Array<number | null>): number[] {
  return values.filter((value): value is number => value !== null && Number.isFinite(value));
}

async function fetchClimateYear(latitude: number, longitude: number, year: number): Promise<ClimateResult> {
  const url = joinProviderUrl(env.OPEN_METEO_ARCHIVE_BASE_URL, 'archive');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('start_date', `${year}-01-01`);
  url.searchParams.set('end_date', `${year}-12-31`);
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum');
  url.searchParams.set('timezone', 'UTC');
  const response = await providerFetch({ provider: 'open-meteo-archive', url: url.toString() });
  const parsed = dailyClimateSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new ProviderUnavailableError('open-meteo-archive', 'Climate archive response was not usable');
  }
  const rain = numbers(parsed.data.daily.precipitation_sum);
  const maxes = numbers(parsed.data.daily.temperature_2m_max);
  const mins = numbers(parsed.data.daily.temperature_2m_min);
  if (rain.length < 300 || maxes.length < 300 || mins.length < 300) {
    throw new ProviderUnavailableError('open-meteo-archive', `Climate archive for ${year} was incomplete`);
  }
  return {
    available: true,
    source: 'Open-Meteo Archive',
    attribution: `Open-Meteo historical weather archive for ${year}.`,
    year,
    annualRainfallMm: roundTo(rain.reduce((sum, value) => sum + value, 0), 0),
    tempMinC: roundTo(Math.min(...mins), 1),
    tempMaxC: roundTo(Math.max(...maxes), 1),
  };
}

export async function getClimate(latitude: number, longitude: number): Promise<ClimateResult> {
  const cacheKey = `climate:${latitude.toFixed(3)}:${longitude.toFixed(3)}`;
  const cached = await readProviderCache<ClimateResult>(cacheKey);
  if (cached?.available) return cached;

  for (const year of [2025, 2024]) {
    try {
      const result = await fetchClimateYear(latitude, longitude, year);
      await writeProviderCache('open-meteo-archive', cacheKey, result, CLIMATE_TTL_MS);
      return result;
    } catch (error) {
      logger.warn('Climate year unavailable', {
        year,
        provider: error instanceof ProviderUnavailableError ? error.provider : 'open-meteo-archive',
      });
    }
  }

  return {
    available: false,
    source: 'Open-Meteo Archive',
    reason: 'A complete annual climate archive was unavailable. Rainfall was not imputed.',
  };
}

export async function getAirQuality(latitude: number, longitude: number): Promise<AirQualityResult> {
  const cacheKey = `air:${latitude.toFixed(3)}:${longitude.toFixed(3)}`;
  const cached = await readProviderCache<AirQualityResult>(cacheKey);
  if (cached?.available) return cached;

  try {
    const url = joinProviderUrl(env.OPEN_METEO_AIR_QUALITY_BASE_URL, 'air-quality');
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set('current', 'us_aqi');
    url.searchParams.set('timezone', 'UTC');
    const response = await providerFetch({ provider: 'open-meteo-air-quality', url: url.toString() });
    const parsed = airSchema.safeParse(await response.json());
    const aqi = parsed.success ? parsed.data.current?.us_aqi : null;
    if (!parsed.success || aqi === null || aqi === undefined || !Number.isFinite(aqi)) {
      throw new ProviderUnavailableError('open-meteo-air-quality', 'US AQI was not present');
    }
    const result: AirQualityResult = {
      available: true,
      source: 'Open-Meteo Air Quality',
      attribution: 'Open-Meteo air-quality API, US AQI.',
      usAqi: aqi,
    };
    await writeProviderCache('open-meteo-air-quality', cacheKey, result, AIR_TTL_MS);
    return result;
  } catch (error) {
    logger.warn('Air quality unavailable', {
      provider: error instanceof ProviderUnavailableError ? error.provider : 'open-meteo-air-quality',
    });
    return {
      available: false,
      source: 'Open-Meteo Air Quality',
      reason: 'Current air quality was unavailable and was not imputed.',
    };
  }
}

export async function getWind(latitude: number, longitude: number): Promise<WindResult> {
  const cacheKey = `wind:${latitude.toFixed(3)}:${longitude.toFixed(3)}`;
  const cached = await readProviderCache<WindResult>(cacheKey);
  if (cached?.available) return cached;

  try {
    const url = joinProviderUrl(env.OPEN_METEO_BASE_URL, 'forecast');
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set('daily', 'wind_direction_10m_dominant,wind_speed_10m_max');
    url.searchParams.set('past_days', '30');
    url.searchParams.set('forecast_days', '1');
    url.searchParams.set('timezone', 'UTC');
    const response = await providerFetch({ provider: 'open-meteo-wind', url: url.toString() });
    const parsed = windSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new ProviderUnavailableError('open-meteo-wind', 'Wind response was not usable');
    }
    const directions = numbers(parsed.data.daily.wind_direction_10m_dominant);
    const speeds = numbers(parsed.data.daily.wind_speed_10m_max);
    const meanDirection = circularMeanDegrees(directions);
    if (directions.length < 14 || speeds.length < 14 || meanDirection === null) {
      throw new ProviderUnavailableError('open-meteo-wind', 'Not enough recent wind samples');
    }
    const result: WindResult = {
      available: true,
      source: 'Open-Meteo Forecast',
      attribution: 'Open-Meteo daily dominant wind direction over the recent 30 days.',
      directionDegrees: roundTo((meanDirection + 360) % 360, 0),
      meanDailyMaxSpeedKmH: roundTo(speeds.reduce((sum, value) => sum + value, 0) / speeds.length, 1),
      sampleDays: directions.length,
    };
    await writeProviderCache('open-meteo-wind', cacheKey, result, WIND_TTL_MS);
    return result;
  } catch (error) {
    logger.warn('Wind data unavailable', {
      provider: error instanceof ProviderUnavailableError ? error.provider : 'open-meteo-wind',
    });
    return {
      available: false,
      source: 'Open-Meteo Forecast',
      reason: 'Recent wind data was unavailable. Orientation will not invent a wind score.',
    };
  }
}
