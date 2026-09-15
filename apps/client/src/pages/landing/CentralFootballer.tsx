import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Flame } from 'lucide-react';

interface CentralFootballerProps {
  imageSrc?: string;
  ronaldoX?: any;
  ronaldoY?: any;
}

export const CentralFootballer: React.FC<CentralFootballerProps> = ({
  imageSrc = '/assets/hero_footballer.jpg',
  ronaldoX,
  ronaldoY,
}) => {
  return (
    <motion.div
      style={{ x: ronaldoX, y: ronaldoY }}
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-15 flex flex-col items-center justify-center pointer-events-none select-none"
    >
      {/* Volumetric Battle Crimson Backglow behind Footballer */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#B81D1D]/35 to-transparent blur-[70px] transform scale-125 pointer-events-none" />

      {/* Halo Hexagon Ring behind player */}
      <div className="absolute w-[340px] sm:w-[460px] md:w-[540px] h-[340px] sm:h-[460px] md:h-[540px] rounded-full border-2 border-[#D92525]/25 border-dashed animate-[spin_80s_linear_infinite] pointer-events-none" />

      {/* Main Player Cutout Container */}
      <div className="relative w-[300px] sm:w-[380px] md:w-[460px] h-[400px] sm:h-[480px] md:h-[540px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/10 bg-[#0A070A]">
        {/* The Footballer Cutout Image */}
        <img
          src={imageSrc}
          alt="Central Footballer"
          className="w-full h-full object-cover object-top filter contrast-[1.08] saturate-[1.12]"
        />

        {/* Soft lower vignette blending torso into dark stadium turf */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050305] via-[#050305]/20 to-transparent pointer-events-none" />
        {/* Subtle crimson rim light reflection on edges */}
        <div className="absolute inset-0 ring-1 ring-inset ring-[#D92525]/40 pointer-events-none" />
      </div>

      {/* Floating Tactical HUD Badge (Left: Player Rating) */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-2 sm:left-2 md:-left-8 bottom-16 sm:bottom-20 z-30 p-2.5 sm:p-3.5 rounded-xl bg-[#0E0A0D]/95 backdrop-blur-md border border-[#D92525]/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] pointer-events-auto"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#B81D1D] flex items-center justify-center font-editorial text-xl font-bold text-white shadow-[0_0_12px_rgba(217,37,37,0.6)]">
            94
          </div>
          <div>
            <div className="font-editorial text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              CR7 ARCHETYPE <span className="w-1.5 h-1.5 rounded-full bg-[#D92525] animate-ping" />
            </div>
            <div className="font-mono text-[10px] text-[#8A95A8]">
              PAC 95 · SHT 93 · DRI 92
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Tactical HUD Badge (Right: Match Chemistry) */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="absolute -right-2 sm:right-2 md:-right-8 top-16 sm:top-24 z-30 p-2.5 sm:p-3.5 rounded-xl bg-[#0E0A0D]/95 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] pointer-events-auto"
      >
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-[#E8B84B]" />
          <div>
            <div className="font-editorial text-xs font-bold text-white uppercase tracking-wider">
              CHEMISTRY: 98%
            </div>
            <div className="font-mono text-[10px] text-[#00E599]">
              HIGH PRESS [4-3-3]
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
