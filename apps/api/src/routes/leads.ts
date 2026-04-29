import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { sendTelegramMessage } from '../lib/telegram.js';

export async function leadRoutes(app: FastifyInstance) {
  const prisma = (app as any).prisma as PrismaClient;

  // Create lead (when a client expresses interest in a service)
  app.post('/create', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const { serviceId, clientId } = request.body as { serviceId: number; clientId: number };

      if (!serviceId || !clientId) {
        return reply.status(400).send({ error: 'serviceId and clientId required' });
      }

      // Avoid creating duplicate leads from the same client to the same service in a short window
      const recent = await prisma.lead.findFirst({
        where: {
          serviceId: parseInt(String(serviceId)),
          clientId: parseInt(String(clientId)),
          createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60) }, // 1 hour
        },
      });
      if (recent) return recent;

      const lead = await prisma.lead.create({
        data: {
          serviceId: parseInt(String(serviceId)),
          clientId: parseInt(String(clientId)),
        },
        include: {
          client: { select: { id: true, name: true, phone: true, username: true, photoUrl: true } },
          service: {
            select: {
              id: true,
              name: true,
              owner: { select: { id: true, telegramId: true, name: true } },
            },
          },
        },
      });

      // Fire-and-forget: notify the master via Telegram bot
      const masterTgId = lead.service?.owner?.telegramId;
      if (masterTgId && !masterTgId.startsWith('dev_')) {
        const clientName = lead.client.name;
        const clientPhone = lead.client.phone || "ko'rsatilmagan";
        const clientUser = lead.client.username ? `@${lead.client.username.replace(/^@/, '')}` : '';
        const serviceName = lead.service.name;
        const text =
          `<b>🔔 Yangi so'rov!</b>\n\n` +
          `<b>Xizmat:</b> ${serviceName}\n` +
          `<b>Mijoz:</b> ${clientName}\n` +
          (clientUser ? `<b>Telegram:</b> ${clientUser}\n` : '') +
          `<b>Telefon:</b> ${clientPhone}\n\n` +
          `Mijoz bilan bog'laning va xizmat ko'rsating.`;
        sendTelegramMessage(masterTgId, text).catch((err) =>
          app.log.warn({ err }, 'telegram notify failed')
        );
      }

      return lead;
    },
  });

  // Get leads for a service (master view)
  app.get<{ Params: { serviceId: string } }>('/service/:serviceId', async (request) => {
    return prisma.lead.findMany({
      where: { serviceId: parseInt(request.params.serviceId) },
      include: {
        client: {
          select: { id: true, name: true, phone: true, username: true, photoUrl: true, avatar: true },
        },
      },
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
        client: {
          select: { id: true, name: true, phone: true, username: true, photoUrl: true, avatar: true },
        },
        service: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  // Update lead status (kept for backwards compat — UI no longer uses it)
  app.patch<{ Params: { id: string } }>('/:id/status', async (request) => {
    const { status } = request.body as { status: string };
    return prisma.lead.update({
      where: { id: parseInt(request.params.id) },
      data: { status },
    });
  });

  // Admin: list all leads
  app.get('/all', async () => {
    return prisma.lead.findMany({
      include: {
        client: {
          select: { id: true, name: true, phone: true, username: true, photoUrl: true },
        },
        service: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });
}
