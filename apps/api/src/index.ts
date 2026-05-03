import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import staticPlugin from '@fastify/static';
import { PrismaClient } from '@prisma/client';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { authRoutes } from './routes/auth.js';
import { serviceRoutes } from './routes/services.js';
import { leadRoutes } from './routes/leads.js';
import { favoriteRoutes } from './routes/favorites.js';
import { categoryRoutes } from './routes/categories.js';
import { userRoutes } from './routes/users.js';
import { uploadRoutes } from './routes/upload.js';
import { bannerRoutes } from './routes/banners.js';
import { quickServiceRoutes } from './routes/quickServices.js';
import { notificationRoutes } from './routes/notifications.js';
import { broadcastRoutes } from './routes/broadcast.js';

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

// Ensure uploads dir exists, then serve it as static
const uploadDir = join(process.cwd(), 'uploads');
await mkdir(uploadDir, { recursive: true });
await app.register(staticPlugin, {
  root: uploadDir,
  prefix: '/uploads/',
  decorateReply: false,
});

// Decorate with prisma
app.decorate('prisma', prisma);

// Register routes
await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(serviceRoutes, { prefix: '/api/services' });
await app.register(leadRoutes, { prefix: '/api/leads' });
await app.register(favoriteRoutes, { prefix: '/api/favorites' });
await app.register(categoryRoutes, { prefix: '/api/categories' });
await app.register(userRoutes, { prefix: '/api/users' });
await app.register(uploadRoutes, { prefix: '/api/upload' });
await app.register(bannerRoutes, { prefix: '/api/banners' });
await app.register(quickServiceRoutes, { prefix: '/api/quick-services' });
await app.register(notificationRoutes, { prefix: '/api/notifications' });
await app.register(broadcastRoutes, { prefix: '/api/broadcast' });

// Health check
app.get('/api/health', async () => ({ status: 'ok' }));

try {
  await app.listen({ port: 3000, host: '0.0.0.0' });
  console.log('Server running on http://localhost:3000');
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
