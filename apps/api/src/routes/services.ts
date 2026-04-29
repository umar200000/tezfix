import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export async function serviceRoutes(app: FastifyInstance) {
  const prisma = (app as any).prisma as PrismaClient;

  // Get all active services
  app.get('/', async (request) => {
    const { search, category } = request.query as { search?: string; category?: string };

    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, phone: true, username: true, avatar: true, photoUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (category) {
      return services.filter((s) => {
        const list = JSON.parse(s.servicesList) as string[];
        return list.includes(category);
      });
    }

    return services;
  });

  // Get service by id
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(request.params.id) },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
            username: true,
            avatar: true,
            photoUrl: true,
            telegramId: true,
          },
        },
      },
    });
    if (!service) return reply.status(404).send({ error: 'Service not found' });
    return service;
  });

  // Get services by owner
  app.get<{ Params: { ownerId: string } }>('/owner/:ownerId', async (request) => {
    return prisma.service.findMany({
      where: { ownerId: parseInt(request.params.ownerId) },
      orderBy: { createdAt: 'desc' },
    });
  });

  // Create service
  app.post('/create', async (request, reply) => {
    const body = request.body as any;
    const { ownerId, name, description, location, latitude, longitude, images, servicesList, bio } = body;

    if (!ownerId || !name) {
      return reply.status(400).send({ error: 'ownerId and name required' });
    }

    let normalizedServices = '[]';
    if (servicesList) {
      try {
        const parsed = typeof servicesList === 'string' ? JSON.parse(servicesList) : servicesList;
        normalizedServices = JSON.stringify(Array.isArray(parsed) ? parsed : []);
      } catch {
        normalizedServices = '[]';
      }
    }

    let normalizedImages = '[]';
    if (images) {
      try {
        const parsed = typeof images === 'string' ? JSON.parse(images) : images;
        normalizedImages = JSON.stringify(Array.isArray(parsed) ? parsed.slice(0, 10) : []);
      } catch {
        normalizedImages = '[]';
      }
    }

    const service = await prisma.service.create({
      data: {
        ownerId: parseInt(ownerId),
        name,
        description: description || null,
        location: location || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        images: normalizedImages,
        servicesList: normalizedServices,
        bio: bio || null,
      },
    });

    // Mark owner as master automatically
    await prisma.user.update({
      where: { id: parseInt(ownerId) },
      data: { isMaster: true },
    });

    return service;
  });

  // Update service
  app.put<{ Params: { id: string } }>('/:id', async (request) => {
    const body = request.body as any;
    return prisma.service.update({
      where: { id: parseInt(request.params.id) },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.latitude !== undefined && { latitude: parseFloat(body.latitude) }),
        ...(body.longitude !== undefined && { longitude: parseFloat(body.longitude) }),
        ...(body.images !== undefined && { images: body.images }),
        ...(body.servicesList !== undefined && { servicesList: body.servicesList }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.isActive !== undefined && { isActive: !!body.isActive }),
      },
    });
  });

  // Delete service
  app.delete<{ Params: { id: string } }>('/:id', async (request) => {
    const id = parseInt(request.params.id);
    await prisma.favorite.deleteMany({ where: { serviceId: id } });
    await prisma.lead.deleteMany({ where: { serviceId: id } });
    await prisma.service.delete({ where: { id } });
    return { ok: true };
  });
}
