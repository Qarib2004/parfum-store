import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (typeof window !== 'undefined') {
          const accessToken = localStorage.getItem('accessToken');
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (accessToken && refreshToken && state) {
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.isAuthenticated = true;
          }
          
          state?.setHydrated();
        }
      },
    }
  )
);