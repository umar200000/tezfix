import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { Search, MapPin, Star, X, SlidersHorizontal, RefreshCw, Loader2 } from 'lucide-react';
import { ServiceHeroIcon } from '../../utils/categoryIcons';

interface Service {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  rating: number;
  servicesList: string;
}

export default function ClientSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [category]);

  const fetchServices = async (searchQuery?: string) => {
    setLoading(true);
    try {
      let url = '/services?';
      if (searchQuery || query) url += `search=${encodeURIComponent(searchQuery || query)}&`;
      if (category) url += `category=${category}`;
      const data = await api.get<Service[]>(url);
      setServices(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices(query);
  };

  const clearSearch = () => {
    setQuery('');
    fetchServices('');
  };

  return (
    <div className="page-container">
      {/* Large title */}
      <div className="px-4 pt-12 pb-3 flex items-start justify-between">
        <h1 className="ios-large-title">Qidiruv</h1>
        <button
          onClick={() => fetchServices()}
          disabled={loading}
          className="w-10 h-10 rounded-full bg-white shadow-ios-card flex items-center justify-center active:scale-95 transition-transform disabled:opacity-60"
          aria-label="Yangilash"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 text-primary-700 animate-spin" strokeWidth={2} />
          ) : (
            <RefreshCw className="w-5 h-5 text-primary-700" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-3">
        <form onSubmit={handleSearch} className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-surface-600" strokeWidth={2.2} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Ustaxona, lokatsiya..."
              className="ios-search"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] bg-surface-500 rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" strokeWidth={3} />
              </button>
            )}
          </div>
          {focused && (
            <button
              type="button"
              onClick={() => setFocused(false)}
              className="text-ios-callout text-primary-500 font-medium animate-fade-up"
            >
              Bekor qilish
            </button>
          )}
          {!focused && (
            <button
              type="button"
              className="w-10 h-10 rounded-ios bg-white shadow-ios-card flex items-center justify-center active:scale-95 transition-transform"
            >
              <SlidersHorizontal className="w-[18px] h-[18px] text-primary-500" strokeWidth={2.2} />
            </button>
          )}
        </form>

        {category && (
          <div className="mt-3 flex items-center gap-2 animate-fade-up">
            <span className="ios-chip bg-primary-50 text-primary-600">
              {category}
              <button
                onClick={() => {
                  setCategory('');
                  setSearchParams({});
                }}
                className="w-4 h-4 rounded-full bg-primary-500/20 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-primary-600" strokeWidth={3} />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-ios-xl p-3.5 flex gap-3 shadow-ios-card">
                <div className="skeleton w-16 h-16 rounded-ios-lg" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-white shadow-ios-card flex items-center justify-center mx-auto mb-4">
              <Search className="w-9 h-9 text-surface-400" strokeWidth={1.8} />
            </div>
            <h3 className="text-ios-headline text-surface-900 mb-1">Topilmadi</h3>
            <p className="text-ios-subhead text-surface-600">Boshqa so'rov bilan qayta urining</p>
          </div>
        ) : (
          <>
            <p className="text-ios-footnote text-surface-600 mb-2.5">
              {services.length} ta natija topildi
            </p>
            <div className="space-y-2.5">
              {services.map((service) => (
                <Link
                  key={service.id}
                  to={`/service/${service.id}`}
                  className="bg-white rounded-ios-xl p-3.5 flex gap-3 shadow-ios-card active:scale-[0.98] transition-all block"
                >
                  <div className="w-14 h-14 rounded-ios-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
                    <ServiceHeroIcon className="w-7 h-7 text-white" strokeWidth={1.8} />
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
          </>
        )}
      </div>
    </div>
  );
}
