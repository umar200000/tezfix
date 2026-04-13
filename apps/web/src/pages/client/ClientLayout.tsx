import { Outlet, NavLink } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Asosiy' },
  { to: '/search', icon: Search, label: 'Qidiruv' },
  { to: '/favorites', icon: Heart, label: 'Saqlangan' },
  { to: '/profile', icon: User, label: 'Profil' },
];

export default function ClientLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />

      <nav className="ios-tab-bar">
        <div className="flex items-center justify-around px-2 pt-1.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-ios min-w-[60px] transition-all ${
                  isActive ? 'text-primary-500' : 'text-surface-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className="w-[26px] h-[26px]"
                    strokeWidth={isActive ? 2.2 : 1.8}
                    fill={isActive ? 'currentColor' : 'none'}
                    fillOpacity={isActive ? 0.15 : 0}
                  />
                  <span className={`text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
        <div className="h-1" />
      </nav>
    </div>
  );
}
