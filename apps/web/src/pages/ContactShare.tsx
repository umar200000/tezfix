import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { api } from '../utils/api';
import { Phone, Loader2, ShieldCheck, Lock } from 'lucide-react';

export default function ContactShare() {
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();

  const handleShareContact = async () => {
    setLoading(true);
    try {
      const role = localStorage.getItem('tezfix-role') || 'client';
      const res = await api.post<{ user: any }>('/auth/mock-contact', { role });
      setUser(res.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col safe-top">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Hero icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-ios-xl bg-primary-500 flex items-center justify-center shadow-ios-elevated">
            <Phone className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
        </div>

        <h1 className="text-ios-title-1 text-primary-700 text-center mb-3">
          Kontaktni ulashing
        </h1>
        <p className="text-ios-body text-surface-600 text-center max-w-xs mb-10">
          Ro'yxatdan o'tish uchun kontakt ma'lumotlaringizni tasdiqlang
        </p>

        {/* Trust features */}
        <div className="w-full max-w-sm bg-white rounded-ios-lg overflow-hidden shadow-ios-card mb-8">
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

        <p className="text-ios-caption text-surface-500 mt-4 text-center max-w-xs">
          Demo rejim — random foydalanuvchi yaratiladi
        </p>
      </div>
    </div>
  );
}
