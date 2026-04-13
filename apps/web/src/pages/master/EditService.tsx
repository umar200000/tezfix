import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { ChevronLeft, Check, Loader2, Store, MapPin, FileText } from 'lucide-react';
import { getCategoryIcon } from '../../utils/categoryIcons';

interface Category {
  id: number;
  name: string;
  icon: string;
  slug: string;
}

export default function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<Category[]>('/categories'),
      api.get<any>(`/services/${id}`),
    ]).then(([cats, service]) => {
      setCategories(cats);
      setName(service.name);
      setLocation(service.location || '');
      setBio(service.bio || '');
      setSelectedCategories(JSON.parse(service.servicesList));
      setFetching(false);
    });
  }, [id]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedCategories.length === 0) return;
    setLoading(true);
    try {
      await api.put(`/services/${id}`, {
        name,
        location: location || null,
        bio: bio || null,
        servicesList: JSON.stringify(selectedCategories),
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = name && selectedCategories.length > 0 && !loading;

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="ios-nav-bar">
        <div className="flex items-center justify-between h-12 px-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-0.5 text-primary-500 pl-1 active:opacity-60 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.4} />
            <span className="text-ios-body">Orqaga</span>
          </button>
          <h1 className="text-ios-headline text-primary-700">Tahrirlash</h1>
          <button
            type="submit"
            form="edit-service"
            disabled={!canSubmit}
            className={`text-ios-body font-semibold pr-3 ${
              canSubmit ? 'text-primary-500 active:opacity-60' : 'text-surface-400'
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Saqlash'}
          </button>
        </div>
      </div>

      <form id="edit-service" onSubmit={handleSubmit} className="p-4 pb-32 space-y-5">
        <div className="space-y-3">
          <div className="field-card">
            <p className="field-label text-surface-500">
              <Store className="w-3.5 h-3.5" strokeWidth={2.2} />
              Ishxona nomi
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ishxona nomi"
              className="w-full bg-transparent text-ios-body text-primary-700 placeholder:text-surface-400 outline-none font-medium"
              required
            />
          </div>
          <div className="field-card">
            <p className="field-label text-surface-500">
              <MapPin className="w-3.5 h-3.5" strokeWidth={2.2} />
              Lokatsiya
            </p>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Toshkent, tuman, ko'cha"
              className="w-full bg-transparent text-ios-body text-primary-700 placeholder:text-surface-400 outline-none font-medium"
            />
          </div>
          <div className="field-card">
            <p className="field-label text-surface-500">
              <FileText className="w-3.5 h-3.5" strokeWidth={2.2} />
              Tavsif
            </p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ishxona haqida qisqacha..."
              rows={3}
              className="w-full bg-transparent text-ios-body text-primary-700 placeholder:text-surface-400 outline-none resize-none font-medium"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="field-label !mb-0 text-surface-500">Xizmatlar</p>
            <span className="chip-mint !py-0.5 !px-2 !text-[11px]">
              {selectedCategories.length} tanlangan
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {categories.map((cat) => {
              const selected = selectedCategories.includes(cat.slug);
              const { Icon } = getCategoryIcon(cat.slug);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.slug)}
                  className={`relative flex items-center gap-2.5 p-3 rounded-ios-lg transition-all text-left shadow-ios-card active:scale-[0.97] ${
                    selected ? 'bg-primary-500 text-white' : 'bg-white text-primary-700'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-ios flex items-center justify-center flex-shrink-0 ${
                      selected ? 'bg-primary-700' : 'bg-primary-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${selected ? 'text-white' : 'text-primary-500'}`} strokeWidth={2} />
                  </div>
                  <span className="text-ios-footnote font-semibold flex-1 leading-tight">
                    {cat.name}
                  </span>
                  {selected && (
                    <div className="w-5 h-5 rounded-full bg-mint-200 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-mint-700" strokeWidth={3.5} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" disabled={!canSubmit} className="ios-btn-primary w-full disabled:opacity-40">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saqlanmoqda...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" strokeWidth={2.5} />
              O'zgarishlarni saqlash
            </>
          )}
        </button>
      </form>
    </div>
  );
}
