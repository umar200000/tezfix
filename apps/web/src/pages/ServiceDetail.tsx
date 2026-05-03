import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { api } from '../utils/api';
import { useT } from '../utils/i18n';
import { categoryName } from '../utils/i18n';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import {
  ChevronLeft,
  Phone,
  Heart,
  MapPin,
  Star,
  CheckCircle2,
  Share2,
  Wrench,
  Award,
  Clock,
} from 'lucide-react';

interface ServiceData {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  images: string;
  servicesList: string;
  bio: string | null;
  rating: number;
  owner: {
    id: number;
    name: string;
    phone: string | null;
    photoUrl: string | null;
    avatar: string | null;
    username: string | null;
  };
}

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, activeRole, language } = useStore();
  const t = useT();
  const [service, setService] = useState<ServiceData | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [callSent, setCallSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageIdx, setImageIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    api.get<ServiceData>(`/services/${id}`).then((data) => {
      setService(data);
      setLoading(false);
    });
    if (user) {
      api
        .get<{ favorited: boolean }>(`/favorites/check?userId=${user.id}&serviceId=${id}`)
        .then((r) => setFavorited(r.favorited));
    }
  }, [id, user]);

  const handleCall = async () => {
    if (!user || !service) return;
    // Fire-and-forget the lead so the master gets a Telegram notification + the
    // request shows up in their "So'rovlar" list. We don't block the dial on it.
    if (!callSent) {
      api
        .post('/leads/create', {
          serviceId: service.id,
          clientId: user.id,
        })
        .catch((err) => console.error(err));
      setCallSent(true);
    }
    // Open the phone dialer with the master's number.
    if (service.owner.phone) {
      window.location.href = `tel:${service.owner.phone}`;
    }
  };

  const handleFavorite = async () => {
    if (!user || !service) return;
    const res = await api.post<{ favorited: boolean }>('/favorites/toggle', {
      userId: user.id,
      serviceId: service.id,
    });
    setFavorited(res.favorited);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) return null;

  const serviceCategories = (() => {
    try {
      return JSON.parse(service.servicesList) as string[];
    } catch {
      return [];
    }
  })();
  const images = (() => {
    try {
      return JSON.parse(service.images) as string[];
    } catch {
      return [];
    }
  })();
  const isClientView = activeRole === 'client';

  return (
    <div className="min-h-screen pb-28">
      {/* Hero / image carousel — touch-swipeable */}
      <div className="relative h-[280px] bg-primary-500 overflow-hidden service-hero-swiper">
        {images.length > 0 ? (
          <>
            <Swiper
              modules={[Pagination]}
              slidesPerView={1}
              pagination={images.length > 1 ? { clickable: true } : false}
              onSlideChange={(s) => setImageIdx(s.activeIndex)}
              initialSlide={imageIdx}
              className="h-full w-full"
            >
              {images.map((src) => (
                <SwiperSlide key={src} className="h-full">
                  <img
                    src={src}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-primary-400/30" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-primary-700/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Wrench className="w-28 h-28 text-white/15" strokeWidth={1.5} />
            </div>
          </>
        )}

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 safe-top z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-ios flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.4} />
          </button>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-ios flex items-center justify-center active:scale-95 transition-transform">
              <Share2 className="w-5 h-5 text-white" />
            </button>
            {isClientView && (
              <button
                onClick={handleFavorite}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-ios flex items-center justify-center active:scale-95 transition-transform"
              >
                <Heart
                  className={`w-5 h-5 ${favorited ? 'text-danger-500 fill-danger-500' : 'text-white'}`}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 relative">
        <div className="bg-white rounded-ios-2xl p-5 shadow-ios-card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-ios-title-2 text-surface-900 leading-tight">
                {service.name}
              </h1>
              {service.location && (
                <p className="text-ios-subhead text-surface-600 flex items-center gap-1 mt-1.5">
                  <MapPin className="w-4 h-4" strokeWidth={2.2} />
                  <span className="truncate">{service.location}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 bg-mint-100 px-2.5 py-1 rounded-full">
              <Star className="w-3.5 h-3.5 text-mint-600 fill-mint-600" />
              <span className="text-ios-footnote font-bold text-mint-700">
                {service.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-separator">
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1 text-primary-500 mb-1">
                <Award className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <p className="text-ios-footnote font-semibold text-primary-700">{t('svc.verified')}</p>
              <p className="text-ios-caption text-surface-500">{t('svc.master')}</p>
            </div>
            <div className="w-px h-10 bg-separator" />
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1 text-mint-600 mb-1">
                <Clock className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <p className="text-ios-footnote font-semibold text-primary-700">{t('svc.fastReply')}</p>
              <p className="text-ios-caption text-surface-500">{t('svc.fastReply.sub')}</p>
            </div>
            <div className="w-px h-10 bg-separator" />
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1 text-primary-500 mb-1">
                <Heart className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <p className="text-ios-footnote font-semibold text-primary-700">{t('svc.popular')}</p>
              <p className="text-ios-caption text-surface-500">{t('svc.popular.sub')}</p>
            </div>
          </div>
        </div>

        {service.bio && (
          <div className="mt-4">
            <p className="ios-section-header">{t('svc.about')}</p>
            <div className="bg-white rounded-ios-xl p-4 shadow-ios-card">
              <p className="text-ios-body text-surface-800 leading-relaxed">
                {service.bio}
              </p>
            </div>
          </div>
        )}

        {serviceCategories.length > 0 && (
          <div className="mt-4">
            <p className="ios-section-header">{t('svc.services')}</p>
            <div className="bg-white rounded-ios-xl p-4 shadow-ios-card">
              <div className="flex flex-wrap gap-2">
                {serviceCategories.map((cat) => (
                  <span key={cat} className="ios-chip bg-primary-50 text-primary-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    {categoryName(language, cat)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="ios-section-header">{t('svc.masterAbout')}</p>
          <div className="bg-white rounded-ios-lg p-4 shadow-ios-card flex items-center gap-3">
            {service.owner.photoUrl || service.owner.avatar ? (
              <img
                src={service.owner.photoUrl || service.owner.avatar || ''}
                alt={service.owner.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold text-ios-title-3">
                  {service.owner.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-ios-headline text-primary-700 truncate">
                {service.owner.name}
              </p>
              {service.owner.username && (
                <p className="text-ios-footnote text-surface-500">
                  @{service.owner.username}
                </p>
              )}
            </div>
            <div className="chip-mint">
              <div className="w-1.5 h-1.5 rounded-full bg-mint-600" />
              {t('common.online')}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      {isClientView && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-ios border-t border-separator/30 px-4 pt-3 pb-safe z-50 flex gap-2">
          <button
            onClick={handleFavorite}
            className="w-14 h-14 rounded-ios-lg bg-white shadow-ios-card flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Sevimli"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                favorited ? 'text-danger-500 fill-danger-500' : 'text-surface-700'
              }`}
              strokeWidth={2.2}
            />
          </button>
          {service.owner.phone ? (
            <button onClick={handleCall} className="ios-btn-primary flex-1">
              {callSent ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Phone className="w-5 h-5" />
              )}
              {callSent ? t('svc.callAgain') : t('svc.callBtn')}
            </button>
          ) : callSent ? (
            <div className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-mint-100 rounded-ios-lg">
              <CheckCircle2 className="w-5 h-5 text-mint-600" />
              <span className="text-ios-headline text-mint-700">{t('svc.requestSent')}</span>
            </div>
          ) : (
            <button onClick={handleCall} className="ios-btn-primary flex-1" disabled={!user}>
              <Phone className="w-5 h-5" />
              {t('svc.contact')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
