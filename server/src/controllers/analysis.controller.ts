import type { Request, Response } from 'express';
import { analysisIdParamSchema, analysisRequestSchema } from '../schemas/requests';
import { runAnalysis } from '../services/analysis/analysis.service';
import { getStoredAnalysis } from '../services/analysis/persistence';
import { databaseConfigured, checkDatabase } from '../services/db';
import { AppError } from '../utils/errors';

async function requireDatabase(): Promise<void> {
  if (!databaseConfigured() || !(await checkDatabase())) {
    throw new AppError(503, 'Database is unavailable. Analysis was not stored or invented.', 'database_unavailable');
  }
}

export async function createAnalysis(req: Request, res: Response): Promise<void> {
  const input = analysisRequestSchema.parse(req.body);
  await requireDatabase();
  const analysis = await runAnalysis(input);
  res.status(201).json(analysis);
}

export async function getAnalysis(req: Request, res: Response): Promise<void> {
  const params = analysisIdParamSchema.parse(req.params);
  await requireDatabase();
  const analysis = await getStoredAnalysis(params.id);
  res.json(analysis);
}
