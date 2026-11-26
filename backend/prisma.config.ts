import { existsSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

// With a prisma.config.ts, Prisma no longer loads .env by itself: load the
// single project-root .env here (real environment variables take precedence).
const rootEnv = path.resolve(import.meta.dirname, '..', '.env');
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

export default defineConfig({
  // All database files live in /database. DATABASE_URL is resolved relative
  // to the schema file, so "file:../dev.db" → database/dev.db.
  schema: path.resolve(import.meta.dirname, '../database/prisma/schema.prisma'),
  migrations: {
    path: path.resolve(import.meta.dirname, '../database/prisma/migrations'),
    seed: 'tsx ../database/prisma/seed.ts',
  },
});
