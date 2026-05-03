import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  telegramId: string;
  firstName: string | null;
  lastName: string | null;
  name: string;
  username: string | null;
  phone: string | null;
  photoUrl: string | null;
  avatar: string | null;
  isMaster: boolean;
  isClient: boolean;
  role: 'master' | 'client' | null;
}

export type ActiveRole = 'master' | 'client';
export type Lang = 'uz' | 'en' | 'ru';

interface AppState {
  user: User | null;
  onboarded: boolean;
  activeRole: ActiveRole | null;
  language: Lang;
  setUser: (user: User | null) => void;
  setOnboarded: (v: boolean) => void;
  setActiveRole: (role: ActiveRole | null) => void;
  setLanguage: (lang: Lang) => void;
  logout: () => void;
}

function detectInitial(): Lang {
  if (typeof window === 'undefined') return 'uz';
  const stored = localStorage.getItem('tezfix-lang') as Lang | null;
  if (stored === 'uz' || stored === 'en' || stored === 'ru') return stored;
  const tgLang = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.language_code as
    | string
    | undefined;
  if (tgLang?.startsWith('ru')) return 'ru';
  if (tgLang?.startsWith('en')) return 'en';
  return 'uz';
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      onboarded: false,
      activeRole: null,
      language: detectInitial(),
      setUser: (user) => set({ user }),
      setOnboarded: (onboarded) => set({ onboarded }),
      setActiveRole: (activeRole) => set({ activeRole }),
      setLanguage: (language) => {
        if (typeof window !== 'undefined') localStorage.setItem('tezfix-lang', language);
        set({ language });
      },
      logout: () => set({ user: null, onboarded: false, activeRole: null }),
    }),
    { name: 'tezfix-store' }
  )
);
