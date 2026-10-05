import { Router } from 'express';
import { analysisLimiter, reportLimiter, searchLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../utils/asyncHandler';
import { health, healthDatabase } from '../controllers/health.controller';
import { reverseSite, searchSites } from '../controllers/sites.controller';
import { createAnalysis, getAnalysis } from '../controllers/analysis.controller';
import { compareAnalyses } from '../controllers/compare.controller';
import { createReport, downloadReport } from '../controllers/reports.controller';

export const apiRouter = Router();

apiRouter.get('/health', health);
apiRouter.get('/health/db', asyncHandler(healthDatabase));

apiRouter.get('/sites/search', searchLimiter, asyncHandler(searchSites));
apiRouter.get('/sites/reverse', searchLimiter, asyncHandler(reverseSite));

apiRouter.post('/analysis', analysisLimiter, asyncHandler(createAnalysis));
apiRouter.get('/analysis/:id', asyncHandler(getAnalysis));

apiRouter.post('/compare', analysisLimiter, asyncHandler(compareAnalyses));

apiRouter.post('/reports/:id', reportLimiter, asyncHandler(createReport));
apiRouter.get('/reports/:reportId', asyncHandler(downloadReport));
