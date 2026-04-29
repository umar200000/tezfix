import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: "Dvigatel ta'miri", icon: '🔧', slug: 'engine-repair' },
  { name: 'Moy almashtirish', icon: '🛢️', slug: 'oil-change' },
  { name: 'Shinalar', icon: '🔘', slug: 'tires' },
  { name: 'Tormoz tizimi', icon: '🛑', slug: 'brakes' },
  { name: 'Elektrika', icon: '⚡', slug: 'electrical' },
  { name: "Kuzov ta'miri", icon: '🚗', slug: 'body-repair' },
  { name: 'Diagnostika', icon: '🔍', slug: 'diagnostics' },
  { name: 'Konditsioner', icon: '❄️', slug: 'ac-repair' },
  { name: 'Benzin yetkazish', icon: '⛽', slug: 'fuel-delivery' },
  { name: 'Evakuator', icon: '🚛', slug: 'tow-truck' },
  { name: 'GAI chaqirish', icon: '👮', slug: 'traffic-police' },
  { name: 'Usta chaqirish', icon: '🧑‍🔧', slug: 'call-mechanic' },
  { name: 'Avtomoyka', icon: '🧼', slug: 'car-wash' },
  { name: "Bo'yoq ishlari", icon: '🎨', slug: 'painting' },
  { name: 'Uzatmalar qutisi', icon: '⚙️', slug: 'transmission' },
];

async function main() {
  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon },
      create: cat,
    });
  }
  console.log(`Seed completed: ${categories.length} categories ensured.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
