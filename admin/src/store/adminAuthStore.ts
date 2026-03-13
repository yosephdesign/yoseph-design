import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminUser } from '../types/admin';

const API_URL = 'http://localhost:4000';

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getToken: () => string | null;
}

export const useAdminAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          
          if (res.ok) {
            const data = await res.json();
            set({ 
              user: data.user, 
              token: data.token, 
              isAuthenticated: true 
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login failed:', error);
          return false;
        }
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      getToken: () => get().token,
    }),
    {
      name: 'admin-auth-storage',
    }
  )
);
