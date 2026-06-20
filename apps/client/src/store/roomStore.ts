import { create } from 'zustand';
import type { RoomState } from '@chaos/shared';

interface AppRoomState {
  room: RoomState | null;
  isConnected: boolean;
  error: string | null;
  setRoom: (room: RoomState | null) => void;
  updateRoom: (partial: Partial<RoomState>) => void;
  setConnectionStatus: (status: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRoomStore = create<AppRoomState>((set) => ({
  room: null,
  isConnected: false,
  error: null,
  setRoom: (room) => set({ room, error: null }),
  updateRoom: (partial) => set((state) => ({ room: state.room ? { ...state.room, ...partial } : null })),
  setConnectionStatus: (isConnected) => set({ isConnected }),
  setError: (error) => set({ error }),
}));
