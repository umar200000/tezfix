import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  role: 'master' | 'client';
  name: string;
  phone: string;
  username: string;
  avatar: string | null;
}

interface AppState {
  user: User | null;
  onboarded: boolean;
  setUser: (user: User | null) => void;
  setOnboarded: (v: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      onboarded: false,
      setUser: (user) => set({ user }),
      setOnboarded: (onboarded) => set({ onboarded }),
      logout: () => set({ user: null, onboarded: false }),
    }),
    { name: 'tezfix-store' }
  )
);
