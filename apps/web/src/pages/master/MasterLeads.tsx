import { useEffect, useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { api } from '../../utils/api';
import { Inbox, Phone, Clock, ChevronRight } from 'lucide-react';

interface Lead {
  id: number;
  status: string;
  createdAt: string;
  client: { id: number; name: string; phone: string; avatar: string | null };
  service: { id: number; name: string };
}

type Filter = 'all' | 'new' | 'contacted';

export default function MasterLeads() {
  const { user } = useStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (!user) return;
    api
      .get<Lead[]>(`/leads/master/${user.id}`)
      .then(setLeads)
      .finally(() => setLoading(false));
  }, [user]);

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return 'Hozir';
    if (diffMin < 60) return `${diffMin} daqiqa oldin`;
    if (diffHr < 24) return `${diffHr} soat oldin`;
    if (diffDay < 7) return `${diffDay} kun oldin`;
    return d.toLocaleDateString('uz', { day: 'numeric', month: 'short' });
  };

  const filtered = leads.filter((l) => {
    if (filter === 'all') return true;
    return l.status === filter;
  });

  const newCount = leads.filter((l) => l.status === 'new').length;

  return (
    <div className="page-container">
      <div className="px-4 pt-12 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="ios-large-title">So'rovlar</h1>
            <p className="text-ios-subhead text-surface-600 mt-0.5">
              {leads.length} ta mijoz murojaati
            </p>
          </div>
          {newCount > 0 && (
            <div className="flex items-center gap-1.5 bg-danger-50 text-danger-500 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-danger-500 animate-pulse" />
              <span className="text-ios-footnote font-bold">{newCount} yangi</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter segmented */}
      <div className="px-4 mb-3">
        <div className="ios-segmented w-full flex">
          {(['all', 'new', 'contacted'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`ios-segmented-item flex-1 ${
                filter === f ? 'ios-segmented-item-active' : ''
              }`}
            >
              {f === 'all' ? 'Barchasi' : f === 'new' ? 'Yangi' : "Bog'landi"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-ios-xl p-4 shadow-ios-card">
                <div className="flex gap-3">
                  <div className="skeleton w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-3 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="absolute inset-0 bg-primary-500/15 rounded-full blur-2xl" />
              <div className="relative w-24 h-24 bg-white rounded-full shadow-ios-card flex items-center justify-center">
                <Inbox className="w-11 h-11 text-primary-500" strokeWidth={1.8} />
              </div>
            </div>
            <h3 className="text-ios-title-3 text-surface-900 mb-2">Murojaat yo'q</h3>
            <p className="text-ios-subhead text-surface-600 max-w-xs mx-auto">
              Mijozlar sizga murojaat qilganda shu yerda ko'rinadi
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-ios-xl shadow-ios-card overflow-hidden active:scale-[0.99] transition-transform"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {lead.client.name.charAt(0)}
                        </span>
                      </div>
                      {lead.status === 'new' && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-danger-500 border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-ios-headline text-surface-900 truncate flex-1">
                          {lead.client.name}
                        </h3>
                        <span
                          className={`ios-chip !py-0.5 !px-2.5 !text-[11px] ${
                            lead.status === 'new' ? 'bg-primary-50 text-primary-600' : 'chip-mint'
                          }`}
                        >
                          {lead.status === 'new' ? 'Yangi' : "Bog'landi"}
                        </span>
                      </div>
                      <a
                        href={`tel:${lead.client.phone}`}
                        className="text-ios-footnote text-primary-500 font-medium flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" strokeWidth={2.2} />
                        {lead.client.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-separator/30">
                    <p className="text-ios-caption text-surface-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" strokeWidth={2.2} />
                      {formatDate(lead.createdAt)}
                    </p>
                    <p className="text-ios-caption text-surface-600 font-medium truncate max-w-[50%]">
                      {lead.service.name}
                    </p>
                  </div>
                </div>
                <a
                  href={`tel:${lead.client.phone}`}
                  className="flex items-center justify-center gap-1.5 py-3 border-t border-separator/30 text-ios-subhead font-semibold text-primary-500 active:bg-primary-50 transition-colors"
                >
                  <Phone className="w-4 h-4" strokeWidth={2} />
                  Qo'ng'iroq qilish
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
