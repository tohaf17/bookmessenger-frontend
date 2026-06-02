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
  login: (token: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  loading: false,
  error: null,

  login: async (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    set({ token, error: null });
    await get().fetchMe();
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data, loading: false });
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
    }
  },
}));
