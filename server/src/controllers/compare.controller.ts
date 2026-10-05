import type { Request, Response } from 'express';
import { compareRequestSchema } from '../schemas/requests';
import { compareStoredAnalyses } from '../services/compare/compare.service';
import { checkDatabase, databaseConfigured } from '../services/db';
import { AppError } from '../utils/errors';

export async function compareAnalyses(req: Request, res: Response): Promise<void> {
  const input = compareRequestSchema.parse(req.body);
  if (!databaseConfigured() || !(await checkDatabase())) {
    throw new AppError(503, 'Database is unavailable', 'database_unavailable');
  }
  const comparison = await compareStoredAnalyses(input.analysisIdA, input.analysisIdB);
  res.json(comparison);
}
