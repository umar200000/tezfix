import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export async function leadRoutes(app: FastifyInstance) {
  const prisma = (app as any).prisma as PrismaClient;

  // Create lead (when client calls)
  app.post('/create', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const { serviceId, clientId } = request.body as { serviceId: number; clientId: number };

      if (!serviceId || !clientId) {
        return reply.status(400).send({ error: 'serviceId and clientId required' });
      }

      const lead = await prisma.lead.create({
        data: {
          serviceId: parseInt(String(serviceId)),
          clientId: parseInt(String(clientId)),
        },
      });

      return lead;
    },
  });

  // Get leads for a service (master view)
  app.get<{ Params: { serviceId: string } }>('/service/:serviceId', async (request) => {
    return prisma.lead.findMany({
      where: { serviceId: parseInt(request.params.serviceId) },
      include: { client: { select: { id: true, name: true, phone: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
  });

  // Get leads by master (all services)
  app.get<{ Params: { masterId: string } }>('/master/:masterId', async (request) => {
    const services = await prisma.service.findMany({
      where: { ownerId: parseInt(request.params.masterId) },
      select: { id: true },
    });

    const serviceIds = services.map((s) => s.id);

    return prisma.lead.findMany({
      where: { serviceId: { in: serviceIds } },
      include: {
        client: { select: { id: true, name: true, phone: true, avatar: true } },
        service: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  // Update lead status
  app.patch<{ Params: { id: string } }>('/:id/status', async (request) => {
    const { status } = request.body as { status: string };
    return prisma.lead.update({
      where: { id: parseInt(request.params.id) },
      data: { status },
    });
  });
}
