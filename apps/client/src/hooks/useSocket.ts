import React, { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@chaos/shared';
import { useRoomStore } from '../store/roomStore';
import { useAuctionStore } from '../store/auctionStore';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Module-level singleton
let socketInstance: AppSocket | null = null;

function getOrCreateSocket(): AppSocket {
  if (!socketInstance) {
    socketInstance = io('http://localhost:3001', {
      autoConnect: false,
    });
  }
  return socketInstance;
}

export function useSocket() {
  const { setConnectionStatus, setRoom, setError } = useRoomStore();
  const { addEvent, setChaosOverlay } = useAuctionStore();
  const listenersAttached = useRef(false);

  useEffect(() => {
    if (listenersAttached.current) return;
    listenersAttached.current = true;

    const socket = getOrCreateSocket();

    // Update auth token before connecting
    const token = localStorage.getItem('accessToken') || '';
    socket.auth = { token };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => {
      console.log('✅ Socket connected');
      setConnectionStatus(true);
    });
    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnectionStatus(false);
    });
    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
      setError('Connection to server failed');
    });

    socket.on('room:state', (state) => setRoom(state));
    socket.on('room:error', (data) => setError(data.message));

    socket.on('room:system_msg', (data) => {
      addEvent({ message: data.message, type: data.type, timestamp: Date.now() });
    });

    socket.on('chaos:card_trigger', () => setChaosOverlay(true, { state: 'triggering' }));
    socket.on('chaos:wheel_spin', (data) => setChaosOverlay(true, { state: 'spinning', pool: data.cardPool }));
    socket.on('chaos:card_land', (data) => setChaosOverlay(true, { state: 'landed', card: data }));
    socket.on('chaos:target_selected', (data) => setChaosOverlay(true, { state: 'targeted', targets: data.targetUsernames }));
    socket.on('chaos:effect_applied', (data) => setChaosOverlay(true, { state: 'applied', effect: data.effect }));
    socket.on('chaos:overlay_close', () => setChaosOverlay(false));

    // Don't disconnect on unmount — keep socket alive across page transitions
    return () => {};
  }, []);

  return getOrCreateSocket();
}

// Call this once in App.tsx to keep the socket alive for the whole session
export function useSocketSession() {
  const { setConnectionStatus, setRoom, setError } = useRoomStore();
  const { addEvent, setChaosOverlay } = useAuctionStore();

  useEffect(() => {
    const socket = getOrCreateSocket();

    const token = localStorage.getItem('accessToken') || '';
    socket.auth = { token };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => setConnectionStatus(true));
    socket.on('disconnect', () => setConnectionStatus(false));
    socket.on('connect_error', (err) => console.error('Socket error:', err.message));
    socket.on('room:state', (state) => setRoom(state));
    socket.on('room:error', (data) => setError(data.message));
    socket.on('room:system_msg', (data) => {
      addEvent({ message: data.message, type: data.type, timestamp: Date.now() });
    });
    socket.on('chaos:card_trigger', () => setChaosOverlay(true, { state: 'triggering' }));
    socket.on('chaos:wheel_spin', (data) => setChaosOverlay(true, { state: 'spinning', pool: data.cardPool }));
    socket.on('chaos:card_land', (data) => setChaosOverlay(true, { state: 'landed', card: data }));
    socket.on('chaos:target_selected', (data) => setChaosOverlay(true, { state: 'targeted', targets: data.targetUsernames }));
    socket.on('chaos:effect_applied', (data) => setChaosOverlay(true, { state: 'applied', effect: data.effect }));
    socket.on('chaos:overlay_close', () => setChaosOverlay(false));

    return () => {
      socket.disconnect();
      socketInstance = null;
    };
  }, []);

  return getOrCreateSocket();
}

export function getSocket(): AppSocket {
  return getOrCreateSocket();
}
