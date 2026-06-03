import { create } from 'zustand';
import { api } from '@/lib/api';

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  lang?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (token: string) => Promise<User | null>;
  logout: () => void;
  fetchMe: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  loading: false,
  error: null,

  login: async (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
    }
    set({ token, error: null });
    if (api.defaults?.headers?.common) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return await get().fetchMe();
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
    if (api.defaults?.headers?.common) {
      delete api.defaults.headers.common['Authorization'];
    }
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/auth/me');
      const userData = res.data
        ? { ...res.data, role: String(res.data.role).toLowerCase() }
        : null;
      set({
        user: userData,
        loading: false,
      });
      return userData;
    } catch (err: any) {
      console.error('Fetch me failed', err);
      if (err.response?.status === 401) {
        get().logout();
      }
      set({ 
        error: err.response?.data?.message || 'Failed to fetch user info', 
        loading: false, 
        user: null 
      });
      return null;
    }
  },
}));
