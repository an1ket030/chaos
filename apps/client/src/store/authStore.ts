import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  elo_rating: number;
  games_played: number;
  games_won: number;
  total_cp_spent: number;
  best_squad_rating: number;
  favorite_formation: string | null;
  chaos_cards_received: number;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },
}));
