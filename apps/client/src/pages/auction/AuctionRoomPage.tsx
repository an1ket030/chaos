import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '../../store/roomStore';
import { useAuthStore } from '../../store/authStore';
import { useAuctionStore } from '../../store/auctionStore';
import { Avatar } from '../../components/ui/Avatar';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

// ─── Countdown Timer ─────────────────────────────────────────────────────────
function Countdown({ totalSeconds, key: _key }: { totalSeconds: number; key?: any }) {
  const [left, setLeft] = useState(totalSeconds);
  useEffect(() => {
    setLeft(totalSeconds);
    if (totalSeconds <= 0) return;
    const interval = setInterval(() => {
      setLeft(t => { if (t <= 1) { clearInterval(interval); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds]);

  const pct = totalSeconds > 0 ? (left / totalSeconds) * 100 : 0;
  const isUrgent = left <= 5;
  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke={isUrgent ? '#FF3B3B' : '#FF6B2B'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 300ms ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-num font-bold text-3xl"
            style={{ color: isUrgent ? '#FF3B3B' : '#FF6B2B', transition: 'color 300ms ease' }}
          >
            {left}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Player Card ─────────────────────────────────────────────────────────────
function PlayerCard({ player }: { player: any }) {
  const tierColor =
    player.rating >= 90 ? '#FF6B2B' :
    player.rating >= 85 ? '#E8B84B' :
    player.rating >= 80 ? '#FF8C00' :
    player.rating >= 75 ? '#8A95A8' : '#CD7F32';

  const tierClass =
    player.rating >= 90 ? 'card-icon' :
    player.rating >= 85 ? 'card-gold' :
    player.rating >= 80 ? 'card-rare-gold' :
    player.rating >= 75 ? 'card-silver' : 'card-bronze';

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
      animate={{ opacity: 1, rotateY: 0, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
      className={`w-44 rounded-2xl overflow-hidden ${tierClass}`}
    >
      {/* Image area */}
      <div className="relative h-40 flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)' }}>
        {player.imageUrl ? (
          <img src={player.imageUrl} alt={player.name} className="h-full w-full object-cover object-top" />
        ) : (
          <div className="font-display text-5xl" style={{ color: 'rgba(255,255,255,0.1)' }}>?</div>
        )}
        <div className="absolute top-2 left-2 w-9 h-9 rounded-full flex items-center justify-center font-num font-bold text-xs"
          style={{ background: tierColor, color: '#080C12' }}>
          {player.rating}
        </div>
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
          style={{ background: 'rgba(0,0,0,0.7)', color: tierColor }}>
          {player.position}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="font-heading font-bold text-sm text-white truncate mb-1">{player.name}</div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] truncate" style={{ color: '#8A95A8' }}>{player.club}</span>
          {player.flagUrl && <img src={player.flagUrl} alt="" className="w-5 h-3 object-cover rounded" />}
        </div>
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-1">
          {[['PAC', player.pace], ['SHO', player.shooting], ['DRI', player.dribbling],
            ['PAS', player.passing], ['DEF', player.defending], ['PHY', player.physical]].map(([l, v]) => (
            <div key={l} className="stat-pill">
              <div className="text-[8px] font-bold uppercase" style={{ color: '#8A95A8' }}>{l}</div>
              <div className="text-xs font-num font-bold text-white">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Chaos Overlay ───────────────────────────────────────────────────────────
function ChaosOverlay({ data }: { data: any }) {
  const state = data?.state;
  const card = data?.card;
  const effect = data?.effect;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(8,12,18,0.94)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 300 }}
        className="text-center p-10 rounded-3xl max-w-md w-full mx-4"
        style={{
          background: '#0F1520',
          border: '2px solid #9B5DE5',
          boxShadow: '0 0 60px rgba(155,93,229,0.3), 0 0 120px rgba(155,93,229,0.1)',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: state === 'triggering' ? Infinity : 0 }}
          className="font-display text-7xl mb-4 block"
          style={{ color: '#9B5DE5' }}
        >
          ⚡
        </motion.div>

        <h2 className="font-display text-4xl mb-3" style={{ color: '#F0F4FF', letterSpacing: '0.05em' }}>
          {state === 'triggering' ? 'CHAOS INCOMING' :
           state === 'landed' || state === 'spinning' ? (card?.cardName ?? 'CHAOS CARD') :
           state === 'targeted' ? 'TARGET ACQUIRED' :
           'EFFECT APPLIED'}
        </h2>

        {state === 'applied' && effect?.description && (
          <p className="text-base mb-2" style={{ color: '#8A95A8' }}>{effect.description}</p>
        )}

        {state === 'targeted' && data?.targets && (
          <div className="flex items-center justify-center gap-2 mt-2">
            {data.targets.map((t: string) => (
              <span key={t} className="badge-chaos">{t}</span>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Auction Room ────────────────────────────────────────────────────────
export function AuctionRoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { room, setRoom, updateRoom } = useRoomStore();
  const { user } = useAuthStore();
  const { showChaosOverlay, chaosOverlayData } = useAuctionStore();
  const [bidError, setBidError] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [customBid, setCustomBid] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [events, setEvents] = useState<Array<{ message: string; type: string; ts: number }>>([]);
  const feedRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!code || !user) return;
    const token = localStorage.getItem('accessToken') || '';
    const socket = io(SERVER_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('room:join', { code, token }, (res: any) => {
        if (!res.success) console.error('Join failed:', res.error);
      });
    });

    socket.on('room:state', (state: any) => {
      setRoom(state);
      if (state.status === 'SQUAD_BUILDER') navigate(`/room/${code}/squad-builder`);
    });

    socket.on('room:system_msg', (data: any) => {
      setEvents(prev => [...prev.slice(-49), { message: data.message, type: data.type, ts: Date.now() }]);
    });

    socket.on('auction:bid_update', (data: any) => {
      updateRoom({
        activeBid: {
          playerId: room?.activeBid?.playerId ?? '',
          currentBid: data.currentBid,
          currentBidderId: data.bidderId,
          currentBidderUsername: data.bidderUsername,
          timeLeft: data.timeLeft,
          isOpen: true,
          skips: data.skips || [],
        }
      });
    });

    return () => { socket.emit('room:leave'); socket.disconnect(); };
  }, [code, user]);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [events]);

  const placeBid = (amount: number) => {
    const socket = socketRef.current;
    if (!socket || isBidding) return;
    setIsBidding(true); setBidError('');
    socket.emit('auction:bid', { amount }, (res: any) => {
      setIsBidding(false);
      if (!res.success) setBidError(res.error || 'Bid failed');
    });
  };

  const placeSkip = () => {
    const socket = socketRef.current;
    if (!socket || isBidding) return;
    setIsBidding(true); setBidError('');
    socket.emit('auction:skip', (res: any) => {
      setIsBidding(false);
      if (res && !res.success) setBidError(res.error || 'Skip failed');
    });
  };

  const placeCustomBid = () => {
    const amount = parseInt(customBid, 10);
    if (!isNaN(amount) && amount > 0) { placeBid(amount); setShowCustom(false); setCustomBid(''); }
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080C12' }}>
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#FF6B2B', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const me = room.players.find((p: any) => p.userId === user?.id);
  const currentBid = room.activeBid?.currentBid ?? 0;
  const isHighestBidder = room.activeBid?.currentBidderId === user?.id;
  const isBidOpen = room.status === 'BIDDING' && room.activeBid?.isOpen;
  const canAfford = (amount: number) => (me?.budget ?? 0) >= amount;
  const isTransferBanned = me?.transferBan?.active;
  const hasSkipped = user?.id ? room.activeBid?.skips?.includes(user.id) : false;
  const skipCount = room.activeBid?.skips?.length || 0;

  const bidOptions = currentBid === 0 ? [1, 5, 10] : [currentBid + 1, currentBid + 5, currentBid + 10];

  const msgColor: Record<string, string> = {
    info: '#8A95A8', sold: '#E8B84B', chaos: '#9B5DE5', warning: '#FFD700', bankruptcy: '#FF3B3B',
  };

  const budgetPct = me ? Math.max(0, Math.min(100, (me.budget / room.settings.startingBudget) * 100)) : 0;
  const budgetColor = budgetPct > 40 ? '#FF6B2B' : budgetPct > 15 ? '#E8B84B' : '#FF3B3B';

  const statusLabel: Record<string, string> = {
    BIDDING: '🔴 LIVE AUCTION', REVEALING: 'REVEALING', SPINNING: 'SPINNING',
    CHAOS: 'CHAOS', SQUAD_BUILDER: 'BUILDING SQUADS',
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#080C12', color: '#F0F4FF' }}>

      {/* ─── Header ─── */}
      <header
        className="h-14 flex items-center justify-between px-5 shrink-0"
        style={{ background: '#0F1520', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-4">
          <span className="font-display text-xl tracking-wider" style={{ color: '#FF6B2B' }}>DRAFTWAR</span>
          <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-xs font-mono" style={{ color: '#8A95A8' }}>
            ROOM: <strong className="text-white">{room.code}</strong>
          </span>
          <span className="text-xs font-mono hidden sm:block" style={{ color: '#8A95A8' }}>
            ROUND: <strong style={{ color: '#FF6B2B' }}>{room.round}/{room.totalRounds}</strong>
          </span>
        </div>

        {me && (
          <div className="flex items-center gap-5">
            <div className="hidden sm:block text-right">
              <div className="dw-label">Budget</div>
              <div className="font-num font-bold text-xl" style={{ color: budgetColor }}>
                {me.budget} <span className="text-xs">CP</span>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <div className="dw-label">Squad</div>
              <div className="font-num font-bold text-xl">{me.filledSlots}/11</div>
            </div>
            <Avatar username={me.username} url={me.avatarUrl} size="sm" />
          </div>
        )}
      </header>

      {/* ─── Main Layout ─── */}
      <main className="flex-1 flex overflow-hidden">

        {/* ─── LEFT: Player Card + Feed (hidden on mobile) ─── */}
        <div className="hidden lg:flex w-56 flex-col gap-2 p-3 shrink-0">

          {/* Player card panel */}
          <div
            className="flex-none rounded-2xl flex flex-col items-center justify-center p-4 min-h-[300px]"
            style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <AnimatePresence mode="wait">
              {room.currentPlayer ? (
                <PlayerCard key={room.currentPlayer.id} player={room.currentPlayer} />
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-44 h-60 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  {room.status === 'SPINNING' ? (
                    <>
                      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: '#FF6B2B', borderTopColor: 'transparent' }} />
                      <span className="font-heading font-bold text-xs uppercase tracking-widest" style={{ color: '#FF6B2B' }}>
                        Spinning...
                      </span>
                    </>
                  ) : (
                    <span className="font-display text-5xl" style={{ color: '#3A4458' }}>?</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {room.currentPosition && (
              <div className="mt-3 dw-label" style={{ color: '#8A95A8' }}>
                POS: {room.currentPosition}
              </div>
            )}
          </div>

          {/* Live feed */}
          <div
            className="flex-1 rounded-2xl flex flex-col overflow-hidden"
            style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.06)', minHeight: 0 }}
          >
            <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="dw-label">Live Feed</span>
            </div>
            <div ref={feedRef} className="flex-1 overflow-y-auto p-2 space-y-1" style={{ scrollbarWidth: 'none' }}>
              {events.length === 0 ? (
                <div className="text-center text-xs italic mt-6" style={{ color: '#3A4458' }}>
                  Auction starting...
                </div>
              ) : events.map((e, i) => (
                <div
                  key={i}
                  className="text-xs font-mono py-0.5 px-2 border-l-2 leading-relaxed"
                  style={{ color: msgColor[e.type] || '#8A95A8', borderLeftColor: msgColor[e.type] || '#3A4458' }}
                >
                  {e.message}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── CENTER: Bidding Arena ─── */}
        <div
          className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden"
          style={{ background: '#080C12' }}
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="font-display text-[20vw] font-bold uppercase opacity-[0.015]">DRAFT</span>
          </div>

          {/* Status pill */}
          <div
            className="absolute top-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{
              background: room.status === 'BIDDING' ? 'rgba(255,59,59,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${room.status === 'BIDDING' ? 'rgba(255,59,59,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: room.status === 'BIDDING' ? '#FF3B3B' : '#8A95A8',
            }}
          >
            {statusLabel[room.status] ?? room.status}
          </div>

          {isBidOpen ? (
            <div className="w-full max-w-sm flex flex-col items-center gap-5 relative z-10">

              {/* Player name (mobile visible) */}
              {room.currentPlayer && (
                <div className="text-center lg:hidden">
                  <div className="font-heading font-bold text-2xl text-white">{room.currentPlayer.name}</div>
                  <div className="text-sm" style={{ color: '#8A95A8' }}>{room.currentPlayer.position} · {room.currentPlayer.club}</div>
                </div>
              )}

              {/* Timer */}
              <Countdown key={room.activeBid?.playerId} totalSeconds={room.settings.bidTimer} />

              {/* Current bid display */}
              <motion.div
                key={currentBid}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.25 }}
                className="w-full text-center p-6 rounded-2xl"
                style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="dw-label mb-2">Current Bid</div>
                <div className="font-display text-7xl" style={{ color: '#FF6B2B', textShadow: '0 0 30px rgba(255,107,43,0.3)' }}>
                  {currentBid}
                  <span className="text-2xl ml-2">CP</span>
                </div>
                {room.activeBid?.currentBidderUsername ? (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Avatar username={room.activeBid.currentBidderUsername} size="sm" />
                    <span className="font-bold">{room.activeBid.currentBidderUsername}</span>
                    {isHighestBidder && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(255,107,43,0.15)', color: '#FF6B2B' }}>
                        YOU
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 text-sm font-bold uppercase tracking-wider italic" style={{ color: '#3A4458' }}>
                    No bids yet — open the war
                  </div>
                )}
              </motion.div>

              {/* Bid controls */}
              {isTransferBanned ? (
                <div className="w-full text-center py-4 rounded-xl badge-banned text-base">
                  🚫 Transfer Ban — {me?.transferBan.roundsRemaining} rounds remaining
                </div>
              ) : isHighestBidder ? (
                <div className="w-full text-center py-4 rounded-xl text-sm font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(255,107,43,0.06)', border: '1px solid rgba(255,107,43,0.2)', color: '#FF6B2B' }}>
                  You're winning — hold your nerve
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {bidOptions.map(amt => (
                      <button
                        key={amt}
                        onClick={() => placeBid(amt)}
                        disabled={isBidding || !canAfford(amt) || hasSkipped}
                        className="py-4 rounded-xl font-num font-bold text-base transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                          background: '#FF6B2B',
                          color: 'white',
                          boxShadow: '0 0 16px rgba(255,107,43,0.3)',
                        }}
                      >
                        {amt}
                      </button>
                    ))}
                    {/* Skip */}
                    <button
                      onClick={placeSkip}
                      disabled={isBidding || hasSkipped}
                      className="py-4 rounded-xl font-heading font-bold text-sm transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex flex-col items-center"
                      style={{
                        background: hasSkipped ? '#161E2E' : '#1A2030',
                        color: hasSkipped ? '#3A4458' : '#8A95A8',
                        border: `1px solid ${hasSkipped ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      <span>SKIP</span>
                      <span className="text-[9px] font-mono">{skipCount}/{room.players.length}</span>
                    </button>
                  </div>

                  {/* Custom bid */}
                  <AnimatePresence>
                    {showCustom ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2"
                      >
                        <input
                          type="number"
                          value={customBid}
                          onChange={e => setCustomBid(e.target.value)}
                          placeholder="Any amount..."
                          className="flex-1 dw-input text-center font-num"
                          onKeyDown={e => e.key === 'Enter' && placeCustomBid()}
                          autoFocus
                        />
                        <button onClick={placeCustomBid} className="btn-primary px-4">Bid</button>
                        <button onClick={() => { setShowCustom(false); setCustomBid(''); }} className="btn-ghost px-3">✕</button>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setShowCustom(true)}
                        disabled={hasSkipped}
                        className="w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-30"
                        style={{ color: '#8A95A8', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        + Custom amount
                      </button>
                    )}
                  </AnimatePresence>

                  {bidError && (
                    <div className="text-xs font-bold text-center" style={{ color: '#FF3B3B' }}>{bidError}</div>
                  )}

                  <div className="text-center text-xs" style={{ color: '#3A4458' }}>
                    Budget: <span style={{ color: budgetColor }}>{me?.budget} CP</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#FF6B2B', borderTopColor: 'transparent' }} />
              <div className="font-display text-2xl uppercase tracking-wider" style={{ color: '#FF6B2B' }}>
                {room.status === 'REVEALING' ? 'Player Reveal' : 'Preparing Round'}
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT: Managers Overview ─── */}
        <div
          className="hidden md:flex w-64 flex-col shrink-0"
          style={{ background: '#0F1520', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="dw-label">Managers</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {room.players.map((p: any) => {
              const myBudgetPct = Math.max(0, Math.min(100, (p.budget / room.settings.startingBudget) * 100));
              const bc = myBudgetPct > 40 ? '#FF6B2B' : myBudgetPct > 15 ? '#E8B84B' : '#FF3B3B';
              return (
                <div
                  key={p.userId}
                  className="rounded-xl p-3"
                  style={{
                    background: '#080C12',
                    border: `1px solid ${p.userId === user?.id ? 'rgba(255,107,43,0.25)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar username={p.username} url={p.avatarUrl} size="sm" />
                      <span className="font-bold text-xs text-white truncate max-w-[80px]">{p.username}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-num font-bold text-base"
                        style={{ color: p.isBankrupt ? '#FF3B3B' : bc, textDecoration: p.isBankrupt ? 'line-through' : 'none' }}>
                        {p.budget}
                      </div>
                      <div className="text-[9px] uppercase" style={{ color: '#3A4458' }}>CP</div>
                    </div>
                  </div>

                  {/* Budget bar */}
                  <div className="w-full h-1 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${myBudgetPct}%`, background: bc }} />
                  </div>

                  {/* Squad slots */}
                  <div className="grid grid-cols-6 gap-0.5">
                    {p.squad.map((slot: any, i: number) => (
                      <div
                        key={i}
                        title={slot.player ? `${slot.player.name} (${slot.purchasePrice}CP)` : slot.position}
                        className="h-4 rounded text-[7px] flex items-center justify-center font-bold"
                        style={{
                          background: slot.player
                            ? (slot.isSystemPick ? 'rgba(155,93,229,0.25)' : 'rgba(255,107,43,0.2)')
                            : 'rgba(255,255,255,0.03)',
                          color: slot.player
                            ? (slot.isSystemPick ? '#9B5DE5' : '#FF6B2B')
                            : '#3A4458',
                          border: `1px solid ${slot.player
                            ? (slot.isSystemPick ? 'rgba(155,93,229,0.3)' : 'rgba(255,107,43,0.25)')
                            : 'rgba(255,255,255,0.05)'}`,
                        }}
                      >
                        {slot.position.substring(0, 2)}
                      </div>
                    ))}
                  </div>

                  {p.transferBan?.active && (
                    <div className="mt-2 badge-banned text-[9px]">
                      BANNED · {p.transferBan.roundsRemaining}r
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ─── Chaos Overlay ─── */}
      <AnimatePresence>
        {showChaosOverlay && chaosOverlayData && (
          <ChaosOverlay data={chaosOverlayData} />
        )}
      </AnimatePresence>
    </div>
  );
}
