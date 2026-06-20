import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../../store/roomStore';
import { useAuthStore } from '../../store/authStore';
import { io } from 'socket.io-client';
import { Button } from '../../components/ui/Button';
// Inline to avoid Vite/Rollup resolution issue with @chaos/shared
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

// Hardcoded to bypass Vite caching/export issues
const ALL_FORMATIONS = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2', '4-1-4-1', '3-4-3'] as const;
type Formation = typeof ALL_FORMATIONS[number];
const FORMATION_LAYOUTS: Record<Formation, any[]> = {
  '4-3-3': [
    { position: 'GK', x: 50, y: 8 }, { position: 'LB', x: 15, y: 28 }, { position: 'CB', x: 35, y: 25 }, { position: 'CB', x: 65, y: 25 }, { position: 'RB', x: 85, y: 28 }, { position: 'CM', x: 25, y: 52 }, { position: 'CM', x: 50, y: 48 }, { position: 'CM', x: 75, y: 52 }, { position: 'LW', x: 18, y: 75 }, { position: 'ST', x: 50, y: 82 }, { position: 'RW', x: 82, y: 75 }
  ],
  '4-4-2': [
    { position: 'GK', x: 50, y: 8 }, { position: 'LB', x: 15, y: 28 }, { position: 'CB', x: 35, y: 25 }, { position: 'CB', x: 65, y: 25 }, { position: 'RB', x: 85, y: 28 }, { position: 'LW', x: 15, y: 52 }, { position: 'CM', x: 38, y: 50 }, { position: 'CM', x: 62, y: 50 }, { position: 'RW', x: 85, y: 52 }, { position: 'ST', x: 35, y: 80 }, { position: 'ST', x: 65, y: 80 }
  ],
  '4-2-3-1': [
    { position: 'GK', x: 50, y: 8 }, { position: 'LB', x: 15, y: 28 }, { position: 'CB', x: 35, y: 25 }, { position: 'CB', x: 65, y: 25 }, { position: 'RB', x: 85, y: 28 }, { position: 'CDM', x: 35, y: 47 }, { position: 'CDM', x: 65, y: 47 }, { position: 'LW', x: 18, y: 67 }, { position: 'CAM', x: 50, y: 65 }, { position: 'RW', x: 82, y: 67 }, { position: 'ST', x: 50, y: 85 }
  ],
  '3-5-2': [
    { position: 'GK', x: 50, y: 8 }, { position: 'CB', x: 25, y: 25 }, { position: 'CB', x: 50, y: 22 }, { position: 'CB', x: 75, y: 25 }, { position: 'LB', x: 10, y: 50 }, { position: 'CDM', x: 30, y: 48 }, { position: 'CM', x: 50, y: 47 }, { position: 'CDM', x: 70, y: 48 }, { position: 'RB', x: 90, y: 50 }, { position: 'ST', x: 35, y: 80 }, { position: 'ST', x: 65, y: 80 }
  ],
  '5-3-2': [
    { position: 'GK', x: 50, y: 8 }, { position: 'LB', x: 10, y: 28 }, { position: 'CB', x: 27, y: 25 }, { position: 'CB', x: 50, y: 22 }, { position: 'CB', x: 73, y: 25 }, { position: 'RB', x: 90, y: 28 }, { position: 'CM', x: 25, y: 55 }, { position: 'CM', x: 50, y: 52 }, { position: 'CM', x: 75, y: 55 }, { position: 'ST', x: 35, y: 80 }, { position: 'ST', x: 65, y: 80 }
  ],
  '4-1-4-1': [
    { position: 'GK', x: 50, y: 8 }, { position: 'LB', x: 15, y: 28 }, { position: 'CB', x: 35, y: 25 }, { position: 'CB', x: 65, y: 25 }, { position: 'RB', x: 85, y: 28 }, { position: 'CDM', x: 50, y: 45 }, { position: 'LW', x: 12, y: 62 }, { position: 'CM', x: 35, y: 60 }, { position: 'CM', x: 65, y: 60 }, { position: 'RW', x: 88, y: 62 }, { position: 'ST', x: 50, y: 83 }
  ],
  '3-4-3': [
    { position: 'GK', x: 50, y: 8 }, { position: 'CB', x: 25, y: 25 }, { position: 'CB', x: 50, y: 22 }, { position: 'CB', x: 75, y: 25 }, { position: 'LB', x: 15, y: 50 }, { position: 'CM', x: 35, y: 48 }, { position: 'CM', x: 65, y: 48 }, { position: 'RB', x: 85, y: 50 }, { position: 'LW', x: 18, y: 75 }, { position: 'ST', x: 50, y: 80 }, { position: 'RW', x: 82, y: 75 }
  ],
};

export function SquadBuilderPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { room, setRoom } = useRoomStore();
  const { user } = useAuthStore();
  const socketRef = useRef<any>(null);
  
  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [lineup, setLineup] = useState<Record<number, string>>({}); // slotIndex -> playerId
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [captain, setCaptain] = useState<string>('');
  const [viceCaptain, setViceCaptain] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  // Own socket — must rejoin room so squad:finalize works server-side
  useEffect(() => {
    if (!code || !user) return;
    const token = localStorage.getItem('accessToken') || '';
    const socket = io('http://localhost:3001', { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('room:join', { code, token }, (res: any) => {
        if (!res.success) console.error('Squad builder join failed:', res.error);
      });
    });

    socket.on('room:state', (state: any) => {
      setRoom(state);
      if (state.status === 'SIMULATION') {
        navigate(`/room/${code}/simulation`);
      }
    });

    return () => {
      socket.emit('room:leave');
      socket.disconnect();
    };
  }, [code, user]);

  const me = room?.players.find((p) => p.userId === user?.id);
  const acquiredPlayers = useMemo(() => {
    if (!me) return [];
    return me.squad.filter((s) => s.player !== null).map((s) => s.player!);
  }, [me]);

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
    setSelectedSlot(idx);
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

  const handleReady = () => {
    if (Object.keys(lineup).length < 11) {
      alert("Please fill all 11 positions!");
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

    socketRef.current?.emit('squad:finalize', {
      userId: user?.id || 'mock',
      formation,
      lineup: formattedLineup,
      captain: captain || formattedLineup[0].playerId,
      viceCaptain: viceCaptain || formattedLineup[0].playerId,
      overallRating,
      chemistry
    }, (res: any) => {
      if (!res.success) {
        setIsReady(false);
        alert(res.error || "Failed to submit squad");
      }
    });
  };

  const unassignedPlayers = acquiredPlayers.filter(p => !Object.values(lineup).includes(p.id));

  return (
    <div className="min-h-screen p-6 md:p-8 flex gap-8 h-screen" style={{ background: '#0d0d0d', color: '#fff' }}>
      
      {/* LEFT: Squad & Pitch */}
      <div className="flex-1 flex flex-col h-full bg-[#141414] rounded-3xl border border-white/10 p-6 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wider" style={{ color: '#C8FF00' }}>Starting XI</h1>
            <p className="text-gray-400 text-sm">Drag or select to place players</p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Formation</div>
              <select 
                value={formation} 
                onChange={e => { setFormation(e.target.value as any); setLineup({}); setCaptain(''); setViceCaptain(''); }}
                className="bg-black/50 border border-white/20 rounded-md px-3 py-1 text-white font-bold outline-none"
              >
                {ALL_FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">OVR</div>
              <div className="text-2xl font-black text-white">{overallRating}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">CHEM</div>
              <div className="text-2xl font-black" style={{ color: chemistry >= 80 ? '#C8FF00' : chemistry >= 50 ? '#FFD700' : '#FF4444' }}>{chemistry}</div>
            </div>
          </div>
        </div>

        {/* Pitch Area */}
        <div className="flex-1 relative rounded-xl border-2 border-white/10 overflow-hidden bg-green-900/20 mb-6">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 80px)' }}></div>
          {layout.map((slot, idx) => {
            const pid = lineup[idx];
            const player = pid ? acquiredPlayers.find(p => p.id === pid) : null;
            return (
              <div 
                key={idx}
                onClick={() => handleSlotClick(idx)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-16 h-20 rounded-lg border-2 cursor-pointer transition-all hover:scale-110 flex flex-col items-center justify-center
                  ${selectedSlot === idx ? 'border-[#C8FF00] shadow-[0_0_15px_rgba(200,255,0,0.5)] z-20' : player ? 'border-white/20 bg-black/80 z-10' : 'border-white/30 border-dashed bg-black/40 z-0'}
                `}
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              >
                {player ? (
                  <>
                    <div className="text-[9px] font-black absolute -top-2 px-1 rounded" style={{ background: '#C8FF00', color: '#000' }}>{slot.position}</div>
                    <img src={player.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover object-top mb-1" />
                    <div className="text-[10px] font-bold text-white truncate w-full text-center px-1">{player.name.split(' ').pop()}</div>
                    <div className="text-[8px] font-black" style={{ color: player.position === slot.position ? '#C8FF00' : '#FFD700' }}>{player.rating}</div>
                    <button onClick={(e) => removePlayerFromSlot(idx, e)} className="absolute -top-2 -right-2 bg-red-500 w-4 h-4 rounded-full text-[10px] flex items-center justify-center">×</button>
                  </>
                ) : (
                  <>
                    <div className="text-white/50 text-xs font-black mb-1">{slot.position}</div>
                    <div className="text-white/20 text-2xl">+</div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <Button size="lg" className="w-full" onClick={handleReady} isLoading={isReady} disabled={isReady}>
          {isReady ? 'Waiting for others...' : 'Confirm Squad'}
        </Button>
      </div>

      {/* RIGHT: Player Bench */}
      <div className="w-80 h-full bg-[#141414] rounded-3xl border border-white/10 p-6 flex flex-col overflow-hidden shrink-0">
        <h2 className="text-lg font-black uppercase tracking-widest text-gray-400 mb-4">Bench</h2>
        
        {selectedSlot !== null && (
          <div className="mb-4 p-3 rounded-xl border border-[#C8FF00]/50" style={{ background: 'rgba(200,255,0,0.1)' }}>
            <div className="text-xs font-bold" style={{ color: '#C8FF00' }}>Selecting for: {layout[selectedSlot].position}</div>
            <div className="text-[10px] text-gray-400">Click a player below to assign</div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 pr-2" style={{ scrollbarWidth: 'none' }}>
          {unassignedPlayers.map(p => (
            <div 
              key={p.id}
              onClick={() => selectedSlot !== null ? handlePlayerSelect(p.id) : null}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${selectedSlot !== null ? 'cursor-pointer hover:border-[#C8FF00] hover:bg-white/5' : 'opacity-50 cursor-not-allowed'}`}
              style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#0d0d0d' }}
            >
              <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover object-top" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-white truncate">{p.name}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">{p.position} · {p.club}</div>
              </div>
              <div className="font-black text-lg" style={{ color: '#C8FF00' }}>{p.rating}</div>
            </div>
          ))}
          {unassignedPlayers.length === 0 && (
            <div className="text-center text-gray-500 text-sm mt-10">All players assigned!</div>
          )}
        </div>

        {/* Roles */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="mb-3">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Captain</div>
            <select 
              value={captain} 
              onChange={e => setCaptain(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded-md px-3 py-2 text-white font-bold outline-none text-sm"
            >
              <option value="" disabled>Select Captain</option>
              {Object.values(lineup).map(pid => {
                const p = acquiredPlayers.find(pl => pl.id === pid);
                return p ? <option key={pid} value={pid}>{p.name}</option> : null;
              })}
            </select>
          </div>
        </div>
      </div>
      
    </div>
  );
}
