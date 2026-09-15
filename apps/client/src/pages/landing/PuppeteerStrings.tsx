import React from 'react';
import { motion } from 'framer-motion';

interface StringsProps {
  isLeftHovered: boolean;
  isRightHovered: boolean;
  isLeftActive: boolean;
  isRightActive: boolean;
  leftDelta?: { x: number; y: number };
  rightDelta?: { x: number; y: number };
}

export const PuppeteerStrings: React.FC<StringsProps> = ({
  isLeftHovered,
  isRightHovered,
  isLeftActive,
  isRightActive,
  leftDelta = { x: 0, y: 0 },
  rightDelta = { x: 0, y: 0 },
}) => {
  // Left crossbar attachment points (in 1024x682 coordinate space)
  const leftBarPoints = [
    { x: 166, y: 275 }, // outer left
    { x: 208, y: 271 }, // inner left
    { x: 318, y: 269 }, // inner right
    { x: 356, y: 273 }, // outer right
  ];

  // Left button top eyelet attachment points
  const leftEyelets = [
    { x: 166 + leftDelta.x, y: 486 + leftDelta.y },
    { x: 208 + leftDelta.x, y: 485 + leftDelta.y },
    { x: 318 + leftDelta.x, y: 485 + leftDelta.y },
    { x: 356 + leftDelta.x, y: 486 + leftDelta.y },
  ];

  // Right crossbar attachment points
  const rightBarPoints = [
    { x: 672, y: 273 }, // outer left
    { x: 710, y: 269 }, // inner left
    { x: 820, y: 271 }, // inner right
    { x: 862, y: 275 }, // outer right
  ];

  // Right button top eyelet attachment points
  const rightEyelets = [
    { x: 672 + rightDelta.x, y: 486 + rightDelta.y },
    { x: 710 + rightDelta.x, y: 485 + rightDelta.y },
    { x: 820 + rightDelta.x, y: 485 + rightDelta.y },
    { x: 862 + rightDelta.x, y: 486 + rightDelta.y },
  ];

  // Calculate sag / curvature: less sag when hovered or active
  const leftSag = isLeftActive ? 0 : isLeftHovered ? 1.5 : 4;
  const rightSag = isRightActive ? 0 : isRightHovered ? 1.5 : 4;

  return (
    <svg
      viewBox="0 0 1024 682"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 w-full h-full pointer-events-none z-25 overflow-visible"
    >
      <defs>
        {/* Battle Crimson String Glow Filter */}
        <filter id="crimson-string-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* High Voltage String Glow Filter */}
        <filter id="crimson-string-glow-active" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4.5" result="blur1" />
          <feGaussianBlur stdDeviation="1.5" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── LEFT PUPPETEER STRINGS ── */}
      <g filter={isLeftHovered || isLeftActive ? 'url(#crimson-string-glow-active)' : 'url(#crimson-string-glow)'}>
        {leftBarPoints.map((barPt, i) => {
          const eyelet = leftEyelets[i];
          const midX = (barPt.x + eyelet.x) / 2 + (i % 2 === 0 ? -leftSag : leftSag);
          const midY = (barPt.y + eyelet.y) / 2;
          const pathD = `M ${barPt.x} ${barPt.y} Q ${midX} ${midY} ${eyelet.x} ${eyelet.y}`;

          return (
            <g key={`left-string-${i}`}>
              {/* Outer soft glow line */}
              <motion.path
                d={pathD}
                stroke={isLeftHovered ? '#D92525' : '#B81D1D'}
                strokeWidth={isLeftHovered ? '2.5' : '1.8'}
                strokeOpacity={isLeftHovered ? '0.95' : '0.75'}
                fill="none"
                strokeLinecap="round"
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
              {/* Inner bright core line */}
              <motion.path
                d={pathD}
                stroke="#FFFFFF"
                strokeWidth="0.75"
                strokeOpacity={isLeftHovered ? '0.85' : '0.45'}
                fill="none"
                strokeLinecap="round"
              />
              {/* Top and bottom attachment rings */}
              <circle cx={barPt.x} cy={barPt.y} r="2.5" fill="#D92525" opacity="0.9" />
              <circle cx={eyelet.x} cy={eyelet.y} r="3" fill="#D92525" opacity="0.95" />
            </g>
          );
        })}
      </g>

      {/* ── RIGHT PUPPETEER STRINGS ── */}
      <g filter={isRightHovered || isRightActive ? 'url(#crimson-string-glow-active)' : 'url(#crimson-string-glow)'}>
        {rightBarPoints.map((barPt, i) => {
          const eyelet = rightEyelets[i];
          const midX = (barPt.x + eyelet.x) / 2 + (i % 2 === 0 ? rightSag : -rightSag);
          const midY = (barPt.y + eyelet.y) / 2;
          const pathD = `M ${barPt.x} ${barPt.y} Q ${midX} ${midY} ${eyelet.x} ${eyelet.y}`;

          return (
            <g key={`right-string-${i}`}>
              {/* Outer soft glow line */}
              <motion.path
                d={pathD}
                stroke={isRightHovered ? '#D92525' : '#B81D1D'}
                strokeWidth={isRightHovered ? '2.5' : '1.8'}
                strokeOpacity={isRightHovered ? '0.95' : '0.75'}
                fill="none"
                strokeLinecap="round"
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
              {/* Inner bright core line */}
              <motion.path
                d={pathD}
                stroke="#FFFFFF"
                strokeWidth="0.75"
                strokeOpacity={isRightHovered ? '0.85' : '0.45'}
                fill="none"
                strokeLinecap="round"
              />
              {/* Top and bottom attachment rings */}
              <circle cx={barPt.x} cy={barPt.y} r="2.5" fill="#D92525" opacity="0.9" />
              <circle cx={eyelet.x} cy={eyelet.y} r="3" fill="#D92525" opacity="0.95" />
            </g>
          );
        })}
      </g>
    </svg>
  );
};
