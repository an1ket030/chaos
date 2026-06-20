import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../../store/roomStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { getSocket } from '../../hooks/useSocket';
import { io } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@chaos/shared';

export function WaitingRoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { room, setRoom, setError } = useRoomStore();
  const { user } = useAuthStore();
  const [isStarting, setIsStarting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!code || !user) return;

    // Load room via REST first so UI isn't blank
    const token = localStorage.getItem('accessToken') || '';
    fetch(`http://localhost:3001/rooms/${code}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setLocalError(data.error);
        else setRoom(data);
      })
      .catch(() => setLocalError('Could not load room'));

    // Set up socket for live updates
    const socket = io('http://localhost:3001', {
      auth: { token },
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('room:join', { code, token }, (res: any) => {
        if (!res.success) {
          setLocalError(res.error || 'Failed to join room');
        }
      });
    });

    socket.on('room:state', (state) => {
      setRoom(state);
      // Navigate immediately if game has started
      if (state.status !== 'WAITING') {
        navigate(`/room/${code}/auction`);
      }
    });

    // Direct navigation trigger from host starting the game
    socket.on('room:start', () => {
      navigate(`/room/${code}/auction`);
    });

    socket.on('room:error', (data) => setLocalError(data.message));
    socket.on('disconnect', () => setIsConnected(false));


    // Store socket on window so Start button can use it
    (window as any).__chaosSocket = socket;

    return () => {
      socket.emit('room:leave');
      socket.disconnect();
      (window as any).__chaosSocket = null;
    };
  }, [code, user]);

  // (navigation handled inside socket event listeners above)

  const handleStart = () => {
    const socket = (window as any).__chaosSocket;
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
    const socket = (window as any).__chaosSocket;
    if (socket) {
      socket.emit('room:leave');
      socket.disconnect();
    }
    navigate('/');
  };

  const handleCopyCode = () => {
    if (code) navigator.clipboard.writeText(code);
  };

  if (localError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#0d0d0d' }}>
        <div className="p-8 rounded-2xl border border-red-500/50 bg-red-500/10 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-black text-red-400 uppercase mb-2">Error</h2>
          <p className="text-red-300 mb-6">{localError}</p>
          <Button onClick={() => navigate('/')} variant="secondary">← Back to Lobby</Button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0d0d0d' }}>
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8FF00', borderTopColor: 'transparent' }} />
        <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Loading room...</p>
      </div>
    );
  }

  const isCreator = user?.id === room.creatorId;
  const canStart = isCreator && room.players.length >= 2;

  return (
    <div className="min-h-screen text-white p-6 md:p-10" style={{ background: '#0d0d0d' }}>
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <Button variant="ghost" onClick={handleLeave} className="!text-gray-400 hover:!text-white">
          ← Leave Room
        </Button>

        <button
          onClick={handleCopyCode}
          className="flex flex-col items-center px-8 py-3 rounded-2xl border border-white/10 hover:border-[#C8FF00]/50 transition-colors group cursor-pointer"
          style={{ background: '#141414' }}
          title="Click to copy"
        >
          <span className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Room Code</span>
          <span className="text-4xl font-black font-mono tracking-[0.2em]" style={{ color: '#C8FF00' }}>{room.code}</span>
          <span className="text-[10px] text-gray-600 uppercase mt-1 group-hover:text-gray-400 transition-colors">Click to copy</span>
        </button>

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
          <span className="text-xs text-gray-500 uppercase font-bold">{isConnected ? 'Live' : 'Connecting...'}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Players panel */}
        <div className="md:col-span-2 rounded-2xl border border-white/8 p-8" style={{ background: '#141414' }}>
          <h2 className="text-xl font-black uppercase tracking-wider mb-6 text-gray-300">
            Managers <span style={{ color: '#C8FF00' }}>{room.players.length}</span>
            <span className="text-gray-600">/{room.settings.maxPlayers}</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {room.players.map((p) => (
              <div key={p.userId} className="rounded-xl border border-white/8 p-4 flex items-center gap-4" style={{ background: '#0d0d0d' }}>
                <Avatar username={p.username} url={p.avatarUrl} size="lg" />
                <div>
                  <div className="font-bold text-lg flex items-center gap-2">
                    {p.username}
                    {p.userId === room.creatorId && <span style={{ color: '#C8FF00' }} title="Host">👑</span>}
                    {p.userId === user?.id && <span className="text-xs text-gray-500 font-normal">(you)</span>}
                  </div>
                  <div className="text-sm text-gray-400">Budget: <span style={{ color: '#C8FF00' }}>{p.budget}</span> CP</div>
                </div>
              </div>
            ))}

            {Array.from({ length: room.settings.maxPlayers - room.players.length }).map((_, i) => (
              <div key={`empty-${i}`} className="rounded-xl border border-dashed border-white/10 p-4 flex items-center justify-center opacity-40">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">Waiting...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings + start panel */}
        <div className="rounded-2xl border border-white/8 p-8 flex flex-col" style={{ background: '#141414' }}>
          <h2 className="text-lg font-black uppercase tracking-wider mb-6 text-gray-300">Settings</h2>

          <div className="space-y-3 flex-1 text-sm">
            {[
              ['Edition', room.settings.edition],
              ['Budget', `${room.settings.startingBudget} CP`],
              ['Bid Timer', `${room.settings.bidTimer}s`],
              ['Mode', room.settings.mode.toUpperCase()],
              ['Chaos Cards', room.settings.chaosCardsEnabled ? '✅ On' : '❌ Off'],
              ['Finance Cards', room.settings.financeCardsEnabled ? '✅ On' : '❌ Off'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">{label}</span>
                <span className="font-bold text-white">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            {isCreator ? (
              <div className="space-y-3">
                {!canStart && (
                  <p className="text-center text-xs text-gray-500 uppercase tracking-wider">
                    Need at least 2 players to start
                  </p>
                )}
                <button
                  onClick={handleStart}
                  disabled={!canStart || isStarting}
                  className="w-full py-4 rounded-xl font-black text-base uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: canStart && !isStarting ? '#C8FF00' : '#333',
                    color: canStart && !isStarting ? '#000' : '#666',
                    boxShadow: canStart && !isStarting ? '0 0 20px rgba(200,255,0,0.4)' : 'none',
                  }}
                >
                  {isStarting ? 'Starting...' : canStart ? '🚀 Start Auction' : 'Waiting for Players'}
                </button>
              </div>
            ) : (
              <div className="text-center p-4 rounded-xl border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-wider">
                Waiting for host to start...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
