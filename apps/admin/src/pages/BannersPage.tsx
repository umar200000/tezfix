import { useEffect, useRef, useState } from 'react';
import { api, uploadImage } from '../utils/api';
import { Plus, Edit3, Trash2, ImagePlus, Loader2, X, Check } from 'lucide-react';

interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
}

interface BannerForm {
  id?: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
  order: number;
}

const empty: BannerForm = { title: '', subtitle: '', image: '', link: '', isActive: true, order: 0 };

export default function BannersPage() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BannerForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    api
      .get<Banner[]>('/banners/all')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startCreate = () => setEditing({ ...empty });
  const startEdit = (b: Banner) =>
    setEditing({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle || '',
      image: b.image,
      link: b.link || '',
      isActive: b.isActive,
      order: b.order,
    });
  const close = () => setEditing(null);

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setEditing({ ...editing, image: url });
    } catch (err) {
      alert('Rasm yuklash xato');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.title || !editing.image) return;
    setSaving(true);
    try {
      const body = {
        title: editing.title,
        subtitle: editing.subtitle || null,
        image: editing.image,
        link: editing.link || null,
        isActive: editing.isActive,
        order: Number(editing.order) || 0,
      };
      if (editing.id) {
        await api.put<Banner>(`/banners/${editing.id}`, body);
      } else {
        await api.post<Banner>('/banners', body);
      }
      close();
      load();
    } catch (err: any) {
      alert(err?.message || 'Xato');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Ushbu bannerni o'chirilsinmi?")) return;
    await api.delete(`/banners/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bannerlar</h1>
          <p className="text-gray-500 text-sm mt-1">Mijoz bosh sahifasidagi bannerlar</p>
        </div>
        <button onClick={startCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          Yangi banner
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="stat-card text-center py-12">
          <p className="text-gray-500">Hali bannerlar yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((b) => (
            <div key={b.id} className="stat-card overflow-hidden p-0">
              <div className="relative h-40 bg-gray-100">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h3 className="text-white font-bold">{b.title}</h3>
                  {b.subtitle && <p className="text-white/85 text-sm">{b.subtitle}</p>}
                </div>
                {!b.isActive && (
                  <div className="absolute top-2 left-2 bg-gray-900/70 text-white text-xs px-2 py-0.5 rounded-full">
                    Nofaol
                  </div>
                )}
              </div>
              <div className="p-4 flex items-center justify-between gap-2">
                <div className="text-xs text-gray-500">Tartib: #{b.order}</div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(b)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(b.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={save}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-lg font-semibold">
                {editing.id ? 'Bannerni tahrirlash' : 'Yangi banner'}
              </h2>
              <button type="button" onClick={close} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rasm *</label>
                {editing.image ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100">
                    <img src={editing.image} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, image: '' })}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-500 hover:bg-gray-50"
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <ImagePlus className="w-6 h-6" />
                        <span className="text-sm">Rasm yuklash</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onPickImage}
                  className="hidden"
                />
              </div>

              <Field label="Sarlavha *">
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="input"
                  required
                />
              </Field>
              <Field label="Tavsif">
                <input
                  type="text"
                  value={editing.subtitle}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Havola (ihtiyoriy)">
                <input
                  type="url"
                  value={editing.link}
                  onChange={(e) => setEditing({ ...editing, link: e.target.value })}
                  placeholder="https://..."
                  className="input"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tartib">
                  <input
                    type="number"
                    value={editing.order}
                    onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                    className="input"
                  />
                </Field>
                <Field label="Holati">
                  <label className="flex items-center gap-2 h-10">
                    <input
                      type="checkbox"
                      checked={editing.isActive}
                      onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Faol</span>
                  </label>
                </Field>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t bg-gray-50">
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Bekor qilish
              </button>
              <button type="submit" disabled={saving || !editing.image || !editing.title} className="btn-primary disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Saqlash
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
