import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export async function categoryRoutes(app: FastifyInstance) {
  const prisma = (app as any).prisma as PrismaClient;

  app.get('/', async () => {
    return prisma.serviceCategory.findMany({ orderBy: { id: 'asc' } });
  });
}
