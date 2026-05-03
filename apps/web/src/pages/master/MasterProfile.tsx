import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, type User as UserType } from '../../hooks/useStore';
import { api } from '../../utils/api';
import { useT } from '../../utils/i18n';
import {
  User,
  Phone,
  AtSign,
  LogOut,
  Wrench,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  Award,
  Globe,
  Car,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function MasterProfile() {
  const navigate = useNavigate();
  const { user, language, logout, setUser, setActiveRole } = useStore();
  const t = useT();
  const [switching, setSwitching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleSwitchToClient = async () => {
    if (!user) return;
    setSwitching(true);
    try {
      const res = await api.post<{ user: UserType }>('/auth/set-role', {
        userId: user.id,
        role: 'client',
      });
      setUser(res.user);
      setActiveRole('client');
    } finally {
      setSwitching(false);
    }
  };

  const refresh = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const res = await api.get<{ user: UserType }>(`/auth/user/${user.id}`);
      setUser(res.user);
    } finally {
      setRefreshing(false);
    }
  };

  const langLabel = t(`lang.${language}`);

  return (
    <div className="page-container">
      <div className="px-4 pt-12 pb-3 flex items-start justify-between">
        <h1 className="ios-large-title">{t('profile.title')}</h1>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="w-10 h-10 rounded-full bg-white shadow-ios-card flex items-center justify-center active:scale-95 transition-transform disabled:opacity-60"
          aria-label={t('common.refresh')}
        >
          {refreshing ? (
            <Loader2 className="w-5 h-5 text-primary-700 animate-spin" strokeWidth={2} />
          ) : (
            <RefreshCw className="w-5 h-5 text-primary-700" strokeWidth={2} />
          )}
        </button>
      </div>

      <div className="px-4 space-y-5">
        {/* Hero profile card */}
        <div className="bg-white rounded-ios-xl p-5 shadow-ios-card flex items-center gap-4">
          <div className="relative">
            {user?.photoUrl || user?.avatar ? (
              <img
                src={user.photoUrl || user.avatar || ''}
                alt={user.name}
                className="w-[72px] h-[72px] rounded-full object-cover shadow-ios-card"
              />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-primary-500 flex items-center justify-center shadow-ios-card">
                <span className="text-white font-bold text-[28px]">
                  {user?.name?.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-mint-500 border-[3px] border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-ios-title-3 text-primary-700 truncate">{user?.name}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="ios-chip bg-primary-50 text-primary-700 !py-0.5 !px-2 !text-[11px]">
                <Wrench className="w-2.5 h-2.5" />
                {t('profile.master.tag')}
              </div>
              <div className="chip-mint !py-0.5 !px-2 !text-[11px]">
                <Award className="w-2.5 h-2.5" />
                {t('profile.verified')}
              </div>
            </div>
          </div>
        </div>

        {/* Switch to client mode */}
        <button
          onClick={handleSwitchToClient}
          disabled={switching}
          className="w-full bg-white rounded-ios-xl p-4 shadow-ios-card flex items-center gap-3 active:bg-surface-150 transition-colors disabled:opacity-60"
        >
          <div className="w-10 h-10 rounded-ios bg-mint-100 flex items-center justify-center">
            <Car className="w-5 h-5 text-mint-600" strokeWidth={2} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-ios-headline text-primary-700">{t('profile.switchToClient')}</p>
            <p className="text-ios-caption text-surface-600 mt-0.5">{t('profile.switchSub.client')}</p>
          </div>
          {switching ? (
            <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
          ) : (
            <ChevronRight className="w-5 h-5 text-surface-400" strokeWidth={2.5} />
          )}
        </button>

        {/* Personal info */}
        <div>
          <p className="ios-section-header">{t('profile.section.personal')}</p>
          <div className="ios-group">
            <InfoRow icon={User} bg="bg-primary-50" iconColor="text-primary-500" label={t('profile.row.name')} value={user?.name || '—'} />
            <div className="border-t border-separator ml-[52px]" />
            <InfoRow icon={Phone} bg="bg-mint-100" iconColor="text-mint-600" label={t('profile.row.phone')} value={user?.phone || '—'} />
            <div className="border-t border-separator ml-[52px]" />
            <InfoRow icon={AtSign} bg="bg-surface-200" iconColor="text-surface-700" label={t('profile.row.username')} value={user?.username ? `@${user.username}` : '—'} />
          </div>
        </div>

        {/* Settings */}
        <div>
          <p className="ios-section-header">{t('profile.section.settings')}</p>
          <div className="ios-group">
            <ActionRow onClick={() => navigate('/notifications')} icon={Bell} bg="bg-primary-50" iconColor="text-primary-500" label={t('profile.action.notifications')} />
            <div className="border-t border-separator ml-[52px]" />
            <ActionRow onClick={() => navigate('/settings/language')} icon={Globe} bg="bg-primary-50" iconColor="text-primary-600" label={t('profile.action.language')} trailing={langLabel} />
            <div className="border-t border-separator ml-[52px]" />
            <ActionRow onClick={() => navigate('/settings/privacy')} icon={Shield} bg="bg-surface-200" iconColor="text-surface-700" label={t('profile.action.privacy')} />
            <div className="border-t border-separator ml-[52px]" />
            <ActionRow onClick={() => navigate('/settings/help')} icon={HelpCircle} bg="bg-surface-200" iconColor="text-surface-700" label={t('profile.action.help')} />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full bg-white rounded-ios-xl shadow-ios-card flex items-center justify-center gap-2 py-3.5 text-ios-body font-semibold text-danger-500 active:bg-surface-150 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {t('profile.logout')}
        </button>

        <p className="text-center text-ios-caption text-surface-500 pt-1">
          TezFix Master · v1.0.0
        </p>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  bg,
  iconColor,
  label,
  value,
}: {
  icon: any;
  bg: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 min-h-[56px]">
      <div className={`w-9 h-9 rounded-ios ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-[18px] h-[18px] ${iconColor}`} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-ios-caption text-surface-600">{label}</p>
        <p className="text-ios-subhead text-surface-900 font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function ActionRow({
  icon: Icon,
  bg,
  iconColor,
  label,
  trailing,
  onClick,
}: {
  icon: any;
  bg: string;
  iconColor: string;
  label: string;
  trailing?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 min-h-[48px] w-full text-left active:bg-surface-150 transition-colors"
    >
      <div className={`w-9 h-9 rounded-ios ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-[18px] h-[18px] ${iconColor}`} strokeWidth={2} />
      </div>
      <span className="flex-1 text-ios-body text-surface-900">{label}</span>
      {trailing && <span className="text-ios-subhead text-surface-500">{trailing}</span>}
      <ChevronRight className="w-4 h-4 text-surface-400" strokeWidth={2.5} />
    </button>
  );
}
