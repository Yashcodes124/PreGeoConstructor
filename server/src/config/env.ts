import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),
  NOMINATIM_BASE_URL: z.string().url().default('https://nominatim.openstreetmap.org'),
  OVERPASS_BASE_URL: z.string().url().default('https://overpass-api.de/api/interpreter'),
  OPEN_ELEVATION_BASE_URL: z.string().url().default('https://api.open-elevation.com/api/v1'),
  OPEN_METEO_BASE_URL: z.string().url().default('https://api.open-meteo.com/v1'),
  OPEN_METEO_ARCHIVE_BASE_URL: z.string().url().default('https://archive-api.open-meteo.com/v1'),
  OPEN_METEO_AIR_QUALITY_BASE_URL: z.string().url().default('https://air-quality-api.open-meteo.com/v1'),
  HTTP_USER_AGENT: z.string().min(1).default('BuildWiseAI/1.0 (construction pre-planning research)'),
  PROVIDER_TIMEOUT_MS: z.coerce.number().int().positive().default(12000),
  OVERPASS_TIMEOUT_MS: z.coerce.number().int().positive().default(28000),
  REPORT_STORAGE_DIR: z.string().min(1).default('storage/reports'),
});

export type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = envSchema.parse(process.env);

export const corsOrigins: string[] = env.CORS_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);
