import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Prevent creating multiple PrismaClient instances during Next.js hot-reload in dev
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
