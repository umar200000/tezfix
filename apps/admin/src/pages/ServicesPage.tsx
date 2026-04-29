import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Store, MapPin, Star, Search, Trash2 } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  rating: number;
  isActive: boolean;
  servicesList: string;
  images: string;
  createdAt: string;
  owner: { id: number; name: string; phone: string | null };
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');

  const load = () => api.get<Service[]>('/services').then(setServices);
  useEffect(() => {
    load();
  }, []);

  const filtered = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.location || '').toLowerCase().includes(search.toLowerCase())
  );

  const remove = async (id: number) => {
    if (!confirm("Xizmatni o'chirilsinmi?")) return;
    await api.delete(`/services/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Xizmatlar</h1>
          <p className="text-gray-500 text-sm mt-1">Jami: {services.length} ta ustaxona</p>
        </div>
      </div>

      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ustaxona qidirish..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-50 outline-none"
        />
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Ustaxona</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Egasi</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Lokatsiya</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Reyting</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Holat</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Xizmatlar</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((service) => {
              let cats: string[] = [];
              try {
                cats = JSON.parse(service.servicesList);
              } catch {}
              let imgs: string[] = [];
              try {
                imgs = JSON.parse(service.images);
              } catch {}
              return (
                <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {imgs[0] ? (
                        <img
                          src={imgs[0]}
                          alt={service.name}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <Store className="w-4 h-4 text-orange-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="text-xs text-gray-400">{service.owner?.name || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{service.owner?.name || '—'}</td>
                  <td className="px-5 py-3.5">
                    {service.location ? (
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {service.location}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {service.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        service.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {service.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {cats.slice(0, 2).map((c) => (
                        <span key={c} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs">
                          {c}
                        </span>
                      ))}
                      {cats.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                          +{cats.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => remove(service.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Xizmatlar topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}
