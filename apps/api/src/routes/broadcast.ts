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

export async function broadcastRoutes(app: FastifyInstance) {
  const prisma = (app as any).prisma as PrismaClient;

  /**
   * POST /api/broadcast — admin only
   * Body: { message: string, audience?: 'all'|'masters'|'clients' }
   * Sends a one-off bot message to every matching user with a real telegramId.
   */
  app.post<{
    Body: { message: string; audience?: Audience };
  }>('/', async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { message, audience } = request.body || ({} as any);
    if (!message || message.trim().length === 0) {
      return reply.status(400).send({ error: 'message required' });
    }
    const aud: Audience = (audience as Audience) || 'all';

    const where: any = {};
    if (aud === 'masters') where.isMaster = true;
    if (aud === 'clients') where.isClient = true;
    const users = await prisma.user.findMany({
      where,
      select: { telegramId: true },
    });
    const recipients = users.filter((u) => !u.telegramId.startsWith('dev_'));

    let sent = 0;
    let failed = 0;
    const text = escapeHtml(message);
    for (const r of recipients) {
      try {
        const ok = await sendTelegramMessage(r.telegramId, text);
        if (ok) sent++;
        else failed++;
      } catch {
        failed++;
      }
      await new Promise((res) => setTimeout(res, 50));
    }

    return { audience: aud, total: recipients.length, sent, failed };
  });

  /**
   * GET /api/broadcast/audience-counts — admin only
   * Returns reach numbers per audience so the admin UI can show "will be sent to N people".
   */
  app.get('/audience-counts', async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const allUsers = await prisma.user.findMany({
      select: { telegramId: true, isMaster: true, isClient: true },
    });
    const real = allUsers.filter((u) => !u.telegramId.startsWith('dev_'));
    const masters = real.filter((u) => u.isMaster).length;
    const clients = real.filter((u) => u.isClient).length;
    return { all: real.length, masters, clients };
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
