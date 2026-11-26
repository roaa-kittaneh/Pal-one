import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';

async function main() {
  await prisma.$connect();
  const app = createApp(env);
  const server = app.listen(env.PORT, () => {
    console.log(`[server] PAL-ONE API listening on http://localhost:${env.PORT}/api (${env.NODE_ENV})`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[server] ${signal} received, shutting down…`);
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch(async (err) => {
  console.error('[server] Failed to start:', err);
  await prisma.$disconnect();
  process.exit(1);
});
