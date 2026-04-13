import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { api } from '../../utils/api';
import { ChevronRight, MapPin, Star, Bell, Wrench, Zap, Clock } from 'lucide-react';
import { getCategoryIcon, ServiceHeroIcon } from '../../utils/categoryIcons';

interface ServiceCategory {
  id: number;
  name: string;
  icon: string;
  slug: string;
}

interface Service {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  images: string;
  servicesList: string;
  rating: number;
  owner: { name: string; avatar: string | null };
}

const banners = [
  {
    id: 1,
    eyebrow: 'YANGI FOYDALANUVCHI',
    title: 'Birinchi diagnostika',
    accent: 'BEPUL',
    desc: 'Avtomobilingizni tekshirib bering',
    pillText: 'Yangi',
  },
  {
    id: 2,
    eyebrow: 'CHEGIRMA',
    title: '20% arzonroq',
    accent: 'moy almashtirish',
    desc: 'Cheklangan vaqt davomida',
    pillText: 'Aksiya',
  },
  {
    id: 3,
    eyebrow: 'SHOSHILINCH YORDAM',
    title: 'Evakuator 24/7',
    accent: "Toshkent bo'ylab",
    desc: 'Tez va ishonchli yetkazish',
    pillText: '24/7',
  },
];

export default function ClientHome() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    api.get<ServiceCategory[]>('/categories').then(setCategories);
    api.get<Service[]>('/services').then(setServices);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="page-container">
      {/* Large Title Header */}
      <div className="px-4 pt-12 pb-3">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-ios-subhead text-surface-600">Assalomu alaykum</p>
            <h1 className="ios-large-title mt-0.5">{user?.name?.split(' ')[0]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-white shadow-ios-card flex items-center justify-center active:scale-95 transition-transform">
              <Bell className="w-5 h-5 text-primary-700" strokeWidth={2} />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center shadow-ios-card">
              <span className="text-white font-semibold text-ios-subhead">
                {user?.name?.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Banner carousel — brand card style */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-ios-lg shadow-ios-card">
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(-${bannerIdx * 100}%)` }}
            >
              {banners.map((b) => (
                <div
                  key={b.id}
                  className="min-w-full bg-primary-500 p-5 flex items-center justify-between gap-3 relative"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-primary-200 text-[11px] font-semibold tracking-[0.1em] uppercase">
                      {b.eyebrow}
                    </p>
                    <h3 className="text-white font-bold text-[22px] leading-tight mt-1.5">
                      {b.title}
                    </h3>
                    <p className="text-white/85 text-ios-subhead mt-0.5">{b.desc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="bg-primary-700 text-white rounded-full px-3 py-1.5 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" strokeWidth={2.5} fill="currentColor" />
                      <span className="text-[11px] font-semibold">{b.pillText}</span>
                    </div>
                    <div className="bg-primary-700/70 text-white/90 rounded-full px-3 py-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" strokeWidth={2.2} />
                      <span className="text-[11px] font-medium">{b.accent}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-3">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === bannerIdx ? 'w-6 bg-primary-500' : 'w-1.5 bg-surface-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Services */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-ios-title-3 text-surface-900">Tez xizmatlar</h2>
            <Link
              to="/categories"
              className="text-ios-subhead text-primary-500 font-medium flex items-center"
            >
              Barchasi
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
            {categories.slice(0, 8).map((cat) => {
              const { Icon } = getCategoryIcon(cat.slug);
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/search?category=${cat.slug}`)}
                  className="flex flex-col items-center gap-2 min-w-[76px] active:scale-95 transition-transform"
                >
                  <div className="w-[60px] h-[60px] rounded-ios-lg bg-white shadow-ios-card flex items-center justify-center">
                    <Icon className="w-[26px] h-[26px] text-primary-500" strokeWidth={1.8} />
                  </div>
                  <span className="text-ios-caption text-surface-700 text-center leading-tight font-medium line-clamp-2 w-[76px]">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Services list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-ios-title-3 text-surface-900">Ustaxonalar</h2>
            <span className="text-ios-footnote text-surface-600">{services.length} ta</span>
          </div>

          {services.length === 0 ? (
            <div className="bg-white rounded-ios-lg p-8 text-center shadow-ios-card">
              <div className="w-14 h-14 rounded-ios-lg bg-primary-50 flex items-center justify-center mx-auto mb-3">
                <Wrench className="w-6 h-6 text-primary-500" />
              </div>
              <p className="text-ios-subhead text-surface-600">Hali ustaxonalar yo'q</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {services.map((service) => (
                <Link
                  key={service.id}
                  to={`/service/${service.id}`}
                  className="bg-white rounded-ios-lg p-3.5 flex gap-3 shadow-ios-card active:scale-[0.98] transition-all"
                >
                  <div className="w-[60px] h-[60px] rounded-ios-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
                    <ServiceHeroIcon className="w-7 h-7 text-white" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="text-ios-headline text-surface-900 truncate">
                      {service.name}
                    </h3>
                    {service.location && (
                      <p className="text-ios-footnote text-surface-600 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={2.2} />
                        <span className="truncate">{service.location}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1 bg-mint-100 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 text-mint-600 fill-mint-600" />
                        <span className="text-[11px] font-semibold text-mint-700">
                          {service.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-ios-caption text-surface-500 truncate">
                        {service.owner.name}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-surface-400 self-center flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
