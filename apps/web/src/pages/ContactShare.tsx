import { useEffect, useState } from 'react';
import { useStore, type User } from '../hooks/useStore';
import { api } from '../utils/api';
import {
  getInitData,
  getInitUser,
  isInTelegram,
  requestContactPayload,
  tgHaptic,
  tgReady,
} from '../utils/telegram';
import { Phone, Loader2, ShieldCheck, Lock, ChevronLeft } from 'lucide-react';

export default function ContactShare() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDevForm, setShowDevForm] = useState(false);
  const [devName, setDevName] = useState('');
  const [devPhone, setDevPhone] = useState('+998');
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
      if (isInTelegram()) {
        // 1) Authenticate via initData → creates/finds user by telegramId
        const initData = getInitData();
        const tgUser = getInitUser();
        const authRes = await api.post<{ user: User }>('/auth/telegram', {
          initData,
          role,
          devUser: tgUser ? { id: tgUser.id, first_name: tgUser.first_name, last_name: tgUser.last_name, username: tgUser.username, photo_url: tgUser.photo_url } : undefined,
        });
        let user = authRes.user;

        // 2) If user already has phone (returning user), skip contact request
        if (user.phone) {
          finishLogin(user);
          return;
        }

        // 3) Otherwise request phone via Telegram popup
        const payload = await requestContactPayload();
        if (payload) {
          const contactRes = await api.post<{ user: User }>('/auth/share-contact', {
            userId: user.id,
            contactPayload: payload,
          });
          user = contactRes.user;
        }
        // Even if user declined contact, we still proceed — phone can be filled later from profile.
        finishLogin(user);
      } else {
        // Dev mode (browser, no Telegram WebApp)
        setShowDevForm(true);
      }
    } catch (e: any) {
      setError(e?.message || 'Xatolik yuz berdi');
      tgHaptic('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDevSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devName || devPhone.length < 9) {
      setError("Ism va to'g'ri telefon kiriting");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const cleanPhone = devPhone.startsWith('+') ? devPhone : '+' + devPhone;
      // Persistent dev telegramId so refreshing doesn't create a new user
      const stored = localStorage.getItem('tezfix-dev-tgid');
      const devTgId = stored || `dev_${cleanPhone.replace(/\D/g, '')}_${Math.floor(Math.random() * 1e6)}`;
      if (!stored) localStorage.setItem('tezfix-dev-tgid', devTgId);

      const [first, ...rest] = devName.trim().split(' ');
      const last = rest.join(' ');

      const authRes = await api.post<{ user: User }>('/auth/telegram', {
        role,
        devUser: { id: devTgId, first_name: first, last_name: last || undefined },
      });
      let user = authRes.user;

      if (!user.phone) {
        const contactRes = await api.post<{ user: User }>('/auth/share-contact', {
          userId: user.id,
          devPhone: cleanPhone,
          devFirstName: first,
          devLastName: last || undefined,
        });
        user = contactRes.user;
      }
      finishLogin(user);
    } catch (e: any) {
      setError(e?.message || 'Xatolik yuz berdi');
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
            ? "Usta sifatida ro'yxatdan o'tish uchun kontakt ma'lumotlaringizni tasdiqlang"
            : "Mijoz sifatida ro'yxatdan o'tish uchun kontakt ma'lumotlaringizni tasdiqlang"}
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
          <div className="w-full max-w-sm mb-3 px-3 py-2 rounded-ios bg-danger-50 text-danger-600 text-ios-footnote">
            {error}
          </div>
        )}

        {!showDevForm ? (
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
        ) : (
          <form onSubmit={handleDevSubmit} className="w-full max-w-sm space-y-3">
            <div className="text-ios-caption text-surface-500 text-center mb-1">
              Brauzer rejimi — sinov uchun
            </div>
            <div className="field-card">
              <p className="field-label text-surface-500">Ism Familiya</p>
              <input
                type="text"
                value={devName}
                onChange={(e) => setDevName(e.target.value)}
                placeholder="Aziz Karimov"
                className="w-full bg-transparent text-ios-body text-primary-700 placeholder:text-surface-400 outline-none font-medium"
                required
              />
            </div>
            <div className="field-card">
              <p className="field-label text-surface-500">Telefon</p>
              <input
                type="tel"
                value={devPhone}
                onChange={(e) => setDevPhone(e.target.value)}
                placeholder="+998901234567"
                className="w-full bg-transparent text-ios-body text-primary-700 placeholder:text-surface-400 outline-none font-medium"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="ios-btn-primary w-full">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Davom etish'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
