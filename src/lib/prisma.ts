import { PrismaClient } from '@prisma/client';

declare global {
  // Esto evita crear múltiples instancias de Prisma en desarrollo
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // opcional, útil para debug
  });

// Solo asignamos global en desarrollo
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
