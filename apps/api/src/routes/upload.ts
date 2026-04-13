import { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function uploadRoutes(app: FastifyInstance) {
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

  const uploadDir = join(process.cwd(), 'uploads');
  await mkdir(uploadDir, { recursive: true });

  app.post('/image', async (request, reply) => {
    const file = await request.file();
    if (!file) return reply.status(400).send({ error: 'No file provided' });

    const ext = file.filename.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(uploadDir, filename);

    const buffer = await file.toBuffer();
    await writeFile(filepath, buffer);

    return { url: `/uploads/${filename}`, filename };
  });
}
