import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@chaos/shared';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

export function getSocket(): AppSocket {
  if (!socket) {
    socket = io('http://localhost:3001', {
      autoConnect: false,
      auth: {
        token: localStorage.getItem('accessToken') || '',
      },
    });
  }
  return socket;
}

export function connectSocket(): AppSocket {
  const s = getSocket();
  if (!s.connected) {
    // Update token on each connect attempt
    (s.auth as { token: string }).token = localStorage.getItem('accessToken') || '';
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) socket.disconnect();
}
