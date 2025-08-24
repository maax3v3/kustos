import { AuthMethod } from '@/lib/auth';
import { create } from 'zustand';

interface AuthStore {
  authMethod: AuthMethod | null;
  setAuthMethod: (authMethod: AuthMethod) => void;
}

export const useAuthStore = create<AuthStore>()(
    (set) => ({
      authMethod: null,
      setAuthMethod: (authMethod) => set({ authMethod }),
    })
);
