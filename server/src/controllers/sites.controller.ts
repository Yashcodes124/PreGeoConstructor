import type { Request, Response } from 'express';
import { reverseQuerySchema, searchQuerySchema } from '../schemas/requests';
import { reverseGeocode, searchLocations } from '../services/geocoding/geocoding.service';
import { AppError } from '../utils/errors';
import { ProviderUnavailableError } from '../utils/errors';

export async function searchSites(req: Request, res: Response): Promise<void> {
  const query = searchQuerySchema.parse(req.query);
  try {
    const results = await searchLocations(query.q);
    res.json(results);
  } catch (error) {
    if (error instanceof ProviderUnavailableError) {
      throw new AppError(503, 'Location search is temporarily unavailable', 'geocoding_unavailable');
    }
    throw error;
  }
}

export async function reverseSite(req: Request, res: Response): Promise<void> {
  const query = reverseQuerySchema.parse(req.query);
  const result = await reverseGeocode(query.lat, query.lon);
  if (!result) {
    throw new AppError(503, 'Reverse geocoding is temporarily unavailable', 'geocoding_unavailable');
  }
  res.json(result);
}
