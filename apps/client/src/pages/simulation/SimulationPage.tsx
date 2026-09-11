import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../../store/roomStore';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../../components/ui/Avatar';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

const EVENT_ICONS: Record<string, string> = {
  goal: '⚽', yellow: '🟨', red: '🟥', save: '🧤',
  assist: '🎯', key_pass: '🔑', whistle: '⏱️',
};
const EVENT_COLORS: Record<string, string> = {
  goal: '#E8B84B', red: '#FF3B3B', yellow: '#FFD700',
  save: '#3D8EFF', whistle: '#9B5DE5',
};

export function SimulationPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { room, setRoom } = useRoomStore();
  const socketRef = useRef<any>(null);

  const [matchups, setMatchups] = useState<any[]>([]);
  const [currentMatch, setCurrentMatch] = useState<{ teamA: string; teamB: string } | null>(null);
  const [score, setScore] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<any[]>([]);
  const [matchMinute, setMatchMinute] = useState(0);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [goalFlash, setGoalFlash] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!code) return;
    const token = localStorage.getItem('accessToken') || '';
    const socket = io(SERVER_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('room:join', { code, token }, (res: any) => {
        if (!res.success) console.error('Simulation join failed:', res.error);
      });
    });

    socket.on('room:state', (state: any) => {
      setRoom(state);
      if (state.status === 'RESULTS') navigate(`/room/${code}/results`);
    });

    socket.on('simulation:start', (data: any) => {
      setMatchups(data.matchups);
      setEvents([]);
      setScore({});
      setCurrentMatch(null);
      setMatchMinute(0);
      if (data.matchups.length > 0) {
        setCurrentMatch({ teamA: data.matchups[0].teamA, teamB: data.matchups[0].teamB });
      }
    });

    socket.on('simulation:event', (data: any) => {
      setEvents(prev => [...prev, data]);
      if (data.minute && typeof data.minute === 'number') setMatchMinute(data.minute);
      if (data.score) {
        setScore(data.score);
        // Flash on goal
        if (data.type === 'goal') {
          const scoringTeam = Object.entries(data.score).find(([id]) => {
            const prev = score[id] ?? 0;
            return (data.score[id] as number) > prev;
          })?.[0];
          if (scoringTeam) {
            setGoalFlash(scoringTeam);
            setTimeout(() => setGoalFlash(null), 1200);
          }
        }
      }
      if (data.score) {
        const teams = Object.keys(data.score);
        if (teams.length >= 2) setCurrentMatch({ teamA: teams[0], teamB: teams[1] });
      }
    });

    socket.on('simulation:result', (data: any) => {
      setEvents(prev => [...prev, { minute: 'FT', type: 'whistle', playerName: 'Full Time', detail: `Final: ${data.scoreA} – ${data.scoreB}` }]);
    });

    socket.on('simulation:tournament_result', (data: any) => {
      setFinalResult(data);
      setTimeout(() => navigate(`/room/${code}/results`), 5000);
    });

    return () => { socket.emit('room:leave'); socket.disconnect(); };
  }, [code]);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [events]);

  const teamA = currentMatch ? room?.players.find((p: any) => p.userId === currentMatch.teamA) : null;
  const teamB = currentMatch ? room?.players.find((p: any) => p.userId === currentMatch.teamB) : null;
  const scoreA = score[currentMatch?.teamA ?? ''] ?? 0;
  const scoreB = score[currentMatch?.teamB ?? ''] ?? 0;

  const flashA = goalFlash === currentMatch?.teamA;
  const flashB = goalFlash === currentMatch?.teamB;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080C12', color: '#F0F4FF' }}>

      {/* Header */}
      <header
        className="flex items-center justify-between px-8 py-4"
        style={{ background: '#0F1520', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="font-display text-2xl tracking-wider" style={{ color: '#FF6B2B' }}>DRAFTWAR</div>
        <div className="dw-label">Match Simulation</div>
        <div className="font-num font-bold text-sm px-3 py-1 rounded-full"
          style={{ background: 'rgba(155,93,229,0.1)', border: '1px solid rgba(155,93,229,0.3)', color: '#9B5DE5' }}>
          CHAOS ENGINE
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-6 py-8 gap-6">

        {/* ─── Scoreboard ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-stretch">
            {/* Team A */}
            <motion.div
              className="flex-1 flex flex-col items-center justify-center py-8 px-6"
              animate={{ background: flashA ? 'rgba(232,184,75,0.15)' : 'transparent' }}
              transition={{ duration: 0.3 }}
            >
              <Avatar username={teamA?.username ?? 'Team A'} url={teamA?.avatarUrl} size="lg" />
              <div className="font-heading font-bold text-lg text-white uppercase mt-3 mb-1">
                {teamA?.username ?? 'Team A'}
              </div>
              <motion.div
                key={scoreA}
                initial={{ scale: 1.5, color: '#E8B84B' }}
                animate={{ scale: 1, color: '#FF6B2B' }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="font-display"
                style={{ fontSize: '6rem', lineHeight: 1, textShadow: '0 0 30px rgba(255,107,43,0.3)' }}
              >
                {scoreA}
              </motion.div>
            </motion.div>

            {/* Center */}
            <div className="flex flex-col items-center justify-center px-6 py-8"
              style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="font-display text-3xl mb-2" style={{ color: '#3A4458' }}>VS</div>
              <div className="font-mono text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(255,107,43,0.1)', color: '#FF6B2B', border: '1px solid rgba(255,107,43,0.2)' }}>
                {typeof matchMinute === 'number' && matchMinute > 0 ? `${matchMinute}'` : 'KO'}
              </div>
              {matchups.length > 1 && (
                <div className="text-[10px] mt-2 uppercase tracking-widest" style={{ color: '#3A4458' }}>
                  Match 1/{matchups.length}
                </div>
              )}
            </div>

            {/* Team B */}
            <motion.div
              className="flex-1 flex flex-col items-center justify-center py-8 px-6"
              animate={{ background: flashB ? 'rgba(155,93,229,0.15)' : 'transparent' }}
              transition={{ duration: 0.3 }}
            >
              <Avatar username={teamB?.username ?? 'Team B'} url={teamB?.avatarUrl} size="lg" />
              <div className="font-heading font-bold text-lg text-white uppercase mt-3 mb-1">
                {teamB?.username ?? 'Team B'}
              </div>
              <motion.div
                key={scoreB}
                initial={{ scale: 1.5, color: '#E8B84B' }}
                animate={{ scale: 1, color: '#9B5DE5' }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="font-display"
                style={{ fontSize: '6rem', lineHeight: 1, textShadow: '0 0 30px rgba(155,93,229,0.3)' }}
              >
                {scoreB}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* ─── Winner Banner ─── */}
        <AnimatePresence>
          {finalResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 px-8 rounded-2xl"
              style={{ background: 'rgba(232,184,75,0.08)', border: '2px solid #E8B84B', boxShadow: '0 0 40px rgba(232,184,75,0.15)' }}
            >
              <div className="dw-label mb-2">Tournament Winner</div>
              <div className="font-display text-5xl text-gradient-gold">
                {finalResult.winnerUsername}
              </div>
              <div className="text-sm mt-2" style={{ color: '#8A95A8' }}>Navigating to results...</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Event Feed ─── */}
        <div
          ref={feedRef}
          className="rounded-2xl overflow-y-auto flex-1"
          style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.06)', maxHeight: '45vh', scrollbarWidth: 'none' }}
        >
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
              <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#FF6B2B', borderTopColor: 'transparent' }} />
              <div className="font-heading font-bold uppercase tracking-widest text-sm" style={{ color: '#8A95A8' }}>
                Awaiting Kickoff...
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              <AnimatePresence initial={false}>
                {events.map((e, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-4 items-center p-3 rounded-xl border-l-4"
                    style={{
                      background: e.type === 'goal' ? 'rgba(232,184,75,0.06)' : 'rgba(255,255,255,0.02)',
                      borderColor: EVENT_COLORS[e.type] || '#3A4458',
                    }}
                  >
                    <span className="font-mono font-bold text-xs shrink-0 w-9 text-right" style={{ color: '#8A95A8' }}>
                      {e.minute !== 'FT' ? `${e.minute}'` : 'FT'}
                    </span>
                    <span className="text-xl shrink-0">{EVENT_ICONS[e.type] || '▶'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white truncate">{e.playerName}</div>
                      <div className="text-xs truncate" style={{ color: '#8A95A8' }}>{e.detail}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
