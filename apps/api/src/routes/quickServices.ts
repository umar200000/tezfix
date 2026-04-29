import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

function requireAdmin(request: FastifyRequest, reply: FastifyReply): boolean {
  if (!ADMIN_TOKEN) return true;
  const header = request.headers['x-admin-token'];
  if (header !== ADMIN_TOKEN) {
    reply.status(401).send({ error: 'Admin token required' });
    return false;
  }
  return true;
}

export async function quickServiceRoutes(app: FastifyInstance) {
  const prisma = (app as any).prisma as PrismaClient;

  // Public — list active quick services
  app.get('/', async () => {
    return prisma.quickService.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  });

  // Public — single quick service
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const id = parseInt(request.params.id);
    const item = await prisma.quickService.findUnique({ where: { id } });
    if (!item || !item.isActive) return reply.status(404).send({ error: 'Not found' });
    return item;
  });

  // Admin — list all
  app.get('/all', async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    return prisma.quickService.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  });

  app.post<{
    Body: {
      name: string;
      icon?: string;
      masterName: string;
      phone: string;
      address: string;
      description?: string;
      image?: string;
      isActive?: boolean;
      order?: number;
    };
  }>('/', async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { name, icon, masterName, phone, address, description, image, isActive, order } = request.body || ({} as any);
    if (!name || !masterName || !phone || !address) {
      return reply.status(400).send({ error: 'name, masterName, phone, address required' });
    }
    return prisma.quickService.create({
      data: {
        name,
        icon: icon || 'wrench',
        masterName,
        phone,
        address,
        description: description || null,
        image: image || null,
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    });
  });

  app.put<{
    Params: { id: string };
    Body: Partial<{
      name: string;
      icon: string;
      masterName: string;
      phone: string;
      address: string;
      description: string;
      image: string;
      isActive: boolean;
      order: number;
    }>;
  }>('/:id', async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const id = parseInt(request.params.id);
    return prisma.quickService.update({ where: { id }, data: request.body });
  });

  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const id = parseInt(request.params.id);
    await prisma.quickService.delete({ where: { id } });
    return { ok: true };
  });
}
