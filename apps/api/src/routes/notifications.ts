import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { sendTelegramMessage } from '../lib/telegram.js';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

function requireAdmin(request: FastifyRequest, reply: FastifyReply): boolean {
  if (!ADMIN_TOKEN) return true;
  if (request.headers['x-admin-token'] !== ADMIN_TOKEN) {
    reply.status(401).send({ error: 'Admin token required' });
    return false;
  }
  return true;
}

type Audience = 'all' | 'masters' | 'clients';

async function findRecipients(prisma: PrismaClient, audience: Audience) {
  const where: any = {};
  if (audience === 'masters') where.isMaster = true;
  if (audience === 'clients') where.isClient = true;
  const all = await prisma.user.findMany({
    where,
    select: { id: true, telegramId: true },
  });
  // telegramId is required by schema, so the only filter we need is to drop dev placeholders.
  return all.filter((u) => !u.telegramId.startsWith('dev_'));
}

export async function notificationRoutes(app: FastifyInstance) {
  const prisma = (app as any).prisma as PrismaClient;

  // Public — list active notifications, audience-aware via ?audience=
  app.get<{ Querystring: { audience?: Audience } }>('/', async (request) => {
    const audience = request.query?.audience;
    const where: any = { isActive: true };
    if (audience && audience !== 'all') {
      // Show notifications targeted at "all" or this specific audience
      where.audience = { in: ['all', audience] };
    }
    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  });

  // Admin — list all
  app.get('/all', async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    return prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
  });

  // Admin — create
  app.post<{
    Body: {
      title: string;
      body: string;
      audience?: Audience;
      isActive?: boolean;
      sendToBot?: boolean;
    };
  }>('/', async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { title, body, audience, isActive, sendToBot } = request.body || ({} as any);
    if (!title || !body) {
      return reply.status(400).send({ error: 'title and body required' });
    }
    const aud: Audience = (audience as Audience) || 'all';
    const item = await prisma.notification.create({
      data: {
        title,
        body,
        audience: aud,
        isActive: isActive ?? true,
        sentToBot: false,
      },
    });

    let delivery: { sent: number; failed: number } | null = null;
    if (sendToBot) {
      const text = `<b>📣 ${escapeHtml(title)}</b>\n\n${escapeHtml(body)}`;
      const recipients = await findRecipients(prisma, aud);
      let sent = 0;
      let failed = 0;
      for (const r of recipients) {
        const ok = await sendTelegramMessage(r.telegramId, text);
        if (ok) sent++;
        else failed++;
        await new Promise((res) => setTimeout(res, 50));
      }
      delivery = { sent, failed };
      await prisma.notification.update({
        where: { id: item.id },
        data: { sentToBot: true },
      });
    }

    return { item, delivery };
  });

  // Admin — update
  app.put<{
    Params: { id: string };
    Body: Partial<{ title: string; body: string; audience: Audience; isActive: boolean }>;
  }>('/:id', async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const id = parseInt(request.params.id);
    return prisma.notification.update({ where: { id }, data: request.body });
  });

  // Admin — delete
  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const id = parseInt(request.params.id);
    await prisma.notification.delete({ where: { id } });
    return { ok: true };
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
