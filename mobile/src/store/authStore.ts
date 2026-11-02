import { create } from 'zustand';
import api, { setAuthToken } from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  quickSwitchPersona: (role: 'customer' | 'farmer' | 'admin' | 'agronomist') => Promise<void>;
  setUser: (user: User | null, token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  setUser: (user, token) => {
    setAuthToken(token);
    set({ user, token, error: null });
  },

  login: async (email: string, password = 'password123') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      setAuthToken(access_token);
      set({ user, token: access_token, isLoading: false });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Login failed. Please check credentials.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    setAuthToken(null);
    set({ user: null, token: null, error: null });
  },

  quickSwitchPersona: async (role: 'customer' | 'farmer' | 'admin' | 'agronomist') => {
    const roleEmailMap = {
      customer: 'customer@rentafarm.com',
      farmer: 'farmer@rentafarm.com',
      admin: 'admin@rentafarm.com',
      agronomist: 'agronomist@rentafarm.com',
    };
    const email = roleEmailMap[role];
    await get().login(email, 'password123');
  },
}));
