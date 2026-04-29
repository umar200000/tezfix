import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import {
  ChevronLeft,
  Check,
  Loader2,
  Store,
  MapPin,
  FileText,
  ImagePlus,
  X,
} from 'lucide-react';
import { getCategoryIcon } from '../../utils/categoryIcons';

interface Category {
  id: number;
  name: string;
  icon: string;
  slug: string;
}

const MAX_IMAGES = 10;

export default function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<Category[]>('/categories'),
      api.get<any>(`/services/${id}`),
    ]).then(([cats, service]) => {
      setCategories(cats);
      setName(service.name);
      setLocation(service.location || '');
      setBio(service.bio || '');
      try {
        setSelectedCategories(JSON.parse(service.servicesList));
      } catch {
        setSelectedCategories([]);
      }
      try {
        setImages(JSON.parse(service.images));
      } catch {
        setImages([]);
      }
      setFetching(false);
    });
  }, [id]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handlePickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const slotsLeft = MAX_IMAGES - images.length;
    const toUpload = files.slice(0, slotsLeft);
    if (toUpload.length === 0) {
      e.target.value = '';
      return;
    }
    setUploading(true);
    const fd = new FormData();
    toUpload.forEach((f) => fd.append('files', f));
    fetch('/api/upload/images', { method: 'POST', body: fd })
      .then(async (res) => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json() as Promise<{ files: { url: string }[] }>;
      })
      .then((data) => {
        setImages((prev) => [...prev, ...data.files.map((f) => f.url)]);
      })
      .catch(() => {})
      .finally(() => {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    try {
      await api.put(`/services/${id}`, {
        name,
        location: location || null,
        bio: bio || null,
        servicesList: JSON.stringify(selectedCategories),
        images: JSON.stringify(images),
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !!name && !loading;
  const canAddMore = images.length < MAX_IMAGES && !uploading;

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
        {/* Image gallery */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="field-label !mb-0 text-surface-500">Rasmlar</p>
            <span className="chip-mint !py-0.5 !px-2 !text-[11px]">
              {images.length}/{MAX_IMAGES}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {images.map((url, idx) => (
              <div
                key={url + idx}
                className="relative aspect-square rounded-ios-lg overflow-hidden bg-surface-100 shadow-ios-card"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 backdrop-blur-ios flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </button>
              </div>
            ))}
            {canAddMore && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-ios-lg bg-white border-2 border-dashed border-primary-200 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6 text-primary-500" strokeWidth={2} />
                    <span className="text-ios-caption text-primary-500 font-medium">
                      Qo'shish
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePickFiles}
            className="hidden"
          />
        </div>

        {/* Basic info */}
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
