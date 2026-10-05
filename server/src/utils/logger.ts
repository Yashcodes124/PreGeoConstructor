import { env } from '../config/env';

type Level = 'info' | 'warn' | 'error';

function write(level: Level, message: string, meta?: Record<string, unknown>): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
  });
  if (level === 'error') {
    console.error(line);
    return;
  }
  if (level === 'warn') {
    console.warn(line);
    return;
  }
  if (env.NODE_ENV !== 'test') {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write('error', message, meta),
};
