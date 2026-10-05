import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.issues.map((issue) => ({
        path: issue.path.join('.') || 'body',
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  logger.error('Unhandled request error', {
    name: error instanceof Error ? error.name : 'unknown',
    message: error instanceof Error ? error.message : 'unknown',
  });

  res.status(500).json({
    error: 'Internal server error',
    ...(env.NODE_ENV === 'development' && error instanceof Error ? { detail: error.message } : {}),
  });
}
