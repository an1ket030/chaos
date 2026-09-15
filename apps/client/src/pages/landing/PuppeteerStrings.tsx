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
  // Left crossbar attachment points (in 1000x650 coordinate space)
  const leftBarPoints = [
    { x: 275, y: 240 },
    { x: 330, y: 240 },
    { x: 395, y: 240 },
    { x: 455, y: 240 },
  ];

  // Left button top eyelet attachment points
  const leftEyelets = [
    { x: 265 + leftDelta.x, y: 455 + leftDelta.y },
    { x: 330 + leftDelta.x, y: 455 + leftDelta.y },
    { x: 400 + leftDelta.x, y: 455 + leftDelta.y },
    { x: 465 + leftDelta.x, y: 455 + leftDelta.y },
  ];

  // Right crossbar attachment points
  const rightBarPoints = [
    { x: 545, y: 240 },
    { x: 605, y: 240 },
    { x: 670, y: 240 },
    { x: 725, y: 240 },
  ];

  // Right button top eyelet attachment points
  const rightEyelets = [
    { x: 535 + rightDelta.x, y: 455 + rightDelta.y },
    { x: 600 + rightDelta.x, y: 455 + rightDelta.y },
    { x: 670 + rightDelta.x, y: 455 + rightDelta.y },
    { x: 735 + rightDelta.x, y: 455 + rightDelta.y },
  ];

  // Calculate sag: straightens into taut tension when hovered or active
  const leftSag = isLeftActive ? 0 : isLeftHovered ? 0.6 : 3.8;
  const rightSag = isRightActive ? 0 : isRightHovered ? 0.6 : 3.8;

  return (
    <svg
      viewBox="0 0 1000 650"
      preserveAspectRatio="none"
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

        {/* Active High-Voltage String Glow Filter */}
        <filter id="crimson-string-glow-active" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur1" />
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
            <g key={`left-str-${i}`}>
              {/* Outer Crimson Glow Line */}
              <motion.path
                d={pathD}
                stroke={isLeftHovered ? '#D92525' : '#B81D1D'}
                strokeWidth={isLeftHovered ? '2.5' : '1.8'}
                strokeOpacity={isLeftHovered ? '0.95' : '0.8'}
                fill="none"
                strokeLinecap="round"
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
              {/* Inner Bright White Core */}
              <motion.path
                d={pathD}
                stroke="#FFFFFF"
                strokeWidth="0.8"
                strokeOpacity={isLeftHovered ? '0.9' : '0.5'}
                fill="none"
                strokeLinecap="round"
              />
              {/* Attachment Anchor Dots */}
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
            <g key={`right-str-${i}`}>
              {/* Outer Crimson Glow Line */}
              <motion.path
                d={pathD}
                stroke={isRightHovered ? '#D92525' : '#B81D1D'}
                strokeWidth={isRightHovered ? '2.5' : '1.8'}
                strokeOpacity={isRightHovered ? '0.95' : '0.8'}
                fill="none"
                strokeLinecap="round"
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
              {/* Inner Bright White Core */}
              <motion.path
                d={pathD}
                stroke="#FFFFFF"
                strokeWidth="0.8"
                strokeOpacity={isRightHovered ? '0.9' : '0.5'}
                fill="none"
                strokeLinecap="round"
              />
              {/* Attachment Anchor Dots */}
              <circle cx={barPt.x} cy={barPt.y} r="2.5" fill="#D92525" opacity="0.9" />
              <circle cx={eyelet.x} cy={eyelet.y} r="3" fill="#D92525" opacity="0.95" />
            </g>
          );
        })}
      </g>
    </svg>
  );
};
