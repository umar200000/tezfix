import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { api } from '../utils/api';
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
    phone: string;
    avatar: string | null;
    username: string;
  };
}

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStore();
  const [service, setService] = useState<ServiceData | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [callSent, setCallSent] = useState(false);
  const [loading, setLoading] = useState(true);

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
    if (!user || !service || callSent) return;
    try {
      await api.post('/leads/create', {
        serviceId: service.id,
        clientId: user.id,
      });
      setCallSent(true);
    } catch (err) {
      console.error(err);
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

  const serviceCategories = JSON.parse(service.servicesList) as string[];

  return (
    <div className="min-h-screen pb-28">
      {/* Hero */}
      <div className="relative h-[260px] bg-primary-500 overflow-hidden">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-primary-400/30" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-primary-700/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Wrench className="w-28 h-28 text-white/15" strokeWidth={1.5} />
        </div>

        {/* Top nav floating */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 safe-top">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-ios flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.4} />
          </button>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-ios flex items-center justify-center active:scale-95 transition-transform">
              <Share2 className="w-5 h-5 text-white" />
            </button>
            {user?.role === 'client' && (
              <button
                onClick={handleFavorite}
                className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-ios flex items-center justify-center active:scale-95 transition-transform"
              >
                <Heart
                  className={`w-5 h-5 ${favorited ? 'text-danger-500 fill-danger-500' : 'text-white'}`}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 relative">
        {/* Main card */}
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

          {/* Stats row */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-separator">
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1 text-primary-500 mb-1">
                <Award className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <p className="text-ios-footnote font-semibold text-primary-700">Tekshirilgan</p>
              <p className="text-ios-caption text-surface-500">Usta</p>
            </div>
            <div className="w-px h-10 bg-separator" />
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1 text-mint-600 mb-1">
                <Clock className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <p className="text-ios-footnote font-semibold text-primary-700">Tez javob</p>
              <p className="text-ios-caption text-surface-500">~5 daqiqa</p>
            </div>
            <div className="w-px h-10 bg-separator" />
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1 text-primary-500 mb-1">
                <Heart className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <p className="text-ios-footnote font-semibold text-primary-700">Mashhur</p>
              <p className="text-ios-caption text-surface-500">Mijozlar</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        {service.bio && (
          <div className="mt-4">
            <p className="ios-section-header">Tavsif</p>
            <div className="bg-white rounded-ios-xl p-4 shadow-ios-card">
              <p className="text-ios-body text-surface-800 leading-relaxed">
                {service.bio}
              </p>
            </div>
          </div>
        )}

        {/* Services */}
        <div className="mt-4">
          <p className="ios-section-header">Xizmatlar</p>
          <div className="bg-white rounded-ios-xl p-4 shadow-ios-card">
            <div className="flex flex-wrap gap-2">
              {serviceCategories.map((cat) => (
                <span
                  key={cat}
                  className="ios-chip bg-primary-50 text-primary-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Owner info */}
        <div className="mt-4">
          <p className="ios-section-header">Usta haqida</p>
          <div className="bg-white rounded-ios-lg p-4 shadow-ios-card flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-ios-title-3">
                {service.owner.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ios-headline text-primary-700 truncate">
                {service.owner.name}
              </p>
              <p className="text-ios-footnote text-surface-500">
                {service.owner.username}
              </p>
            </div>
            <div className="chip-mint">
              <div className="w-1.5 h-1.5 rounded-full bg-mint-600" />
              Online
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      {user?.role === 'client' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-ios border-t border-separator/30 px-4 pt-3 pb-safe z-50">
          {callSent ? (
            <div className="flex items-center justify-center gap-2 py-3.5 bg-mint-100 rounded-ios-lg">
              <CheckCircle2 className="w-5 h-5 text-mint-600" />
              <span className="text-ios-headline text-mint-700">
                So'rov yuborildi!
              </span>
            </div>
          ) : (
            <button
              onClick={handleCall}
              className="ios-btn-primary w-full"
            >
              <Phone className="w-5 h-5" />
              Qo'ng'iroq qilish
            </button>
          )}
        </div>
      )}
    </div>
  );
}
