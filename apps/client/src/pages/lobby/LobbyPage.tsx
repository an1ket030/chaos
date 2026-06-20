import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';

export function LobbyPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setError('');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Not authenticated. Please log in again.');
      setIsCreating(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          edition: 'world-cup',
          startingBudget: 120,
          maxPlayers: 4,
          mode: 'ffa',
          chaosCardsEnabled: true,
          financeCardsEnabled: true,
          bidTimer: 10,
          visibility: 'public',
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `Server error: ${res.status}`);
      }

      if (!json.room?.code) {
        throw new Error('Invalid response from server');
      }

      navigate(`/room/${json.room.code}`);
    } catch (err: any) {
      console.error('Create room failed:', err);
      setError(err.message || 'Failed to create room. Check the console for details.');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = joinCode.trim().toUpperCase();
    if (trimmed.length === 6) {
      navigate(`/room/${trimmed}`);
    } else {
      setError('Room code must be exactly 6 characters');
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ background: '#0d0d0d' }}>
      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-8 py-5 border-b border-white/5">
        <div className="font-black text-2xl tracking-tighter uppercase" style={{ color: '#C8FF00', letterSpacing: '-0.02em' }}>
          CHAOS CLUB
        </div>

        {user && (
          <div className="flex items-center gap-3 pl-4 pr-5 py-2 rounded-full border border-white/10" style={{ background: '#141414' }}>
            <Avatar username={user.username} url={user.avatar_url} size="sm" />
            <div>
              <div className="text-sm font-bold leading-none">{user.username}</div>
              <div className="text-[10px] font-mono mt-0.5" style={{ color: '#C8FF00' }}>ELO {user.elo_rating}</div>
            </div>
            <button
              onClick={logout}
              className="ml-2 text-[11px] text-gray-500 hover:text-white uppercase font-bold tracking-wider transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        {/* Hero text */}
        <div className="text-center mb-14">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-3">
            <span style={{ color: '#C8FF00' }}>Let The</span>
            <br />
            <span className="text-white">Chaos Begin</span>
          </h1>
          <p className="text-gray-500 uppercase tracking-[0.3em] text-sm">Multiplayer Football Auction</p>
        </div>

        {/* Error */}
        {error && (
          <div className="w-full max-w-2xl mb-6 px-5 py-4 rounded-xl border border-red-500/40 text-red-400 text-sm font-bold text-center" style={{ background: 'rgba(255,68,68,0.08)' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Cards */}
        <div className="w-full max-w-2xl grid md:grid-cols-2 gap-6">
          {/* Create Room */}
          <div
            className="rounded-2xl border border-white/8 p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-[#C8FF00]/30 group"
            style={{ background: '#141414' }}
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5 transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(200,255,0,0.08)' }}>
              👑
            </div>
            <h2 className="text-xl font-black uppercase tracking-wider mb-2">Host an Auction</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">Create a room, set your rules, and let the system run the show.</p>
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#C8FF00',
                color: '#000',
                boxShadow: isCreating ? 'none' : '0 0 20px rgba(200,255,0,0.35)',
              }}
            >
              {isCreating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : 'Create Room'}
            </button>
          </div>

          {/* Join Room */}
          <div
            className="rounded-2xl border border-white/8 p-8 flex flex-col items-center text-center"
            style={{ background: '#141414' }}
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5" style={{ background: 'rgba(99,102,241,0.08)' }}>
              🎯
            </div>
            <h2 className="text-xl font-black uppercase tracking-wider mb-2">Join an Auction</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">Enter a 6-character code to jump into an existing game.</p>

            <form onSubmit={handleJoinRoom} className="w-full flex flex-col gap-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="ENTER CODE"
                maxLength={6}
                className="w-full py-3 px-4 rounded-xl text-center text-xl font-black font-mono tracking-[0.4em] uppercase outline-none border border-white/10 focus:border-white/30 transition-colors text-white"
                style={{ background: '#0d0d0d', letterSpacing: '0.4em' }}
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest border border-white/15 text-gray-300 hover:text-white hover:border-white/30 transition-all"
                style={{ background: '#1a1a1a' }}
              >
                Join Room
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
