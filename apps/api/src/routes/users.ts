import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export async function userRoutes(app: FastifyInstance) {
  const prisma = (app as any).prisma as PrismaClient;

  // Update user profile
  app.put<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { name, phone, avatar } = request.body as any;
    const user = await prisma.user.update({
      where: { id: parseInt(request.params.id) },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatar !== undefined && { avatar }),
      },
    });
    return user;
  });

  // Get all users (admin)
  app.get('/', async () => {
    return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  });

  // Stats (admin)
  app.get('/stats', async () => {
    const totalUsers = await prisma.user.count();
    const totalMasters = await prisma.user.count({ where: { role: 'master' } });
    const totalClients = await prisma.user.count({ where: { role: 'client' } });
    const totalServices = await prisma.service.count();
    const totalLeads = await prisma.lead.count();

    return { totalUsers, totalMasters, totalClients, totalServices, totalLeads };
  });
}
