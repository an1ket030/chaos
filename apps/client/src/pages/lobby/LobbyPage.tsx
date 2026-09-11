import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useRoomStore } from '../../store/roomStore';
import { Avatar } from '../../components/ui/Avatar';
import { api } from '../../lib/api';

// ─── Edition definitions for the picker ─────────────────────────────────────
const EDITIONS = [
  { slug: 'world-cup', name: 'World Cup', accent: '#E8B84B', icon: '🏆', desc: 'Top stars from 16 national teams' },
  { slug: 'champions-league', name: 'Champions League', accent: '#3D8EFF', icon: '⭐', desc: 'Elite UCL club players' },
  { slug: 'premier-league', name: 'Premier League', accent: '#9B5DE5', icon: '🦁', desc: "England's finest" },
  { slug: 'la-liga', name: 'La Liga', accent: '#FF6B2B', icon: '🇪🇸', desc: 'Spanish supremacy' },
  { slug: 'bundesliga', name: 'Bundesliga', accent: '#FF3B3B', icon: '🦅', desc: 'German powerhouses' },
  { slug: 'all-time-legends', name: 'Legends', accent: '#E8B84B', icon: '👑', desc: 'Greatest of all time' },
];

// ─── Room Creation Modal ─────────────────────────────────────────────────────
function CreateRoomModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [edition, setEdition] = useState('world-cup');
  const [budget, setBudget] = useState(120);
  const [maxPlayers, setMaxPlayers] = useState<2 | 3 | 4>(4);
  const [bidTimer, setBidTimer] = useState<8 | 10 | 15>(10);
  const [chaosCards, setChaosCards] = useState(true);
  const [financeCards, setFinanceCards] = useState(true);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setIsCreating(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const { data } = await api.post('/rooms', {
        edition,
        startingBudget: budget,
        maxPlayers,
        mode: 'ffa',
        chaosCardsEnabled: chaosCards,
        financeCardsEnabled: financeCards,
        bidTimer,
        visibility,
      }, { headers: { Authorization: `Bearer ${token}` } });
      navigate(`/room/${data.room.code}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create room');
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,12,18,0.92)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 350 }}
        className="w-full max-w-2xl"
        style={{
          background: '#0F1520',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <div className="font-heading text-xl font-bold text-white">Create Room</div>
            <div className="text-xs font-mono mt-0.5" style={{ color: '#8A95A8' }}>
              Step {step} of 2
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: '#8A95A8' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Edition picker */}
                <div className="dw-label mb-4">Choose Edition</div>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {EDITIONS.map(ed => (
                    <button
                      key={ed.slug}
                      onClick={() => setEdition(ed.slug)}
                      className="p-4 rounded-xl text-left transition-all duration-150"
                      style={{
                        background: edition === ed.slug ? 'rgba(255,107,43,0.1)' : '#161E2E',
                        border: `1px solid ${edition === ed.slug ? ed.accent : 'rgba(255,255,255,0.07)'}`,
                        boxShadow: edition === ed.slug ? `0 0 12px rgba(255,107,43,0.2)` : 'none',
                      }}
                    >
                      <div className="text-2xl mb-2">{ed.icon}</div>
                      <div className="font-heading font-bold text-sm text-white uppercase">{ed.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#8A95A8' }}>{ed.desc}</div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 rounded-xl font-heading font-bold text-base uppercase tracking-widest"
                  style={{ background: '#FF6B2B', color: 'white', boxShadow: '0 0 20px rgba(255,107,43,0.4)' }}
                >
                  Next: Settings →
                </button>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="space-y-6">
                  {/* Budget */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="dw-label">Starting Budget</div>
                      <div className="font-num font-bold text-lg" style={{ color: '#FF6B2B' }}>{budget} CP</div>
                    </div>
                    <input
                      type="range" min={80} max={200} step={10} value={budget}
                      onChange={e => setBudget(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: '#FF6B2B' }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: '#3A4458' }}>
                      <span>80 (Tight)</span><span>200 (Lavish)</span>
                    </div>
                  </div>

                  {/* Players + Timer row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="dw-label mb-3">Max Players</div>
                      <div className="flex gap-2">
                        {([2, 3, 4] as const).map(n => (
                          <button
                            key={n}
                            onClick={() => setMaxPlayers(n)}
                            className="flex-1 py-3 rounded-lg font-heading font-bold text-lg transition-all"
                            style={{
                              background: maxPlayers === n ? '#FF6B2B' : '#161E2E',
                              color: maxPlayers === n ? 'white' : '#8A95A8',
                              border: `1px solid ${maxPlayers === n ? '#FF6B2B' : 'rgba(255,255,255,0.07)'}`,
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="dw-label mb-3">Bid Timer</div>
                      <div className="flex gap-2">
                        {([8, 10, 15] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setBidTimer(t)}
                            className="flex-1 py-3 rounded-lg font-heading font-bold text-lg transition-all"
                            style={{
                              background: bidTimer === t ? '#FF6B2B' : '#161E2E',
                              color: bidTimer === t ? 'white' : '#8A95A8',
                              border: `1px solid ${bidTimer === t ? '#FF6B2B' : 'rgba(255,255,255,0.07)'}`,
                            }}
                          >
                            {t}s
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    {[
                      { label: 'Chaos Cards', desc: 'Transfer bans, ego clashes, blind bags', val: chaosCards, set: setChaosCards, color: '#9B5DE5' },
                      { label: 'Finance Cards', desc: 'Oil money, FFP violations, tax raids', val: financeCards, set: setFinanceCards, color: '#E8B84B' },
                    ].map(({ label, desc, val, set, color }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all"
                        style={{
                          background: val ? `rgba(${color === '#9B5DE5' ? '155,93,229' : '232,184,75'},0.08)` : '#161E2E',
                          border: `1px solid ${val ? color : 'rgba(255,255,255,0.07)'}`,
                        }}
                        onClick={() => set(!val)}
                      >
                        <div>
                          <div className="font-heading font-bold text-sm text-white uppercase">{label}</div>
                          <div className="text-xs mt-0.5" style={{ color: '#8A95A8' }}>{desc}</div>
                        </div>
                        <div
                          className="w-11 h-6 rounded-full relative transition-all duration-200"
                          style={{ background: val ? color : '#1A2030' }}
                        >
                          <div
                            className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                            style={{ left: val ? '24px' : '4px' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Visibility */}
                  <div className="flex gap-3">
                    {(['public', 'private'] as const).map(v => (
                      <button
                        key={v}
                        onClick={() => setVisibility(v)}
                        className="flex-1 py-3 rounded-xl font-heading font-bold text-sm uppercase tracking-wider transition-all"
                        style={{
                          background: visibility === v ? 'rgba(255,107,43,0.1)' : '#161E2E',
                          border: `1px solid ${visibility === v ? '#FF6B2B' : 'rgba(255,255,255,0.07)'}`,
                          color: visibility === v ? '#FF6B2B' : '#8A95A8',
                        }}
                      >
                        {v === 'public' ? '🌐 Public' : '🔒 Private'}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="mt-4 px-4 py-3 rounded-lg text-sm font-bold text-center"
                    style={{ background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.4)', color: '#FF3B3B' }}>
                    {error}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="py-4 px-6 rounded-xl font-heading font-bold text-sm uppercase tracking-wider transition-all"
                    style={{ background: '#161E2E', color: '#8A95A8', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="flex-1 py-4 rounded-xl font-heading font-bold text-base uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95"
                    style={{ background: '#FF6B2B', color: 'white', boxShadow: '0 0 20px rgba(255,107,43,0.4)' }}
                  >
                    {isCreating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : '🚀 Create Room'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Public Room Card ────────────────────────────────────────────────────────
function PublicRoomCard({ room, onJoin }: { room: any; onJoin: () => void }) {
  const editionInfo = EDITIONS.find(e => e.slug === room.edition) ?? EDITIONS[0];
  const spotsLeft = room.maxPlayers - room.playerCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl cursor-pointer group transition-all duration-200"
      style={{
        background: '#0F1520',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
      whileHover={{ borderColor: 'rgba(255,107,43,0.35)', scale: 1.01 }}
      onClick={onJoin}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{editionInfo.icon}</span>
          <div>
            <div className="font-heading font-bold text-sm text-white uppercase">{editionInfo.name}</div>
            <div className="font-mono text-xs mt-0.5" style={{ color: '#8A95A8' }}>#{room.code}</div>
          </div>
        </div>
        <div
          className="text-xs font-mono font-bold px-2 py-1 rounded-full"
          style={{
            background: spotsLeft > 0 ? 'rgba(46,204,113,0.12)' : 'rgba(255,59,59,0.12)',
            color: spotsLeft > 0 ? '#2ECC71' : '#FF3B3B',
          }}
        >
          {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} open` : 'Full'}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1">
          {Array.from({ length: room.playerCount }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full"
              style={{ background: `hsl(${i * 60}, 60%, 40%)`, border: '1px solid #0F1520' }}
            />
          ))}
          {Array.from({ length: room.maxPlayers - room.playerCount }).map((_, i) => (
            <div
              key={`e${i}`}
              className="w-6 h-6 rounded-full"
              style={{ background: '#1A2030', border: '1px dashed rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>
        <div className="text-xs font-mono" style={{ color: '#3A4458' }}>
          {room.playerCount}/{room.maxPlayers} players
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Lobby / Hub Page ───────────────────────────────────────────────────
export function LobbyPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Fetch public rooms
  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const { data } = await api.get('/lobby/rooms');
      setPublicRooms(data.rooms ?? []);
    } catch {
      setPublicRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length === 6) {
      navigate(`/room/${code}`);
    } else {
      setJoinError('Room code must be exactly 6 characters');
    }
  };

  const eloRank = (elo: number) => {
    if (elo >= 2000) return { label: 'Elite', color: '#E8B84B' };
    if (elo >= 1600) return { label: 'Diamond', color: '#3D8EFF' };
    if (elo >= 1300) return { label: 'Gold', color: '#E8B84B' };
    if (elo >= 1100) return { label: 'Silver', color: '#8A95A8' };
    return { label: 'Bronze', color: '#CD7F32' };
  };
  const rank = eloRank(user?.elo_rating ?? 1000);

  return (
    <div className="min-h-screen text-white relative" style={{ background: '#080C12' }}>
      {/* Grid bg */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-60" />

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,107,43,0.05) 0%, transparent 70%)' }} />

      {/* ─── Header ─── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-8 py-4"
        style={{ background: 'rgba(8,12,18,0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="font-display text-3xl tracking-wider"
          style={{ color: '#FF6B2B', textShadow: '0 0 16px rgba(255,107,43,0.35)' }}
        >
          DRAFTWAR
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/profile/${user.id}`)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all"
              style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Avatar username={user.username} url={user.avatar_url} size="sm" />
              <div className="text-left hidden sm:block">
                <div className="font-bold text-sm leading-none text-white">{user.username}</div>
                <div className="text-xs mt-0.5 font-mono" style={{ color: rank.color }}>
                  {rank.label} · {user.elo_rating} ELO
                </div>
              </div>
            </button>
            <button
              onClick={logout}
              className="text-xs font-bold uppercase tracking-wider transition-colors px-3 py-2 rounded-lg"
              style={{ color: '#3A4458' }}
            >
              Exit
            </button>
          </div>
        )}
      </header>

      {/* ─── Main Content ─── */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1
            className="font-display mb-3"
            style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', color: '#F0F4FF', lineHeight: '0.95' }}
          >
            <span className="text-gradient-fire">Build Your</span>
            <br />
            <span style={{ color: '#F0F4FF' }}>Squad.</span>
          </h1>
          <p className="dw-label text-center" style={{ letterSpacing: '0.3em' }}>
            Real-Time Multiplayer Football Auction
          </p>
        </motion.div>

        {/* ─── Action Cards ─── */}
        <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto mb-12">
          {/* Create Room */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setShowCreate(true)}
            className="p-8 rounded-2xl text-left group transition-all duration-200 active:scale-98"
            style={{
              background: '#0F1520',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            whileHover={{ borderColor: 'rgba(255,107,43,0.4)', scale: 1.02 }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.2)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B2B" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-white mb-1">Host a War</h2>
            <p className="text-sm" style={{ color: '#8A95A8' }}>
              Create a room, pick your edition, and set the rules.
            </p>
            <div
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors"
              style={{ color: '#FF6B2B' }}
            >
              Create Room
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>

          {/* Join Room */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-8 rounded-2xl"
            style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(61,142,255,0.1)', border: '1px solid rgba(61,142,255,0.2)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3D8EFF" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-white mb-1">Join a Room</h2>
            <p className="text-sm mb-5" style={{ color: '#8A95A8' }}>
              Enter a 6-character code to jump in.
            </p>
            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setJoinError(''); }}
                placeholder="ENTER CODE"
                maxLength={6}
                className="w-full py-3 px-4 rounded-xl text-center font-display text-xl tracking-[0.4em] uppercase transition-all"
                style={{
                  background: '#080C12',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#F0F4FF',
                  outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = '#3D8EFF'; e.target.style.boxShadow = '0 0 0 3px rgba(61,142,255,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
              />
              {joinError && <div className="text-xs font-bold text-center" style={{ color: '#FF3B3B' }}>{joinError}</div>}
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-heading font-bold text-sm uppercase tracking-widest transition-all"
                style={{ background: '#161E2E', color: '#8A95A8', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Join Room
              </button>
            </form>
          </motion.div>
        </div>

        {/* ─── Public Room Browser ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="font-heading text-lg font-bold text-white uppercase tracking-wider">
              Live Rooms
              {!loadingRooms && (
                <span className="ml-3 text-sm font-mono font-normal" style={{ color: '#8A95A8' }}>
                  {publicRooms.length} open
                </span>
              )}
            </div>
            <button
              onClick={fetchRooms}
              className="text-xs font-bold uppercase tracking-wider transition-colors px-3 py-1.5 rounded-lg"
              style={{ color: '#8A95A8', background: '#0F1520', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              Refresh
            </button>
          </div>

          {loadingRooms ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: '#0F1520' }} />
              ))}
            </div>
          ) : publicRooms.length === 0 ? (
            <div
              className="text-center py-16 rounded-2xl"
              style={{ background: '#0F1520', border: '1px dashed rgba(255,255,255,0.07)' }}
            >
              <div className="font-display text-4xl mb-3" style={{ color: '#3A4458' }}>NO ACTIVE ROOMS</div>
              <p className="text-sm mb-6" style={{ color: '#8A95A8' }}>
                Be the first to start a war.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="btn-primary"
              >
                Create Room
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {publicRooms.map(room => (
                <PublicRoomCard
                  key={room.roomId}
                  room={room}
                  onJoin={() => navigate(`/room/${room.code}`)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  );
}
