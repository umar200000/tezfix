import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export async function favoriteRoutes(app: FastifyInstance) {
  const prisma = (app as any).prisma as PrismaClient;

  // Toggle favorite
  app.post('/toggle', async (request) => {
    const { userId, serviceId } = request.body as { userId: number; serviceId: number };

    const existing = await prisma.favorite.findUnique({
      where: { userId_serviceId: { userId, serviceId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await prisma.favorite.create({ data: { userId, serviceId } });
    return { favorited: true };
  });

  // Get user favorites
  app.get<{ Params: { userId: string } }>('/user/:userId', async (request) => {
    const favorites = await prisma.favorite.findMany({
      where: { userId: parseInt(request.params.userId) },
      include: {
        service: {
          include: { owner: { select: { id: true, name: true, phone: true, avatar: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.service);
  });

  // Check if favorited
  app.get('/check', async (request) => {
    const { userId, serviceId } = request.query as { userId: string; serviceId: string };
    const fav = await prisma.favorite.findUnique({
      where: { userId_serviceId: { userId: parseInt(userId), serviceId: parseInt(serviceId) } },
    });
    return { favorited: !!fav };
  });
}
