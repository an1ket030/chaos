import React from 'react';
import { motion } from 'framer-motion';
import type { Player } from '@chaos/shared';

interface PlayerCardProps {
  player: Player;
  isFlipped?: boolean;
  className?: string;
  onClick?: () => void;
}

export function PlayerCard({ player, isFlipped = false, className = '', onClick }: PlayerCardProps) {
  const getTierColor = (rating: number) => {
    if (rating >= 90) return 'from-yellow-400 via-yellow-600 to-yellow-800 border-yellow-500';
    if (rating >= 80) return 'from-gray-300 via-gray-400 to-gray-500 border-gray-400';
    return 'from-amber-700 via-amber-800 to-amber-900 border-amber-800'; // Bronze
  };

  const getRarityText = (rating: number) => {
    if (rating >= 90) return 'text-yellow-400';
    if (rating >= 80) return 'text-gray-200';
    return 'text-amber-600';
  };

  return (
    <div 
      className={`relative w-48 h-72 perspective-1000 ${className}`}
      onClick={onClick}
    >
      <motion.div
        className="w-full h-full preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 0 : 180 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Front (Revealed) */}
        <div className={`absolute inset-0 backface-hidden rounded-xl border-2 overflow-hidden bg-gradient-to-br ${getTierColor(player.rating)} p-1 shadow-2xl`}>
          <div className="absolute inset-0 bg-black/40 mix-blend-overlay"></div>
          
          <div className="relative h-full flex flex-col justify-between p-2 z-10 bg-black/60 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-center">
                <span className={`text-2xl font-black ${getRarityText(player.rating)}`}>{player.rating}</span>
                <span className="text-sm font-bold text-white">{player.position}</span>
                <div className="mt-1 flex flex-col gap-1 items-center">
                  <img src={player.flagUrl} alt={player.nationality} className="w-5 h-3 object-cover rounded-sm" />
                  {player.clubBadgeUrl && (
                    <img src={player.clubBadgeUrl} alt={player.club} className="w-5 h-5 object-contain" />
                  )}
                </div>
              </div>
              <div className="w-24 h-24 right-0 top-0 absolute opacity-90 overflow-hidden">
                <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover object-top scale-125 translate-y-2 translate-x-2 drop-shadow-xl" />
              </div>
            </div>

            <div className="text-center mt-auto">
              <h3 className="text-sm font-black text-white tracking-wider uppercase truncate">{player.shortName}</h3>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-gray-300 font-mono mt-2 border-t border-white/20 pt-1">
                <div>PAC <span className="text-white font-bold">{player.pace}</span></div>
                <div>DRI <span className="text-white font-bold">{player.dribbling}</span></div>
                <div>SHO <span className="text-white font-bold">{player.shooting}</span></div>
                <div>DEF <span className="text-white font-bold">{player.defending}</span></div>
                <div>PAS <span className="text-white font-bold">{player.passing}</span></div>
                <div>PHY <span className="text-white font-bold">{player.physical}</span></div>
              </div>
            </div>
            
            <div className="absolute bottom-1 right-2 flex gap-1">
               {player.isLegend && <span className="text-[10px] text-yellow-400 font-black tracking-widest">ICON</span>}
            </div>
          </div>
        </div>

        {/* Back (Hidden) */}
        <div className="absolute inset-0 backface-hidden rounded-xl border-2 border-primary/20 bg-[#141414] rotate-y-180 flex items-center justify-center shadow-2xl">
          <div className="w-24 h-24 rounded-full border-4 border-primary/30 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
            <span className="text-primary/50 text-4xl font-black">?</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
