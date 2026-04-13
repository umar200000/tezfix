import { useStore } from '../../hooks/useStore';
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
} from 'lucide-react';

export default function MasterProfile() {
  const { user, logout } = useStore();

  return (
    <div className="page-container">
      <div className="px-4 pt-12 pb-3">
        <h1 className="ios-large-title">Profil</h1>
      </div>

      <div className="px-4 space-y-5">
        {/* Hero profile card */}
        <div className="bg-white rounded-ios-xl p-5 shadow-ios-card flex items-center gap-4">
          <div className="relative">
            <div className="w-[72px] h-[72px] rounded-full bg-primary-500 flex items-center justify-center shadow-ios-card">
              <span className="text-white font-bold text-[28px]">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-mint-500 border-[3px] border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-ios-title-3 text-primary-700 truncate">{user?.name}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="ios-chip bg-primary-50 text-primary-700 !py-0.5 !px-2 !text-[11px]">
                <Wrench className="w-2.5 h-2.5" />
                Usta
              </div>
              <div className="chip-mint !py-0.5 !px-2 !text-[11px]">
                <Award className="w-2.5 h-2.5" />
                Tekshirilgan
              </div>
            </div>
          </div>
          <button className="w-9 h-9 rounded-full bg-surface-150 flex items-center justify-center active:scale-95 transition-transform">
            <ChevronRight className="w-5 h-5 text-surface-600" />
          </button>
        </div>

        {/* Contact info */}
        <div>
          <p className="ios-section-header">Shaxsiy ma'lumotlar</p>
          <div className="ios-group">
            <InfoRow icon={User} bg="bg-primary-50" iconColor="text-primary-500" label="Ism" value={user?.name || '—'} />
            <div className="border-t border-separator ml-[52px]" />
            <InfoRow icon={Phone} bg="bg-mint-100" iconColor="text-mint-600" label="Telefon" value={user?.phone || '—'} />
            <div className="border-t border-separator ml-[52px]" />
            <InfoRow icon={AtSign} bg="bg-surface-200" iconColor="text-surface-700" label="Username" value={user?.username || '—'} />
          </div>
        </div>

        {/* Settings */}
        <div>
          <p className="ios-section-header">Sozlamalar</p>
          <div className="ios-group">
            <ActionRow icon={Bell} bg="bg-primary-50" iconColor="text-primary-500" label="Bildirishnomalar" />
            <div className="border-t border-separator ml-[52px]" />
            <ActionRow icon={Globe} bg="bg-primary-50" iconColor="text-primary-600" label="Til" trailing="O'zbekcha" />
            <div className="border-t border-separator ml-[52px]" />
            <ActionRow icon={Shield} bg="bg-surface-200" iconColor="text-surface-700" label="Maxfiylik" />
            <div className="border-t border-separator ml-[52px]" />
            <ActionRow icon={HelpCircle} bg="bg-surface-200" iconColor="text-surface-700" label="Yordam" />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full bg-white rounded-ios-xl shadow-ios-card flex items-center justify-center gap-2 py-3.5 text-ios-body font-semibold text-danger-500 active:bg-surface-150 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Chiqish
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
}: {
  icon: any;
  bg: string;
  iconColor: string;
  label: string;
  trailing?: string;
}) {
  return (
    <button className="flex items-center gap-3 px-4 py-3 min-h-[48px] w-full text-left active:bg-surface-150 transition-colors">
      <div className={`w-9 h-9 rounded-ios ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-[18px] h-[18px] ${iconColor}`} strokeWidth={2} />
      </div>
      <span className="flex-1 text-ios-body text-surface-900">{label}</span>
      {trailing && <span className="text-ios-subhead text-surface-500">{trailing}</span>}
      <ChevronRight className="w-4 h-4 text-surface-400" strokeWidth={2.5} />
    </button>
  );
}
