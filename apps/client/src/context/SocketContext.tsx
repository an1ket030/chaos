import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@chaos/shared';
import { useRoomStore } from '../store/roomStore';
import { useAuctionStore } from '../store/auctionStore';

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextValue {
  socket: AppSocket | null;
  isConnected: boolean;
  connectionError: string | null;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  connectionError: null,
  reconnect: () => {},
});

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<AppSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const { setConnectionStatus, setRoom, setError } = useRoomStore();
  const { addEvent, setChaosOverlay } = useAuctionStore();
  const socketRef = useRef<AppSocket | null>(null);

  const initSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const token = localStorage.getItem('accessToken') || '';
    const instance: AppSocket = io(SERVER_URL, {
      autoConnect: true,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    instance.on('connect', () => {
      console.log('⚡ [DraftWar Socket] Connected to War Room');
      setIsConnected(true);
      setConnectionError(null);
      setConnectionStatus(true);
    });

    instance.on('disconnect', (reason) => {
      console.log('🔌 [DraftWar Socket] Disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus(false);
    });

    instance.on('connect_error', (err) => {
      console.warn('⚠️ [DraftWar Socket] Connection error:', err.message);
      setConnectionError(err.message);
      setError('Connection to War Room failed');
      setConnectionStatus(false);
    });

    instance.on('room:state', (state) => {
      setRoom(state);
    });

    instance.on('room:error', (data) => {
      setError(data.message);
    });

    instance.on('room:system_msg', (data) => {
      addEvent({ message: data.message, type: data.type, timestamp: Date.now() });
    });

    instance.on('chaos:card_trigger', () => setChaosOverlay(true, { state: 'triggering' }));
    instance.on('chaos:wheel_spin', (data) => setChaosOverlay(true, { state: 'spinning', pool: data.cardPool }));
    instance.on('chaos:card_land', (data) => setChaosOverlay(true, { state: 'landed', card: data }));
    instance.on('chaos:target_selected', (data) => setChaosOverlay(true, { state: 'targeted', targets: data.targetUsernames }));
    instance.on('chaos:effect_applied', (data) => setChaosOverlay(true, { state: 'applied', effect: data.effect }));
    instance.on('chaos:overlay_close', () => setChaosOverlay(false));

    socketRef.current = instance;
    setSocket(instance);
  };

  useEffect(() => {
    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const reconnect = () => {
    initSocket();
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectionError, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}
