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
      {/* ── LEFT PUPPETEER CROSSBAR ── */}
      <motion.div
        animate={{
          y: isLeftActive ? 2 : isLeftHovered ? -4 : [0, -4, 0],
          rotate: isLeftActive ? -1 : isLeftHovered ? -1.5 : [-0.5, 0.5, -0.5],
        }}
        transition={{
          y: { duration: isLeftHovered || isLeftActive ? 0.2 : 5, repeat: isLeftHovered || isLeftActive ? 0 : Infinity, ease: 'easeInOut' },
          rotate: { duration: isLeftHovered || isLeftActive ? 0.2 : 5.5, repeat: isLeftHovered || isLeftActive ? 0 : Infinity, ease: 'easeInOut' },
        }}
        style={{
          position: 'absolute',
          left: '16%',
          top: '38.5%',
          width: '18%',
          height: '14px',
        }}
        className="flex items-center justify-between"
      >
        {/* The Wooden / Metallic Bar */}
        <div 
          className="relative w-full h-full rounded-full border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.9)]"
          style={{
            background: 'linear-gradient(180deg, #4A3328 0%, #2A1A12 50%, #150C07 100%)',
            boxShadow: isLeftHovered 
              ? '0 0 15px rgba(217, 37, 37, 0.6), inset 0 1px 2px rgba(255,255,255,0.4)' 
              : '0 4px 12px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.2)',
          }}
        >
          {/* Metallic End Caps with Crimson Rim */}
          <div className="absolute -left-1 top-0 bottom-0 w-2.5 rounded-l-full bg-[#181116] border border-[#D92525]/60" />
          <div className="absolute -right-1 top-0 bottom-0 w-2.5 rounded-r-full bg-[#181116] border border-[#D92525]/60" />

          {/* 4 Brass Suspension Rings / Eyelets from which strings drop */}
          <div className="absolute -bottom-2 left-0 right-0 flex justify-between px-2">
            <span className="w-2 h-2 rounded-full border border-[#D92525] bg-[#0E0A0D] shadow-[0_0_6px_rgba(217,37,37,0.8)]" />
            <span className="w-2 h-2 rounded-full border border-[#D92525] bg-[#0E0A0D] shadow-[0_0_6px_rgba(217,37,37,0.8)]" />
            <span className="w-2 h-2 rounded-full border border-[#D92525] bg-[#0E0A0D] shadow-[0_0_6px_rgba(217,37,37,0.8)]" />
            <span className="w-2 h-2 rounded-full border border-[#D92525] bg-[#0E0A0D] shadow-[0_0_6px_rgba(217,37,37,0.8)]" />
          </div>

          {/* Grip / Center Metal Bracket */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-6 h-5 rounded bg-gradient-to-b from-[#3A2830] to-[#120D14] border border-[#D92525]/40" />
        </div>
      </motion.div>

      {/* ── RIGHT PUPPETEER CROSSBAR ── */}
      <motion.div
        animate={{
          y: isRightActive ? 2 : isRightHovered ? -4 : [0, -4, 0],
          rotate: isRightActive ? 1 : isRightHovered ? 1.5 : [0.5, -0.5, 0.5],
        }}
        transition={{
          y: { duration: isRightHovered || isRightActive ? 0.2 : 5.2, repeat: isRightHovered || isRightActive ? 0 : Infinity, ease: 'easeInOut' },
          rotate: { duration: isRightHovered || isRightActive ? 0.2 : 5.8, repeat: isRightHovered || isRightActive ? 0 : Infinity, ease: 'easeInOut' },
        }}
        style={{
          position: 'absolute',
          right: '16%',
          top: '38.5%',
          width: '18%',
          height: '14px',
        }}
        className="flex items-center justify-between"
      >
        {/* The Wooden / Metallic Bar */}
        <div 
          className="relative w-full h-full rounded-full border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.9)]"
          style={{
            background: 'linear-gradient(180deg, #4A3328 0%, #2A1A12 50%, #150C07 100%)',
            boxShadow: isRightHovered 
              ? '0 0 15px rgba(217, 37, 37, 0.6), inset 0 1px 2px rgba(255,255,255,0.4)' 
              : '0 4px 12px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.2)',
          }}
        >
          {/* Metallic End Caps with Crimson Rim */}
          <div className="absolute -left-1 top-0 bottom-0 w-2.5 rounded-l-full bg-[#181116] border border-[#D92525]/60" />
          <div className="absolute -right-1 top-0 bottom-0 w-2.5 rounded-r-full bg-[#181116] border border-[#D92525]/60" />

          {/* 4 Brass Suspension Rings / Eyelets */}
          <div className="absolute -bottom-2 left-0 right-0 flex justify-between px-2">
            <span className="w-2 h-2 rounded-full border border-[#D92525] bg-[#0E0A0D] shadow-[0_0_6px_rgba(217,37,37,0.8)]" />
            <span className="w-2 h-2 rounded-full border border-[#D92525] bg-[#0E0A0D] shadow-[0_0_6px_rgba(217,37,37,0.8)]" />
            <span className="w-2 h-2 rounded-full border border-[#D92525] bg-[#0E0A0D] shadow-[0_0_6px_rgba(217,37,37,0.8)]" />
            <span className="w-2 h-2 rounded-full border border-[#D92525] bg-[#0E0A0D] shadow-[0_0_6px_rgba(217,37,37,0.8)]" />
          </div>

          {/* Grip / Center Metal Bracket */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-6 h-5 rounded bg-gradient-to-b from-[#3A2830] to-[#120D14] border border-[#D92525]/40" />
        </div>
      </motion.div>
    </div>
  );
};
