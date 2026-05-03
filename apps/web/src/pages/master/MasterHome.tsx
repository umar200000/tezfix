import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { api } from '../../utils/api';
import {
  Plus,
  MapPin,
  Star,
  Edit3,
  Eye,
  Wrench,
  TrendingUp,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { ServiceHeroIcon } from '../../utils/categoryIcons';

interface Service {
  id: number;
  name: string;
  location: string | null;
  rating: number;
  servicesList: string;
  isActive: boolean;
}

export default function MasterHome() {
  const { user } = useStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const data = await api.get<Service[]>(`/services/owner/${user.id}`);
      setServices(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const activeCount = services.filter((s) => s.isActive).length;
  const avgRating =
    services.length > 0
      ? (services.reduce((sum, s) => sum + s.rating, 0) / services.length).toFixed(1)
      : '—';

  return (
    <div className="page-container">
      {/* Large title header */}
      <div className="px-4 pt-12 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-ios-subhead text-surface-600">Salom,</p>
            <h1 className="ios-large-title mt-0.5">{user?.name?.split(' ')[0]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={refreshing}
              className="w-10 h-10 rounded-full bg-white shadow-ios-card flex items-center justify-center active:scale-95 transition-transform disabled:opacity-60"
              aria-label="Yangilash"
            >
              {refreshing ? (
                <Loader2 className="w-5 h-5 text-primary-700 animate-spin" strokeWidth={2} />
              ) : (
                <RefreshCw className="w-5 h-5 text-primary-700" strokeWidth={2} />
              )}
            </button>
            {user?.photoUrl || user?.avatar ? (
              <img
                src={user.photoUrl || user.avatar || ''}
                alt={user.name}
                className="w-11 h-11 rounded-full object-cover shadow-ios-card"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-primary-500 flex items-center justify-center shadow-ios-card">
                <span className="text-white font-semibold text-ios-body">
                  {user?.name?.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            icon={Wrench}
            color="primary"
            label="Xizmatlar"
            value={services.length.toString()}
          />
          <StatCard
            icon={TrendingUp}
            color="success"
            label="Faol"
            value={activeCount.toString()}
          />
          <StatCard
            icon={Star}
            color="warn"
            label="Reyting"
            value={avgRating}
          />
        </div>

        {/* My Services */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-ios-title-3 text-surface-900">Xizmatlarim</h2>
            <Link
              to="/service/create"
              className="flex items-center gap-1 text-primary-500 text-ios-subhead font-semibold px-2 py-1 rounded-ios active:bg-primary-50"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Yangi
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-ios-xl p-4 shadow-ios-card">
                  <div className="flex gap-3">
                    <div className="skeleton w-16 h-16 rounded-ios-lg" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="skeleton h-4 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                      <div className="skeleton h-3 w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white rounded-ios-2xl p-8 text-center shadow-ios-card">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl" />
                <div className="relative w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center">
                  <Wrench className="w-10 h-10 text-primary-500" strokeWidth={1.8} />
                </div>
              </div>
              <h3 className="text-ios-title-3 text-surface-900 mb-1">Xizmat yo'q</h3>
              <p className="text-ios-subhead text-surface-600 mb-5">
                Mijozlar sizni topishi uchun birinchi xizmatingizni yarating
              </p>
              <Link to="/service/create" className="ios-btn-primary inline-flex">
                <Plus className="w-5 h-5" />
                Xizmat yaratish
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-ios-xl shadow-ios-card overflow-hidden"
                >
                  <div className="p-4 flex gap-3">
                    <div className="w-[60px] h-[60px] rounded-ios-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
                      <ServiceHeroIcon className="w-7 h-7 text-white" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-ios-headline text-surface-900 truncate flex-1">
                          {service.name}
                        </h3>
                        <span
                          className={`ios-chip !py-0.5 !px-2.5 !text-[11px] ${
                            service.isActive ? 'chip-mint' : 'chip-neutral'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              service.isActive ? 'bg-mint-600' : 'bg-surface-500'
                            }`}
                          />
                          {service.isActive ? 'Faol' : 'Nofaol'}
                        </span>
                      </div>
                      {service.location && (
                        <p className="text-ios-footnote text-surface-600 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3" strokeWidth={2.2} />
                          <span className="truncate">{service.location}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1 bg-mint-100 w-fit px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 text-mint-600 fill-mint-600" />
                        <span className="text-[11px] font-semibold text-mint-700">
                          {service.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 border-t border-separator/30">
                    <Link
                      to={`/service/${service.id}`}
                      className="flex items-center justify-center gap-1.5 py-3 text-ios-subhead font-medium text-surface-700 active:bg-surface-150 transition-colors"
                    >
                      <Eye className="w-4 h-4" strokeWidth={2} />
                      Ko'rish
                    </Link>
                    <Link
                      to={`/service/edit/${service.id}`}
                      className="flex items-center justify-center gap-1.5 py-3 text-ios-subhead font-semibold text-primary-500 border-l border-separator/30 active:bg-primary-50 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" strokeWidth={2} />
                      Tahrirlash
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: any;
  color: 'primary' | 'success' | 'warn';
  label: string;
  value: string;
}) {
  const colorMap = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-500' },
    success: { bg: 'bg-mint-100', text: 'text-mint-600' },
    warn: { bg: 'bg-primary-50', text: 'text-primary-500' },
  };
  return (
    <div className="bg-white rounded-ios-lg p-3 shadow-ios-card">
      <div className={`w-8 h-8 rounded-ios ${colorMap[color].bg} flex items-center justify-center mb-2`}>
        <Icon className={`w-4 h-4 ${colorMap[color].text}`} strokeWidth={2.2} />
      </div>
      <p className="text-ios-title-3 font-bold text-primary-700 leading-none">{value}</p>
      <p className="text-ios-caption text-surface-600 mt-1 font-medium">{label}</p>
    </div>
  );
}
