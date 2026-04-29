import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Users, Search, UserCheck, User, Trash2 } from 'lucide-react';

interface UserData {
  id: number;
  telegramId: string;
  role: string | null;
  name: string;
  phone: string | null;
  username: string | null;
  photoUrl: string | null;
  avatar: string | null;
  isMaster: boolean;
  isClient: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'master' | 'client'>('all');

  const load = () => api.get<UserData[]>('/users').then(setUsers);
  useEffect(() => {
    load();
  }, []);

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      u.name.toLowerCase().includes(term) ||
      (u.phone || '').includes(search) ||
      (u.username || '').toLowerCase().includes(term);
    const matchRole =
      filter === 'all' ||
      (filter === 'master' && u.isMaster) ||
      (filter === 'client' && u.isClient);
    return matchSearch && matchRole;
  });

  const deleteUser = async (id: number) => {
    if (!confirm("Foydalanuvchini va uning barcha xizmatlarini o'chirilsinmi?")) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err: any) {
      alert(err?.message || "O'chirib bo'lmadi");
    }
  };

  const roleBadge = (u: UserData) => {
    const parts: { label: string; cls: string; icon: any }[] = [];
    if (u.isMaster) parts.push({ label: 'Usta', cls: 'bg-blue-50 text-blue-700', icon: UserCheck });
    if (u.isClient) parts.push({ label: 'Mijoz', cls: 'bg-green-50 text-green-700', icon: User });
    if (parts.length === 0) parts.push({ label: '—', cls: 'bg-gray-100 text-gray-500', icon: User });
    return (
      <div className="flex flex-wrap gap-1">
        {parts.map((p, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${p.cls}`}
          >
            <p.icon className="w-3 h-3" />
            {p.label}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
          <p className="text-gray-500 text-sm mt-1">Jami: {users.length} ta</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-50 outline-none"
          />
        </div>
        <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
          {(['all', 'master', 'client'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                filter === f ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Barchasi' : f === 'master' ? 'Ustalar' : 'Mijozlar'}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Foydalanuvchi</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Telefon</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Username</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Rollar</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Sana</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {user.photoUrl || user.avatar ? (
                      <img
                        src={user.photoUrl || user.avatar || ''}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 font-semibold text-sm">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="font-medium text-sm">{user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{user.phone || '—'}</td>
                <td className="px-5 py-3.5 text-sm text-gray-500">
                  {user.username ? `@${user.username}` : '—'}
                </td>
                <td className="px-5 py-3.5">{roleBadge(user)}</td>
                <td className="px-5 py-3.5 text-sm text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('uz')}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Foydalanuvchilar topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}
