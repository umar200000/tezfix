import { useEffect, useRef, useState } from 'react';
import { api, uploadImage } from '../utils/api';
import { Plus, Edit3, Trash2, Loader2, X, Check, ImagePlus, Phone, MapPin, Wrench } from 'lucide-react';

interface QuickService {
  id: number;
  name: string;
  icon: string;
  masterName: string;
  phone: string;
  address: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
}

interface QuickServiceForm {
  id?: number;
  name: string;
  icon: string;
  masterName: string;
  phone: string;
  address: string;
  description: string;
  image: string;
  isActive: boolean;
  order: number;
}

const empty: QuickServiceForm = {
  name: '',
  icon: 'wrench',
  masterName: '',
  phone: '',
  address: '',
  description: '',
  image: '',
  isActive: true,
  order: 0,
};

const iconOptions = [
  { slug: 'wrench', label: 'Usta' },
  { slug: 'engine-repair', label: 'Dvigatel' },
  { slug: 'oil-change', label: 'Moy' },
  { slug: 'tires', label: 'Shina' },
  { slug: 'brakes', label: 'Tormoz' },
  { slug: 'electrical', label: 'Elektrika' },
  { slug: 'body-repair', label: 'Kuzov' },
  { slug: 'diagnostics', label: 'Diagnostika' },
  { slug: 'ac-repair', label: 'Konditsioner' },
  { slug: 'fuel-delivery', label: 'Benzin' },
  { slug: 'tow-truck', label: 'Evakuator' },
  { slug: 'traffic-police', label: 'GAI' },
  { slug: 'call-mechanic', label: 'Usta chaqirish' },
  { slug: 'car-wash', label: 'Avtomoyka' },
  { slug: 'painting', label: "Bo'yoq" },
  { slug: 'transmission', label: 'Uzatma' },
];

export default function QuickServicesPage() {
  const [items, setItems] = useState<QuickService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<QuickServiceForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    api
      .get<QuickService[]>('/quick-services/all')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startCreate = () => setEditing({ ...empty });
  const startEdit = (qs: QuickService) =>
    setEditing({
      id: qs.id,
      name: qs.name,
      icon: qs.icon,
      masterName: qs.masterName,
      phone: qs.phone,
      address: qs.address,
      description: qs.description || '',
      image: qs.image || '',
      isActive: qs.isActive,
      order: qs.order,
    });
  const close = () => setEditing(null);

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setEditing({ ...editing, image: url });
    } catch {
      alert('Rasm yuklash xato');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name || !editing.masterName || !editing.phone || !editing.address) return;
    setSaving(true);
    try {
      const body = {
        name: editing.name,
        icon: editing.icon || 'wrench',
        masterName: editing.masterName,
        phone: editing.phone,
        address: editing.address,
        description: editing.description || null,
        image: editing.image || null,
        isActive: editing.isActive,
        order: Number(editing.order) || 0,
      };
      if (editing.id) {
        await api.put<QuickService>(`/quick-services/${editing.id}`, body);
      } else {
        await api.post<QuickService>('/quick-services', body);
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
    if (!confirm("Ushbu tez xizmatni o'chirilsinmi?")) return;
    await api.delete(`/quick-services/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tez xizmatlar</h1>
          <p className="text-gray-500 text-sm mt-1">
            Mijoz bosh sahifasidagi tezkor xizmat tugmalari
          </p>
        </div>
        <button onClick={startCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          Yangi xizmat
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="stat-card text-center py-12">
          <p className="text-gray-500">Hali tez xizmatlar yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((qs) => (
            <div key={qs.id} className="stat-card">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-6 h-6 text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{qs.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{qs.masterName}</p>
                </div>
                {!qs.isActive && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    Nofaol
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                <p className="flex items-center gap-1.5 text-gray-600">
                  <Phone className="w-3.5 h-3.5" />
                  {qs.phone}
                </p>
                <p className="flex items-center gap-1.5 text-gray-600">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{qs.address}</span>
                </p>
              </div>
              <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t">
                <button
                  onClick={() => startEdit(qs)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(qs.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
                {editing.id ? "Xizmatni tahrirlash" : 'Yangi tez xizmat'}
              </h2>
              <button type="button" onClick={close} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <Field label="Xizmat nomi *">
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="input"
                  placeholder="Masalan: Evakuator 24/7"
                  required
                />
              </Field>

              <Field label="Ikona">
                <select
                  value={editing.icon}
                  onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                  className="input"
                >
                  {iconOptions.map((o) => (
                    <option key={o.slug} value={o.slug}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Usta ismi *">
                <input
                  type="text"
                  value={editing.masterName}
                  onChange={(e) => setEditing({ ...editing, masterName: e.target.value })}
                  className="input"
                  placeholder="Sardor Karimov"
                  required
                />
              </Field>

              <Field label="Telefon *">
                <input
                  type="tel"
                  value={editing.phone}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                  className="input"
                  placeholder="+998901234567"
                  required
                />
              </Field>

              <Field label="Manzil *">
                <input
                  type="text"
                  value={editing.address}
                  onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                  className="input"
                  placeholder="Toshkent, Chilonzor tumani..."
                  required
                />
              </Field>

              <Field label="Tavsif (ihtiyoriy)">
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="input resize-none"
                />
              </Field>

              <Field label="Rasm (ihtiyoriy)">
                {editing.image ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
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
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-500 hover:bg-gray-50"
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
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
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
