import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { api } from '../../utils/api';
import { playNotificationBeep } from '../../utils/sound';
import { tgHaptic } from '../../utils/telegram';
import { Inbox, Phone, Clock, Send, RefreshCw, BellRing, Loader2 } from 'lucide-react';

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
    avatar: string | null;
  };
  service: { id: number; name: string };
}

const POLL_MS = 3000;
const HIGHLIGHT_MS = 6000;
const TOAST_MS = 4500;

export default function MasterLeads() {
  const { user } = useStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newLeadIds, setNewLeadIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const seenIdsRef = useRef<Set<number>>(new Set());
  const initializedRef = useRef(false);

  const fetchLeads = useCallback(
    async (silent = false) => {
      if (!user) return;
      if (!silent) setRefreshing(true);
      try {
        const data = await api.get<Lead[]>(`/leads/master/${user.id}`);
        setLeads(data);
        const currentIds = new Set(data.map((l) => l.id));
        if (initializedRef.current) {
          const fresh = data.filter((l) => !seenIdsRef.current.has(l.id));
          if (fresh.length > 0) {
            const newest = fresh[0];
            setToast(`Yangi so'rov: ${newest.client.name}`);
            playNotificationBeep();
            tgHaptic('success');
            setNewLeadIds((prev) => {
              const next = new Set(prev);
              fresh.forEach((l) => next.add(l.id));
              return next;
            });
            window.setTimeout(() => {
              setNewLeadIds((prev) => {
                const next = new Set(prev);
                fresh.forEach((l) => next.delete(l.id));
                return next;
              });
            }, HIGHLIGHT_MS);
            window.setTimeout(() => setToast(null), TOAST_MS);
          }
        }
        seenIdsRef.current = currentIds;
        initializedRef.current = true;
      } catch {
        /* swallow polling errors */
      } finally {
        setLoading(false);
        if (!silent) setRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!user) return;
    fetchLeads();
    const id = window.setInterval(() => fetchLeads(true), POLL_MS);
    return () => window.clearInterval(id);
  }, [user, fetchLeads]);

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

  return (
    <div className="page-container">
      {/* Floating toast for new leads */}
      {toast && (
        <div className="fixed top-3 left-3 right-3 z-[60] flex justify-center pointer-events-none animate-fade-up">
          <div className="bg-primary-500 text-white shadow-ios-elevated rounded-ios-lg px-4 py-3 flex items-center gap-3 max-w-md">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
              <BellRing className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ios-footnote text-white/80 leading-tight">Yangi so'rov</p>
              <p className="text-ios-headline text-white truncate">{toast.replace(/^Yangi so'rov:\s*/, '')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-12 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="ios-large-title">So'rovlar</h1>
            <p className="text-ios-subhead text-surface-600 mt-0.5">
              Sizga qiziqish bildirgan mijozlar
            </p>
          </div>
          <div className="flex items-center gap-2">
            {leads.length > 0 && (
              <div className="flex items-center gap-1.5 bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full">
                <span className="text-ios-footnote font-bold">{leads.length}</span>
              </div>
            )}
            <button
              onClick={() => fetchLeads()}
              disabled={refreshing}
              className="w-10 h-10 rounded-full bg-white shadow-ios-card flex items-center justify-center active:scale-95 transition-transform disabled:opacity-60"
              aria-label="Yangilash"
            >
              {refreshing ? (
                <Loader2 className="w-5 h-5 text-primary-600 animate-spin" strokeWidth={2.2} />
              ) : (
                <RefreshCw className="w-5 h-5 text-primary-600" strokeWidth={2.2} />
              )}
            </button>
          </div>
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
        ) : leads.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="absolute inset-0 bg-primary-500/15 rounded-full blur-2xl" />
              <div className="relative w-24 h-24 bg-white rounded-full shadow-ios-card flex items-center justify-center">
                <Inbox className="w-11 h-11 text-primary-500" strokeWidth={1.8} />
              </div>
            </div>
            <h3 className="text-ios-title-3 text-surface-900 mb-2">Hali so'rovlar yo'q</h3>
            <p className="text-ios-subhead text-surface-600 max-w-xs mx-auto">
              Mijozlar sizga qiziqish bildirganda shu yerda ko'rinadi
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {leads.map((lead) => {
              const phone = lead.client.phone;
              const username = lead.client.username
                ? lead.client.username.replace(/^@/, '')
                : null;
              const isNew = newLeadIds.has(lead.id);
              return (
                <div
                  key={lead.id}
                  className={`bg-white rounded-ios-xl shadow-ios-card overflow-hidden ${
                    isNew ? 'lead-new ring-2 ring-primary-400/60' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {lead.client.photoUrl || lead.client.avatar ? (
                        <img
                          src={lead.client.photoUrl || lead.client.avatar || ''}
                          alt={lead.client.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold">
                            {lead.client.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-ios-headline text-surface-900 truncate">
                            {lead.client.name}
                          </h3>
                          {isNew && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-500 text-white px-1.5 py-0.5 rounded">
                              Yangi
                            </span>
                          )}
                        </div>
                        {username && (
                          <p className="text-ios-footnote text-surface-500">@{username}</p>
                        )}
                        {phone && (
                          <p className="text-ios-footnote text-primary-500 font-medium flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" strokeWidth={2.2} />
                            {phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-separator/30">
                      <p className="text-ios-caption text-surface-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" strokeWidth={2.2} />
                        {formatDate(lead.createdAt)}
                      </p>
                      <p className="text-ios-caption text-surface-600 font-medium truncate max-w-[55%]">
                        {lead.service.name}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 border-t border-separator/30 divide-x divide-separator/30">
                    <a
                      href={phone ? `tel:${phone}` : undefined}
                      aria-disabled={!phone}
                      className={`flex items-center justify-center gap-1.5 py-3 text-ios-subhead font-semibold transition-colors ${
                        phone
                          ? 'text-primary-500 active:bg-primary-50'
                          : 'text-surface-400 pointer-events-none'
                      }`}
                    >
                      <Phone className="w-4 h-4" strokeWidth={2} />
                      Qo'ng'iroq
                    </a>
                    <a
                      href={username ? `https://t.me/${username}` : undefined}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={!username}
                      className={`flex items-center justify-center gap-1.5 py-3 text-ios-subhead font-semibold transition-colors ${
                        username
                          ? 'text-primary-500 active:bg-primary-50'
                          : 'text-surface-400 pointer-events-none'
                      }`}
                    >
                      <Send className="w-4 h-4" strokeWidth={2} />
                      Telegram
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
