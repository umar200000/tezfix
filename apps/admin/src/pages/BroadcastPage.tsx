import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Send, Loader2, CheckCircle2, AlertCircle, Users } from 'lucide-react';

type Audience = 'all' | 'masters' | 'clients';

interface Counts {
  all: number;
  masters: number;
  clients: number;
}

export default function BroadcastPage() {
  const [audience, setAudience] = useState<Audience>('all');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Counts>({ all: 0, masters: 0, clients: 0 });

  useEffect(() => {
    api
      .get<Counts>('/broadcast/audience-counts')
      .then(setCounts)
      .catch(() => {});
  }, []);

  const send = async () => {
    if (!message.trim()) return;
    if (!confirm(`Bu xabar ${counts[audience]} kishiga yuboriladi. Davom etilsinmi?`)) return;
    setError(null);
    setResult(null);
    setSending(true);
    try {
      const res = await api.post<{ total: number; sent: number; failed: number }>(
        '/broadcast',
        { message: message.trim(), audience }
      );
      setResult({ total: res.total, sent: res.sent, failed: res.failed });
    } catch (err: any) {
      setError(err?.message || 'Xato');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Xabar yuborish</h1>
        <p className="text-gray-500 text-sm mt-1">
          Telegram bot orqali foydalanuvchilarga ommaviy xabar yuborish
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <AudienceCard
          label="Hammaga"
          count={counts.all}
          selected={audience === 'all'}
          onClick={() => setAudience('all')}
        />
        <AudienceCard
          label="Ustalarga"
          count={counts.masters}
          selected={audience === 'masters'}
          onClick={() => setAudience('masters')}
        />
        <AudienceCard
          label="Mijozlarga"
          count={counts.clients}
          selected={audience === 'clients'}
          onClick={() => setAudience('clients')}
        />
      </div>

      <div className="stat-card">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Xabar matni
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Xabar matnini kiriting..."
          className="input resize-none"
        />
        <p className="text-xs text-gray-500 mt-1.5">
          {message.trim().length} belgi
        </p>

        {error && (
          <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {result && (
          <div className="mt-3 flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Yuborildi</p>
              <p className="text-green-700">
                Jami: {result.total}, Muvaffaqiyatli: {result.sent}, Xato: {result.failed}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={send}
            disabled={sending || !message.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Yuborish ({counts[audience]} kishi)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AudienceCard({
  label,
  count,
  selected,
  onClick,
}: {
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`stat-card text-left transition-all ${
        selected
          ? 'border-primary-500 ring-2 ring-primary-200'
          : 'hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold mt-1">{count}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          selected ? 'bg-primary-500' : 'bg-gray-100'
        }`}>
          <Users className={`w-5 h-5 ${selected ? 'text-white' : 'text-gray-500'}`} />
        </div>
      </div>
    </button>
  );
}
