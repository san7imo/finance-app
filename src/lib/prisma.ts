import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Crear cliente Prisma
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    datasources: {
      db: {
        // DATABASE_URL ya debe incluir:
        // ?pgbouncer=true&connection_limit=1&prepared_statements=false
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Instancia única según entorno
export const prisma = (() => {
  if (process.env.NODE_ENV === 'production') {
    // En producción serverless (Vercel), crear nueva instancia para evitar prepared statements inválidos
    return createPrismaClient();
  } else {
    // En desarrollo, reutilizar instancia global para no crear múltiples conexiones
    if (!global.prisma) {
      global.prisma = createPrismaClient();
    }
    return global.prisma;
  }
})();

export default prisma;
