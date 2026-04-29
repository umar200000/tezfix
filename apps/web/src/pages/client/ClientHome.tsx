import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { api } from '../../utils/api';
import { ChevronRight, MapPin, Star, Bell, Wrench, Heart } from 'lucide-react';
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
  owner: { name: string; avatar: string | null; photoUrl?: string | null };
}

interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
}

interface QuickService {
  id: number;
  name: string;
  icon: string;
  masterName: string;
  phone: string;
  address: string;
}

export default function ClientHome() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [quickServices, setQuickServices] = useState<QuickService[]>([]);
  const [favIds, setFavIds] = useState<Set<number>>(new Set());
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    api.get<ServiceCategory[]>('/categories').then(setCategories).catch(() => {});
    api.get<Service[]>('/services').then(setServices).catch(() => {});
    api.get<Banner[]>('/banners').then(setBanners).catch(() => {});
    api.get<QuickService[]>('/quick-services').then(setQuickServices).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    api
      .get<{ id: number }[]>(`/favorites/user/${user.id}`)
      .then((favs) => setFavIds(new Set(favs.map((f) => f.id))))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const toggleFavorite = async (serviceId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const wasFav = favIds.has(serviceId);
    // optimistic
    const next = new Set(favIds);
    if (wasFav) next.delete(serviceId);
    else next.add(serviceId);
    setFavIds(next);
    try {
      const res = await api.post<{ favorited: boolean }>('/favorites/toggle', {
        userId: user.id,
        serviceId,
      });
      if (res.favorited !== !wasFav) {
        const corrected = new Set(favIds);
        if (res.favorited) corrected.add(serviceId);
        else corrected.delete(serviceId);
        setFavIds(corrected);
      }
    } catch {
      setFavIds(favIds); // revert
    }
  };

  const safeBanners = useMemo(() => banners, [banners]);

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
            {user?.photoUrl || user?.avatar ? (
              <img
                src={user.photoUrl || user.avatar || ''}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover shadow-ios-card"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center shadow-ios-card">
                <span className="text-white font-semibold text-ios-subhead">
                  {user?.name?.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Banner carousel — only render when banners exist */}
        {safeBanners.length > 0 && (
          <div className="relative">
            <div className="relative overflow-hidden rounded-ios-lg shadow-ios-card">
              <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `translateX(-${bannerIdx * 100}%)` }}
              >
                {safeBanners.map((b) => (
                  <a
                    key={b.id}
                    href={b.link || undefined}
                    target={b.link ? '_blank' : undefined}
                    rel="noreferrer"
                    className="min-w-full relative h-[160px] overflow-hidden"
                  >
                    <img
                      src={b.image}
                      alt={b.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="text-white font-bold text-[20px] leading-tight">
                        {b.title}
                      </h3>
                      {b.subtitle && (
                        <p className="text-white/90 text-ios-subhead mt-0.5">{b.subtitle}</p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
            {safeBanners.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {safeBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setBannerIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === bannerIdx ? 'w-6 bg-primary-500' : 'w-1.5 bg-surface-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Services (admin-managed) */}
        {quickServices.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-ios-title-3 text-surface-900">Tez xizmatlar</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
              {quickServices.map((qs) => {
                const { Icon } = getCategoryIcon(qs.icon);
                return (
                  <button
                    key={qs.id}
                    onClick={() => navigate(`/quick-service/${qs.id}`)}
                    className="flex flex-col items-center gap-2 min-w-[88px] active:scale-95 transition-transform"
                  >
                    <div className="w-[68px] h-[68px] rounded-ios-lg bg-primary-500 shadow-ios-card flex items-center justify-center">
                      <Icon className="w-[30px] h-[30px] text-white" strokeWidth={1.8} />
                    </div>
                    <span className="text-ios-caption text-surface-700 text-center leading-tight font-medium line-clamp-2 w-[88px]">
                      {qs.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-ios-title-3 text-surface-900">Kategoriyalar</h2>
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

        {/* Services list — bigger cards with images */}
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
            <div className="space-y-4">
              {services.map((service) => {
                const images = (() => {
                  try {
                    return JSON.parse(service.images) as string[];
                  } catch {
                    return [];
                  }
                })();
                const cover = images[0];
                const isFav = favIds.has(service.id);
                return (
                  <Link
                    key={service.id}
                    to={`/service/${service.id}`}
                    className="block bg-white rounded-ios-xl overflow-hidden shadow-ios-card active:scale-[0.99] transition-all"
                  >
                    {/* Cover image */}
                    <div className="relative h-44 bg-primary-500">
                      {cover ? (
                        <img
                          src={cover}
                          alt={service.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ServiceHeroIcon className="w-20 h-20 text-white/30" strokeWidth={1.5} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      {/* Favorite button */}
                      <button
                        onClick={(e) => toggleFavorite(service.id, e)}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-ios flex items-center justify-center active:scale-90 transition-transform shadow-ios-card"
                        aria-label="Sevimli"
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${
                            isFav ? 'text-danger-500 fill-danger-500' : 'text-surface-700'
                          }`}
                          strokeWidth={2.2}
                        />
                      </button>

                      {/* Rating chip */}
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-ios px-2.5 py-1 rounded-full shadow-ios-card">
                        <Star className="w-3.5 h-3.5 text-mint-600 fill-mint-600" />
                        <span className="text-ios-footnote font-bold text-mint-700">
                          {service.rating.toFixed(1)}
                        </span>
                      </div>

                      {/* Image counter */}
                      {images.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-ios text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                          1/{images.length}
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-4">
                      <h3 className="text-ios-headline text-surface-900 leading-tight">
                        {service.name}
                      </h3>
                      {service.location && (
                        <p className="text-ios-footnote text-surface-600 flex items-center gap-1 mt-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.2} />
                          <span className="truncate">{service.location}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                          {service.owner?.photoUrl || service.owner?.avatar ? (
                            <img
                              src={service.owner.photoUrl || service.owner.avatar || ''}
                              alt={service.owner.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-[11px] font-bold">
                              {service.owner?.name?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="text-ios-footnote text-surface-700 truncate">
                          {service.owner?.name}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
