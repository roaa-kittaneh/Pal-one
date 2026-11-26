import { PrismaClient } from '@prisma/client';

/**
 * Single shared Prisma client. Reused across hot reloads in development so
 * `tsx watch` doesn't open a new SQLite connection on every restart.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
