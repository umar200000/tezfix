import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const uzbekNames = ['Aziz', 'Jasur', 'Dilshod', 'Sardor', 'Bobur', 'Sherzod', 'Otabek', 'Nodir', 'Farrux', 'Jamshid', 'Bekzod', 'Ulugbek', 'Dostonbek', 'Asilbek'];
const lastNames = ['Karimov', 'Toshmatov', 'Rahimov', 'Sobirov', 'Nazarov', 'Ergashev', 'Mirzayev', 'Xolmatov', 'Abdullayev', 'Ismoilov'];

function randomPhone(): string {
  const codes = ['90', '91', '93', '94', '95', '97', '98', '99'];
  const code = codes[Math.floor(Math.random() * codes.length)];
  const num = Math.floor(1000000 + Math.random() * 9000000);
  return `+998${code}${num}`;
}

function randomName(): string {
  const first = uzbekNames[Math.floor(Math.random() * uzbekNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

function randomUsername(name: string): string {
  const clean = name.toLowerCase().split(' ')[0];
  const num = Math.floor(100 + Math.random() * 9900);
  return `@${clean}${num}`;
}

export async function authRoutes(app: FastifyInstance) {
  const prisma = (app as any).prisma as PrismaClient;

  // Mock contact share — creates a random user
  app.post<{ Body: { role: string } }>('/mock-contact', async (request, reply) => {
    const { role } = request.body;
    if (!role || !['master', 'client'].includes(role)) {
      return reply.status(400).send({ error: 'Role must be "master" or "client"' });
    }

    const name = randomName();
    const phone = randomPhone();
    const username = randomUsername(name);

    const user = await prisma.user.create({
      data: { role, name, phone, username },
    });

    return { user };
  });

  // Get user by id
  app.get<{ Params: { id: string } }>('/user/:id', async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(request.params.id) },
    });
    if (!user) return reply.status(404).send({ error: 'User not found' });
    return { user };
  });
}
