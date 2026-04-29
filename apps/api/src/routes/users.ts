import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export async function userRoutes(app: FastifyInstance) {
  const prisma = (app as any).prisma as PrismaClient;

  // Update user profile
  app.put<{ Params: { id: string } }>('/:id', async (request) => {
    const { name, firstName, lastName, phone, avatar, photoUrl } = request.body as any;
    const user = await prisma.user.update({
      where: { id: parseInt(request.params.id) },
      data: {
        ...(name !== undefined && { name }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
        ...(photoUrl !== undefined && { photoUrl }),
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
    const totalMasters = await prisma.user.count({ where: { isMaster: true } });
    const totalClients = await prisma.user.count({ where: { isClient: true } });
    const totalServices = await prisma.service.count();
    const totalLeads = await prisma.lead.count();
    const totalQuickServices = await prisma.quickService.count();
    const totalBanners = await prisma.banner.count();

    return {
      totalUsers,
      totalMasters,
      totalClients,
      totalServices,
      totalLeads,
      totalQuickServices,
      totalBanners,
    };
  });

  // Delete user (admin)
  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const id = parseInt(request.params.id);
    try {
      // Cascade-style cleanup: remove dependent records first
      await prisma.favorite.deleteMany({ where: { userId: id } });
      await prisma.lead.deleteMany({ where: { clientId: id } });
      const services = await prisma.service.findMany({ where: { ownerId: id }, select: { id: true } });
      const sids = services.map((s) => s.id);
      if (sids.length) {
        await prisma.favorite.deleteMany({ where: { serviceId: { in: sids } } });
        await prisma.lead.deleteMany({ where: { serviceId: { in: sids } } });
        await prisma.service.deleteMany({ where: { id: { in: sids } } });
      }
      await prisma.user.delete({ where: { id } });
      return { ok: true };
    } catch (err: any) {
      return reply.status(400).send({ error: err?.message || 'Delete failed' });
    }
  });
}
