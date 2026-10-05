import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 reads the datasource URL from this file, not schema.prisma.
 * DIRECT_URL is preferred for migrations when it differs from the runtime URL.
 */
function resolveDatabaseUrl(): string {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('Set DATABASE_URL or DIRECT_URL before running Prisma CLI commands.');
  }
  return url;
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: resolveDatabaseUrl(),
  },
});
