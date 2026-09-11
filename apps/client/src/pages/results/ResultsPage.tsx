import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '../../store/roomStore';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { io } from 'socket.io-client';
import { api } from '../../lib/api';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

// ─── Confetti particle ───────────────────────────────────────────────────────
function ConfettiParticle({ x, color, delay }: { x: number; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute top-0 w-2 h-2 rounded-sm pointer-events-none"
      style={{ left: `${x}%`, background: color }}
      initial={{ y: -20, rotate: 0, opacity: 1 }}
      animate={{ y: '110vh', rotate: 720, opacity: 0 }}
      transition={{ duration: 3 + Math.random() * 2, delay, ease: 'linear' }}
    />
  );
}

function ConfettiBurst() {
  const particles = Array.from({ length: 60 }).map((_, i) => ({
    x: Math.random() * 100,
    color: ['#FF6B2B', '#E8B84B', '#9B5DE5', '#3D8EFF', '#2ECC71', '#FF3B3B'][Math.floor(Math.random() * 6)],
    delay: Math.random() * 0.8,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {particles.map((p, i) => <ConfettiParticle key={i} {...p} />)}
    </div>
  );
}

// ─── Award badge ─────────────────────────────────────────────────────────────
function AwardBadge({ icon, label, winner, detail }: { icon: string; label: string; winner: string; detail?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 rounded-xl"
      style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="dw-label">{label}</div>
        <div className="font-heading font-bold text-sm text-white uppercase truncate">{winner}</div>
        {detail && <div className="text-xs mt-0.5 truncate" style={{ color: '#8A95A8' }}>{detail}</div>}
      </div>
    </motion.div>
  );
}

// ─── Placement row ────────────────────────────────────────────────────────────
const PLACE_COLORS = ['#E8B84B', '#8A95A8', '#CD7F32', '#3A4458'];
const PLACE_LABELS = ['1st', '2nd', '3rd', '4th'];

// ─── Main Results Page ────────────────────────────────────────────────────────
export function ResultsPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { room, setRoom } = useRoomStore();
  const { user } = useAuthStore();

  const [results, setResults] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<'standings' | 'awards' | 'squads'>('standings');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) return;
    const token = localStorage.getItem('accessToken') || '';
    const socket = io(SERVER_URL, { auth: { token } });

    socket.on('connect', () => {
      socket.emit('room:join', { code, token }, () => {});
    });

    socket.on('room:state', (state: any) => {
      setRoom(state);
      if (state.status === 'RESULTS') {
        // Build results from room state
        buildResultsFromRoom(state);
      }
    });

    // Also try to fetch from API
    api.get(`/rooms/${code}/results`).then(({ data }) => {
      if (data) {
        setResults(data);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }).catch(() => {
      // Fallback — build from current room state
      if (room) buildResultsFromRoom(room);
    });

    return () => { socket.emit('room:leave'); socket.disconnect(); };
  }, [code]);

  const buildResultsFromRoom = (state: any) => {
    if (!state?.players) return;

    // Sort by squad overall rating as proxy for placement
    const sorted = [...state.players].sort((a: any, b: any) => {
      const ratingA = a.squad.reduce((sum: number, s: any) => sum + (s.player?.rating ?? 0), 0);
      const ratingB = b.squad.reduce((sum: number, s: any) => sum + (s.player?.rating ?? 0), 0);
      return ratingB - ratingA;
    });

    const standings = sorted.map((p: any, idx: number) => {
      const totalRating = p.squad.reduce((sum: number, s: any) => sum + (s.player?.rating ?? 0), 0);
      const filledSlots = p.squad.filter((s: any) => s.player).length;
      const avgRating = filledSlots > 0 ? Math.round(totalRating / filledSlots) : 0;
      const totalSpent = state.settings.startingBudget - p.budget;
      return {
        userId: p.userId,
        username: p.username,
        avatarUrl: p.avatarUrl,
        placement: idx + 1,
        overallRating: avgRating,
        budget: p.budget,
        totalSpent,
        filledSlots,
        chaosCardsReceived: p.chaosCardsReceived,
        squad: p.squad,
        eloChange: idx === 0 ? '+18' : idx === 1 ? '+6' : idx === 2 ? '-8' : '-16',
      };
    });

    // Build awards
    const awards = buildAwards(sorted, state.settings.startingBudget);

    setResults({ standings, awards, edition: state.settings.edition, code: state.code });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const buildAwards = (players: any[], startBudget: number) => {
    const awards: any[] = [];

    // Best value: highest rating / CP spent
    const bestValue = [...players].sort((a: any, b: any) => {
      const spentA = startBudget - a.budget;
      const spentB = startBudget - b.budget;
      const ratingA = a.squad.reduce((sum: number, s: any) => sum + (s.player?.rating ?? 0), 0);
      const ratingB = b.squad.reduce((sum: number, s: any) => sum + (s.player?.rating ?? 0), 0);
      return (ratingB / Math.max(1, spentB)) - (ratingA / Math.max(1, spentA));
    })[0];
    if (bestValue) awards.push({ icon: '💰', label: 'Best Value Manager', winner: bestValue.username, detail: `Spent ${startBudget - bestValue.budget}CP efficiently` });

    // Biggest spender
    const biggestSpender = [...players].sort((a: any, b: any) =>
      (startBudget - b.budget) - (startBudget - a.budget)
    )[0];
    if (biggestSpender) awards.push({ icon: '💸', label: 'All-In Manager', winner: biggestSpender.username, detail: `Spent ${startBudget - biggestSpender.budget}CP` });

    // Chaos magnet
    const chaosMagnet = [...players].sort((a: any, b: any) => b.chaosCardsReceived - a.chaosCardsReceived)[0];
    if (chaosMagnet && chaosMagnet.chaosCardsReceived > 0) {
      awards.push({ icon: '⚡', label: 'Chaos Magnet', winner: chaosMagnet.username, detail: `Received ${chaosMagnet.chaosCardsReceived} chaos cards` });
    }

    // Best squad rating
    const bestSquad = players[0];
    if (bestSquad) awards.push({ icon: '🏆', label: 'Best Squad', winner: bestSquad.username, detail: `Highest overall rating` });

    // Most frugal
    const mostFrugal = [...players].sort((a: any, b: any) => a.budget - b.budget)[0];
    if (mostFrugal) awards.push({ icon: '🏦', label: 'Last Penny Manager', winner: mostFrugal.username, detail: `Only ${mostFrugal.budget}CP remaining` });

    return awards;
  };

  const handleShare = () => {
    const winner = results?.standings?.[0];
    const isWinner = winner?.userId === user?.id;
    const text = isWinner
      ? `🏆 I just won a DraftWar session! My squad rated ${winner?.overallRating} overall. Can you beat me?\n\ndraftwar.gg`
      : `⚔️ Just played DraftWar — a real-time football squad auction. Finished ${results?.standings?.find((s: any) => s.userId === user?.id)?.placement}th. Build your squad at draftwar.gg`;

    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!results) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: '#080C12' }}>
        <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#FF6B2B', borderTopColor: 'transparent' }} />
        <div className="font-heading font-bold uppercase tracking-widest" style={{ color: '#8A95A8' }}>
          Calculating results...
        </div>
      </div>
    );
  }

  const myResult = results.standings.find((s: any) => s.userId === user?.id);
  const winner = results.standings[0];
  const isWinner = winner?.userId === user?.id;

  return (
    <div className="min-h-screen" style={{ background: '#080C12', color: '#F0F4FF' }}>

      {showConfetti && <ConfettiBurst />}

      {/* Header */}
      <header
        className="flex items-center justify-between px-8 py-4"
        style={{ background: '#0F1520', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="font-display text-2xl tracking-wider" style={{ color: '#FF6B2B' }}>DRAFTWAR</div>
        <div className="dw-label">Battle Results</div>
        <button
          onClick={() => navigate('/')}
          className="btn-ghost text-sm px-4 py-2"
        >
          ← Hub
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* ─── Winner Hero ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="dw-label mb-4">Winner</div>
          <div
            className="inline-flex flex-col items-center gap-4 px-10 py-8 rounded-3xl relative"
            style={{
              background: 'rgba(232,184,75,0.06)',
              border: '2px solid #E8B84B',
              boxShadow: '0 0 60px rgba(232,184,75,0.15)',
            }}
          >
            <Avatar username={winner.username} url={winner.avatarUrl} size="lg" />
            <div>
              <div className="font-display text-5xl md:text-6xl text-gradient-gold">{winner.username.toUpperCase()}'S XI</div>
              {winner.overallRating > 0 && (
                <div className="font-mono text-sm mt-1" style={{ color: '#8A95A8' }}>
                  Squad Rating: <span style={{ color: '#E8B84B' }}>{winner.overallRating}</span>
                </div>
              )}
            </div>
            {isWinner && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', bounce: 0.5 }}
                className="absolute -top-4 -right-4 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-widest"
                style={{ background: '#FF6B2B', color: 'white', boxShadow: '0 0 16px rgba(255,107,43,0.5)' }}
              >
                That's You! 🔥
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ─── ELO Change for current user ─── */}
        {myResult && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-8"
          >
            <div
              className="flex items-center gap-6 px-8 py-4 rounded-2xl"
              style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="text-center">
                <div className="dw-label mb-1">Your Placement</div>
                <div className="font-display text-4xl" style={{ color: PLACE_COLORS[myResult.placement - 1] ?? '#8A95A8' }}>
                  {PLACE_LABELS[myResult.placement - 1] ?? `${myResult.placement}th`}
                </div>
              </div>
              <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="text-center">
                <div className="dw-label mb-1">ELO Change</div>
                <div className="font-display text-4xl" style={{
                  color: myResult.eloChange.startsWith('+') ? '#2ECC71' : '#FF3B3B'
                }}>
                  {myResult.eloChange}
                </div>
              </div>
              <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="text-center">
                <div className="dw-label mb-1">Squad OVR</div>
                <div className="font-display text-4xl" style={{ color: '#FF6B2B' }}>
                  {myResult.overallRating}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Tabs ─── */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.06)' }}>
          {(['standings', 'awards', 'squads'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-lg font-heading font-bold text-sm uppercase tracking-wider transition-all"
              style={{
                background: activeTab === tab ? '#FF6B2B' : 'transparent',
                color: activeTab === tab ? 'white' : '#8A95A8',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ─── Standings Tab ─── */}
          {activeTab === 'standings' && (
            <motion.div
              key="standings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {results.standings.map((s: any, idx: number) => (
                <motion.div
                  key={s.userId}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-center gap-5 p-5 rounded-2xl"
                  style={{
                    background: s.userId === user?.id ? 'rgba(255,107,43,0.06)' : '#0F1520',
                    border: `1px solid ${s.userId === user?.id ? 'rgba(255,107,43,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  {/* Position */}
                  <div className="w-10 text-center">
                    <span className="font-display text-3xl" style={{ color: PLACE_COLORS[idx] ?? '#3A4458' }}>
                      {PLACE_LABELS[idx] ?? `${idx + 1}`}
                    </span>
                  </div>

                  <Avatar username={s.username} url={s.avatarUrl} size="md" />

                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-bold text-lg text-white uppercase flex items-center gap-2">
                      {s.username}'s XI
                      {s.userId === user?.id && (
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,107,43,0.12)', color: '#FF6B2B' }}>you</span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs" style={{ color: '#8A95A8' }}>
                        OVR <strong className="text-white">{s.overallRating}</strong>
                      </span>
                      <span className="text-xs" style={{ color: '#8A95A8' }}>
                        Spent <strong className="text-white">{s.totalSpent}CP</strong>
                      </span>
                      <span className="text-xs hidden sm:block" style={{ color: '#8A95A8' }}>
                        {s.filledSlots}/11 filled
                      </span>
                    </div>
                  </div>

                  {/* ELO */}
                  <div className="text-right shrink-0">
                    <div className="dw-label mb-1">ELO</div>
                    <div className="font-num font-bold text-xl" style={{
                      color: s.eloChange?.startsWith?.('+') ? '#2ECC71' : '#FF3B3B'
                    }}>
                      {s.eloChange}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ─── Awards Tab ─── */}
          {activeTab === 'awards' && (
            <motion.div
              key="awards"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {results.awards.map((award: any, idx: number) => (
                <motion.div key={award.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
                  <AwardBadge {...award} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ─── Squads Tab ─── */}
          {activeTab === 'squads' && (
            <motion.div
              key="squads"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {results.standings.map((s: any, idx: number) => (
                <motion.div
                  key={s.userId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-5 rounded-2xl"
                  style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-2xl" style={{ color: PLACE_COLORS[idx] ?? '#3A4458' }}>
                        {PLACE_LABELS[idx]}
                      </span>
                      <Avatar username={s.username} url={s.avatarUrl} size="sm" />
                      <span className="font-heading font-bold uppercase text-white">{s.username}'s XI</span>
                    </div>
                    <div className="font-num font-bold" style={{ color: '#FF6B2B' }}>
                      OVR {s.overallRating}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {s.squad.filter((slot: any) => slot.player).map((slot: any, slotIdx: number) => {
                      const r = slot.player.rating;
                      const tierColor = r >= 90 ? '#FF6B2B' : r >= 85 ? '#E8B84B' : r >= 80 ? '#FF8C00' : r >= 75 ? '#8A95A8' : '#CD7F32';
                      return (
                        <div
                          key={slotIdx}
                          className="flex items-center gap-2 p-2 rounded-lg"
                          style={{
                            background: slot.isSystemPick ? 'rgba(155,93,229,0.08)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${slot.isSystemPick ? 'rgba(155,93,229,0.2)' : 'rgba(255,255,255,0.05)'}`,
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center font-num font-bold text-xs shrink-0"
                            style={{ background: 'rgba(0,0,0,0.3)', color: tierColor }}
                          >
                            {r}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{slot.player.name.split(' ').pop()}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[9px] font-bold uppercase" style={{ color: '#8A95A8' }}>{slot.position.substring(0, 3)}</span>
                              <span className="text-[9px]" style={{ color: '#3A4458' }}>{slot.purchasePrice}CP</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Action Buttons ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 mt-10"
        >
          <button
            onClick={handleShare}
            className="flex-1 py-4 rounded-xl font-heading font-bold text-base uppercase tracking-widest transition-all active:scale-95"
            style={{ background: '#FF6B2B', color: 'white', boxShadow: '0 0 24px rgba(255,107,43,0.35)' }}
          >
            {copied ? '✓ Copied to clipboard!' : '📤 Share Result'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-4 rounded-xl font-heading font-bold text-base uppercase tracking-widest transition-all active:scale-95"
            style={{ background: '#0F1520', color: '#8A95A8', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            ← Return to Hub
          </button>
          {winner && winner.userId !== user?.id && (
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-4 rounded-xl font-heading font-bold text-base uppercase tracking-widest transition-all active:scale-95"
              style={{ background: '#161E2E', color: '#FF6B2B', border: '1px solid rgba(255,107,43,0.25)' }}
            >
              ⚔️ Rematch
            </button>
          )}
        </motion.div>
      </main>
    </div>
  );
}
