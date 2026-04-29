import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { verifyInitData, verifyContactPayload, devTelegramId } from '../lib/telegram.js';

function buildName(first?: string | null, last?: string | null): string {
  const parts = [first, last].filter(Boolean) as string[];
  return parts.join(' ').trim() || 'Foydalanuvchi';
}

export async function authRoutes(app: FastifyInstance) {
  const prisma = (app as any).prisma as PrismaClient;

  /**
   * POST /api/auth/telegram
   * Body: { initData?: string, role?: "master"|"client", devUser?: { id, first_name, last_name, username, photo_url } }
   *
   * - If initData is present and valid, parse the Telegram user from it.
   * - Otherwise, in non-production mode, fall back to devUser object (for browser dev).
   * - Creates user if telegramId is new, otherwise returns existing user.
   * - If role is provided, sets isMaster/isClient flag (does not unset the other one — dual role allowed).
   */
  app.post<{
    Body: {
      initData?: string;
      role?: 'master' | 'client';
      devUser?: {
        id: number | string;
        first_name?: string;
        last_name?: string;
        username?: string;
        photo_url?: string;
      };
    };
  }>('/telegram', async (request, reply) => {
    const { initData, role, devUser } = request.body || {};

    let tgUser: {
      id: number | string;
      first_name?: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    } | null = null;

    if (initData) {
      const verified = verifyInitData(initData);
      if (verified) tgUser = verified;
    }

    if (!tgUser && process.env.NODE_ENV !== 'production' && devUser?.id) {
      tgUser = {
        id: typeof devUser.id === 'string' ? devUser.id : Number(devUser.id),
        first_name: devUser.first_name,
        last_name: devUser.last_name,
        username: devUser.username,
        photo_url: devUser.photo_url,
      };
    }

    if (!tgUser) {
      return reply.status(401).send({ error: 'Telegram auth failed: invalid or missing initData' });
    }

    const telegramId = String(tgUser.id);
    const name = buildName(tgUser.first_name, tgUser.last_name);

    let user = await prisma.user.findUnique({ where: { telegramId } });

    const roleData =
      role === 'master'
        ? { isMaster: true }
        : role === 'client'
        ? { isClient: true }
        : {};

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          firstName: tgUser.first_name ?? null,
          lastName: tgUser.last_name ?? null,
          name,
          username: tgUser.username ?? null,
          photoUrl: tgUser.photo_url ?? null,
          avatar: tgUser.photo_url ?? null,
          role: role ?? null,
          ...roleData,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { telegramId },
        data: {
          firstName: tgUser.first_name ?? user.firstName,
          lastName: tgUser.last_name ?? user.lastName,
          name: name || user.name,
          username: tgUser.username ?? user.username,
          photoUrl: tgUser.photo_url ?? user.photoUrl,
          avatar: tgUser.photo_url ?? user.avatar,
          ...roleData,
          // keep legacy role updated to last selected
          ...(role ? { role } : {}),
        },
      });
    }

    return { user };
  });

  /**
   * POST /api/auth/share-contact
   * Body: { userId: number, contactPayload?: string, devPhone?: string, devFirstName?: string, devLastName?: string }
   *
   * Stores the user's phone number after they share via Telegram WebApp.requestContact() popup.
   */
  app.post<{
    Body: {
      userId: number;
      contactPayload?: string;
      devPhone?: string;
      devFirstName?: string;
      devLastName?: string;
    };
  }>('/share-contact', async (request, reply) => {
    const { userId, contactPayload, devPhone, devFirstName, devLastName } = request.body || ({} as any);
    if (!userId) return reply.status(400).send({ error: 'userId required' });

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) return reply.status(404).send({ error: 'User not found' });

    let phone: string | null = null;
    let first: string | null = null;
    let last: string | null = null;

    if (contactPayload) {
      const verified = verifyContactPayload(contactPayload);
      if (verified) {
        phone = verified.phone_number?.startsWith('+') ? verified.phone_number : '+' + (verified.phone_number ?? '');
        first = verified.first_name ?? null;
        last = verified.last_name ?? null;
      }
    }

    if (!phone && process.env.NODE_ENV !== 'production' && devPhone) {
      phone = devPhone.startsWith('+') ? devPhone : '+' + devPhone;
      first = devFirstName ?? null;
      last = devLastName ?? null;
    }

    if (!phone) {
      return reply.status(400).send({ error: 'No valid contact payload provided' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        phone,
        firstName: first ?? existing.firstName,
        lastName: last ?? existing.lastName,
        name: buildName(first ?? existing.firstName, last ?? existing.lastName) || existing.name,
      },
    });

    return { user: updated };
  });

  /**
   * POST /api/auth/set-role
   * Body: { userId, role: "master"|"client" }
   * Adds the requested role to the user without removing existing roles (dual-role).
   */
  app.post<{ Body: { userId: number; role: 'master' | 'client' } }>(
    '/set-role',
    async (request, reply) => {
      const { userId, role } = request.body || ({} as any);
      if (!userId || !['master', 'client'].includes(role)) {
        return reply.status(400).send({ error: 'userId and role required' });
      }
      const data = role === 'master' ? { isMaster: true, role } : { isClient: true, role };
      const user = await prisma.user.update({ where: { id: userId }, data });
      return { user };
    }
  );

  /**
   * GET /api/auth/user/:id — fetch user by id
   */
  app.get<{ Params: { id: string } }>('/user/:id', async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(request.params.id) },
    });
    if (!user) return reply.status(404).send({ error: 'User not found' });
    return { user };
  });

  /**
   * GET /api/auth/by-telegram/:telegramId — fetch user by telegramId (for re-login)
   */
  app.get<{ Params: { telegramId: string } }>('/by-telegram/:telegramId', async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { telegramId: request.params.telegramId },
    });
    if (!user) return reply.status(404).send({ error: 'User not found' });
    return { user };
  });
}

export { devTelegramId };
