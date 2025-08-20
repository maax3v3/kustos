import { create } from 'zustand';

interface AuthCredentials {
  username: string;
  password: string;
}

interface AuthStore {
  credentials: AuthCredentials | null;
  setCredentials: (credentials: AuthCredentials) => void;
  clearCredentials: () => void;
}

export const useAuthStore = create<AuthStore>()(
    (set) => ({
      credentials: null,
      setCredentials: (credentials) => set({ credentials }),
      clearCredentials: () => set({ credentials: null }),
    })
);
