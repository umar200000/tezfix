import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Users, Store, PhoneCall, UserCheck, TrendingUp } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalMasters: number;
  totalClients: number;
  totalServices: number;
  totalLeads: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>('/users/stats').then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: 'Jami foydalanuvchilar', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600', iconBg: 'bg-blue-100' },
    { label: 'Ustalar', value: stats.totalMasters, icon: UserCheck, color: 'bg-green-50 text-green-600', iconBg: 'bg-green-100' },
    { label: 'Mijozlar', value: stats.totalClients, icon: Users, color: 'bg-purple-50 text-purple-600', iconBg: 'bg-purple-100' },
    { label: 'Xizmatlar', value: stats.totalServices, icon: Store, color: 'bg-orange-50 text-orange-600', iconBg: 'bg-orange-100' },
    { label: 'Jami leadlar', value: stats.totalLeads, icon: PhoneCall, color: 'bg-red-50 text-red-600', iconBg: 'bg-red-100' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">TezFix platformasi statistikasi</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.color.split(' ')[1]}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity summary */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          <h2 className="font-semibold text-lg">Platforma holati</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 font-medium">Faol xizmatlar</p>
            <p className="text-2xl font-bold text-green-800 mt-1">{stats.totalServices}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">Konversiya</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">
              {stats.totalUsers > 0 ? Math.round((stats.totalLeads / stats.totalUsers) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
