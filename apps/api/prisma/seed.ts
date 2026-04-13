import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Dvigatel ta\'miri', icon: '🔧', slug: 'engine-repair' },
  { name: 'Moy almashtirish', icon: '🛢️', slug: 'oil-change' },
  { name: 'Shinalar', icon: '🔘', slug: 'tires' },
  { name: 'Tormoz tizimi', icon: '🛑', slug: 'brakes' },
  { name: 'Elektrika', icon: '⚡', slug: 'electrical' },
  { name: 'Kuzov ta\'miri', icon: '🚗', slug: 'body-repair' },
  { name: 'Diagnostika', icon: '🔍', slug: 'diagnostics' },
  { name: 'Konditsioner', icon: '❄️', slug: 'ac-repair' },
  { name: 'Benzin yetkazish', icon: '⛽', slug: 'fuel-delivery' },
  { name: 'Evakuator', icon: '🚛', slug: 'tow-truck' },
  { name: 'GAI chaqirish', icon: '👮', slug: 'traffic-police' },
  { name: 'Usta chaqirish', icon: '🧑‍🔧', slug: 'call-mechanic' },
  { name: 'Avtomoyka', icon: '🧼', slug: 'car-wash' },
  { name: 'Bo\'yoq ishlari', icon: '🎨', slug: 'painting' },
  { name: 'Uzatmalar qutisi', icon: '⚙️', slug: 'transmission' },
];

const uzbekNames = ['Aziz', 'Jasur', 'Dilshod', 'Sardor', 'Bobur', 'Sherzod', 'Otabek', 'Nodir', 'Farrux', 'Jamshid'];
const lastNames = ['Karimov', 'Toshmatov', 'Rahimov', 'Sobirov', 'Nazarov', 'Ergashev', 'Mirzayev', 'Xolmatov'];

function randomPhone() {
  const codes = ['90', '91', '93', '94', '95', '97', '98', '99'];
  const code = codes[Math.floor(Math.random() * codes.length)];
  const num = Math.floor(1000000 + Math.random() * 9000000);
  return `+998${code}${num}`;
}

async function main() {
  // Seed categories
  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Create sample masters with services
  const sampleServices = [
    {
      masterName: 'Sardor Karimov',
      username: '@sardor_auto',
      serviceName: 'Sardor Auto Service',
      description: 'Professional avtomobil ta\'miri. 10 yillik tajriba.',
      location: 'Toshkent, Chilonzor tumani',
      latitude: 41.2855,
      longitude: 69.2048,
      servicesList: ['engine-repair', 'oil-change', 'brakes', 'diagnostics'],
      bio: '10 yillik tajribaga ega professional avtousta. Barcha turdagi avtomobillar bilan ishlaymiz.',
    },
    {
      masterName: 'Bobur Toshmatov',
      username: '@bobur_service',
      serviceName: 'Bobur Elektrika Xizmati',
      description: 'Avtomobil elektrika tizimlarini ta\'mirlash.',
      location: 'Toshkent, Yunusobod tumani',
      latitude: 41.3425,
      longitude: 69.2843,
      servicesList: ['electrical', 'diagnostics', 'ac-repair'],
      bio: 'Avtomobil elektrikasi bo\'yicha mutaxassis. Zamonaviy asbob-uskunalar bilan ishlaymiz.',
    },
    {
      masterName: 'Otabek Rahimov',
      username: '@otabek_kuzov',
      serviceName: 'Otabek Kuzov Centre',
      description: 'Kuzov ta\'miri va bo\'yoq ishlari.',
      location: 'Toshkent, Mirzo Ulug\'bek tumani',
      latitude: 41.3101,
      longitude: 69.3322,
      servicesList: ['body-repair', 'painting'],
      bio: 'Kuzov ta\'miri va bo\'yoq ishlari bo\'yicha malakali mutaxassislar jamoasi.',
    },
    {
      masterName: 'Jamshid Nazarov',
      username: '@jamshid_moy',
      serviceName: 'Fast Oil Change',
      description: 'Tez va sifatli moy almashtirish xizmati.',
      location: 'Toshkent, Sergeli tumani',
      latitude: 41.2263,
      longitude: 69.2241,
      servicesList: ['oil-change', 'diagnostics', 'tires'],
      bio: 'Moy almashtirish 30 daqiqada. Barcha brendlar mavjud.',
    },
    {
      masterName: 'Nodir Ergashev',
      username: '@nodir_shina',
      serviceName: 'Nodir Shina Markazi',
      description: 'Shinalar sotish va o\'rnatish.',
      location: 'Toshkent, Yakkasaroy tumani',
      latitude: 41.2916,
      longitude: 69.2694,
      servicesList: ['tires', 'brakes'],
      bio: 'Eng katta shina tanlovi. O\'rnatish va balans bepul.',
    },
  ];

  for (const s of sampleServices) {
    const master = await prisma.user.create({
      data: {
        role: 'master',
        name: s.masterName,
        phone: randomPhone(),
        username: s.username,
        avatar: null,
      },
    });

    await prisma.service.create({
      data: {
        ownerId: master.id,
        name: s.serviceName,
        description: s.description,
        location: s.location,
        latitude: s.latitude,
        longitude: s.longitude,
        servicesList: JSON.stringify(s.servicesList),
        bio: s.bio,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        images: JSON.stringify([]),
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
