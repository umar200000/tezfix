import { useEffect, useState } from 'react';
import { useStore, type User } from '../hooks/useStore';
import { api } from '../utils/api';
import {
  canRequestContact,
  getInitData,
  getInitUser,
  isInTelegram,
  requestContactPayload,
  tgHaptic,
  tgReady,
} from '../utils/telegram';
import { Phone, Loader2, ShieldCheck, Lock, ChevronLeft, AlertCircle } from 'lucide-react';

export default function ContactShare() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setActiveRole, setOnboarded } = useStore();

  useEffect(() => {
    tgReady();
  }, []);

  const role = (localStorage.getItem('tezfix-role') as 'master' | 'client') || 'client';

  const handleBack = () => {
    setOnboarded(false);
    localStorage.removeItem('tezfix-role');
  };

  const finishLogin = (user: User) => {
    setUser(user);
    setActiveRole(role);
    tgHaptic('success');
  };

  const handleShareContact = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!isInTelegram()) {
        setError("Iltimos, ilovani Telegram bot orqali oching.");
        tgHaptic('error');
        return;
      }
      if (!canRequestContact()) {
        setError("Telegram ilovangizni yangilang — kontakt ulashish qo'llab-quvvatlanmaydi.");
        tgHaptic('error');
        return;
      }

      // 1) Trigger Telegram's native "Share contact" popup
      const payload = await requestContactPayload();
      if (!payload) {
        setError("Kontakt ulashilmadi. Iltimos qayta urinib ko'ring.");
        return;
      }

      // 2) One-shot login: verify signed payload server-side, upsert user, set role
      const initData = getInitData();
      const tgUser = getInitUser();
      const res = await api.post<{ user: User }>('/auth/contact-login', {
        contactPayload: payload,
        role,
        initData: initData || undefined,
        // for clients on older API where requestContact returns nothing signed,
        // we still pass initDataUnsafe.user as a hint (server only trusts signed data)
        ...(tgUser ? {} : {}),
      });

      finishLogin(res.user);
    } catch (e: any) {
      setError(e?.message || 'Xatolik yuz berdi');
      tgHaptic('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col safe-top">
      {/* Top bar with back button */}
      <div className="flex items-center px-2 pt-3">
        <button
          onClick={handleBack}
          className="flex items-center gap-0.5 text-primary-500 pl-1 active:opacity-60 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2.4} />
          <span className="text-ios-body">Orqaga</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        {/* Hero icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-ios-xl bg-primary-500 flex items-center justify-center shadow-ios-elevated">
            <Phone className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
        </div>

        <h1 className="text-ios-title-1 text-primary-700 text-center mb-3">
          Kontaktni ulashing
        </h1>
        <p className="text-ios-body text-surface-600 text-center max-w-xs mb-8">
          {role === 'master'
            ? "Usta sifatida ro'yxatdan o'tish uchun Telegram kontaktingizni ulashing"
            : "Mijoz sifatida ro'yxatdan o'tish uchun Telegram kontaktingizni ulashing"}
        </p>

        {/* Trust features */}
        <div className="w-full max-w-sm bg-white rounded-ios-lg overflow-hidden shadow-ios-card mb-6">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-separator">
            <div className="w-9 h-9 rounded-ios bg-mint-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-mint-600" />
            </div>
            <div className="flex-1">
              <p className="text-ios-subhead text-primary-700 font-semibold">Xavfsiz</p>
              <p className="text-ios-caption text-surface-600">Ma'lumotlar himoyalangan</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-ios bg-primary-50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-ios-subhead text-primary-700 font-semibold">Maxfiy</p>
              <p className="text-ios-caption text-surface-600">Hech kimga ulashilmaydi</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="w-full max-w-sm mb-3 px-3 py-2.5 rounded-ios bg-danger-50 text-danger-600 text-ios-footnote flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2.2} />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleShareContact}
          disabled={loading}
          className="ios-btn-primary w-full max-w-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Yuklanmoqda...
            </>
          ) : (
            <>
              <Phone className="w-5 h-5" />
              Kontaktni ulashish
            </>
          )}
        </button>
      </div>
    </div>
  );
}
