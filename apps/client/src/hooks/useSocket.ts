import { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@chaos/shared';
import { useSocketContext, type AppSocket } from '../context/SocketContext';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

// Fallback singleton for non-React context callers
let fallbackSocketInstance: AppSocket | null = null;

export function getSocket(): AppSocket {
  if (!fallbackSocketInstance) {
    const token = localStorage.getItem('accessToken') || '';
    fallbackSocketInstance = io(SERVER_URL, {
      autoConnect: true,
      auth: { token },
      reconnection: true,
    });
  }
  return fallbackSocketInstance;
}

export function useSocket(): AppSocket {
  const { socket } = useSocketContext();
  return socket || getSocket();
}

export function useSocketSession(): AppSocket {
  return useSocket();
}

export type { AppSocket };
