import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '../../store/roomStore';
import { useSocket } from '../../hooks/useSocket';
import { api } from '../../lib/api';
import { Avatar } from '../../components/ui/Avatar';

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
  const socket = useSocket();

  const [matchups, setMatchups] = useState<any[]>([]);
  const [currentMatch, setCurrentMatch] = useState<{ teamA: string; teamB: string } | null>(null);
  const [score, setScore] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<any[]>([]);
  const [matchMinute, setMatchMinute] = useState(0);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [goalFlash, setGoalFlash] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef(score);
  scoreRef.current = score;

  // Initial load: fetch room state from REST
  useEffect(() => {
    if (!code) return;
    const upperCode = code.toUpperCase();

    api.get(`/rooms/${upperCode}`)
      .then(({ data }) => {
        if (data) {
          setRoom(data);
          if (data.status === 'RESULTS') {
            navigate(`/room/${upperCode}/results`);
          }
        }
      })
      .catch((err) => console.warn('Simulation room fetch warning:', err));
  }, [code, navigate, setRoom]);

  // Unified socket listeners
  useEffect(() => {
    if (!code) return;
    const upperCode = code.toUpperCase();
    const token = localStorage.getItem('accessToken') || '';

    // Join room channel & request simulation sync
    socket.emit('room:join', { code: upperCode, token }, (res: any) => {
      if (res?.room) {
        setRoom(res.room);
        if (res.room.status === 'RESULTS') {
          navigate(`/room/${upperCode}/results`);
        }
      }
    });

    socket.emit('simulation:sync');

    const onRoomState = (state: any) => {
      if (!state) return;
      setRoom(state);
      if (state.status === 'RESULTS') {
        navigate(`/room/${upperCode}/results`);
      }
    };

    const onSimStart = (data: any) => {
      if (data?.matchups) {
        setMatchups(data.matchups);
        if (data.matchups.length > 0) {
          setCurrentMatch({ teamA: data.matchups[0].teamA, teamB: data.matchups[0].teamB });
        }
      }
    };

    const onSimEvent = (data: any) => {
      setEvents(prev => [...prev, data]);
      if (data.minute && typeof data.minute === 'number') setMatchMinute(data.minute);
      if (data.score) {
        setScore(data.score);
        if (data.type === 'goal') {
          const scoringTeam = Object.entries(data.score).find(([id]) => {
            const prev = scoreRef.current[id] ?? 0;
            return (data.score[id] as number) > prev;
          })?.[0];
          if (scoringTeam) {
            setGoalFlash(scoringTeam);
            setTimeout(() => setGoalFlash(null), 1200);
          }
        }
        const teams = Object.keys(data.score);
        if (teams.length >= 2) setCurrentMatch({ teamA: teams[0], teamB: teams[1] });
      }
    };

    const onSimResult = (data: any) => {
      setEvents(prev => [
        ...prev,
        { minute: 'FT', type: 'whistle', playerName: 'Full Time', detail: `Final: ${data.scoreA} – ${data.scoreB}` }
      ]);
    };

    const onTournamentResult = (data: any) => {
      setFinalResult(data);
      setTimeout(() => navigate(`/room/${upperCode}/results`), 4000);
    };

    socket.on('room:state', onRoomState);
    socket.on('simulation:start', onSimStart);
    socket.on('simulation:event', onSimEvent);
    socket.on('simulation:result', onSimResult);
    socket.on('simulation:tournament_result', onTournamentResult);

    return () => {
      socket.off('room:state', onRoomState);
      socket.off('simulation:start', onSimStart);
      socket.off('simulation:event', onSimEvent);
      socket.off('simulation:result', onSimResult);
      socket.off('simulation:tournament_result', onTournamentResult);
    };
  }, [code, socket, navigate, setRoom]);

  // Fallback poll: if simulation has completed or progressed to RESULTS
  useEffect(() => {
    if (!code) return;
    const upperCode = code.toUpperCase();

    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/rooms/${upperCode}`);
        if (data?.status === 'RESULTS') {
          clearInterval(interval);
          navigate(`/room/${upperCode}/results`);
        }
      } catch {}
    }, 2000);

    return () => clearInterval(interval);
  }, [code, navigate]);

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
    <div className="min-h-screen flex flex-col bg-[#080C12] text-[#F0F4FF]">
      {/* Header */}
      <header className="h-16 border-b border-white/[0.07] bg-[#0F1520] px-8 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <span className="font-heading font-black text-2xl tracking-widest text-[#FF6B2B]">
            DRAFTWAR
          </span>
          <span className="text-xs uppercase tracking-widest px-2.5 py-1 rounded bg-white/[0.06] border border-white/10 text-[#8A95A8]">
            {teamA && teamB ? `${teamA.username}'s XI vs ${teamB.username}'s XI` : 'MATCH SIMULATION'}
          </span>
        </div>
        <div className="font-num font-bold text-xs px-3 py-1 rounded-full bg-[#9B5DE5]/10 border border-[#9B5DE5]/30 text-[#9B5DE5] uppercase tracking-wider">
          TACTICAL ENGINE ACTIVE
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-6 py-8 gap-6 overflow-hidden">
        {/* Scoreboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden bg-[#0F1520] border border-white/[0.07] shadow-2xl"
        >
          <div className="flex items-stretch">
            {/* Team A */}
            <motion.div
              className="flex-1 flex flex-col items-center justify-center py-8 px-6"
              animate={{ background: flashA ? 'rgba(232,184,75,0.15)' : 'transparent' }}
              transition={{ duration: 0.3 }}
            >
              <Avatar username={teamA?.username ?? 'Team A'} url={teamA?.avatarUrl} size="lg" />
              <div className="font-heading font-bold text-lg text-white uppercase mt-3 mb-1 truncate max-w-[220px] text-center">
                {teamA?.username ? `${teamA.username}'s XI` : 'Team A'}
              </div>
              <motion.div
                key={scoreA}
                initial={{ scale: 1.5, color: '#E8B84B' }}
                animate={{ scale: 1, color: '#FF6B2B' }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="font-display font-black leading-none"
                style={{ fontSize: '5.5rem', textShadow: '0 0 30px rgba(255,107,43,0.3)' }}
              >
                {scoreA}
              </motion.div>
            </motion.div>

            {/* Center VS & Minute */}
            <div
              className="flex flex-col items-center justify-center px-8 py-8 border-x border-white/[0.06]"
            >
              <div className="font-heading font-black text-2xl text-white/30 mb-2">VS</div>
              <div className="font-num text-xs font-black px-3 py-1 rounded-full bg-[#FF6B2B]/10 text-[#FF6B2B] border border-[#FF6B2B]/30 tracking-wider">
                {typeof matchMinute === 'number' && matchMinute > 0 ? `${matchMinute}'` : 'KO'}
              </div>
              {matchups.length > 1 && (
                <div className="text-[10px] font-heading font-bold mt-2 uppercase tracking-widest text-[#8A95A8]">
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
              <div className="font-heading font-bold text-lg text-white uppercase mt-3 mb-1 truncate max-w-[220px] text-center">
                {teamB?.username ? `${teamB.username}'s XI` : 'Team B'}
              </div>
              <motion.div
                key={scoreB}
                initial={{ scale: 1.5, color: '#E8B84B' }}
                animate={{ scale: 1, color: '#9B5DE5' }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="font-display font-black leading-none"
                style={{ fontSize: '5.5rem', textShadow: '0 0 30px rgba(155,93,229,0.3)' }}
              >
                {scoreB}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Winner Banner */}
        <AnimatePresence>
          {finalResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 px-8 rounded-2xl bg-[#E8B84B]/10 border-2 border-[#E8B84B] shadow-[0_0_40px_rgba(232,184,75,0.2)]"
            >
              <div className="text-xs font-heading font-bold uppercase tracking-widest text-[#E8B84B] mb-1">
                Match Winner
              </div>
              <div className="font-heading font-black text-5xl text-white tracking-wide">
                {finalResult.winnerUsername ? `${finalResult.winnerUsername}'s XI` : 'Draw'}
              </div>
              <div className="text-xs text-[#8A95A8] mt-2 flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Transitioning to final match accolades...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Event Feed */}
        <div
          ref={feedRef}
          className="rounded-2xl overflow-y-auto flex-1 bg-[#0F1520] border border-white/[0.06] p-4 shadow-xl"
          style={{ maxHeight: '42vh', scrollbarWidth: 'thin' }}
        >
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
              <div className="w-10 h-10 border-2 border-[#FF6B2B] border-t-transparent rounded-full animate-spin" />
              <div className="font-heading font-bold uppercase tracking-widest text-sm text-[#8A95A8]">
                Awaiting Kickoff...
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {events.map((e, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-4 items-center p-3 rounded-xl border-l-4 bg-white/[0.02]"
                    style={{
                      borderColor: EVENT_COLORS[e.type] || '#3A4458',
                      background: e.type === 'goal' ? 'rgba(232,184,75,0.06)' : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <span className="font-mono font-bold text-xs shrink-0 w-9 text-right text-[#8A95A8]">
                      {e.minute !== 'FT' ? `${e.minute}'` : 'FT'}
                    </span>
                    <span className="text-xl shrink-0">{EVENT_ICONS[e.type] || '▶'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white truncate">{e.playerName}</div>
                      <div className="text-xs text-[#8A95A8] truncate">{e.detail}</div>
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
