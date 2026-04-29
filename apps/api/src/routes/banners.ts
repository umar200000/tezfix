import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

function requireAdmin(request: FastifyRequest, reply: FastifyReply): boolean {
  if (!ADMIN_TOKEN) return true; // dev: no token configured, allow
  const header = request.headers['x-admin-token'];
  if (header !== ADMIN_TOKEN) {
    reply.status(401).send({ error: 'Admin token required' });
    return false;
  }
  return true;
}

export async function bannerRoutes(app: FastifyInstance) {
  const prisma = (app as any).prisma as PrismaClient;

  // Public — list active banners
  app.get('/', async () => {
    return prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  });

  // Admin — list all banners
  app.get('/all', async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    return prisma.banner.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  });

  app.post<{
    Body: { title: string; subtitle?: string; image: string; link?: string; isActive?: boolean; order?: number };
  }>('/', async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { title, subtitle, image, link, isActive, order } = request.body || ({} as any);
    if (!title || !image) return reply.status(400).send({ error: 'title and image required' });
    return prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        link: link || null,
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    });
  });

  app.put<{
    Params: { id: string };
    Body: Partial<{ title: string; subtitle: string; image: string; link: string; isActive: boolean; order: number }>;
  }>('/:id', async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const id = parseInt(request.params.id);
    return prisma.banner.update({ where: { id }, data: request.body });
  });

  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const id = parseInt(request.params.id);
    await prisma.banner.delete({ where: { id } });
    return { ok: true };
  });
}
