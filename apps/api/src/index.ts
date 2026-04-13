import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './routes/auth.js';
import { serviceRoutes } from './routes/services.js';
import { leadRoutes } from './routes/leads.js';
import { favoriteRoutes } from './routes/favorites.js';
import { categoryRoutes } from './routes/categories.js';
import { userRoutes } from './routes/users.js';
import { uploadRoutes } from './routes/upload.js';

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

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

// Health check
app.get('/api/health', async () => ({ status: 'ok' }));

try {
  await app.listen({ port: 3000, host: '0.0.0.0' });
  console.log('Server running on http://localhost:3000');
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
