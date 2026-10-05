import type { Request, Response } from 'express';
import { analysisIdParamSchema, reportIdParamSchema } from '../schemas/requests';
import { checkDatabase, databaseConfigured } from '../services/db';
import { generatePdfReport, readReportFile } from '../services/report/report.service';
import { AppError } from '../utils/errors';

async function requireDatabase(): Promise<void> {
  if (!databaseConfigured() || !(await checkDatabase())) {
    throw new AppError(503, 'Database is unavailable', 'database_unavailable');
  }
}

export async function createReport(req: Request, res: Response): Promise<void> {
  const params = analysisIdParamSchema.parse(req.params);
  await requireDatabase();
  const report = await generatePdfReport(params.id);
  res.status(201).json(report);
}

export async function downloadReport(req: Request, res: Response): Promise<void> {
  const params = reportIdParamSchema.parse(req.params);
  await requireDatabase();
  const file = await readReportFile(params.reportId);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${file.downloadName}"`);
  res.sendFile(file.filePath);
}
