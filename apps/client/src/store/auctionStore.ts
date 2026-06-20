import { create } from 'zustand';

export type SystemEvent = {
  id: string;
  message: string;
  type: 'info' | 'chaos' | 'sold' | 'warning' | 'bankruptcy';
  timestamp: number;
};

interface AuctionState {
  events: SystemEvent[];
  addEvent: (event: Omit<SystemEvent, 'id'>) => void;
  clearEvents: () => void;
  showChaosOverlay: boolean;
  chaosOverlayData: any | null;
  setChaosOverlay: (show: boolean, data?: any) => void;
}

export const useAuctionStore = create<AuctionState>((set) => ({
  events: [],
  addEvent: (event) => set((state) => ({ 
    events: [...state.events, { ...event, id: Math.random().toString(36).substring(7) }].slice(-50) // keep last 50
  })),
  clearEvents: () => set({ events: [] }),
  showChaosOverlay: false,
  chaosOverlayData: null,
  setChaosOverlay: (show, data = null) => set({ showChaosOverlay: show, chaosOverlayData: data }),
}));
