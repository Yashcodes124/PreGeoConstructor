import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { corsOrigins } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimit';
import { apiRouter } from './routes';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    methods: ['GET', 'POST'],
  }));
  app.use(express.json({ limit: '100kb' }));
  app.use('/api', globalLimiter, apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
