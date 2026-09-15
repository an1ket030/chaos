import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { 
  Users, Gamepad2, X, ArrowRight, Volume2, VolumeX,
  Shield, Trophy, Zap, ChevronRight, Hash, Flame, User
} from 'lucide-react';
import { StadiumEnvironment } from './StadiumEnvironment';
import { CentralFootballer } from './CentralFootballer';
import { PuppeteerRods } from './PuppeteerRods';
import { PuppeteerStrings } from './PuppeteerStrings';
import { PlaqueButton } from './PlaqueButton';
import {
  DoodleFootball,
  DoodleWhistle,
  DoodleBoot,
  DoodleCrown,
  DoodleTrophy,
  DoodleJersey,
  DoodleTacticalArrow,
  DoodlePressArrow,
  DoodleFormation,
  DoodleCards,
  DoodleGoalpost,
  DoodleLightning,
  DoodleSparkle,
  DoodleCross,
  DoodlePitchCrown,
  DoodleNumber7
} from './FootballDoodles';

// Editions available for room creation
const EDITIONS = [
  { slug: 'world-cup', name: 'World Cup', accent: '#E8B84B', icon: '🏆', desc: '16 national squads' },
  { slug: 'champions-league', name: 'Champions League', accent: '#3D8EFF', icon: '⭐', desc: 'Elite European titans' },
  { slug: 'premier-league', name: 'Premier League', accent: '#9B5DE5', icon: '🦁', desc: "England's top flight" },
  { slug: 'all-time-legends', name: 'Legends', accent: '#B81D1D', icon: '👑', desc: 'Greatest of all time' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Audio immersion toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Interactive Puppeteer Strings & Button physics state
  const [isLeftHovered, setIsLeftHovered] = useState(false);
  const [isRightHovered, setIsRightHovered] = useState(false);
  const [isLeftActive, setIsLeftActive] = useState(false);
  const [isRightActive, setIsRightActive] = useState(false);

  // Dynamic button sway offsets
  const [leftDelta, setLeftDelta] = useState({ x: 0, y: 0 });
  const [rightDelta, setRightDelta] = useState({ x: 0, y: 0 });

  // ─── PARALLAX MOUSE TRACKING ──────────────────────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth camera depth
  const springConfig = { damping: 28, stiffness: 85, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Layer 1: Background slow shift (-12px to +12px)
  const bgX = useTransform(smoothX, [-1, 1], [-12, 12]);
  const bgY = useTransform(smoothY, [-1, 1], [-12, 12]);

  // Layer 2: Midground doodles (-28px to +28px)
  const midX = useTransform(smoothX, [-1, 1], [-28, 28]);
  const midY = useTransform(smoothY, [-1, 1], [-28, 28]);

  // Layer 3: Foreground particles (-55px to +55px)
  const fgX = useTransform(smoothX, [-1, 1], [-55, 55]);
  const fgY = useTransform(smoothY, [-1, 1], [-55, 55]);

  // Player subtle stabilization (-6px to +6px)
  const ronaldoX = useTransform(smoothX, [-1, 1], [-6, 6]);
  const ronaldoY = useTransform(smoothY, [-1, 1], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth) * 2 - 1;
    const y = (e.clientY / innerHeight) * 2 - 1;
    mouseX.set(x);
    mouseY.set(y);
  };

  // ─── CREATE ROOM STATE & HANDLER ─────────────────────────────────────────
  const [createEdition, setCreateEdition] = useState('world-cup');
  const [createBudget, setCreateBudget] = useState(120);
  const [createTimer, setCreateTimer] = useState<8 | 10 | 15>(10);
  const [createMaxPlayers, setCreateMaxPlayers] = useState<2 | 3 | 4>(2);
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [guestManagerName, setGuestManagerName] = useState('');

  const handleCreateRoom = async () => {
    setCreateError('');
    setIsCreating(true);
    try {
      let token = localStorage.getItem('accessToken');
      
      // Auto-enlist guest manager if no active token
      if (!token) {
        const guestName = guestManagerName.trim() || `Manager_${Math.floor(1000 + Math.random() * 9000)}`;
        const guestEmail = `guest_${Date.now()}@draftwar.game`;
        const { data: authData } = await api.post('/auth/register', {
          username: guestName,
          email: guestEmail,
          password: 'GuestPassword123!',
        });
        token = authData.token || authData.accessToken;
        if (token) {
          localStorage.setItem('accessToken', token);
          if (authData.user) {
            useAuthStore.getState().setUser(authData.user);
          }
        }
      }

      const { data } = await api.post(
        '/rooms',
        {
          edition: createEdition,
          startingBudget: createBudget,
          maxPlayers: createMaxPlayers,
          mode: 'ffa',
          chaosCardsEnabled: true,
          financeCardsEnabled: true,
          bidTimer: createTimer,
          visibility: 'public',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/room/${data.room.code}`);
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'Failed to initialize match room');
      setIsCreating(false);
    }
  };

  // ─── JOIN ROOM STATE & HANDLER ───────────────────────────────────────────
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length === 6) {
      navigate(`/room/${code}`);
    } else {
      setJoinError('Room code must be exactly 6 characters');
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#050305] text-[#F4F6FB] overflow-x-hidden selection:bg-[#B81D1D] selection:text-white relative font-body"
    >
      {/* =====================================================================
          1. MINIMAL CINEMATIC HEADER (100% REAL HTML COMPONENTS)
          ===================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 px-6 md:px-12 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-[#050305]/90 to-transparent">
        {/* Left: Crown Crest + Wordmark */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(217,37,37,0.7)] group-hover:scale-105 transition-transform">
            <DoodlePitchCrown size={36} color="#D92525" />
          </div>
          <div className="flex flex-col">
            <div className="font-editorial tracking-[0.22em] text-lg sm:text-xl font-bold uppercase text-white flex items-center gap-1.5">
              <span>PITCH</span>
              <span className="text-[#D92525]">LORDS</span>
            </div>
            <div className="font-mono text-[9px] tracking-[0.3em] text-[#8A95A8] uppercase">
              FOOTBALL LIVES HERE
            </div>
          </div>
        </div>

        {/* Right: How To Play + Login / Profile */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setShowHowToPlay(true)}
            className="font-mono text-xs uppercase tracking-[0.2em] text-[#A6B2C8] hover:text-white transition-colors cursor-pointer px-3 py-1.5"
          >
            HOW TO PLAY
          </button>

          {isAuthenticated && user ? (
            <button
              onClick={() => navigate('/lobby')}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0E0A0D]/90 border border-[#D92525]/50 hover:border-[#D92525] shadow-[0_0_20px_rgba(217,37,37,0.3)] transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-[#B81D1D] flex items-center justify-center text-xs font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="font-heading font-bold text-sm tracking-wider uppercase text-white">
                {user.username}
              </span>
              <span className="font-mono text-xs text-[#E8B84B] font-bold">
                {user.elo_rating || 1000} ELO
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#8A95A8] group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0E0A0D]/80 hover:bg-[#1A1217] border border-[#D92525]/60 hover:border-[#D92525] text-white font-mono text-xs uppercase tracking-[0.18em] shadow-[0_0_18px_rgba(217,37,37,0.35)] transition-all cursor-pointer group"
            >
              <User className="w-3.5 h-3.5 text-[#D92525] group-hover:scale-110 transition-transform" />
              <span>LOGIN</span>
            </button>
          )}
        </div>
      </header>

      {/* =====================================================================
          2. THE MAIN HERO CANVAS — 100% REBUILT FROM SCRATCH
          ===================================================================== */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 select-none">
        
        {/* ── LAYER 1: THE INDEPENDENT STADIUM ENVIRONMENT ── */}
        <StadiumEnvironment />

        {/* ── LAYER 2: PARALLAX ANIMATED FOOTBALL DOODLES (MIDGROUND & FOREGROUND) ── */}
        {/* Far Background Pitch Grid & Formations */}
        <motion.div 
          style={{ x: bgX, y: bgY }}
          className="absolute inset-0 pointer-events-none z-5 overflow-hidden"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] md:w-[1300px] h-[900px] md:h-[1300px] rounded-full border border-white/[0.03] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[750px] h-[500px] md:h-[750px] rounded-full border border-[#B81D1D]/10 pointer-events-none" />
          <div className="absolute top-28 left-20 opacity-20 hidden xl:block">
            <DoodleGoalpost size={110} color="rgba(244,246,251,0.2)" />
          </div>
          <div className="absolute top-36 right-24 opacity-20 hidden xl:block">
            <DoodleFormation size={120} color="rgba(244,246,251,0.2)" />
          </div>
        </motion.div>

        {/* Midground Floating Vector Doodles */}
        <motion.div 
          style={{ x: midX, y: midY }}
          className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
        >
          {/* Floating Sketched Football (Upper Left) */}
          <motion.div
            animate={{ 
              y: [0, -12, 0],
              rotate: [0, 8, -4, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-24 left-[8%] md:left-[13%]"
          >
            <DoodleFootball size={70} color="#F4F6FB" />
          </motion.div>

          {/* Tactical Whistle (Upper Right) */}
          <motion.div
            animate={{ 
              y: [0, 10, 0],
              rotate: [0, -5, 4, 0]
            }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-28 right-[8%] md:right-[14%]"
          >
            <DoodleWhistle size={65} color="#F4F6FB" />
          </motion.div>

          {/* CR7 Number 7 Sketch (Left) */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className="absolute top-[40%] left-[5%] md:left-[9%] opacity-75"
          >
            <DoodleNumber7 size={52} color="#F4F6FB" />
          </motion.div>

          {/* Cleat / Boot Sketch (Mid-Left) */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [-10, -6, -10]
            }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-[56%] left-[4%] md:left-[8%]"
          >
            <DoodleBoot size={75} color="#F4F6FB" />
          </motion.div>

          {/* Champion Crown (Mid-Right) */}
          <motion.div
            animate={{ 
              y: [0, -14, 0],
              rotate: [3, -3, 3]
            }}
            transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            className="absolute top-[26%] right-[18%] hidden md:block"
          >
            <DoodleCrown size={60} color="#E8B84B" />
          </motion.div>

          {/* Trophy Sketch (Lower-Right) */}
          <motion.div
            animate={{ 
              y: [0, 10, 0],
              rotate: [-2, 2, -2]
            }}
            transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            className="absolute top-[55%] right-[5%] md:right-[9%]"
          >
            <DoodleTrophy size={65} color="#E8B84B" />
          </motion.div>

          {/* Tactical Arrows */}
          <div className="absolute top-[36%] left-[20%] hidden lg:block opacity-60">
            <DoodleTacticalArrow size={75} angle={-20} color="#D92525" />
          </div>
          <div className="absolute top-[62%] right-[22%] hidden lg:block opacity-60">
            <DoodlePressArrow size={70} angle={15} color="#F4F6FB" />
          </div>
        </motion.div>

        {/* Foreground Particle Layer */}
        <motion.div 
          style={{ x: fgX, y: fgY }}
          className="absolute inset-0 pointer-events-none z-12 overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-28 left-[24%]"
          >
            <DoodleLightning size={38} color="#D92525" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            className="absolute top-[48%] right-[8%]"
          >
            <DoodleLightning size={36} color="#E8B84B" />
          </motion.div>
          <div className="absolute top-[22%] right-[28%]">
            <DoodleSparkle size={20} color="#F4F6FB" />
          </div>
          <div className="absolute bottom-[36%] left-[14%]">
            <DoodleSparkle size={18} color="#D92525" />
          </div>
          <div className="absolute top-[64%] left-[22%]">
            <DoodleCross size={18} color="#D92525" />
          </div>
        </motion.div>

        {/* ── LAYER 3: THE CENTRAL PUPPETEER HERO CANVAS ── */}
        <div className="relative w-full max-w-[1400px] mx-auto px-4 flex items-center justify-center min-h-[620px] md:min-h-[700px]">
          
          {/* Main 1000x650 Aspect Coordinate Canvas */}
          <div className="relative w-full aspect-[1000/650] max-h-[82vh] flex items-center justify-center">

            {/* 1. Real HTML Left Editorial Headline */}
            <div className="absolute top-[10%] left-[3%] md:left-[5%] z-20 text-left pointer-events-none max-w-[320px]">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[0.9] uppercase"
              >
                CONTROL<br />
                THE GAME<span className="text-[#D92525]">.</span>
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-3 font-mono text-[10px] sm:text-xs text-[#8A95A8] tracking-[0.25em] uppercase leading-relaxed"
              >
                MANAGE. COMPETE. BE A LEGEND.
              </motion.div>
            </div>

            {/* 2. Real HTML Right Editorial Text */}
            <div className="absolute top-[24%] right-[4%] md:right-[6%] z-20 text-right pointer-events-none hidden sm:block max-w-[220px]">
              <div className="font-mono text-[10px] sm:text-xs text-[#8A95A8] tracking-[0.25em] uppercase leading-relaxed">
                IT'S MORE THAN FOOTBALL.
              </div>
            </div>

            {/* 3. The Central Footballer Component */}
            <CentralFootballer
              ronaldoX={ronaldoX}
              ronaldoY={ronaldoY}
            />

            {/* 4. The Independent Puppeteer Crossbars */}
            <PuppeteerRods
              isLeftHovered={isLeftHovered}
              isRightHovered={isRightHovered}
              isLeftActive={isLeftActive}
              isRightActive={isRightActive}
            />

            {/* 5. Dynamic Interactive Glowing Crimson Strings */}
            <PuppeteerStrings
              isLeftHovered={isLeftHovered}
              isRightHovered={isRightHovered}
              isLeftActive={isLeftActive}
              isRightActive={isRightActive}
              leftDelta={leftDelta}
              rightDelta={rightDelta}
            />

            {/* 6. Real HTML Plaque Button: CREATE ROOM (Left - Suspended beneath CR7's Left Hand) */}
            <div 
              style={{
                position: 'absolute',
                left: '23.9%',
                top: '70%',
                width: '25%',
              }}
              className="z-30"
            >
              <PlaqueButton
                label="CREATE ROOM"
                icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
                onClick={() => setShowCreateModal(true)}
                isHovered={isLeftHovered}
                isActive={isLeftActive}
                onHoverStart={() => {
                  setIsLeftHovered(true);
                  setLeftDelta({ x: 0, y: -4 });
                }}
                onHoverEnd={() => {
                  setIsLeftHovered(false);
                  setIsLeftActive(false);
                  setLeftDelta({ x: 0, y: 0 });
                }}
                onPressStart={() => {
                  setIsLeftActive(true);
                  setLeftDelta({ x: 0, y: 3 });
                }}
                onPressEnd={() => {
                  setIsLeftActive(false);
                  setLeftDelta({ x: 0, y: -4 });
                }}
                className="w-full"
              />
            </div>

            {/* 7. Real HTML Plaque Button: JOIN ROOM (Right - Suspended beneath CR7's Right Hand) */}
            <div 
              style={{
                position: 'absolute',
                left: '51.1%',
                top: '70%',
                width: '25%',
              }}
              className="z-30"
            >
              <PlaqueButton
                label="JOIN ROOM"
                icon={<Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                onClick={() => setShowJoinModal(true)}
                isHovered={isRightHovered}
                isActive={isRightActive}
                onHoverStart={() => {
                  setIsRightHovered(true);
                  setRightDelta({ x: 0, y: -4 });
                }}
                onHoverEnd={() => {
                  setIsRightHovered(false);
                  setIsRightActive(false);
                  setRightDelta({ x: 0, y: 0 });
                }}
                onPressStart={() => {
                  setIsRightActive(true);
                  setRightDelta({ x: 0, y: 3 });
                }}
                onPressEnd={() => {
                  setIsRightActive(false);
                  setRightDelta({ x: 0, y: -4 });
                }}
                className="w-full"
              />
            </div>

            {/* 8. Bottom Center Real HTML Tagline */}
            <div className="absolute bottom-[2%] left-0 right-0 z-20 text-center pointer-events-none">
              <span className="font-mono text-[9px] sm:text-[11px] text-[#8A95A8] tracking-[0.3em] uppercase flex items-center justify-center gap-2">
                GREAT MANAGERS MAKE GREATER STORIES.
              </span>
              <div className="w-8 h-0.5 bg-[#D92525] mx-auto mt-1.5 opacity-80" />
            </div>

          </div>
        </div>

      </section>

      {/* =====================================================================
          3. SECTION 2: COMPACT HOW-TO-PLAY GAME LOOP STRIP
          ===================================================================== */}
      <section id="how-to-play" className="relative w-full py-16 px-6 md:px-12 border-t border-white/[0.08] bg-[#070508]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="font-mono text-xs text-[#D92525] uppercase tracking-[0.25em] font-bold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D92525] animate-pulse" />
                THE MATCHDAY LOOP
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-none uppercase">
                HOW TO PLAY <span className="text-[#D92525]">DRAFTWAR</span>
              </h2>
            </div>
            <p className="font-mono text-xs md:text-sm text-[#8A95A8] uppercase tracking-wider max-w-md">
              From room setup to the winner's podium in 15 intense match minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 01 ENTER ROOM */}
            <div className="p-5 rounded-2xl bg-[#0E0A0D] border border-white/[0.08] hover:border-[#D92525]/60 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-editorial text-3xl font-bold text-[#D92525]">01</span>
                  <div className="w-8 h-8 rounded-lg bg-[#B81D1D]/15 flex items-center justify-center text-[#D92525]">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-editorial text-base font-bold text-white uppercase tracking-wider mb-1.5">ENTER ROOM</h3>
                <p className="text-xs text-[#8A95A8] leading-relaxed">Host a war room or enter with a 6-character code. Go head-to-head with 2 to 4 managers.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.05] font-mono text-[10px] text-[#8A95A8] uppercase">Step 1 of 5</div>
            </div>

            {/* 02 BID FOR PLAYERS */}
            <div className="p-5 rounded-2xl bg-[#0E0A0D] border border-white/[0.08] hover:border-[#D92525]/60 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-editorial text-3xl font-bold text-[#D92525]">02</span>
                  <div className="w-8 h-8 rounded-lg bg-[#B81D1D]/15 flex items-center justify-center text-[#D92525]">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-editorial text-base font-bold text-white uppercase tracking-wider mb-1.5">BID FOR PLAYERS</h3>
                <p className="text-xs text-[#8A95A8] leading-relaxed">Live 10-second auction floor. Manage your 120M CP budget and outbid rivals under clock pressure.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.05] font-mono text-[10px] text-[#8A95A8] uppercase">Step 2 of 5</div>
            </div>

            {/* 03 BUILD YOUR XI */}
            <div className="p-5 rounded-2xl bg-[#0E0A0D] border border-white/[0.08] hover:border-[#D92525]/60 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-editorial text-3xl font-bold text-[#D92525]">03</span>
                  <div className="w-8 h-8 rounded-lg bg-[#B81D1D]/15 flex items-center justify-center text-[#D92525]">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-editorial text-base font-bold text-white uppercase tracking-wider mb-1.5">BUILD YOUR XI</h3>
                <p className="text-xs text-[#8A95A8] leading-relaxed">Choose your formation (4-3-3, 3-5-2). Position drafted stars to maximize club and national chemistry.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.05] font-mono text-[10px] text-[#8A95A8] uppercase">Step 3 of 5</div>
            </div>

            {/* 04 BATTLE */}
            <div className="p-5 rounded-2xl bg-[#0E0A0D] border border-white/[0.08] hover:border-[#D92525]/60 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-editorial text-3xl font-bold text-[#D92525]">04</span>
                  <div className="w-8 h-8 rounded-lg bg-[#B81D1D]/15 flex items-center justify-center text-[#D92525]">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-editorial text-base font-bold text-white uppercase tracking-wider mb-1.5">BATTLE</h3>
                <p className="text-xs text-[#8A95A8] leading-relaxed">Live minute-by-minute tactical simulation. Track xG, dynamic fouls, and dramatic clutch goals.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.05] font-mono text-[10px] text-[#8A95A8] uppercase">Step 4 of 5</div>
            </div>

            {/* 05 CLAIM THE CROWN */}
            <div className="p-5 rounded-2xl bg-[#0E0A0D] border border-white/[0.08] hover:border-[#E8B84B]/60 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-editorial text-3xl font-bold text-[#E8B84B]">05</span>
                  <div className="w-8 h-8 rounded-lg bg-[#E8B84B]/15 flex items-center justify-center text-[#E8B84B]">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-editorial text-base font-bold text-white uppercase tracking-wider mb-1.5">CLAIM THE CROWN</h3>
                <p className="text-xs text-[#8A95A8] leading-relaxed">Find out which manager built the superior XI. Gain ELO rating points and unlock legendary accolades.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.05] font-mono text-[10px] text-[#E8B84B] uppercase">Step 5 of 5</div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. SECTION 3: MINIMAL TECHNICAL FOOTER
          ===================================================================== */}
      <footer className="w-full py-6 px-6 md:px-12 border-t border-white/[0.08] bg-[#050305] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#00E599] animate-ping" />
          <span className="font-mono text-xs text-[#8A95A8]">
            ENGINE ONLINE // LATENCY 14MS // REGION EU-WEST
          </span>
        </div>

        <div className="font-mono text-xs text-[#8A95A8] uppercase tracking-[0.2em]">
          PITCHLORDS · DRAFTWAR ENGINE v2.4.0 · BATTLE CRIMSON
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 font-mono text-xs text-[#8A95A8] hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#D92525]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>SFX {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-mono text-xs text-[#8A95A8] hover:text-white uppercase transition-colors"
          >
            ↑ TOP
          </button>
        </div>
      </footer>

      {/* =====================================================================
          MODAL 1: CREATE MATCH ROOM
          ===================================================================== */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-[#0E0A0D] border border-[#D92525]/60 shadow-[0_20px_50px_rgba(217,37,37,0.35)] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-[#D92525]" />
                  <span className="font-editorial font-bold text-lg text-white uppercase tracking-wider">
                    CREATE MATCH ROOM
                  </span>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-[#8A95A8] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {!isAuthenticated && (
                  <div>
                    <label className="block text-xs font-mono text-[#8A95A8] uppercase tracking-wider mb-2">
                      Manager Nickname (Guest)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tactician_07"
                      value={guestManagerName}
                      onChange={e => setGuestManagerName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#050305] border border-white/[0.1] text-white font-mono text-sm focus:border-[#D92525] focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-[#8A95A8] uppercase tracking-wider mb-2">
                    Tournament Edition
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {EDITIONS.map(ed => (
                      <button
                        key={ed.slug}
                        onClick={() => setCreateEdition(ed.slug)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          createEdition === ed.slug
                            ? 'bg-[#B81D1D]/25 border-[#D92525] shadow-[0_0_15px_rgba(217,37,37,0.35)]'
                            : 'bg-[#140E13] border-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div className="text-xl mb-1">{ed.icon}</div>
                        <div className="font-editorial font-bold text-sm text-white uppercase">
                          {ed.name}
                        </div>
                        <div className="font-mono text-[10px] text-[#8A95A8]">
                          {ed.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-[#8A95A8] uppercase tracking-wider mb-2">
                      Budget (CP)
                    </label>
                    <select
                      value={createBudget}
                      onChange={e => setCreateBudget(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#050305] border border-white/[0.1] text-white font-mono text-sm focus:border-[#D92525] focus:outline-none"
                    >
                      <option value={100}>100M CP</option>
                      <option value={120}>120M CP (Standard)</option>
                      <option value={150}>150M CP (Galactico)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8A95A8] uppercase tracking-wider mb-2">
                      Bid Clock
                    </label>
                    <select
                      value={createTimer}
                      onChange={e => setCreateTimer(Number(e.target.value) as 8 | 10 | 15)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#050305] border border-white/[0.1] text-white font-mono text-sm focus:border-[#D92525] focus:outline-none"
                    >
                      <option value={8}>8s (Blitz)</option>
                      <option value={10}>10s (Standard)</option>
                      <option value={15}>15s (Strategic)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#8A95A8] uppercase tracking-wider mb-2">
                    Opponents Count
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([2, 3, 4] as const).map(num => (
                      <button
                        key={num}
                        onClick={() => setCreateMaxPlayers(num)}
                        className={`py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                          createMaxPlayers === num
                            ? 'bg-[#D92525] text-white'
                            : 'bg-[#140E13] text-[#8A95A8] hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {num} Managers
                      </button>
                    ))}
                  </div>
                </div>

                {createError && (
                  <div className="p-3 rounded-lg bg-[#B81D1D]/20 border border-[#D92525] text-xs font-mono text-[#D92525]">
                    {createError}
                  </div>
                )}

                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#B81D1D] to-[#D92525] hover:from-[#D92525] hover:to-[#B81D1D] text-white font-editorial font-bold text-lg uppercase tracking-wider shadow-[0_0_25px_rgba(217,37,37,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCreating ? (
                    <span>COMMISSIONING WAR ROOM...</span>
                  ) : (
                    <>
                      <span>LAUNCH MATCH ROOM</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          MODAL 2: ENTER ROOM (JOIN BY CODE)
          ===================================================================== */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-[#0E0A0D] border border-[#D92525]/60 shadow-[0_20px_50px_rgba(217,37,37,0.35)] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Hash className="w-5 h-5 text-[#D92525]" />
                  <span className="font-editorial font-bold text-lg text-white uppercase tracking-wider">
                    ENTER ROOM CODE
                  </span>
                </div>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="p-1 rounded-lg text-[#8A95A8] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleJoinRoom} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-mono text-[#8A95A8] uppercase tracking-wider mb-2 text-center">
                    Enter 6-Character Room Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. WC789A"
                    value={joinCode}
                    onChange={e => {
                      setJoinCode(e.target.value.toUpperCase());
                      setJoinError('');
                    }}
                    autoFocus
                    className="w-full px-4 py-4 rounded-xl bg-[#050305] border-2 border-white/[0.1] focus:border-[#D92525] text-white text-center font-mono font-bold text-2xl tracking-[0.3em] uppercase focus:outline-none shadow-inner"
                  />
                </div>

                {joinError && (
                  <div className="p-3 rounded-lg bg-[#B81D1D]/20 border border-[#D92525] text-xs font-mono text-[#D92525] text-center">
                    {joinError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={joinCode.trim().length !== 6}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#B81D1D] to-[#D92525] hover:from-[#D92525] hover:to-[#B81D1D] disabled:opacity-40 text-white font-editorial font-bold text-lg uppercase tracking-wider shadow-[0_0_20px_rgba(217,37,37,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>CONNECT TO MATCH</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          MODAL 3: HOW TO PLAY MODAL
          ===================================================================== */}
      <AnimatePresence>
        {showHowToPlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl bg-[#0E0A0D] border border-[#D92525]/60 shadow-[0_20px_50px_rgba(217,37,37,0.35)] overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-[#E8B84B]" />
                  <span className="font-editorial font-bold text-lg text-white uppercase tracking-wider">
                    HOW TO PLAY DRAFTWAR
                  </span>
                </div>
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="p-1 rounded-lg text-[#8A95A8] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="p-4 rounded-xl bg-[#140E13] border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D92525]/20 text-[#D92525] flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-editorial font-bold text-white uppercase text-sm">Enter Room</h4>
                    <p className="text-xs text-[#8A95A8] mt-0.5">Host a war room or enter via a 6-character room code with 2 to 4 managers.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#140E13] border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D92525]/20 text-[#D92525] flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-editorial font-bold text-white uppercase text-sm">Live Player Auction</h4>
                    <p className="text-xs text-[#8A95A8] mt-0.5">Rapid-fire 10-second bidding. Balance your 120M CP budget against rival managers.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#140E13] border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D92525]/20 text-[#D92525] flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-editorial font-bold text-white uppercase text-sm">Build Your Tactical XI</h4>
                    <p className="text-xs text-[#8A95A8] mt-0.5">Slot acquired players into 4-3-3, 3-5-2, or 4-2-3-1 formations to trigger club and national chemistry bonuses.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#140E13] border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D92525]/20 text-[#D92525] flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="font-editorial font-bold text-white uppercase text-sm">Minute-By-Minute Match Battle</h4>
                    <p className="text-xs text-[#8A95A8] mt-0.5">Watch the Dixon-Coles simulation simulate 90 minutes of authentic football with dynamic goals, saves, and cards.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#140E13] border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8B84B]/20 text-[#E8B84B] flex items-center justify-center font-bold">5</div>
                  <div>
                    <h4 className="font-editorial font-bold text-white uppercase text-sm">Claim The Crown</h4>
                    <p className="text-xs text-[#8A95A8] mt-0.5">Gain competitive ELO rating points, earn managerial accolades, and dominate the global rankings.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
