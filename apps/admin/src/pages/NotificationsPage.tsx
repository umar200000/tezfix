import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Plus, Edit3, Trash2, Loader2, X, Check, Bell, Send } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  body: string;
  audience: 'all' | 'masters' | 'clients';
  isActive: boolean;
  sentToBot: boolean;
  createdAt: string;
}

interface Form {
  id?: number;
  title: string;
  body: string;
  audience: 'all' | 'masters' | 'clients';
  isActive: boolean;
  sendToBot: boolean;
}

const empty: Form = {
  title: '',
  body: '',
  audience: 'all',
  isActive: true,
  sendToBot: true,
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [delivery, setDelivery] = useState<{ sent: number; failed: number } | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get<Notification[]>('/notifications/all')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startCreate = () => {
    setDelivery(null);
    setEditing({ ...empty });
  };

  const startEdit = (n: Notification) => {
    setDelivery(null);
    setEditing({
      id: n.id,
      title: n.title,
      body: n.body,
      audience: n.audience,
      isActive: n.isActive,
      sendToBot: false,
    });
  };

  const close = () => {
    setEditing(null);
    setDelivery(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.title.trim() || !editing.body.trim()) return;
    setSaving(true);
    setDelivery(null);
    try {
      const body = {
        title: editing.title.trim(),
        body: editing.body.trim(),
        audience: editing.audience,
        isActive: editing.isActive,
        sendToBot: editing.sendToBot,
      };
      if (editing.id) {
        await api.put<Notification>(`/notifications/${editing.id}`, body);
        close();
        load();
      } else {
        const res = await api.post<{
          item: Notification;
          delivery: { sent: number; failed: number } | null;
        }>('/notifications', body);
        if (res.delivery) {
          setDelivery(res.delivery);
        } else {
          close();
        }
        load();
      }
    } catch (err: any) {
      alert(err?.message || 'Xato');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Ushbu bildirishnomani o'chirilsinmi?")) return;
    await api.delete(`/notifications/${id}`);
    load();
  };

  const audienceLabel = (a: string) =>
    a === 'masters' ? 'Ustalar' : a === 'clients' ? 'Mijozlar' : 'Hammaga';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bildirishnomalar</h1>
          <p className="text-gray-500 text-sm mt-1">
            Mini app va Telegram bot orqali yuboriladigan xabarlar
          </p>
        </div>
        <button onClick={startCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          Yangi bildirishnoma
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="stat-card text-center py-12">
          <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-gray-500">Hali bildirishnomalar yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div key={n.id} className="stat-card">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{n.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {audienceLabel(n.audience)}
                    </span>
                    {!n.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        Nofaol
                      </span>
                    )}
                    {n.sentToBot && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 inline-flex items-center gap-1">
                        <Send className="w-3 h-3" /> Botga yuborilgan
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(n)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(n.id)}
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
                {editing.id ? 'Bildirishnomani tahrirlash' : 'Yangi bildirishnoma'}
              </h2>
              <button type="button" onClick={close} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {delivery && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-green-800">Bot orqali yuborildi</p>
                  <p className="text-green-700 mt-0.5">
                    Yuborildi: {delivery.sent}, Xato: {delivery.failed}
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="text-green-700 underline text-xs mt-2"
                  >
                    Yopish
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sarlavha *</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Matn *</label>
                <textarea
                  value={editing.body}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  rows={5}
                  className="input resize-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Kimlarga
                  </label>
                  <select
                    value={editing.audience}
                    onChange={(e) =>
                      setEditing({ ...editing, audience: e.target.value as Form['audience'] })
                    }
                    className="input"
                  >
                    <option value="all">Hammaga</option>
                    <option value="masters">Ustalarga</option>
                    <option value="clients">Mijozlarga</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Holati</label>
                  <label className="flex items-center gap-2 h-10">
                    <input
                      type="checkbox"
                      checked={editing.isActive}
                      onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Faol</span>
                  </label>
                </div>
              </div>

              {!editing.id && (
                <label className="flex items-center gap-2 bg-primary-50 px-3 py-2.5 rounded-lg">
                  <input
                    type="checkbox"
                    checked={editing.sendToBot}
                    onChange={(e) => setEditing({ ...editing, sendToBot: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-primary-700 font-medium">
                    Telegram bot orqali ham yuborilsin
                  </span>
                </label>
              )}
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
