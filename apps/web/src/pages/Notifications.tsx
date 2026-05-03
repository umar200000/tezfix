import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useStore } from '../hooks/useStore';
import { useT } from '../utils/i18n';
import { Bell, ChevronLeft, RefreshCw, Loader2 } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  body: string;
  audience: 'all' | 'masters' | 'clients';
  createdAt: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { activeRole } = useStore();
  const t = useT();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const audience = activeRole === 'master' ? 'masters' : 'clients';
      const data = await api.get<Notification[]>(`/notifications?audience=${audience}`);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return t('common.now');
    if (diffMin < 60) return `${diffMin} ${t('common.minutesAgo')}`;
    if (diffHr < 24) return `${diffHr} ${t('common.hoursAgo')}`;
    if (diffDay < 7) return `${diffDay} ${t('common.daysAgo')}`;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="ios-nav-bar">
        <div className="flex items-center justify-between h-12 px-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-0.5 text-primary-500 pl-1 active:opacity-60 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.4} />
            <span className="text-ios-body">{t('common.back')}</span>
          </button>
          <h1 className="text-ios-headline text-primary-700">{t('notif.title')}</h1>
          <button
            onClick={load}
            disabled={refreshing}
            className="flex items-center justify-center w-9 h-9 active:opacity-60 transition-opacity disabled:opacity-30"
            aria-label={t('common.refresh')}
          >
            {refreshing ? (
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5 text-primary-500" />
            )}
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-ios-xl p-4 shadow-ios-card">
                <div className="skeleton h-4 w-2/3 mb-2" />
                <div className="skeleton h-3 w-full" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 bg-primary-500/15 rounded-full blur-2xl" />
              <div className="relative w-20 h-20 bg-white rounded-full shadow-ios-card flex items-center justify-center">
                <Bell className="w-9 h-9 text-primary-500" strokeWidth={1.8} />
              </div>
            </div>
            <h3 className="text-ios-title-3 text-surface-900 mb-2">{t('notif.empty')}</h3>
            <p className="text-ios-subhead text-surface-600 max-w-xs mx-auto">
              {t('notif.empty.sub')}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((n) => (
              <div key={n.id} className="bg-white rounded-ios-xl p-4 shadow-ios-card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-ios bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-primary-500" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-ios-headline text-surface-900">{n.title}</h3>
                    <p className="text-ios-footnote text-surface-700 mt-1 leading-relaxed whitespace-pre-line">
                      {n.body}
                    </p>
                    <p className="text-ios-caption text-surface-500 mt-2">
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
