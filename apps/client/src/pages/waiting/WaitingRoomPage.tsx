import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '../../store/roomStore';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { io } from 'socket.io-client';
import { api } from '../../lib/api';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

const EDITION_LABELS: Record<string, string> = {
  'world-cup': '🏆 World Cup',
  'champions-league': '⭐ Champions League',
  'premier-league': '🦁 Premier League',
  'la-liga': '🇪🇸 La Liga',
  'bundesliga': '🦅 Bundesliga',
  'all-time-legends': '👑 Legends',
};

export function WaitingRoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { room, setRoom } = useRoomStore();
  const { user } = useAuthStore();
  const [isStarting, setIsStarting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [localError, setLocalError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code || !user) return;
    const token = localStorage.getItem('accessToken') || '';

    // Fetch room via REST first
    api.get(`/rooms/${code}`)
      .then(({ data }) => setRoom(data))
      .catch(() => setLocalError('Could not load room'));

    // Live updates via socket
    const socket = io(SERVER_URL, { auth: { token } });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('room:join', { code, token }, (res: any) => {
        if (!res.success) setLocalError(res.error || 'Failed to join room');
      });
    });

    socket.on('room:state', (state: any) => {
      setRoom(state);
      if (state.status !== 'WAITING') navigate(`/room/${code}/auction`);
    });

    socket.on('room:start', () => navigate(`/room/${code}/auction`));
    socket.on('room:error', (data: any) => setLocalError(data.message));
    socket.on('disconnect', () => setIsConnected(false));

    (window as any).__dwSocket = socket;

    return () => {
      socket.off('connect');
      socket.off('room:state');
      socket.off('room:start');
      socket.off('room:error');
      socket.off('disconnect');
      (window as any).__dwSocket = null;
    };
  }, [code, user]);

  const handleStart = () => {
    const socket = (window as any).__dwSocket;
    if (!socket) return;
    setIsStarting(true);
    socket.emit('room:start_game', (res: any) => {
      if (!res.success) {
        setIsStarting(false);
        setLocalError(res.error || 'Failed to start');
      }
    });
  };

  const handleLeave = () => {
    const socket = (window as any).__dwSocket;
    if (socket) { socket.emit('room:leave'); socket.disconnect(); }
    navigate('/');
  };

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (localError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#080C12' }}>
        <div className="p-8 rounded-2xl text-center max-w-md w-full"
          style={{ background: '#0F1520', border: '1px solid rgba(255,59,59,0.3)' }}>
          <div className="font-display text-3xl mb-3" style={{ color: '#FF3B3B' }}>ERROR</div>
          <p className="mb-6 text-sm" style={{ color: '#8A95A8' }}>{localError}</p>
          <button onClick={() => navigate('/')} className="btn-ghost">← Back to Hub</button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#080C12' }}>
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#FF6B2B', borderTopColor: 'transparent' }} />
        <p className="font-mono text-sm uppercase tracking-widest" style={{ color: '#8A95A8' }}>Loading room...</p>
      </div>
    );
  }

  const isCreator = user?.id === room.creatorId;
  const canStart = isCreator && room.players.length >= 2;

  return (
    <div className="min-h-screen text-white relative" style={{ background: '#080C12' }}>
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-40" />

      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-8 py-4"
        style={{ background: 'rgba(8,12,18,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={handleLeave}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors"
          style={{ color: '#8A95A8' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Leave
        </button>

        <div
          className="font-display text-2xl tracking-wider"
          style={{ color: '#FF6B2B', textShadow: '0 0 16px rgba(255,107,43,0.3)' }}
        >
          DRAFTWAR
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: '#8A95A8' }}>
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* Room code — hero element */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="dw-label mb-3">Room Code</div>
          <button
            onClick={handleCopyCode}
            className="group relative inline-block"
          >
            <div
              className="font-display text-7xl md:text-8xl tracking-[0.3em] transition-all duration-200 group-hover:opacity-80"
              style={{ color: '#FF6B2B', textShadow: '0 0 40px rgba(255,107,43,0.35)' }}
            >
              {room.code}
            </div>
            <AnimatePresence>
              {copied ? (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#2ECC71' }}
                >
                  Copied!
                </motion.div>
              ) : (
                <motion.div
                  className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#8A95A8' }}
                >
                  Click to copy
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          <p className="text-sm mt-10" style={{ color: '#8A95A8' }}>
            Share this code with up to {room.settings.maxPlayers} managers
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Players panel */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="font-heading text-lg font-bold uppercase tracking-wider">
                Managers
                <span className="ml-2 font-num" style={{ color: '#FF6B2B' }}>{room.players.length}</span>
                <span style={{ color: '#3A4458' }}>/{room.settings.maxPlayers}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {room.players.map((p: any, idx: number) => (
                <motion.div
                  key={p.userId}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-4 p-5 rounded-xl"
                  style={{
                    background: '#0F1520',
                    border: `1px solid ${p.userId === user?.id ? 'rgba(255,107,43,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  <Avatar username={p.username} url={p.avatarUrl} size="lg" />
                  <div className="min-w-0">
                    <div className="font-bold text-base text-white flex items-center gap-2 truncate">
                      {p.username}
                      {p.userId === room.creatorId && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF6B2B">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      )}
                      {p.userId === user?.id && (
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,107,43,0.12)', color: '#FF6B2B' }}>you</span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#8A95A8' }}>
                      {p.budget} CP starting budget
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, room.settings.maxPlayers - room.players.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center justify-center p-5 rounded-xl"
                  style={{ border: '1px dashed rgba(255,255,255,0.07)', background: 'transparent', minHeight: '80px' }}
                >
                  <span className="text-sm uppercase tracking-wider font-bold" style={{ color: '#3A4458' }}>
                    Waiting...
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Settings + Start */}
          <div className="space-y-4">
            {/* Room settings */}
            <div className="p-5 rounded-xl" style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="font-heading text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#8A95A8' }}>
                Room Settings
              </div>
              <div className="space-y-3">
                {[
                  ['Edition', EDITION_LABELS[room.settings.edition] ?? room.settings.edition],
                  ['Budget', `${room.settings.startingBudget} CP`],
                  ['Timer', `${room.settings.bidTimer}s per bid`],
                  ['Chaos Cards', room.settings.chaosCardsEnabled ? 'Enabled' : 'Disabled'],
                  ['Finance Cards', room.settings.financeCardsEnabled ? 'Enabled' : 'Disabled'],
                  ['Visibility', room.settings.visibility],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-xs uppercase tracking-wider font-bold" style={{ color: '#8A95A8' }}>{label}</span>
                    <span className="font-mono text-xs font-bold text-white capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Start / waiting */}
            <div className="p-5 rounded-xl" style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.07)' }}>
              {isCreator ? (
                <div className="space-y-3">
                  {!canStart && (
                    <p className="text-center text-xs uppercase tracking-wider" style={{ color: '#8A95A8' }}>
                      Need at least 2 managers to start
                    </p>
                  )}
                  <button
                    onClick={handleStart}
                    disabled={!canStart || isStarting}
                    className="w-full py-4 rounded-xl font-heading font-bold text-base uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: canStart && !isStarting ? '#FF6B2B' : '#161E2E',
                      color: canStart && !isStarting ? 'white' : '#8A95A8',
                      boxShadow: canStart && !isStarting ? '0 0 24px rgba(255,107,43,0.4)' : 'none',
                    }}
                  >
                    {isStarting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Starting...
                      </span>
                    ) : canStart ? '🚀 Start Auction' : 'Waiting for Players'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 justify-center py-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-sm font-bold uppercase tracking-wider" style={{ color: '#8A95A8' }}>
                    Waiting for host...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
