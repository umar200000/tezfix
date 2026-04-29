import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { PhoneCall, Clock } from 'lucide-react';

interface Lead {
  id: number;
  status: string;
  createdAt: string;
  client: {
    id: number;
    name: string;
    phone: string | null;
    username: string | null;
    photoUrl: string | null;
  };
  service: { id: number; name: string };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Lead[]>('/leads/all')
      .then(setLeads)
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString('uz', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">So'rovlar</h1>
          <p className="text-gray-500 text-sm mt-1">Mijozlarning qiziqishlari</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="table-container">
          <div className="text-center py-16">
            <PhoneCall className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">Hali so'rovlar yo'q</p>
            <p className="text-sm text-gray-300 mt-1">
              Mijozlar qiziqish bildirganda bu yerda ko'rinadi
            </p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Mijoz</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Telefon</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Ustaxona</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-gray-400">#{lead.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {lead.client.photoUrl ? (
                        <img
                          src={lead.client.photoUrl}
                          alt={lead.client.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                          <span className="text-green-600 font-semibold text-xs">
                            {lead.client.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{lead.client.name}</p>
                        {lead.client.username && (
                          <p className="text-xs text-gray-400">@{lead.client.username}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {lead.client.phone || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{lead.service.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(lead.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
