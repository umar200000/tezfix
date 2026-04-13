import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { PhoneCall, Search, Clock } from 'lucide-react';

interface Lead {
  id: number;
  status: string;
  createdAt: string;
  client: { id: number; name: string; phone: string };
  service: { id: number; name: string };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get all services first, then get leads for each
    api.get<any[]>('/services').then(async (services) => {
      const allLeads: Lead[] = [];
      for (const s of services) {
        try {
          const serviceLeads = await api.get<Lead[]>(`/leads/service/${s.id}`);
          allLeads.push(...serviceLeads.map((l) => ({ ...l, service: { id: s.id, name: s.name } })));
        } catch {}
      }
      allLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLeads(allLeads);
      setLoading(false);
    });
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString('uz', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Leadlar</h1>
          <p className="text-gray-500 text-sm mt-1">Mijozlarning qo'ng'iroqlari</p>
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
            <p className="text-gray-400">Hali leadlar yo'q</p>
            <p className="text-sm text-gray-300 mt-1">Mijozlar ustaxonalarga qo'ng'iroq qilganda bu yerda ko'rinadi</p>
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-gray-400">#{lead.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                        <span className="text-green-600 font-semibold text-xs">{lead.client.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-sm">{lead.client.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{lead.client.phone}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{lead.service.name}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      lead.status === 'new'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-green-50 text-green-700'
                    }`}>
                      {lead.status === 'new' ? 'Yangi' : 'Bog\'landi'}
                    </span>
                  </td>
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
