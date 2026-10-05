import { createApp } from './app';
import { env } from './config/env';
import { disconnectDatabase } from './services/db';
import { logger } from './utils/logger';

const app = createApp();
const server = app.listen(env.PORT, env.HOST, () => {
  logger.info('API listening', { host: env.HOST, port: env.PORT });
});

async function shutdown(signal: string): Promise<void> {
  logger.info('Shutting down', { signal });
  server.close();
  try {
    await disconnectDatabase();
  } catch {
    // Shutdown should not fail if the pool is already closed.
  }
  process.exit(0);
}

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
