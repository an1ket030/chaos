import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '../../store/roomStore';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';

// Inline to avoid Vite/Rollup resolution issues with @chaos/shared
function calculateChemistry(
  players: Array<{ nationality: string; club: string; position: string; naturalPosition: string }>
): number {
  let chemistry = 50;
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      if (players[i].nationality === players[j].nationality) chemistry += 5;
      if (players[i].club === players[j].club) chemistry += 3;
    }
    if (players[i].position !== players[i].naturalPosition) chemistry -= 5;
  }
  return Math.min(Math.max(chemistry, 0), 100);
}

const ALL_FORMATIONS = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2', '4-1-4-1', '3-4-3'] as const;
type Formation = typeof ALL_FORMATIONS[number];

const FORMATION_LAYOUTS: Record<Formation, any[]> = {
  '4-3-3': [
    { position: 'GK', x: 50, y: 10 },
    { position: 'LB', x: 16, y: 28 }, { position: 'CB', x: 38, y: 25 }, { position: 'CB', x: 62, y: 25 }, { position: 'RB', x: 84, y: 28 },
    { position: 'CM', x: 26, y: 52 }, { position: 'CM', x: 50, y: 48 }, { position: 'CM', x: 74, y: 52 },
    { position: 'LW', x: 20, y: 76 }, { position: 'ST', x: 50, y: 84 }, { position: 'RW', x: 80, y: 76 }
  ],
  '4-4-2': [
    { position: 'GK', x: 50, y: 10 },
    { position: 'LB', x: 16, y: 28 }, { position: 'CB', x: 38, y: 25 }, { position: 'CB', x: 62, y: 25 }, { position: 'RB', x: 84, y: 28 },
    { position: 'LM', x: 16, y: 54 }, { position: 'CM', x: 38, y: 50 }, { position: 'CM', x: 62, y: 50 }, { position: 'RM', x: 84, y: 54 },
    { position: 'ST', x: 36, y: 82 }, { position: 'ST', x: 64, y: 82 }
  ],
  '4-2-3-1': [
    { position: 'GK', x: 50, y: 10 },
    { position: 'LB', x: 16, y: 28 }, { position: 'CB', x: 38, y: 25 }, { position: 'CB', x: 62, y: 25 }, { position: 'RB', x: 84, y: 28 },
    { position: 'CDM', x: 35, y: 46 }, { position: 'CDM', x: 65, y: 46 },
    { position: 'LW', x: 18, y: 68 }, { position: 'CAM', x: 50, y: 66 }, { position: 'RW', x: 82, y: 68 },
    { position: 'ST', x: 50, y: 86 }
  ],
  '3-5-2': [
    { position: 'GK', x: 50, y: 10 },
    { position: 'CB', x: 25, y: 26 }, { position: 'CB', x: 50, y: 23 }, { position: 'CB', x: 75, y: 26 },
    { position: 'LM', x: 12, y: 52 }, { position: 'CDM', x: 35, y: 48 }, { position: 'CAM', x: 50, y: 62 }, { position: 'CDM', x: 65, y: 48 }, { position: 'RM', x: 88, y: 52 },
    { position: 'ST', x: 36, y: 82 }, { position: 'ST', x: 64, y: 82 }
  ],
  '5-3-2': [
    { position: 'GK', x: 50, y: 10 },
    { position: 'LWB', x: 12, y: 32 }, { position: 'CB', x: 30, y: 25 }, { position: 'CB', x: 50, y: 22 }, { position: 'CB', x: 70, y: 25 }, { position: 'RWB', x: 88, y: 32 },
    { position: 'CM', x: 26, y: 55 }, { position: 'CM', x: 50, y: 50 }, { position: 'CM', x: 74, y: 55 },
    { position: 'ST', x: 36, y: 82 }, { position: 'ST', x: 64, y: 82 }
  ],
  '4-1-4-1': [
    { position: 'GK', x: 50, y: 10 },
    { position: 'LB', x: 16, y: 28 }, { position: 'CB', x: 38, y: 25 }, { position: 'CB', x: 62, y: 25 }, { position: 'RB', x: 84, y: 28 },
    { position: 'CDM', x: 50, y: 44 },
    { position: 'LM', x: 16, y: 62 }, { position: 'CM', x: 38, y: 60 }, { position: 'CM', x: 62, y: 60 }, { position: 'RM', x: 84, y: 62 },
    { position: 'ST', x: 50, y: 84 }
  ],
  '3-4-3': [
    { position: 'GK', x: 50, y: 10 },
    { position: 'CB', x: 25, y: 26 }, { position: 'CB', x: 50, y: 23 }, { position: 'CB', x: 75, y: 26 },
    { position: 'LM', x: 16, y: 52 }, { position: 'CM', x: 38, y: 50 }, { position: 'CM', x: 62, y: 50 }, { position: 'RM', x: 84, y: 52 },
    { position: 'LW', x: 18, y: 78 }, { position: 'ST', x: 50, y: 84 }, { position: 'RW', x: 82, y: 78 }
  ],
};

export function SquadBuilderPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { room, setRoom } = useRoomStore();
  const { user } = useAuthStore();
  const socket = useSocket();

  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [lineup, setLineup] = useState<Record<number, string>>({}); // slotIndex -> playerId
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [captain, setCaptain] = useState<string>('');
  const [viceCaptain, setViceCaptain] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const [matchCountdown, setMatchCountdown] = useState<number | null>(null);
  const matchCountdownRef = useRef<number | null>(matchCountdown);
  matchCountdownRef.current = matchCountdown;

  // Synchronized countdown timer before match simulation
  useEffect(() => {
    if (matchCountdown === null) return;
    if (matchCountdown === 0) {
      navigate(`/room/${code?.toUpperCase()}/simulation`);
      return;
    }
    const timer = setTimeout(() => {
      setMatchCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [matchCountdown, code, navigate]);

  // Initial load: fetch room state from REST and check status
  useEffect(() => {
    if (!code) return;
    const upperCode = code.toUpperCase();

    api.get(`/rooms/${upperCode}`)
      .then(({ data }) => {
        if (data) {
          setRoom(data);
          if (data.status === 'SIMULATION') {
            navigate(`/room/${upperCode}/simulation`);
          } else if (data.status === 'RESULTS') {
            navigate(`/room/${upperCode}/results`);
          }
        }
      })
      .catch((err) => console.warn('Squad builder initial room fetch warning:', err));
  }, [code, navigate, setRoom]);

  // Socket setup with unified lifecycle and navigation listeners
  useEffect(() => {
    if (!code || !user) return;
    const upperCode = code.toUpperCase();
    const token = localStorage.getItem('accessToken') || '';

    // Join room channel
    socket.emit('room:join', { code: upperCode, token }, (res: any) => {
      if (res?.room) {
        setRoom(res.room);
        if (res.room.status === 'SIMULATION') {
          navigate(`/room/${upperCode}/simulation`);
        } else if (res.room.status === 'RESULTS') {
          navigate(`/room/${upperCode}/results`);
        }
      }
    });

    const onRoomState = (state: any) => {
      if (!state) return;
      setRoom(state);
      if (state.status === 'SIMULATION') {
        if (matchCountdownRef.current === null) {
          setMatchCountdown(3);
        }
      } else if (state.status === 'RESULTS') {
        navigate(`/room/${upperCode}/results`);
      }
    };

    const onSquadAllReady = () => {
      if (matchCountdownRef.current === null) {
        setMatchCountdown(3);
      }
    };

    const onSimulationStart = () => {
      navigate(`/room/${upperCode}/simulation`);
    };

    socket.on('room:state', onRoomState);
    socket.on('squad:all_ready', onSquadAllReady);
    socket.on('simulation:start', onSimulationStart);

    return () => {
      socket.off('room:state', onRoomState);
      socket.off('squad:all_ready', onSquadAllReady);
      socket.off('simulation:start', onSimulationStart);
    };
  }, [code, user, socket, navigate, setRoom]);

  // Polling fallback while waiting for other players
  useEffect(() => {
    if (!isReady || !code || matchCountdown !== null) return;
    const upperCode = code.toUpperCase();

    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/rooms/${upperCode}`);
        if (data?.status === 'SIMULATION') {
          clearInterval(interval);
          if (matchCountdownRef.current === null) {
            setMatchCountdown(3);
          }
        } else if (data?.status === 'RESULTS') {
          clearInterval(interval);
          navigate(`/room/${upperCode}/results`);
        }
      } catch (err) {
        console.warn('Squad builder poll warning:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isReady, code, navigate, matchCountdown]);

  const me = room?.players.find((p) => p.userId === user?.id);
  const acquiredPlayers = useMemo(() => {
    if (!me) return [];
    return me.squad.filter((s) => s.player !== null).map((s) => s.player!);
  }, [me]);

  // Auto-populate lineup with acquired players matching formation
  useEffect(() => {
    if (acquiredPlayers.length === 0 || Object.keys(lineup).length > 0) return;
    const layout = FORMATION_LAYOUTS[formation];
    const initialLineup: Record<number, string> = {};
    const unassigned = [...acquiredPlayers];

    // Priority 1: Exact position matches
    layout.forEach((slot, idx) => {
      const matchIdx = unassigned.findIndex(p => p.position === slot.position);
      if (matchIdx !== -1) {
        initialLineup[idx] = unassigned[matchIdx].id;
        unassigned.splice(matchIdx, 1);
      }
    });

    // Priority 2: Fill remaining empty slots with any available player
    layout.forEach((_, idx) => {
      if (!initialLineup[idx] && unassigned.length > 0) {
        initialLineup[idx] = unassigned.shift()!.id;
      }
    });

    setLineup(initialLineup);
    const firstPlayerId = Object.values(initialLineup)[0];
    if (firstPlayerId) {
      setCaptain(firstPlayerId);
      const secondPlayerId = Object.values(initialLineup)[1] || firstPlayerId;
      setViceCaptain(secondPlayerId);
    }
  }, [acquiredPlayers, formation]);

  const layout = FORMATION_LAYOUTS[formation];

  const overallRating = useMemo(() => {
    const placedPlayers = Object.values(lineup).map(id => acquiredPlayers.find(p => p.id === id));
    if (placedPlayers.length === 0) return 0;
    const sum = placedPlayers.reduce((acc, p) => acc + (p?.rating || 0), 0);
    return Math.round(sum / placedPlayers.length);
  }, [lineup, acquiredPlayers]);

  const chemistry = useMemo(() => {
    const chemPlayers = [];
    for (const [slotIdxStr, playerId] of Object.entries(lineup)) {
      const slotIdx = parseInt(slotIdxStr, 10);
      const player = acquiredPlayers.find(p => p.id === playerId);
      const slot = layout[slotIdx];
      if (player && slot) {
        chemPlayers.push({
          nationality: player.nationality,
          club: player.club,
          position: slot.position,
          naturalPosition: player.position,
        });
      }
    }
    return calculateChemistry(chemPlayers);
  }, [lineup, acquiredPlayers, layout]);

  const handleSlotClick = (idx: number) => {
    setSelectedSlot(selectedSlot === idx ? null : idx);
  };

  const handlePlayerSelect = (playerId: string) => {
    if (selectedSlot === null) return;

    // Check if player is already in another slot
    const newLineup = { ...lineup };
    for (const [sIdx, pId] of Object.entries(newLineup)) {
      if (pId === playerId) {
        delete newLineup[parseInt(sIdx, 10)];
      }
    }

    newLineup[selectedSlot] = playerId;
    setLineup(newLineup);
    setSelectedSlot(null);

    // Auto-assign captain if none
    if (!captain) setCaptain(playerId);
    else if (!viceCaptain && captain !== playerId) setViceCaptain(playerId);
  };

  const removePlayerFromSlot = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLineup = { ...lineup };
    const pId = newLineup[idx];
    delete newLineup[idx];
    setLineup(newLineup);
    if (captain === pId) setCaptain('');
    if (viceCaptain === pId) setViceCaptain('');
  };

  const handleReady = async () => {
    if (Object.keys(lineup).length < 11) {
      alert("Please place all 11 players in your Starting XI!");
      return;
    }
    setIsReady(true);

    const formattedLineup = Object.entries(lineup).map(([slotIdxStr, playerId]) => {
      const slotIdx = parseInt(slotIdxStr, 10);
      return {
        slotIndex: slotIdx,
        playerId,
        position: layout[slotIdx].position,
      };
    });

    const upperCode = code?.toUpperCase() || '';
    const payload = {
      userId: user?.id || 'mock',
      roomCode: upperCode,
      formation,
      lineup: formattedLineup,
      captain: captain || formattedLineup[0].playerId,
      viceCaptain: viceCaptain || formattedLineup[0].playerId,
      overallRating,
      chemistry,
    };

    let submitted = false;

    // Guaranteed REST path: ensures squad is saved to Redis even if WebSocket has issues
    try {
      const { data } = await api.post(`/rooms/${upperCode}/finalize-squad`, payload);
      if (data?.success) {
        submitted = true;
        if (data.allReady && matchCountdownRef.current === null) {
          setMatchCountdown(3);
        }
      }
    } catch (err: any) {
      console.warn('REST finalize notice:', err?.response?.data || err.message);
    }

    // Real-time socket emission
    socket.emit('squad:finalize', payload as any, (res: any) => {
      if (res?.success) {
        submitted = true;
        if (res.allReady && matchCountdownRef.current === null) {
          setMatchCountdown(3);
        }
      } else if (!submitted) {
        setIsReady(false);
        alert(res?.error || 'Failed to submit squad');
      }
    });
  };

  const unassignedPlayers = acquiredPlayers.filter(p => !Object.values(lineup).includes(p.id));

  return (
    <div className="min-h-screen bg-[#080C12] text-[#F0F4FF] flex flex-col h-screen overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-white/[0.07] bg-[#0F1520] px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <span className="font-heading font-black text-2xl tracking-widest text-[#FF6B2B]">
            DRAFTWAR
          </span>
          <span className="text-xs uppercase tracking-widest px-2.5 py-1 rounded bg-white/[0.06] border border-white/10 text-[#8A95A8]">
            ROOM {code?.toUpperCase()}
          </span>
        </div>

        {/* Formation & Team Metrics */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-[#161E2E] border border-white/10 px-3 py-1.5 rounded-lg">
            <span className="text-[10px] font-heading font-bold text-[#8A95A8] uppercase tracking-wider">Formation</span>
            <select
              value={formation}
              onChange={e => {
                setFormation(e.target.value as any);
                setLineup({});
                setCaptain('');
                setViceCaptain('');
              }}
              className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer"
            >
              {ALL_FORMATIONS.map(f => <option key={f} value={f} className="bg-[#161E2E] text-white">{f}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-4 bg-[#161E2E] border border-white/10 px-4 py-1.5 rounded-lg">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] font-heading font-bold text-[#8A95A8] uppercase tracking-widest">OVR</span>
              <span className="font-num font-black text-xl text-[#FF6B2B]">{overallRating}</span>
            </div>
            <div className="w-[1px] h-4 bg-white/10" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] font-heading font-bold text-[#8A95A8] uppercase tracking-widest">CHEM</span>
              <span
                className="font-num font-black text-xl"
                style={{ color: chemistry >= 75 ? '#2ECC71' : chemistry >= 50 ? '#E8B84B' : '#FF3B3B' }}
              >
                {chemistry}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Squad Workspace */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Pitch Area */}
        <div className="flex-1 flex flex-col bg-[#0F1520] rounded-2xl border border-white/[0.07] p-4 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-2 px-2 shrink-0">
            <div>
              <h2 className="font-heading font-black text-2xl tracking-wide text-white uppercase">Tactical Pitch</h2>
              <p className="text-xs text-[#8A95A8]">Proportional vertical board · Click a pitch slot to position squad members</p>
            </div>
            <div className="text-right text-xs text-[#8A95A8]">
              <span className="font-bold text-white">{Object.keys(lineup).length}</span> / 11 Players Placed
            </div>
          </div>

          {/* Proportional Vertical Football Pitch Container (3:4 Aspect Ratio) */}
          <div className="flex-1 flex items-center justify-center p-1 min-h-0 overflow-hidden">
            <div className="h-full aspect-[3/4] max-w-full relative rounded-xl border-2 border-white/20 overflow-hidden pitch-surface shadow-2xl">
              {/* Pitch Markings */}
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/25 -translate-y-1/2" />
              <div className="absolute left-1/2 top-1/2 w-28 h-28 border border-white/25 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-white/50 rounded-full -translate-x-1/2 -translate-y-1/2" />

              {/* Goal Areas */}
              <div className="absolute left-1/2 top-0 w-44 h-16 border-b border-x border-white/25 -translate-x-1/2 rounded-b-md" />
              <div className="absolute left-1/2 bottom-0 w-44 h-16 border-t border-x border-white/25 -translate-x-1/2 rounded-t-md" />

              {/* Subtle Pitch Striping Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 36px, rgba(255,255,255,0.05) 36px, rgba(255,255,255,0.05) 72px)'
                }}
              />

              {/* Position Slots */}
              {layout.map((slot, idx) => {
                const pid = lineup[idx];
                const player = pid ? acquiredPlayers.find(p => p.id === pid) : null;
                const isSelected = selectedSlot === idx;
                const isCap = captain === pid;
                const isVc = viceCaptain === pid;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSlotClick(idx)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-16 h-20 md:w-20 md:h-24 rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center select-none group
                      ${isSelected
                        ? 'border-2 border-[#FF6B2B] shadow-[0_0_25px_rgba(255,107,43,0.5)] scale-105 z-20 bg-[#161E2E]/95'
                        : player
                          ? 'border border-white/20 bg-[#0F1520]/90 hover:border-white/40 hover:scale-105 z-10'
                          : 'border-2 border-dashed border-white/20 bg-black/40 hover:border-[#FF6B2B]/60 hover:bg-[#FF6B2B]/5 z-0'
                      }
                    `}
                    style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                  >
                    {player ? (
                      <>
                        {/* Role & Position Badges */}
                        <div className="absolute -top-2 flex items-center gap-1 z-30">
                          <span className="text-[9px] font-heading font-black px-1.5 py-0.5 rounded bg-[#FF6B2B] text-white shadow">
                            {slot.position}
                          </span>
                          {isCap && (
                            <span className="text-[9px] font-heading font-black px-1 py-0.5 rounded bg-[#E8B84B] text-black shadow">
                              C
                            </span>
                          )}
                          {isVc && !isCap && (
                            <span className="text-[9px] font-heading font-black px-1 py-0.5 rounded bg-[#8A95A8] text-white shadow">
                              VC
                            </span>
                          )}
                        </div>

                        {/* Player Image */}
                        <img
                          src={player.imageUrl}
                          alt={player.name}
                          className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover object-top border border-white/20 shadow-md mb-0.5"
                        />

                        {/* Player Surname */}
                        <div className="text-[10px] md:text-[11px] font-bold text-white truncate w-full text-center px-1 leading-tight">
                          {player.name.split(' ').pop()}
                        </div>

                        {/* Rating */}
                        <div
                          className="font-num font-black text-[10px] md:text-[11px]"
                          style={{ color: player.position === slot.position ? '#2ECC71' : '#E8B84B' }}
                        >
                          {player.rating}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => removePlayerFromSlot(idx, e)}
                          className="absolute -top-2 -right-2 bg-[#FF3B3B] hover:bg-red-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          title="Remove to bench"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-heading font-black text-white/60 tracking-wider">
                          {slot.position}
                        </span>
                        <span className="text-xl text-white/30 font-light mt-0.5">+</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirm Button Bar */}
          <div className="mt-3 pt-2 border-t border-white/[0.07] shrink-0">
            <Button
              size="lg"
              className="w-full h-14"
              onClick={handleReady}
              disabled={isReady || Object.keys(lineup).length < 11}
            >
              {isReady ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="font-heading font-bold text-sm tracking-wider uppercase">
                    SQUAD LOCKED · WAITING FOR RIVAL MANAGERS...
                  </span>
                </div>
              ) : (
                <span className="font-heading font-black text-base tracking-widest uppercase">
                  CONFIRM & LOCK SQUAD
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Right Sidebar: Bench & Roles */}
        <div className="w-96 bg-[#0F1520] rounded-2xl border border-white/[0.07] p-5 flex flex-col overflow-hidden shrink-0 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-black text-lg tracking-widest text-[#FF6B2B] uppercase">
              RESERVES & BENCH
            </h3>
            <span className="text-xs text-[#8A95A8]">
              {unassignedPlayers.length} Available
            </span>
          </div>

          {/* Slot Selection Prompt */}
          <AnimatePresence>
            {selectedSlot !== null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-3 p-3 rounded-xl bg-[#FF6B2B]/10 border border-[#FF6B2B]/40 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-heading font-black text-[#FF6B2B] uppercase tracking-wider">
                    Selecting for: {layout[selectedSlot].position}
                  </div>
                  <div className="text-[11px] text-[#8A95A8]">Click any player below to assign</div>
                </div>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="text-xs text-[#8A95A8] hover:text-white underline"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bench Player List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'thin' }}>
            {unassignedPlayers.map((p) => {
              const isMatch = selectedSlot !== null && layout[selectedSlot]?.position === p.position;
              return (
                <div
                  key={p.id}
                  onClick={() => selectedSlot !== null ? handlePlayerSelect(p.id) : null}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-150
                    ${selectedSlot !== null
                      ? isMatch
                        ? 'border-[#2ECC71]/60 bg-[#2ECC71]/10 cursor-pointer hover:scale-[1.02]'
                        : 'border-white/10 bg-[#161E2E] cursor-pointer hover:border-[#FF6B2B]/60 hover:bg-[#FF6B2B]/5'
                      : 'border-white/[0.06] bg-[#161E2E] opacity-75'
                    }
                  `}
                >
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-10 h-10 rounded-full object-cover object-top border border-white/20 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white truncate">{p.name}</div>
                    <div className="text-[11px] text-[#8A95A8] flex items-center gap-1.5 font-medium">
                      <span className="text-[10px] font-heading font-black px-1 rounded bg-white/10 text-white">
                        {p.position}
                      </span>
                      <span className="truncate">{p.club}</span>
                    </div>
                  </div>
                  <div className="font-num font-black text-lg text-[#E8B84B] shrink-0">
                    {p.rating}
                  </div>
                </div>
              );
            })}

            {unassignedPlayers.length === 0 && (
              <div className="text-center text-[#8A95A8] text-sm py-12 flex flex-col items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span>All acquired players placed in Starting XI!</span>
              </div>
            )}
          </div>

          {/* Captaincy Selection */}
          <div className="mt-4 pt-4 border-t border-white/[0.07] space-y-3">
            <div>
              <div className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#8A95A8] mb-1">
                Captain
              </div>
              <select
                value={captain}
                onChange={e => setCaptain(e.target.value)}
                className="w-full bg-[#161E2E] border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-sm outline-none cursor-pointer focus:border-[#FF6B2B]"
              >
                <option value="" disabled>Select Captain</option>
                {Object.values(lineup).map(pid => {
                  const p = acquiredPlayers.find(pl => pl.id === pid);
                  return p ? <option key={pid} value={pid} className="bg-[#161E2E] text-white">{p.name} ({p.position})</option> : null;
                })}
              </select>
            </div>

            <div>
              <div className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#8A95A8] mb-1">
                Vice Captain
              </div>
              <select
                value={viceCaptain}
                onChange={e => setViceCaptain(e.target.value)}
                className="w-full bg-[#161E2E] border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-sm outline-none cursor-pointer focus:border-[#FF6B2B]"
              >
                <option value="" disabled>Select Vice Captain</option>
                {Object.values(lineup).map(pid => {
                  const p = acquiredPlayers.find(pl => pl.id === pid);
                  return p ? <option key={pid} value={pid} className="bg-[#161E2E] text-white">{p.name} ({p.position})</option> : null;
                })}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Kickoff Countdown Overlay */}
      <AnimatePresence>
        {matchCountdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080C12]/95"
          >
            <div className="w-full max-w-md p-8 rounded-2xl bg-[#0F1520] border-2 border-[#FF6B2B] shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FF6B2B]" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FF6B2B]" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FF6B2B]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FF6B2B]" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FF6B2B]/10 border border-[#FF6B2B]/30 text-[#FF6B2B] text-xs font-mono font-bold uppercase tracking-widest mb-4">
                TACTICAL LOCK ENGAGED
              </div>

              <h2 className="font-display text-4xl text-white tracking-wide mb-2">
                ALL SQUADS CONFIRMED
              </h2>
              <p className="text-sm font-mono text-[#8A95A8] uppercase tracking-wider mb-6">
                MATCH SIMULATION STARTING IN
              </p>

              <motion.div
                key={matchCountdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="font-display text-8xl font-black text-[#FF6B2B] drop-shadow-[0_0_25px_rgba(255,107,43,0.7)]"
              >
                {matchCountdown > 0 ? matchCountdown : 'KICKOFF!'}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
