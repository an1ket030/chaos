import { create } from 'zustand';

interface UIState {
  soundEnabled: boolean;
  toggleSound: () => void;
  showChat: boolean;
  toggleChat: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  soundEnabled: true,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  showChat: false,
  toggleChat: () => set((state) => ({ showChat: !state.showChat })),
}));
