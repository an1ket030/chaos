import React from 'react';
import { motion } from 'framer-motion';

interface PuppeteerRodsProps {
  isLeftHovered?: boolean;
  isRightHovered?: boolean;
  isLeftActive?: boolean;
  isRightActive?: boolean;
}

export const PuppeteerRods: React.FC<PuppeteerRodsProps> = ({
  isLeftHovered = false,
  isRightHovered = false,
  isLeftActive = false,
  isRightActive = false,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
      {/* ── LEFT PUPPETEER CROSSBAR (HELD IN CR7'S LEFT HAND) ── */}
      <motion.div
        animate={{
          y: isLeftActive ? 4 : isLeftHovered ? -6 : [0, -4, 0],
          rotate: isLeftActive ? -1.5 : isLeftHovered ? -3 : [-0.5, 0.5, -0.5],
        }}
        transition={{
          y: { duration: isLeftHovered || isLeftActive ? 0.22 : 5.2, repeat: isLeftHovered || isLeftActive ? 0 : Infinity, ease: 'easeInOut' },
          rotate: { duration: isLeftHovered || isLeftActive ? 0.22 : 5.5, repeat: isLeftHovered || isLeftActive ? 0 : Infinity, ease: 'easeInOut' },
        }}
        style={{
          position: 'absolute',
          left: '25.4%',
          top: '34.5%',
          width: '22%',
          height: '16px',
        }}
        className="flex items-center justify-between overflow-visible"
      >
        {/* The Wooden Crossbar with Hand Grip */}
        <div 
          className="relative w-full h-full rounded-full border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.9)]"
          style={{
            background: 'linear-gradient(180deg, #4E3426 0%, #2E1B12 50%, #160D08 100%)',
            boxShadow: isLeftHovered 
              ? '0 0 20px rgba(217, 37, 37, 0.7), inset 0 1px 2px rgba(255,255,255,0.4)' 
              : '0 6px 16px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.2)',
          }}
        >
          {/* Metallic End Caps with Crimson Rim */}
          <div className="absolute -left-1.5 top-0 bottom-0 w-3 rounded-l-full bg-[#181116] border border-[#D92525]/70 shadow-[0_0_8px_rgba(217,37,37,0.5)]" />
          <div className="absolute -right-1.5 top-0 bottom-0 w-3 rounded-r-full bg-[#181116] border border-[#D92525]/70 shadow-[0_0_8px_rgba(217,37,37,0.5)]" />

          {/* 4 Brass Suspension Rings / Eyelets from which strings drop */}
          <div className="absolute -bottom-2.5 left-0 right-0 flex justify-between px-3">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#D92525] bg-[#0E0A0D] shadow-[0_0_8px_rgba(217,37,37,0.9)]" />
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#D92525] bg-[#0E0A0D] shadow-[0_0_8px_rgba(217,37,37,0.9)]" />
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#D92525] bg-[#0E0A0D] shadow-[0_0_8px_rgba(217,37,37,0.9)]" />
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#D92525] bg-[#0E0A0D] shadow-[0_0_8px_rgba(217,37,37,0.9)]" />
          </div>

          {/* Central Grip Collar Bracket (where Ronaldo's hand grips) */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-9 h-6 rounded bg-gradient-to-b from-[#4A323D] to-[#140D17] border border-[#D92525]/60 shadow-[0_0_12px_rgba(217,37,37,0.4)]" />
        </div>
      </motion.div>

      {/* ── RIGHT PUPPETEER CROSSBAR (HELD IN CR7'S RIGHT HAND) ── */}
      <motion.div
        animate={{
          y: isRightActive ? 4 : isRightHovered ? -6 : [0, -4, 0],
          rotate: isRightActive ? 1.5 : isRightHovered ? 3 : [0.5, -0.5, 0.5],
        }}
        transition={{
          y: { duration: isRightHovered || isRightActive ? 0.22 : 5.4, repeat: isRightHovered || isRightActive ? 0 : Infinity, ease: 'easeInOut' },
          rotate: { duration: isRightHovered || isRightActive ? 0.22 : 5.8, repeat: isRightHovered || isRightActive ? 0 : Infinity, ease: 'easeInOut' },
        }}
        style={{
          position: 'absolute',
          left: '52.6%',
          top: '34.5%',
          width: '22%',
          height: '16px',
        }}
        className="flex items-center justify-between overflow-visible"
      >
        {/* The Wooden Crossbar with Hand Grip */}
        <div 
          className="relative w-full h-full rounded-full border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.9)]"
          style={{
            background: 'linear-gradient(180deg, #4E3426 0%, #2E1B12 50%, #160D08 100%)',
            boxShadow: isRightHovered 
              ? '0 0 20px rgba(217, 37, 37, 0.7), inset 0 1px 2px rgba(255,255,255,0.4)' 
              : '0 6px 16px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.2)',
          }}
        >
          {/* Metallic End Caps with Crimson Rim */}
          <div className="absolute -left-1.5 top-0 bottom-0 w-3 rounded-l-full bg-[#181116] border border-[#D92525]/70 shadow-[0_0_8px_rgba(217,37,37,0.5)]" />
          <div className="absolute -right-1.5 top-0 bottom-0 w-3 rounded-r-full bg-[#181116] border border-[#D92525]/70 shadow-[0_0_8px_rgba(217,37,37,0.5)]" />

          {/* 4 Brass Suspension Rings / Eyelets from which strings drop */}
          <div className="absolute -bottom-2.5 left-0 right-0 flex justify-between px-3">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#D92525] bg-[#0E0A0D] shadow-[0_0_8px_rgba(217,37,37,0.9)]" />
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#D92525] bg-[#0E0A0D] shadow-[0_0_8px_rgba(217,37,37,0.9)]" />
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#D92525] bg-[#0E0A0D] shadow-[0_0_8px_rgba(217,37,37,0.9)]" />
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#D92525] bg-[#0E0A0D] shadow-[0_0_8px_rgba(217,37,37,0.9)]" />
          </div>

          {/* Central Grip Collar Bracket (where Ronaldo's hand grips) */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-9 h-6 rounded bg-gradient-to-b from-[#4A323D] to-[#140D17] border border-[#D92525]/60 shadow-[0_0_12px_rgba(217,37,37,0.4)]" />
        </div>
      </motion.div>
    </div>
  );
};
