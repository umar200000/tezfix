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
  LogIn,
  Loader2,
  ShieldCheck,
  Bell,
  Send,
  LogOut,
} from 'lucide-react';
import { api, getAdminToken, setAdminToken } from '../utils/api';

const sidebarLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Foydalanuvchilar' },
  { to: '/services', icon: Store, label: 'Xizmatlar' },
  { to: '/leads', icon: PhoneCall, label: "So'rovlar" },
  { to: '/banners', icon: ImageIcon, label: 'Bannerlar' },
  { to: '/quick-services', icon: Zap, label: 'Tez xizmatlar' },
  { to: '/notifications', icon: Bell, label: 'Bildirishnomalar' },
  { to: '/broadcast', icon: Send, label: 'Xabar yuborish' },
];

export default function AdminLayout() {
  const [authStatus, setAuthStatus] = useState<'unknown' | 'ok' | 'bad'>('unknown');
  const [verifying, setVerifying] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const verifyExisting = async () => {
    if (!getAdminToken()) {
      setAuthStatus('bad');
      return;
    }
    try {
      await api.get('/banners/all');
      setAuthStatus('ok');
    } catch {
      setAuthStatus('bad');
    }
  };

  useEffect(() => {
    verifyExisting();
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError("Login va parolni kiriting");
      return;
    }
    setVerifying(true);
    try {
      const res = await api.postUnauthed<{ token: string }>('/auth/admin-login', {
        username: username.trim(),
        password,
      });
      setAdminToken(res.token);
      setAuthStatus('ok');
      setPassword('');
    } catch (err: any) {
      setError(err?.message || "Login yoki parol noto'g'ri");
      setAuthStatus('bad');
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    setAdminToken('');
    setAuthStatus('bad');
    setUsername('');
    setPassword('');
  };

  if (authStatus !== 'ok') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-primary-50 to-gray-50">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-lg w-full max-w-md p-7"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">TezFix Admin</h1>
          <p className="text-sm text-gray-500 mt-1 mb-5">Kirish uchun login va parolni kiriting.</p>

          <label className="block text-sm font-medium text-gray-700 mb-1.5">Login</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            placeholder="login"
            className="input mb-3"
            autoComplete="username"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1.5">Parol</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="parol"
            className="input"
            autoComplete="current-password"
          />

          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

          <button
            type="submit"
            disabled={verifying || !username || !password}
            className="btn-primary w-full mt-4 disabled:opacity-50"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Tekshirilmoqda...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Kirish
              </>
            )}
          </button>
        </form>
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
            onClick={handleLogout}
            className="sidebar-link sidebar-link-inactive w-full"
          >
            <LogOut className="w-5 h-5" />
            Chiqish
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
