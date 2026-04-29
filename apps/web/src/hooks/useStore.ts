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

interface AppState {
  user: User | null;
  onboarded: boolean;
  activeRole: ActiveRole | null;
  setUser: (user: User | null) => void;
  setOnboarded: (v: boolean) => void;
  setActiveRole: (role: ActiveRole | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      onboarded: false,
      activeRole: null,
      setUser: (user) => set({ user }),
      setOnboarded: (onboarded) => set({ onboarded }),
      setActiveRole: (activeRole) => set({ activeRole }),
      logout: () => set({ user: null, onboarded: false, activeRole: null }),
    }),
    { name: 'tezfix-store' }
  )
);
