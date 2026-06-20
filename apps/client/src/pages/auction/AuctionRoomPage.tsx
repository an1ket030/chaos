import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '../../store/roomStore';
import { useAuthStore } from '../../store/authStore';
import { useAuctionStore } from '../../store/auctionStore';
import { Avatar } from '../../components/ui/Avatar';
import { io } from 'socket.io-client';

// ─── Countdown timer that resets whenever initialTime changes ──────────────
function Countdown({ totalSeconds }: { totalSeconds: number }) {
  const [left, setLeft] = useState(totalSeconds);

  useEffect(() => {
    setLeft(totalSeconds);
    if (totalSeconds <= 0) return;
    const interval = setInterval(() => {
      setLeft((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds]);

  const pct = totalSeconds > 0 ? (left / totalSeconds) * 100 : 0;
  const isUrgent = left <= 3;

  return (
    <div className="w-full">
      <div
        className="text-6xl font-black font-mono text-center mb-3 transition-colors"
        style={{ color: isUrgent ? '#FF4444' : '#C8FF00' }}
      >
        {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: isUrgent ? '#FF4444' : '#C8FF00',
            boxShadow: isUrgent ? '0 0 10px rgba(255,68,68,0.6)' : '0 0 10px rgba(200,255,0,0.4)',
          }}
        />
      </div>
    </div>
  );
}

// ─── FIFA-style player card ─────────────────────────────────────────────────
function PlayerCardDisplay({ player }: { player: any }) {
  const ratingColor =
    player.rating >= 90 ? '#C8FF00' :
    player.rating >= 85 ? '#FFD700' :
    player.rating >= 80 ? '#FF8C00' :
    player.rating >= 75 ? '#C0C0C0' : '#CD7F32';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
      className="w-48 rounded-2xl overflow-hidden border-2 shadow-2xl"
      style={{ borderColor: ratingColor, background: 'linear-gradient(135deg, #1a1a1a, #0d0d0d)' }}
    >
      {/* Player image */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center">
        {player.imageUrl ? (
          <img
            src={player.imageUrl}
            alt={player.name}
            className="h-full w-full object-cover object-top"
            onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="text-6xl text-white/20">⚽</div>
        )}
        {/* Rating badge */}
        <div
          className="absolute top-2 left-2 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-black"
          style={{ background: ratingColor }}
        >
          {player.rating}
        </div>
        {/* Position badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-black uppercase" style={{ background: 'rgba(0,0,0,0.7)', color: ratingColor }}>
          {player.position}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="font-black text-sm text-white truncate mb-1">{player.name}</div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-400 truncate">{player.club}</span>
          {player.flagUrl && <img src={player.flagUrl} alt="" className="w-5 h-3 object-cover rounded" />}
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 text-center">
          {[['PAC', player.pace], ['SHO', player.shooting], ['DRI', player.dribbling]].map(([label, val]) => (
            <div key={label} className="bg-white/5 rounded p-1">
              <div className="text-[8px] text-gray-500 font-bold">{label}</div>
              <div className="text-xs font-black text-white">{val}</div>
            </div>
          ))}
          {[['PAS', player.passing], ['DEF', player.defending], ['PHY', player.physical]].map(([label, val]) => (
            <div key={label} className="bg-white/5 rounded p-1">
              <div className="text-[8px] text-gray-500 font-bold">{label}</div>
              <div className="text-xs font-black text-white">{val}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Auction Room Page ─────────────────────────────────────────────────
export function AuctionRoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { room, setRoom, updateRoom } = useRoomStore();
  const { user } = useAuthStore();
  const { showChaosOverlay, chaosOverlayData } = useAuctionStore();
  const [bidError, setBidError] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [events, setEvents] = useState<Array<{ message: string; type: string; ts: number }>>([]);
  const feedRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // Connect socket
  useEffect(() => {
    if (!code || !user) return;
    const token = localStorage.getItem('accessToken') || '';

    const socket = io('http://localhost:3001', { auth: { token } });
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
      setEvents((prev) => [...prev.slice(-49), { message: data.message, type: data.type, ts: Date.now() }]);
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

    return () => {
      socket.emit('room:leave');
      socket.disconnect();
    };
  }, [code, user]);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [events]);

  const placeBid = (amount: number) => {
    const socket = socketRef.current;
    if (!socket || isBidding) return;
    setIsBidding(true);
    setBidError('');
    socket.emit('auction:bid', { amount }, (res: any) => {
      setIsBidding(false);
      if (!res.success) setBidError(res.error || 'Bid failed');
    });
  };

  const placeSkip = () => {
    const socket = socketRef.current;
    if (!socket || isBidding) return;
    setIsBidding(true);
    setBidError('');
    socket.emit('auction:skip', (res: any) => {
      setIsBidding(false);
      if (res && !res.success) setBidError(res.error || 'Skip failed');
    });
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d0d' }}>
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8FF00', borderTopColor: 'transparent' }} />
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

  // Bid amounts: current + 1, +5, +10
  const bidOptions = currentBid === 0
    ? [1, 5, 10]
    : [currentBid + 1, currentBid + 5, currentBid + 10];

  const msgColor: Record<string, string> = {
    info: '#888',
    sold: '#C8FF00',
    chaos: '#a855f7',
    warning: '#FFD700',
    bankruptcy: '#FF4444',
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#0d0d0d', color: '#fff' }}>

      {/* ── Header ── */}
      <header className="h-14 flex items-center justify-between px-6 border-b shrink-0" style={{ background: '#141414', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-4">
          <span className="font-black text-lg tracking-tighter" style={{ color: '#C8FF00' }}>CHAOS CLUB</span>
          <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-xs font-mono text-gray-400">ROOM: <strong className="text-white">{room.code}</strong></span>
          <span className="text-xs font-mono text-gray-400">ROUND: <strong style={{ color: '#C8FF00' }}>{room.round}/{room.totalRounds}</strong></span>
        </div>
        {me && (
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Budget</div>
              <div className="text-xl font-black" style={{ color: '#C8FF00' }}>{me.budget} <span className="text-xs">CP</span></div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Squad</div>
              <div className="text-xl font-black">{me.filledSlots}/11</div>
            </div>
            <Avatar username={me.username} url={me.avatarUrl} size="sm" />
          </div>
        )}
      </header>

      {/* ── Main 3-column layout ── */}
      <main className="flex-1 flex overflow-hidden gap-3 p-3">

        {/* LEFT: Player card + feed */}
        <div className="w-64 flex flex-col gap-3 shrink-0">
          {/* Player reveal */}
          <div className="flex-none rounded-2xl border border-white/5 flex flex-col items-center justify-center p-4 min-h-[340px]" style={{ background: '#141414' }}>
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
              {room.currentPosition ? `Pos: ${room.currentPosition}` : 'Waiting...'}
            </div>
            <AnimatePresence mode="wait">
              {room.currentPlayer ? (
                <PlayerCardDisplay key={room.currentPlayer.id} player={room.currentPlayer} />
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-48 h-64 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3"
                >
                  {room.status === 'SPINNING' ? (
                    <>
                      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8FF00', borderTopColor: 'transparent' }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#C8FF00' }}>Spinning...</span>
                    </>
                  ) : (
                    <span className="text-5xl text-white/10">?</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live feed */}
          <div className="flex-1 rounded-2xl border border-white/5 flex flex-col overflow-hidden" style={{ background: '#141414', minHeight: 0 }}>
            <div className="px-4 py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Live Events</span>
              </div>
            </div>
            <div ref={feedRef} className="flex-1 overflow-y-auto p-3 space-y-1 text-xs font-mono" style={{ scrollbarWidth: 'none' }}>
              {events.length === 0 ? (
                <div className="text-gray-600 italic text-center mt-4">Waiting for auction to begin...</div>
              ) : (
                events.map((e, i) => (
                  <div key={i} style={{ color: msgColor[e.type] || '#888', borderLeft: `2px solid ${msgColor[e.type] || '#333'}`, paddingLeft: '8px' }}>
                    {e.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* CENTER: Bidding arena */}
        <div className="flex-1 rounded-2xl border border-white/5 flex flex-col items-center justify-center p-8 relative overflow-hidden" style={{ background: '#141414' }}>

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ opacity: 0.015 }}>
            <span className="text-[18rem] font-black uppercase">CHAOS</span>
          </div>

          {/* Status label */}
          <div className="absolute top-4 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            {room.status === 'BIDDING' ? '🔴 Live Auction' : room.status === 'REVEALING' ? '👁️ Revealing' : room.status === 'SPINNING' ? '🎡 Spinning' : room.status}
          </div>

          {isBidOpen ? (
            <div className="w-full max-w-sm flex flex-col items-center gap-6 relative z-10">

              {/* Player name recap */}
              {room.currentPlayer && (
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{room.currentPlayer.name}</div>
                  <div className="text-sm text-gray-400">{room.currentPlayer.position} · {room.currentPlayer.club}</div>
                </div>
              )}

              {/* Countdown */}
              <Countdown key={room.activeBid?.playerId} totalSeconds={room.settings.bidTimer} />

              {/* Current bid */}
              <div className="w-full text-center p-6 rounded-2xl border border-white/8" style={{ background: '#0d0d0d' }}>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Current Bid</div>
                <div className="text-7xl font-black tracking-tighter" style={{ color: '#C8FF00' }}>
                  {currentBid}
                  <span className="text-2xl ml-2">CP</span>
                </div>
                {room.activeBid?.currentBidderUsername ? (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Avatar username={room.activeBid.currentBidderUsername} size="sm" />
                    <span className="font-bold">{room.activeBid.currentBidderUsername}</span>
                    {isHighestBidder && <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(200,255,0,0.1)', color: '#C8FF00' }}>YOU</span>}
                  </div>
                ) : (
                  <div className="text-gray-500 mt-3 font-bold uppercase tracking-wider text-sm italic">No bids yet</div>
                )}
              </div>

              {/* Bid buttons — ALL players can bid simultaneously */}
              {isTransferBanned ? (
                <div className="w-full text-center py-4 rounded-xl border border-red-500/40 text-red-400 font-bold uppercase tracking-wider text-sm" style={{ background: 'rgba(255,68,68,0.08)' }}>
                  🚫 Transfer Ban Active ({me?.transferBan.roundsRemaining} rounds)
                </div>
              ) : isHighestBidder ? (
                <div className="w-full text-center py-4 rounded-xl border border-white/10 text-gray-500 font-bold uppercase tracking-wider text-sm">
                  You're the highest bidder — wait for others to raise
                </div>
              ) : (
                <div className="w-full flex flex-col gap-3">
                  <div className="grid grid-cols-4 gap-3">
                    {bidOptions.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => placeBid(amt)}
                        disabled={isBidding || !canAfford(amt) || hasSkipped}
                        className="py-4 rounded-xl font-black text-lg transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                          background: '#C8FF00',
                          color: '#000',
                          boxShadow: '0 0 15px rgba(200,255,0,0.3)',
                        }}
                      >
                        {amt} CP
                      </button>
                    ))}
                    <button
                      onClick={placeSkip}
                      disabled={isBidding || hasSkipped}
                      className="py-4 rounded-xl font-black text-lg transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex flex-col items-center justify-center"
                      style={{
                        background: hasSkipped ? '#333' : '#FF4444',
                        color: '#fff',
                        boxShadow: hasSkipped ? 'none' : '0 0 15px rgba(255,68,68,0.3)',
                      }}
                    >
                      <span>SKIP</span>
                      <span className="text-[10px] font-bold opacity-80">{skipCount}/{room.players.length}</span>
                    </button>
                  </div>
                  {bidError && (
                    <div className="text-red-400 text-sm font-bold text-center">{bidError}</div>
                  )}
                  <div className="text-center text-xs text-gray-600">
                    Your budget: <span style={{ color: '#C8FF00' }}>{me?.budget} CP</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center relative z-10">
              <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#C8FF00', borderTopColor: 'transparent' }} />
              <div className="font-black text-xl uppercase tracking-widest" style={{ color: '#C8FF00' }}>
                {room.status === 'REVEALING' ? 'Player Reveal...' : 'Preparing Next Round'}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Managers overview */}
        <div className="w-72 rounded-2xl border border-white/5 flex flex-col overflow-hidden shrink-0" style={{ background: '#141414' }}>
          <div className="px-4 py-3 border-b border-white/5">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Managers Overview</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {room.players.map((p: any) => (
              <div
                key={p.userId}
                className="rounded-xl border p-4"
                style={{
                  background: '#0d0d0d',
                  borderColor: p.userId === user?.id ? 'rgba(200,255,0,0.3)' : 'rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Avatar username={p.username} url={p.avatarUrl} size="sm" />
                    <div className="font-bold text-sm truncate max-w-[90px]">{p.username}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black text-lg ${p.isBankrupt ? 'line-through text-red-500' : ''}`} style={{ color: p.isBankrupt ? '#FF4444' : '#C8FF00' }}>
                      {p.budget}
                    </div>
                    <div className="text-[9px] text-gray-600 font-bold -mt-1">CP</div>
                  </div>
                </div>
                {/* Squad slots */}
                <div className="grid grid-cols-6 gap-0.5 mb-2">
                  {p.squad.map((slot: any, i: number) => (
                    <div
                      key={i}
                      title={slot.player ? `${slot.player.name} (${slot.purchasePrice}CP)` : slot.position}
                      className="h-5 rounded text-[8px] flex items-center justify-center font-bold"
                      style={{
                        background: slot.player
                          ? (slot.isSystemPick ? 'rgba(168,85,247,0.3)' : 'rgba(200,255,0,0.2)')
                          : 'rgba(255,255,255,0.04)',
                        color: slot.player
                          ? (slot.isSystemPick ? '#a855f7' : '#C8FF00')
                          : '#333',
                        border: `1px solid ${slot.player ? (slot.isSystemPick ? 'rgba(168,85,247,0.4)' : 'rgba(200,255,0,0.3)') : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {slot.position.substring(0, 2)}
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 11 - p.squad.length) }).map((_, i) => (
                    <div key={`e${i}`} className="h-5 rounded" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
                  ))}
                </div>
                {/* Bought Players List */}
                {p.squad.filter((s: any) => s.player).length > 0 && (
                  <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-white/5">
                    {p.squad.filter((s: any) => s.player).map((slot: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 font-mono w-6">{slot.position.substring(0, 2)}</span>
                        <span className="text-white font-bold truncate flex-1" style={{ color: slot.isSystemPick ? '#a855f7' : '#fff' }}>{slot.player.name.split(' ').pop()}</span>
                        <span className="text-gray-500 font-bold">{slot.purchasePrice} CP</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ── Chaos overlay ── */}
      <AnimatePresence>
        {showChaosOverlay && chaosOverlayData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.7, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className="text-center p-10 rounded-3xl border-2 max-w-lg w-full mx-4"
              style={{ background: '#141414', borderColor: '#a855f7', boxShadow: '0 0 60px rgba(168,85,247,0.3)' }}
            >
              <div className="text-7xl mb-6">⚡</div>
              <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-3">
                {(chaosOverlayData as any).state === 'triggering' ? 'Chaos Incoming!' :
                 (chaosOverlayData as any).state === 'landed' ? (chaosOverlayData as any).card?.cardName :
                 'Effect Applied'}
              </h2>
              {(chaosOverlayData as any).state === 'applied' && (
                <p className="text-xl text-gray-300">{(chaosOverlayData as any).effect?.description}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
