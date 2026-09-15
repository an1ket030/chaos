import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CentralFootballerProps {
  imageSrc?: string;
  ronaldoX?: any;
  ronaldoY?: any;
}

export const CentralFootballer: React.FC<CentralFootballerProps> = ({
  imageSrc = '/assets/ronaldo-hero.png',
  ronaldoX,
  ronaldoY,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      style={{ x: ronaldoX, y: ronaldoY }}
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 w-full h-full pointer-events-none z-15 flex items-center justify-center select-none overflow-visible"
    >
      {/* ── 1. Volumetric Battle Crimson Backglow behind Ronaldo ── */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[600px] h-[450px] rounded-full bg-gradient-to-b from-[#B81D1D]/30 via-[#D92525]/12 to-transparent blur-[90px] pointer-events-none" />

      {/* ── 2. Subtle Arena Tactical Target Rings behind Hero ── */}
      <div className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full border border-[#D92525]/15 border-dashed animate-[spin_100s_linear_infinite] pointer-events-none" />
      <div className="absolute top-[34%] left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full border border-white/[0.04] pointer-events-none" />

      {/* ── 3. High-Res Image Overlay (Active if user provides /assets/ronaldo-hero.png) ── */}
      {!hasError && (
        <div className="absolute inset-0 flex items-center justify-center overflow-visible">
          <img
            src={imageSrc}
            alt="Cristiano Ronaldo - The Master Puppeteer"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full max-w-[900px] h-auto max-h-[90%] object-contain object-top filter contrast-[1.12] drop-shadow-[0_20px_50px_rgba(217,37,37,0.4)] transition-opacity duration-700 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      )}

      {/* ── 4. Unified 1000x650 Cristiano Ronaldo Master Puppeteer Canvas ── */}
      {(!isLoaded || hasError) && (
        <svg
          viewBox="0 0 1000 650"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full filter drop-shadow-[0_0_40px_rgba(217,37,37,0.45)] overflow-visible"
        >
          <defs>
            {/* Battle Crimson Rim Flare Filter */}
            <filter id="cr7-unified-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Torso Dark Shading Gradient */}
            <linearGradient id="cr7-carbon-body" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#221820" />
              <stop offset="25%" stopColor="#150E14" />
              <stop offset="70%" stopColor="#0A0609" />
              <stop offset="100%" stopColor="#050305" />
            </linearGradient>

            {/* Arm Shading Left (Light from Center) */}
            <linearGradient id="cr7-arm-left" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#221820" />
              <stop offset="60%" stopColor="#160F15" />
              <stop offset="100%" stopColor="#0D080C" />
            </linearGradient>

            {/* Arm Shading Right */}
            <linearGradient id="cr7-arm-right" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#221820" />
              <stop offset="60%" stopColor="#160F15" />
              <stop offset="100%" stopColor="#0D080C" />
            </linearGradient>

            {/* Red Rim Stroke Gradient */}
            <linearGradient id="cr7-rim-red" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF4A4A" />
              <stop offset="40%" stopColor="#D92525" />
              <stop offset="80%" stopColor="#B81D1D" />
              <stop offset="100%" stopColor="#550A0A" />
            </linearGradient>

            {/* Face Shading Gradient */}
            <linearGradient id="cr7-face-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2A1C24" />
              <stop offset="50%" stopColor="#1C1218" />
              <stop offset="100%" stopColor="#0E080C" />
            </linearGradient>
          </defs>

          {/* ── UNIFIED ATHLETIC SILHOUETTE WITH ARMS REACHING DIRECTLY TO STICKS ── */}
          <g filter="url(#cr7-unified-glow)">
            
            {/* 1. Main Torso & Chest Path (centered at X=500, Y=220-650) */}
            <path
              d="
                M 500 188
                C 475 190, 440 200, 415 224
                C 395 244, 385 272, 382 310
                L 392 410
                C 398 480, 394 560, 400 650
                L 600 650
                C 606 560, 602 480, 608 410
                L 618 310
                C 615 272, 605 244, 585 224
                C 560 200, 525 190, 500 188 Z
              "
              fill="url(#cr7-carbon-body)"
              stroke="url(#cr7-rim-red)"
              strokeWidth="2.4"
            />

            {/* 2. LEFT ARM — Originates at Left Shoulder (415, 224), curves down/out and grips Left Stick at (250, 252) */}
            <path
              d="
                M 415 224
                C 375 226, 315 234, 255 248
                L 245 256
                L 255 268
                C 305 278, 355 288, 385 306
                C 390 280, 398 250, 415 224 Z
              "
              fill="url(#cr7-arm-left)"
              stroke="url(#cr7-rim-red)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* Left Hand Knuckles & Fingers Gripping the Left Stick (at X=250, Y=252) */}
            <g transform="translate(250, 250)">
              {/* Palm / Hand Back */}
              <path
                d="M -16 -8 C -16 -16, 16 -16, 16 -8 C 18 2, 14 10, 8 12 L -8 12 C -14 10, -18 2, -16 -8 Z"
                fill="#2E1C27"
                stroke="#D92525"
                strokeWidth="1.8"
              />
              {/* 4 Curled Fingers wrapping tightly over the top of the wooden bar */}
              <circle cx="-12" cy="0" r="4.2" fill="#3D2434" stroke="#FF4A4A" strokeWidth="1.5" />
              <circle cx="-4" cy="-1.5" r="4.2" fill="#3D2434" stroke="#FF4A4A" strokeWidth="1.5" />
              <circle cx="4" cy="-1.5" r="4.2" fill="#3D2434" stroke="#FF4A4A" strokeWidth="1.5" />
              <circle cx="12" cy="0" r="4.2" fill="#3D2434" stroke="#FF4A4A" strokeWidth="1.5" />
              {/* Thumb wrapping underneath */}
              <path d="M -14 4 C -10 12, -4 14, 0 12" stroke="#FF4A4A" strokeWidth="1.6" fill="none" />
            </g>

            {/* 3. RIGHT ARM — Originates at Right Shoulder (585, 224), curves down/out and grips Right Stick at (750, 252) */}
            <path
              d="
                M 585 224
                C 625 226, 685 234, 745 248
                L 755 256
                L 745 268
                C 695 278, 645 288, 615 306
                C 610 280, 602 250, 585 224 Z
              "
              fill="url(#cr7-arm-right)"
              stroke="url(#cr7-rim-red)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* Right Hand Knuckles & Fingers Gripping the Right Stick (at X=750, Y=252) */}
            <g transform="translate(750, 250)">
              {/* Palm / Hand Back */}
              <path
                d="M -16 -8 C -16 -16, 16 -16, 16 -8 C 18 2, 14 10, 8 12 L -8 12 C -14 10, -18 2, -16 -8 Z"
                fill="#2E1C27"
                stroke="#D92525"
                strokeWidth="1.8"
              />
              {/* 4 Curled Fingers wrapping tightly over the top of the wooden bar */}
              <circle cx="-12" cy="0" r="4.2" fill="#3D2434" stroke="#FF4A4A" strokeWidth="1.5" />
              <circle cx="-4" cy="-1.5" r="4.2" fill="#3D2434" stroke="#FF4A4A" strokeWidth="1.5" />
              <circle cx="4" cy="-1.5" r="4.2" fill="#3D2434" stroke="#FF4A4A" strokeWidth="1.5" />
              <circle cx="12" cy="0" r="4.2" fill="#3D2434" stroke="#FF4A4A" strokeWidth="1.5" />
              {/* Thumb wrapping underneath */}
              <path d="M 14 4 C 10 12, 4 14, 0 12" stroke="#FF4A4A" strokeWidth="1.6" fill="none" />
            </g>

            {/* 4. NECK & TRAPEZIUS MUSCLES */}
            <path
              d="
                M 478 145
                L 476 188
                C 460 196, 440 206, 420 220
                L 435 222
                C 455 208, 475 198, 485 192
                L 485 145 Z
              "
              fill="#181016"
              opacity="0.8"
            />
            <path
              d="
                M 522 145
                L 524 188
                C 540 196, 560 206, 580 220
                L 565 222
                C 545 208, 525 198, 515 192
                L 515 145 Z
              "
              fill="#181016"
              opacity="0.8"
            />

            {/* 5. AUTHENTIC CRISTIANO RONALDO HEAD & SCULPTED JAWLINE */}
            {/* Head Silhouette */}
            <path
              d="
                M 500 58
                C 480 58, 464 68, 462 88
                C 460 98, 462 108, 466 118
                C 468 126, 470 136, 476 148
                C 482 158, 492 165, 500 166
                C 508 165, 518 158, 524 148
                C 530 136, 532 126, 534 118
                C 538 108, 540 98, 538 88
                C 536 68, 520 58, 500 58 Z
              "
              fill="url(#cr7-face-grad)"
              stroke="#D92525"
              strokeWidth="2.2"
            />

            {/* CR7 Textured High-Fade Hairstyle with Volume */}
            <path
              d="
                M 462 86
                C 460 62, 476 48, 500 48
                C 524 48, 540 62, 538 86
                C 536 78, 530 68, 518 64
                C 508 61, 492 61, 482 64
                C 470 68, 464 78, 462 86 Z
              "
              fill="#0A0609"
              stroke="#FF4A4A"
              strokeWidth="1.8"
            />
            {/* Hair Strands Highlights */}
            <path d="M 488 56 C 496 52, 504 52, 512 56" stroke="#D92525" strokeWidth="1.2" fill="none" />
            <path d="M 482 66 C 494 60, 506 60, 518 66" stroke="#D92525" strokeWidth="1.2" fill="none" />

            {/* Brow Ridge & Focused Eyes Impression */}
            <path d="M 480 102 L 494 104" stroke="#D92525" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 506 104 L 520 102" stroke="#D92525" strokeWidth="1.8" strokeLinecap="round" />
            <ellipse cx="488" cy="110" rx="3.5" ry="2" fill="#D92525" />
            <ellipse cx="512" cy="110" rx="3.5" ry="2" fill="#D92525" />

            {/* Chiseled Straight Nose */}
            <path d="M 500 105 L 498 124 L 504 126" stroke="#D92525" strokeWidth="1.4" fill="none" />

            {/* Strong Determined Lips */}
            <path d="M 492 138 C 496 136, 504 136, 508 138" stroke="#D92525" strokeWidth="1.6" strokeLinecap="round" />

            {/* Sharp Masculine Jawline & Cleft Chin Highlight */}
            <path
              d="M 474 132 L 484 152 L 496 158 L 504 158 L 516 152 L 526 132"
              stroke="#D92525"
              strokeWidth="1.6"
              fill="none"
              strokeOpacity="0.85"
            />

            {/* 6. ATHLETIC JERSEY COLLAR & DETAILS */}
            <path
              d="M 478 188 L 500 216 L 522 188"
              stroke="#D92525"
              strokeWidth="2.4"
              fill="none"
            />

            {/* Pectoral Muscle Contours */}
            <path
              d="M 440 280 C 470 295, 500 295, 500 320"
              stroke="#D92525"
              strokeWidth="1.4"
              strokeOpacity="0.4"
              fill="none"
            />
            <path
              d="M 560 280 C 530 295, 500 295, 500 320"
              stroke="#D92525"
              strokeWidth="1.4"
              strokeOpacity="0.4"
              fill="none"
            />

            {/* Deltoid / Bicep Definition Lines */}
            <path d="M 410 240 C 370 246, 330 252, 290 256" stroke="#D92525" strokeWidth="1.2" strokeOpacity="0.35" fill="none" />
            <path d="M 590 240 C 630 246, 670 252, 710 256" stroke="#D92525" strokeWidth="1.2" strokeOpacity="0.35" fill="none" />

            {/* 7. LEGENDARY #7 EMBLEM ON CHEST */}
            <g transform="translate(500, 360)">
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fontFamily="'Bebas Neue', sans-serif"
                fontSize="84"
                fontWeight="bold"
                fill="#D92525"
                fillOpacity="0.22"
                stroke="#D92525"
                strokeWidth="2"
                letterSpacing="4"
              >
                7
              </text>
            </g>
          </g>

          {/* Smooth Bottom Pitch Shadow Mask */}
          <rect
            x="200"
            y="540"
            width="600"
            height="110"
            fill="url(#cr7-carbon-body)"
            opacity="0.95"
          />
        </svg>
      )}

      {/* ── 5. Minimalist Character Identity Indicator (Zero Dashboard Clutter) ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-[#8A95A8]/70 flex items-center gap-2 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D92525] animate-pulse" />
        CR7 // THE MASTER PUPPETEER
      </div>

      {/* Soft Bottom Vignette Fade into Deep Stadium Turf */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#050305] via-[#050305]/80 to-transparent pointer-events-none" />
    </motion.div>
  );
};
