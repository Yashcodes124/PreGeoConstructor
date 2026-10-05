import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const testMode = env.NODE_ENV === 'test';

function limiter(limit: number, message: string) {
  return rateLimit({
    windowMs: 60_000,
    limit: testMode ? 10_000 : limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
  });
}

export const globalLimiter = limiter(120, 'Too many requests. Please wait and try again.');
export const searchLimiter = limiter(20, 'Too many location searches. Please wait and try again.');
export const analysisLimiter = limiter(8, 'Too many analysis requests. Please wait and try again.');
export const reportLimiter = limiter(8, 'Too many report requests. Please wait and try again.');
