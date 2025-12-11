import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => {
        set({ user: null, token: null });
        // Clear localStorage to ensure complete logout
        localStorage.removeItem('auth-storage');
        // Redirect to login page
        window.location.href = '/login';
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
