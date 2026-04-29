import { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file
const MAX_FILES = 10;

export async function uploadRoutes(app: FastifyInstance) {
  await app.register(multipart, {
    limits: {
      fileSize: MAX_FILE_BYTES,
      files: MAX_FILES,
    },
  });

  const uploadDir = join(process.cwd(), 'uploads');
  await mkdir(uploadDir, { recursive: true });

  // Single image upload — kept for backwards compat
  app.post('/image', async (request, reply) => {
    const file = await request.file();
    if (!file) return reply.status(400).send({ error: 'No file provided' });

    const ext = (file.filename.split('.').pop() || 'jpg').toLowerCase();
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(uploadDir, filename);

    const buffer = await file.toBuffer();
    await writeFile(filepath, buffer);

    return { url: `/uploads/${filename}`, filename };
  });

  // Multiple images — up to 10 in one request
  app.post('/images', async (request, reply) => {
    const files: { url: string; filename: string }[] = [];
    try {
      for await (const part of request.files()) {
        if (files.length >= MAX_FILES) break;
        const ext = (part.filename.split('.').pop() || 'jpg').toLowerCase();
        const filename = `${randomUUID()}.${ext}`;
        const filepath = join(uploadDir, filename);
        const buffer = await part.toBuffer();
        await writeFile(filepath, buffer);
        files.push({ url: `/uploads/${filename}`, filename });
      }
    } catch (err: any) {
      return reply.status(400).send({ error: err?.message || 'Upload failed' });
    }
    if (files.length === 0) return reply.status(400).send({ error: 'No files provided' });
    return { files };
  });
}
