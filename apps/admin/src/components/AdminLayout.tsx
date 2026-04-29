import { useState } from 'react';
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
} from 'lucide-react';
import { getAdminToken, setAdminToken } from '../utils/api';

const sidebarLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Foydalanuvchilar' },
  { to: '/services', icon: Store, label: 'Xizmatlar' },
  { to: '/leads', icon: PhoneCall, label: "So'rovlar" },
  { to: '/banners', icon: ImageIcon, label: 'Bannerlar' },
  { to: '/quick-services', icon: Zap, label: 'Tez xizmatlar' },
];

export default function AdminLayout() {
  const [tokenOpen, setTokenOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState(getAdminToken());
  const [saved, setSaved] = useState(false);

  const handleSaveToken = () => {
    setAdminToken(tokenInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
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
            onClick={() => setTokenOpen(!tokenOpen)}
            className="sidebar-link sidebar-link-inactive w-full"
          >
            <Key className="w-5 h-5" />
            Admin token
          </button>
          {tokenOpen && (
            <div className="px-2 space-y-2">
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ADMIN_TOKEN"
                className="input"
              />
              <button onClick={handleSaveToken} className="btn-primary w-full">
                {saved ? (
                  <>
                    <Check className="w-4 h-4" /> Saqlandi
                  </>
                ) : (
                  'Saqlash'
                )}
              </button>
            </div>
          )}
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
