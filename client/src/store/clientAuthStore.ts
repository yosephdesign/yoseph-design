import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_URL } from "../config";

type ClientUser = {
  id: string;
  email: string;
  role: "client";
};

type ClientAuthState = {
  user: ClientUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getToken: () => string | null;
};

export const useClientAuthStore = create<ClientAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          const res = await fetch(`${API_URL}/api/client/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!res.ok) return false;

          const data = await res.json();
          set({ user: data.user, token: data.token, isAuthenticated: true });
          return true;
        } catch (error) {
          console.error("Client login failed:", error);
          return false;
        }
      },
      register: async (email, password) => {
        try {
          const res = await fetch(`${API_URL}/api/client/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!res.ok) return false;

          const data = await res.json();
          set({ user: data.user, token: data.token, isAuthenticated: true });
          return true;
        } catch (error) {
          console.error("Client registration failed:", error);
          return false;
        }
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      getToken: () => get().token,
    }),
    {
      name: "client-auth-storage",
    },
  ),
);
