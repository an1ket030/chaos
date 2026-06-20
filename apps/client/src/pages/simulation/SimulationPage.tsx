import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../../store/roomStore';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

export function SimulationPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { room, setRoom } = useRoomStore();
  const socketRef = useRef<any>(null);

  const [matchups, setMatchups] = useState<any[]>([]);
  const [currentMatch, setCurrentMatch] = useState<{ teamA: string; teamB: string } | null>(null);
  const [score, setScore] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<any[]>([]);
  const [finalResult, setFinalResult] = useState<any>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Own socket — must rejoin room to receive simulation:* events
  useEffect(() => {
    if (!code) return;
    const token = localStorage.getItem('accessToken') || '';
    const socket = io('http://localhost:3001', { auth: { token } });
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
      if (data.matchups.length > 0) {
        setCurrentMatch({ teamA: data.matchups[0].teamA, teamB: data.matchups[0].teamB });
      }
    });

    socket.on('simulation:event', (data: any) => {
      setEvents(prev => [...prev, data]);
      if (data.score) setScore(data.score);
      if (data.score) {
        const teams = Object.keys(data.score);
        if (teams.length >= 2) setCurrentMatch({ teamA: teams[0], teamB: teams[1] });
      }
    });

    socket.on('simulation:result', (data: any) => {
      setEvents(prev => [...prev, {
        minute: 'FT',
        type: 'whistle',
        playerName: 'Full Time',
        detail: `FULL TIME! Final Score: ${data.scoreA} – ${data.scoreB}`,
      }]);
    });

    socket.on('simulation:tournament_result', (data: any) => {
      setFinalResult(data);
      setTimeout(() => navigate(`/room/${code}/results`), 6000);
    });

    return () => {
      socket.emit('room:leave');
      socket.disconnect();
    };
  }, [code]);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [events]);

  const teamA = currentMatch ? room?.players.find(p => p.userId === currentMatch.teamA) : null;
  const teamB = currentMatch ? room?.players.find(p => p.userId === currentMatch.teamB) : null;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal': return '⚽';
      case 'yellow': return '🟨';
      case 'red': return '🟥';
      case 'save': return '🧤';
      case 'assist': return '🎯';
      case 'key_pass': return '🔑';
      case 'whistle': return '⏱️';
      default: return '▶️';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'goal': return '#C8FF00';
      case 'red': return '#FF4444';
      case 'yellow': return '#FFD700';
      case 'save': return '#60a5fa';
      case 'whistle': return '#a855f7';
      default: return '#555';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 md:p-10" style={{ background: '#0d0d0d', color: '#fff' }}>
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black uppercase tracking-wider mb-1"
            style={{ background: 'linear-gradient(135deg, #C8FF00, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Live Simulation
          </h1>
          <p className="text-gray-500 tracking-widest uppercase text-sm">Chaos Match Engine</p>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center justify-between gap-4 mb-6 p-6 rounded-2xl border border-white/10" style={{ background: '#141414' }}>
          <div className="text-center flex-1">
            <div className="font-black text-lg text-gray-300 uppercase tracking-widest mb-2">{teamA?.username || 'Team A'}</div>
            <div className="text-8xl font-black" style={{ color: '#C8FF00' }}>{score[currentMatch?.teamA || ''] ?? 0}</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-4xl font-black text-white/20 mb-2">VS</div>
            {matchups.length > 0 && (
              <div className="text-xs text-gray-600 font-bold uppercase tracking-widest">
                Match {matchups.length > 1 ? `1/${matchups.length}` : ''}
              </div>
            )}
          </div>

          <div className="text-center flex-1">
            <div className="font-black text-lg text-gray-300 uppercase tracking-widest mb-2">{teamB?.username || 'Team B'}</div>
            <div className="text-8xl font-black" style={{ color: '#a855f7' }}>{score[currentMatch?.teamB || ''] ?? 0}</div>
          </div>
        </div>

        {/* Final Result Banner */}
        {finalResult && (
          <div className="mb-6 p-6 rounded-2xl border-2 text-center" style={{ background: 'rgba(200,255,0,0.08)', borderColor: '#C8FF00' }}>
            <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Tournament Winner</div>
            <div className="text-4xl font-black uppercase" style={{ color: '#C8FF00' }}>
              🏆 {finalResult.winnerUsername}
            </div>
            <div className="text-gray-400 text-sm mt-2">Redirecting to results...</div>
          </div>
        )}

        {/* Live Feed */}
        <div
          ref={feedRef}
          className="rounded-2xl border border-white/10 overflow-y-auto p-6 space-y-3"
          style={{ background: '#141414', maxHeight: '50vh', scrollbarWidth: 'none' }}
        >
          {events.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: '#C8FF00', borderTopColor: 'transparent' }} />
              <div className="text-gray-500 font-bold uppercase tracking-widest text-sm">Awaiting kickoff...</div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {events.map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-4 items-center p-4 rounded-xl border-l-4"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: getEventColor(e.type),
                  }}
                >
                  <span className="font-mono font-black text-gray-400 w-10 text-right shrink-0">
                    {e.minute !== 'FT' ? `${e.minute}'` : 'FT'}
                  </span>
                  <span className="text-2xl">{getEventIcon(e.type)}</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white">{e.playerName}</div>
                    <div className="text-xs text-gray-400">{e.detail}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}
