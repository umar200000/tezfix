import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { ChevronLeft, MapPin, Phone, User as UserIcon } from 'lucide-react';
import { getCategoryIcon } from '../../utils/categoryIcons';

interface QuickService {
  id: number;
  name: string;
  icon: string;
  masterName: string;
  phone: string;
  address: string;
  description: string | null;
  image: string | null;
}

export default function QuickServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<QuickService | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get<QuickService>(`/quick-services/${id}`)
      .then(setItem)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-ios-headline text-surface-700 mb-2">Xizmat topilmadi</p>
        <button onClick={() => navigate('/')} className="text-primary-500 text-ios-body">
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  const { Icon } = getCategoryIcon(item.icon);

  return (
    <div className="min-h-screen pb-32">
      {/* Hero */}
      <div className="relative h-[260px] bg-primary-500 overflow-hidden">
        {item.image ? (
          <>
            <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/15" />
          </>
        ) : (
          <>
            <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-primary-400/30" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-primary-700/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="w-28 h-28 text-white/20" strokeWidth={1.5} />
            </div>
          </>
        )}

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 safe-top">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-ios flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-6 relative space-y-4">
        {/* Header card */}
        <div className="bg-white rounded-ios-2xl p-5 shadow-ios-card">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-ios-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-7 h-7 text-primary-500" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-ios-title-2 text-surface-900 leading-tight">{item.name}</h1>
              <p className="text-ios-subhead text-surface-600 mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" strokeWidth={2.2} />
                <span className="truncate">{item.address}</span>
              </p>
            </div>
          </div>

          {item.description && (
            <p className="text-ios-body text-surface-700 mt-4 leading-relaxed">{item.description}</p>
          )}
        </div>

        {/* Master info */}
        <div>
          <p className="ios-section-header">Usta</p>
          <div className="bg-white rounded-ios-xl p-4 shadow-ios-card flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ios-headline text-primary-700 truncate">{item.masterName}</p>
              <p className="text-ios-footnote text-surface-500">Tezkor xizmat</p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <p className="ios-section-header">Manzil</p>
          <div className="bg-white rounded-ios-xl p-4 shadow-ios-card">
            <p className="text-ios-body text-surface-800 flex items-start gap-2 leading-relaxed">
              <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" strokeWidth={2.2} />
              <span>{item.address}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA — call */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-ios border-t border-separator/30 px-4 pt-3 pb-safe z-50">
        <a href={`tel:${item.phone}`} className="ios-btn-primary w-full">
          <Phone className="w-5 h-5" />
          {item.phone}
        </a>
      </div>
    </div>
  );
}
