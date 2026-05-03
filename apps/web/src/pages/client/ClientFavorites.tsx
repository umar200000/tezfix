import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { api } from '../../utils/api';
import { Heart, MapPin, Star, RefreshCw, Loader2 } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  location: string | null;
  rating: number;
}

export default function ClientFavorites() {
  const { user } = useStore();
  const [favorites, setFavorites] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const data = await api.get<Service[]>(`/favorites/user/${user.id}`);
      setFavorites(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="page-container">
      <div className="px-4 pt-12 pb-3 flex items-start justify-between">
        <div>
          <h1 className="ios-large-title">Saqlangan</h1>
          <p className="text-ios-subhead text-surface-600 mt-0.5">
            {favorites.length > 0
              ? `${favorites.length} ta ustaxona saqlangan`
              : "Hali saqlangan ustaxona yo'q"}
          </p>
        </div>
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
      </div>

      <div className="px-4">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-ios-xl p-3.5 flex gap-3 shadow-ios-card">
                <div className="skeleton w-14 h-14 rounded-ios-lg" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 bg-white rounded-ios-lg shadow-ios-card flex items-center justify-center">
                <Heart className="w-11 h-11 text-primary-400" strokeWidth={1.8} />
              </div>
            </div>
            <h3 className="text-ios-title-3 text-surface-900 mb-2">
              Saqlangan yo'q
            </h3>
            <p className="text-ios-subhead text-surface-600 max-w-xs mx-auto">
              Sizga yoqqan ustaxonalarni ♡ tugmasi bilan saqlang
            </p>
            <Link to="/" className="ios-btn-secondary inline-flex mt-6">
              Ustaxonalarni ko'rish
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {favorites.map((service) => (
              <Link
                key={service.id}
                to={`/service/${service.id}`}
                className="bg-white rounded-ios-xl p-3.5 flex gap-3 shadow-ios-card active:scale-[0.98] transition-all block relative overflow-hidden"
              >
                <div className="w-14 h-14 rounded-ios-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white fill-white" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-ios-headline text-surface-900 truncate">
                    {service.name}
                  </h3>
                  {service.location && (
                    <p className="text-ios-footnote text-surface-600 flex items-center gap-1 mt-0.5 truncate">
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
