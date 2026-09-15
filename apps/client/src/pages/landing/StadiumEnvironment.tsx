import React from 'react';
import { motion } from 'framer-motion';

interface StadiumEnvironmentProps {
  mouseXSpring?: any;
  mouseYSpring?: any;
}

export const StadiumEnvironment: React.FC<StadiumEnvironmentProps> = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* ── 1. Deep Void Base Background ── */}
      <div className="absolute inset-0 bg-[#050305]" />

      {/* ── 2. Theatrical Volumetric Floodlight Beams & Ambient Glow ── */}
      <div className="absolute inset-0">
        {/* Top-left floodlight beam */}
        <div 
          className="absolute -top-24 left-1/4 w-[500px] h-[800px] bg-gradient-to-b from-white/[0.04] via-[#B81D1D]/[0.06] to-transparent transform -rotate-12 blur-3xl"
        />
        {/* Top-right floodlight beam */}
        <div 
          className="absolute -top-24 right-1/4 w-[500px] h-[800px] bg-gradient-to-b from-white/[0.04] via-[#B81D1D]/[0.06] to-transparent transform rotate-12 blur-3xl"
        />
        {/* Central fiery red stadium halo behind player */}
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[950px] h-[550px] bg-[#B81D1D]/20 rounded-full blur-[140px]"
        />
        {/* Deep stadium dome curvature line */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1600px] h-[700px] rounded-[100%] border-b border-white/[0.04]"
        />
      </div>

      {/* ── 3. Architectural Stone Pillars / Colonnade (Fluted Stadium Columns) ── */}
      {/* Left Pillars */}
      <div className="absolute top-0 bottom-0 left-0 w-28 sm:w-44 md:w-56 flex opacity-40">
        <div className="w-1/2 h-full bg-gradient-to-r from-[#0E0B0F] via-[#1A141C] to-[#0A070B] border-r border-white/[0.05] shadow-[15px_0_30px_rgba(0,0,0,0.8)]" />
        <div className="w-1/2 h-full bg-gradient-to-r from-[#120D14] via-[#1E1721] to-[#0A070B] border-r border-white/[0.03]" />
      </div>
      {/* Right Pillars */}
      <div className="absolute top-0 bottom-0 right-0 w-28 sm:w-44 md:w-56 flex opacity-40">
        <div className="w-1/2 h-full bg-gradient-to-l from-[#120D14] via-[#1E1721] to-[#0A070B] border-l border-white/[0.03]" />
        <div className="w-1/2 h-full bg-gradient-to-l from-[#0E0B0F] via-[#1A141C] to-[#0A070B] border-l border-white/[0.05] shadow-[-15px_0_30px_rgba(0,0,0,0.8)]" />
      </div>

      {/* ── 4. Theatrical Dark Crimson Arena Fabric Banners ── */}
      {/* Left Hanging Banner: #7 Insignia */}
      <div className="absolute top-16 left-28 sm:left-48 md:left-64 w-28 sm:w-36 md:w-44 h-[420px] rounded-b-xl overflow-hidden opacity-45 shadow-[0_20px_40px_rgba(0,0,0,0.9)] hidden sm:block">
        <div className="w-full h-full bg-gradient-to-b from-[#220B0F] via-[#150608] to-[#090304] border-x border-b border-[#B81D1D]/30 p-4 flex flex-col justify-between items-center relative">
          <div className="w-full h-1 bg-[#D92525]/60 mb-2" />
          <div className="font-editorial text-7xl font-bold text-white/20 select-none tracking-tighter">
            7
          </div>
          <div className="font-mono text-[9px] tracking-[0.3em] text-[#8A95A8] uppercase text-center pb-2">
            CR7 // LEGEND
          </div>
          {/* Subtle fabric weave overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        </div>
      </div>

      {/* Right Hanging Banner: DISCIPLINE BUILDS FREEDOM */}
      <div className="absolute top-16 right-28 sm:right-48 md:right-64 w-28 sm:w-36 md:w-44 h-[440px] rounded-b-xl overflow-hidden opacity-45 shadow-[0_20px_40px_rgba(0,0,0,0.9)] hidden sm:block">
        <div className="w-full h-full bg-gradient-to-b from-[#220B0F] via-[#150608] to-[#090304] border-x border-b border-[#B81D1D]/30 p-4 flex flex-col justify-between items-center relative">
          <div className="w-full h-1 bg-[#D92525]/60 mb-2" />
          <div className="text-center">
            <div className="font-editorial text-xs sm:text-sm font-bold text-white/50 tracking-[0.2em] leading-relaxed uppercase">
              DISCIPLINE<br />BUILDS<br />FREEDOM
            </div>
          </div>
          <div className="font-mono text-[9px] tracking-[0.25em] text-[#8A95A8] uppercase text-center pb-2">
            WAR ROOM // XI
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        </div>
      </div>

      {/* ── 5. Background Stadium Statues / Trophies (Rendered as Crisp Silhouettes) ── */}
      {/* Left Statue: Striker silhouette on pedestal */}
      <div className="absolute bottom-28 left-8 sm:left-20 opacity-30 hidden md:block">
        <svg width="120" height="220" viewBox="0 0 100 180" fill="none">
          {/* Pedestal */}
          <rect x="25" y="140" width="50" height="40" rx="4" fill="#140E16" stroke="rgba(255,255,255,0.06)" />
          {/* Striker body silhouette */}
          <path d="M45 40 Q55 20 60 40 L58 75 L75 110 L68 115 L52 85 L44 125 L36 125 L46 75 L35 70 Z" fill="#1E1622" />
          <circle cx="50" cy="24" r="8" fill="#1E1622" />
          {/* Ball */}
          <circle cx="80" cy="115" r="7" fill="#B81D1D" stroke="#D92525" strokeWidth="1" />
        </svg>
      </div>

      {/* Right Trophy: Champions League style cup silhouette */}
      <div className="absolute bottom-28 right-8 sm:right-20 opacity-35 hidden md:block">
        <svg width="140" height="240" viewBox="0 0 120 180" fill="none">
          {/* Pedestal */}
          <rect x="35" y="145" width="50" height="35" rx="4" fill="#140E16" stroke="rgba(255,255,255,0.06)" />
          {/* Trophy body */}
          <path d="M40 35 L80 35 L76 90 Q60 115 44 90 Z" fill="#221A26" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          {/* Trophy handles */}
          <path d="M40 45 C20 45 15 65 15 80 C15 95 30 98 44 85" stroke="rgba(217,37,37,0.4)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M80 45 C100 45 105 65 105 80 C105 95 90 98 76 85" stroke="rgba(217,37,37,0.4)" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Stem */}
          <line x1="60" y1="108" x2="60" y2="145" stroke="#221A26" strokeWidth="6" />
        </svg>
      </div>

      {/* ── 6. Specular Wet Pitch Floor Reflection Plane at the Base ── */}
      <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#0A050A] via-[#080408]/90 to-transparent">
        {/* Specular glossy red reflection highlight */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[700px] h-[60px] bg-gradient-to-r from-transparent via-[#D92525]/20 to-transparent rounded-full blur-xl" />
        {/* Wet pitch floor surface lines */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>
    </div>
  );
};
