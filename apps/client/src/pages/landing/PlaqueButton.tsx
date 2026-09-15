import React from 'react';
import { motion } from 'framer-motion';

interface PlaqueButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isHovered: boolean;
  isActive: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onPressStart: () => void;
  onPressEnd: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const PlaqueButton: React.FC<PlaqueButtonProps> = ({
  label,
  icon,
  onClick,
  isHovered,
  isActive,
  onHoverStart,
  onHoverEnd,
  onPressStart,
  onPressEnd,
  className = '',
  style = {},
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onMouseDown={onPressStart}
      onMouseUp={onPressEnd}
      animate={{
        y: isActive ? 3 : isHovered ? -5 : [0, -3, 0],
      }}
      transition={{
        y: {
          duration: isHovered || isActive ? 0.2 : 4.8,
          repeat: isHovered || isActive ? 0 : Infinity,
          ease: 'easeInOut',
        },
      }}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.97 }}
      className={`relative rounded-xl md:rounded-2xl transition-all cursor-pointer group flex items-center justify-center select-none overflow-visible ${className}`}
      style={{
        background: 'linear-gradient(180deg, #1A1218 0%, #0E0A0D 50%, #060406 100%)',
        border: isHovered 
          ? '2px solid #D92525' 
          : '1.5px solid rgba(217, 37, 37, 0.65)',
        boxShadow: isHovered 
          ? '0 0 35px rgba(217, 37, 37, 0.75), inset 0 0 15px rgba(217, 37, 37, 0.35)' 
          : '0 10px 25px rgba(0, 0, 0, 0.9), 0 0 15px rgba(184, 29, 29, 0.25), inset 0 0 12px rgba(0,0,0,0.85)',
        ...style,
      }}
    >
      {/* 4 Metal Hanging Eyelets / Rings at Top */}
      <div className="absolute -top-3 left-0 right-0 flex justify-around px-2 pointer-events-none opacity-90">
        <span className="w-2.5 h-2.5 rounded-full border-2 border-[#D92525] bg-[#0E0A0D] shadow-[0_0_8px_rgba(217,37,37,0.9)]" />
        <span className="w-2.5 h-2.5 rounded-full border-2 border-[#D92525] bg-[#0E0A0D] shadow-[0_0_8px_rgba(217,37,37,0.9)]" />
        <span className="w-2.5 h-2.5 rounded-full border-2 border-[#D92525] bg-[#0E0A0D] shadow-[0_0_8px_rgba(217,37,37,0.9)]" />
        <span className="w-2.5 h-2.5 rounded-full border-2 border-[#D92525] bg-[#0E0A0D] shadow-[0_0_8px_rgba(217,37,37,0.9)]" />
      </div>

      {/* Internal Chamfered Accent Border */}
      <div className="absolute inset-1 rounded-lg border border-white/[0.07] pointer-events-none" />

      {/* Content Container */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 py-3 sm:py-4 px-4 sm:px-6 z-10">
        {/* Icon Badge */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#B81D1D]/20 border border-[#D92525]/50 flex items-center justify-center text-[#D92525] group-hover:scale-110 group-hover:text-white transition-all shadow-[0_0_10px_rgba(217,37,37,0.4)]">
          {icon}
        </div>

        {/* Plaque Typography */}
        <div className="text-left flex flex-col">
          <span className="font-editorial font-bold text-sm sm:text-base md:text-lg lg:text-xl uppercase tracking-[0.15em] text-white group-hover:text-[#F4F6FB] transition-colors leading-none">
            {label}
          </span>
          <span className="w-8 h-0.5 bg-[#D92525]/60 mt-1 rounded-full group-hover:w-full transition-all duration-300" />
        </div>
      </div>

      {/* Crimson Ambient Glow Flare on Hover */}
      {isHovered && (
        <div className="absolute inset-0 rounded-xl md:rounded-2xl ring-2 ring-[#D92525] ring-opacity-80 animate-pulse pointer-events-none" />
      )}
    </motion.button>
  );
};
