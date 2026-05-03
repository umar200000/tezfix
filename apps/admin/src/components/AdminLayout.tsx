import { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  PhoneCall,
  Wrench,
  Image as ImageIcon,
  Zap,
  Key,
  Check,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { api, getAdminToken, setAdminToken } from '../utils/api';

const sidebarLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Foydalanuvchilar' },
  { to: '/services', icon: Store, label: 'Xizmatlar' },
  { to: '/leads', icon: PhoneCall, label: "So'rovlar" },
  { to: '/banners', icon: ImageIcon, label: 'Bannerlar' },
  { to: '/quick-services', icon: Zap, label: 'Tez xizmatlar' },
];

export default function AdminLayout() {
  const [tokenInput, setTokenInput] = useState(getAdminToken());
  const [authStatus, setAuthStatus] = useState<'unknown' | 'ok' | 'bad'>('unknown');
  const [verifying, setVerifying] = useState(false);
  const [tokenSavedToast, setTokenSavedToast] = useState(false);

  // Verify token on mount and whenever it changes
  const verifyToken = async () => {
    if (!getAdminToken()) {
      setAuthStatus('bad');
      return;
    }
    setVerifying(true);
    try {
      // /banners/all is admin-protected
      await api.get('/banners/all');
      setAuthStatus('ok');
    } catch {
      setAuthStatus('bad');
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveToken = async () => {
    setAdminToken(tokenInput.trim());
    setTokenSavedToast(true);
    window.setTimeout(() => setTokenSavedToast(false), 1500);
    await verifyToken();
  };

  // Token gate: if no valid token, lock the screen with a setup card.
  if (authStatus !== 'ok') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-primary-50 to-gray-50">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-7">
          <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">TezFix Admin</h1>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Davom etish uchun admin tokenni kiriting.
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin token</label>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="ADMIN_TOKEN"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveToken();
            }}
            className="input"
          />

          {authStatus === 'bad' && getAdminToken() && (
            <p className="text-xs text-red-600 mt-2">Token noto'g'ri. Qayta kiriting.</p>
          )}

          <button
            onClick={handleSaveToken}
            disabled={verifying || !tokenInput.trim()}
            className="btn-primary w-full mt-4 disabled:opacity-50"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Tekshirilmoqda...
              </>
            ) : tokenSavedToast ? (
              <>
                <Check className="w-4 h-4" />
                Saqlandi
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                Kirish
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 mt-4">
            Token <code>/opt/tezfix/apps/api/.env</code> faylidagi <code>ADMIN_TOKEN</code> bilan
            mos bo'lishi kerak. Saqlangach, bu qurilmada qayta so'ramaymiz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">TezFix</span>
            <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">
              Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-2">
          <button
            onClick={() => {
              setAdminToken('');
              setAuthStatus('bad');
              setTokenInput('');
            }}
            className="sidebar-link sidebar-link-inactive w-full"
          >
            <Key className="w-5 h-5" />
            Tokenni o'chirish
          </button>
          <p className="text-xs text-gray-400 text-center">TezFix Admin v1.0</p>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
