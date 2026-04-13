import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Users, Search, UserCheck, User } from 'lucide-react';

interface UserData {
  id: number;
  role: string;
  name: string;
  phone: string;
  username: string;
  avatar: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'master' | 'client'>('all');

  useEffect(() => {
    api.get<UserData[]>('/users').then(setUsers);
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) || u.username.toLowerCase().includes(search.toLowerCase());
    const matchRole = filter === 'all' || u.role === filter;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
          <p className="text-gray-500 text-sm mt-1">Jami: {users.length} ta</p>
        </div>
      </div>

      {/* Filters */}
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

      {/* Table */}
      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Foydalanuvchi</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Telefon</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Username</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Rol</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Sana</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-700 font-semibold text-sm">{user.name.charAt(0)}</span>
                    </div>
                    <span className="font-medium text-sm">{user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{user.phone}</td>
                <td className="px-5 py-3.5 text-sm text-gray-500">{user.username}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    user.role === 'master'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {user.role === 'master' ? <UserCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {user.role === 'master' ? 'Usta' : 'Mijoz'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('uz')}
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
