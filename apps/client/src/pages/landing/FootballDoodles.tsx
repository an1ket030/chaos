import React from 'react';

interface DoodleProps {
  className?: string;
  color?: string;
  size?: number;
}

// Sketched Football with trajectory motion lines
export const DoodleFootball: React.FC<DoodleProps> = ({ className = '', color = '#F4F6FB', size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Ball outer perimeter with hand-drawn wobble */}
    <path
      d="M50 8 C26.8 8 8 26.8 8 50 C8 73.2 26.8 92 50 92 C73.2 92 92 73.2 92 50 C92 26.8 73.2 8 50 8 Z"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="180 5"
    />
    {/* Central pentagon */}
    <polygon
      points="50,32 66,44 60,63 40,63 34,44"
      fill="#B81D1D"
      stroke={color}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Seams radiating from pentagon */}
    <path d="M50 32 L50 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M66 44 L87 34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M60 63 L79 78" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M40 63 L21 78" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M34 44 L13 34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    {/* Dynamic curve speed marks */}
    <path d="M88 20 C96 28 98 42 95 56" stroke="#D92525" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 6" />
    <path d="M6 35 C3 45 4 60 12 72" stroke="#D92525" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 5" />
  </svg>
);

// Referee Whistle with vibration blast lines
export const DoodleWhistle: React.FC<DoodleProps> = ({ className = '', color = '#F4F6FB', size = 60 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Whistle barrel & mouth */}
    <path
      d="M18 42 L42 42 L62 26 C66 23 72 24 76 27 L82 33 C87 38 87 46 82 51 L72 61 C64 69 52 69 44 63 L34 68 L18 68 C14 68 12 64 12 60 L12 50 C12 46 14 42 18 42 Z"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(184, 29, 29, 0.15)"
    />
    {/* Sound vent / hole */}
    <circle cx="58" cy="48" r="7" stroke={color} strokeWidth="2.5" fill="#B81D1D" />
    {/* Loop ring at rear */}
    <path d="M12 55 C6 55 4 50 4 45 C4 40 7 35 12 35" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    {/* Sound / air vibrations */}
    <path d="M88 22 C94 28 96 36 94 44" stroke="#D92525" strokeWidth="3" strokeLinecap="round" />
    <path d="M78 12 C88 20 92 32 89 44" stroke="#D92525" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 4" />
    <path d="M68 6 C76 12 80 20 78 28" stroke="#F4F6FB" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Football Boot / Cleat with studs
export const DoodleBoot: React.FC<DoodleProps> = ({ className = '', color = '#F4F6FB', size = 70 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 110 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Boot outline */}
    <path
      d="M15 28 L32 26 C36 26 40 29 44 34 L56 46 L82 48 C94 48 102 54 104 64 L102 70 L20 70 C14 70 10 65 10 59 L10 40 C10 33 12 28 15 28 Z"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(184, 29, 29, 0.12)"
    />
    {/* Laces */}
    <path d="M38 35 L44 32 M42 41 L48 38 M47 47 L53 44" stroke="#D92525" strokeWidth="2.5" strokeLinecap="round" />
    {/* Sole & studs */}
    <path d="M15 70 L102 70" stroke={color} strokeWidth="4" strokeLinecap="round" />
    {/* Studs */}
    <path d="M22 74 L22 82 M34 74 L34 82 M76 74 L76 82 M92 74 L92 82" stroke="#D92525" strokeWidth="3" strokeLinecap="round" />
    {/* Swoosh accent */}
    <path d="M30 56 Q55 60 78 52" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    {/* Kick action dashes */}
    <path d="M102 44 L110 40 M104 54 L112 52 M98 64 L106 66" stroke="#D92525" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Champion's Crown
export const DoodleCrown: React.FC<DoodleProps> = ({ className = '', color = '#E8B84B', size = 60 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Crown Base */}
    <path
      d="M15 62 L85 62 L88 68 L12 68 Z"
      stroke={color}
      strokeWidth="2.5"
      fill="rgba(232, 184, 75, 0.2)"
    />
    {/* Crown peaks */}
    <path
      d="M15 62 L10 26 L32 44 L50 16 L68 44 L90 26 L85 62 Z"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(184, 29, 29, 0.15)"
    />
    {/* Jewels on tips */}
    <circle cx="10" cy="24" r="3.5" fill="#D92525" stroke={color} strokeWidth="1.5" />
    <circle cx="50" cy="14" r="4.5" fill="#D92525" stroke={color} strokeWidth="1.5" />
    <circle cx="90" cy="24" r="3.5" fill="#D92525" stroke={color} strokeWidth="1.5" />
    {/* Center diamond */}
    <polygon points="50,38 56,48 50,58 44,48" fill={color} />
  </svg>
);

// Championship Trophy
export const DoodleTrophy: React.FC<DoodleProps> = ({ className = '', color = '#E8B84B', size = 65 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Cup Body */}
    <path
      d="M28 20 L72 20 L68 55 C66 65 58 72 50 72 C42 72 34 65 32 55 Z"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(232, 184, 75, 0.15)"
    />
    {/* Handles */}
    <path
      d="M28 26 C16 26 12 36 12 44 C12 52 20 56 31 54"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M72 26 C84 26 88 36 88 44 C88 52 80 56 69 54"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Stem & Pedestal */}
    <path d="M50 72 L50 84" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    <path d="M30 84 L70 84 L74 92 L26 92 Z" stroke={color} strokeWidth="2.5" fill="rgba(184, 29, 29, 0.2)" />
    {/* Star inside cup */}
    <path
      d="M50 32 L52 38 L58 39 L53 43 L55 49 L50 45 L45 49 L47 43 L42 39 L48 38 Z"
      fill="#D92525"
    />
  </svg>
);

// Football Jersey with number
export const DoodleJersey: React.FC<DoodleProps & { number?: string }> = ({
  className = '',
  color = '#F4F6FB',
  size = 65,
  number = '10',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Jersey silhouette */}
    <path
      d="M36 18 C42 24 58 24 64 18 L86 30 L76 46 L68 40 L68 84 L32 84 L32 40 L24 46 L14 30 Z"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(184, 29, 29, 0.2)"
    />
    {/* Collar V */}
    <path d="M42 19 L50 29 L58 19" stroke="#D92525" strokeWidth="2.5" strokeLinecap="round" />
    {/* Number text */}
    <text
      x="50"
      y="62"
      textAnchor="middle"
      fill="#F4F6FB"
      fontSize="24"
      fontFamily="Bebas Neue, sans-serif"
      fontWeight="bold"
      letterSpacing="1"
    >
      {number}
    </text>
  </svg>
);

// Tactical Curved Run Arrow
export const DoodleTacticalArrow: React.FC<DoodleProps & { angle?: number }> = ({
  className = '',
  color = '#D92525',
  size = 70,
  angle = 0,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ transform: `rotate(${angle}deg)` }}
  >
    {/* Dynamic chalk dashed curved path */}
    <path
      d="M15 85 C25 45 55 25 80 20"
      stroke={color}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeDasharray="6 6"
    />
    {/* Arrowhead */}
    <path
      d="M65 14 L84 20 L76 38"
      stroke={color}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Tactical Press Arrow (Straight thrust)
export const DoodlePressArrow: React.FC<DoodleProps & { angle?: number }> = ({
  className = '',
  color = '#F4F6FB',
  size = 60,
  angle = 0,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ transform: `rotate(${angle}deg)` }}
  >
    <path d="M10 30 L80 30" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray="5 5" />
    <polygon points="76,18 94,30 76,42" fill="#B81D1D" stroke={color} strokeWidth="2.5" />
  </svg>
);

// Tactical Formation [4-3-3] chalkboard sketch
export const DoodleFormation: React.FC<DoodleProps> = ({ className = '', color = '#F4F6FB', size = 80 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Pitch border */}
    <rect x="10" y="10" width="100" height="80" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
    <line x1="60" y1="10" x2="60" y2="90" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
    <circle cx="60" cy="50" r="16" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
    {/* Strikers (3) */}
    <circle cx="95" cy="25" r="4" fill="#D92525" stroke={color} strokeWidth="1.5" />
    <circle cx="98" cy="50" r="4.5" fill="#B81D1D" stroke={color} strokeWidth="1.5" />
    <circle cx="95" cy="75" r="4" fill="#D92525" stroke={color} strokeWidth="1.5" />
    {/* Midfielders (3) */}
    <circle cx="70" cy="30" r="4" fill="#E8B84B" stroke={color} strokeWidth="1.5" />
    <circle cx="60" cy="50" r="4" fill="#E8B84B" stroke={color} strokeWidth="1.5" />
    <circle cx="70" cy="70" r="4" fill="#E8B84B" stroke={color} strokeWidth="1.5" />
    {/* Defenders (4) */}
    <circle cx="36" cy="20" r="3.5" fill="#3D8EFF" stroke={color} strokeWidth="1.5" />
    <circle cx="32" cy="40" r="3.5" fill="#3D8EFF" stroke={color} strokeWidth="1.5" />
    <circle cx="32" cy="60" r="3.5" fill="#3D8EFF" stroke={color} strokeWidth="1.5" />
    <circle cx="36" cy="80" r="3.5" fill="#3D8EFF" stroke={color} strokeWidth="1.5" />
    {/* Keeper */}
    <circle cx="16" cy="50" r="4" fill="#00E599" stroke={color} strokeWidth="1.5" />
    {/* Connecting pass vector */}
    <path d="M60 50 L95 25" stroke="#D92525" strokeWidth="1.5" strokeDasharray="2 3" />
  </svg>
);

// Referee Cards (Red & Yellow)
export const DoodleCards: React.FC<DoodleProps> = ({ className = '', size = 55 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 90 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Yellow Card (Behind) */}
    <rect
      x="12"
      y="22"
      width="34"
      height="52"
      rx="3"
      fill="#E8B84B"
      stroke="#F4F6FB"
      strokeWidth="2"
      transform="rotate(-15 12 22)"
    />
    {/* Red Card (Front) */}
    <rect
      x="40"
      y="18"
      width="34"
      height="52"
      rx="3"
      fill="#B81D1D"
      stroke="#F4F6FB"
      strokeWidth="2.5"
      transform="rotate(12 40 18)"
    />
    {/* Card glow line */}
    <line x1="45" y1="28" x2="68" y2="33" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Auction Gavel & Gold Coin Token
export const DoodleAuction: React.FC<DoodleProps> = ({ className = '', color = '#F4F6FB', size = 60 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Gavel head */}
    <rect
      x="22"
      y="18"
      width="36"
      height="18"
      rx="3"
      fill="#B81D1D"
      stroke={color}
      strokeWidth="2.5"
      transform="rotate(-30 22 18)"
    />
    {/* Gavel handle */}
    <path d="M42 36 L68 76" stroke={color} strokeWidth="4" strokeLinecap="round" />
    {/* Impact ring */}
    <path d="M12 48 C16 42 26 40 32 44" stroke="#D92525" strokeWidth="2.5" strokeLinecap="round" />
    {/* Coin */}
    <circle cx="78" cy="74" r="14" fill="#E8B84B" stroke={color} strokeWidth="2" />
    <text x="78" y="80" textAnchor="middle" fill="#06090E" fontSize="13" fontFamily="JetBrains Mono" fontWeight="bold">
      CP
    </text>
  </svg>
);

// Goalpost with Net
export const DoodleGoalpost: React.FC<DoodleProps> = ({ className = '', color = 'rgba(255,255,255,0.4)', size = 75 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Goal frame */}
    <path d="M15 65 L15 15 L85 15 L85 65" stroke={color} strokeWidth="3" strokeLinecap="round" />
    {/* Net back frame */}
    <path d="M15 15 L26 8 L74 8 L85 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M26 8 L26 58 L15 65" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
    <path d="M74 8 L74 58 L85 65" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
    {/* Net mesh lines */}
    <line x1="38" y1="12" x2="38" y2="60" stroke={color} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
    <line x1="50" y1="12" x2="50" y2="60" stroke={color} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
    <line x1="62" y1="12" x2="62" y2="60" stroke={color} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
    <line x1="18" y1="30" x2="82" y2="30" stroke={color} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
    <line x1="18" y1="45" x2="82" y2="45" stroke={color} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
  </svg>
);

// Lightning Mark
export const DoodleLightning: React.FC<DoodleProps> = ({ className = '', color = '#D92525', size = 50 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 60 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <polygon
      points="34,4 12,42 28,42 22,76 48,34 32,34"
      fill={color}
      stroke="#F4F6FB"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

// Tactical Coordinate Crosses & Sparkles
export const DoodleSparkle: React.FC<DoodleProps> = ({ className = '', color = '#F4F6FB', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 4-point star sparkle */}
    <path
      d="M20 4 Q20 20 4 20 Q20 20 20 36 Q20 20 36 20 Q20 20 20 4 Z"
      fill={color}
    />
  </svg>
);

export const DoodleCross: React.FC<DoodleProps> = ({ className = '', color = '#D92525', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M15 4 L15 26 M4 15 L26 15" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// Iconic Pitch Lords / Game Crown emblem
export const DoodlePitchCrown: React.FC<DoodleProps> = ({ className = '', color = '#D92525', size = 38 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Crown 3-pointed shape */}
    <path
      d="M6 24 L10 8 L24 16 L38 8 L42 24 Z"
      stroke={color}
      strokeWidth="2.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />
    {/* Double horizontal base bars */}
    <line x1="8" y1="28" x2="40" y2="28" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="12" y1="33" x2="36" y2="33" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// CR7 Iconic Number 7 sketch
export const DoodleNumber7: React.FC<DoodleProps> = ({ className = '', color = '#F4F6FB', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M8 12 L42 12 L22 52"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="16" y1="32" x2="32" y2="32" stroke="#D92525" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

