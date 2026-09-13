import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { 
  Trophy, Flame, Zap, Shield, ArrowRight, X, Play, 
  Sparkles, CheckCircle2, ChevronRight, Hash, Volume2, VolumeX,
  Radio, Award, Users, Crosshair
} from 'lucide-react';
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
  DoodleAuction,
  DoodleGoalpost,
  DoodleLightning,
  DoodleSparkle,
  DoodleCross
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
  const { isAuthenticated, user, setUser } = useAuthStore();

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Sound toggle (for immersion)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ─── PARALLAX MOUSE TRACKING ──────────────────────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs to eliminate jitter
  const springConfig = { damping: 28, stiffness: 100, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Layer 1: Background slow shift (-12px to +12px)
  const bgX = useTransform(smoothX, [-1, 1], [-14, 14]);
  const bgY = useTransform(smoothY, [-1, 1], [-14, 14]);

  // Layer 2: Midground tactical doodles (-32px to +32px)
  const midX = useTransform(smoothX, [-1, 1], [-35, 35]);
  const midY = useTransform(smoothY, [-1, 1], [-35, 35]);

  // Layer 3: Foreground fast particles (-65px to +65px)
  const fgX = useTransform(smoothX, [-1, 1], [-65, 65]);
  const fgY = useTransform(smoothY, [-1, 1], [-65, 65]);

  // Center Footballer: Very subtle stabilization (-8px to +8px)
  const heroX = useTransform(smoothX, [-1, 1], [-8, 8]);
  const heroY = useTransform(smoothY, [-1, 1], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth) * 2 - 1; // Range [-1, 1]
    const y = (e.clientY / innerHeight) * 2 - 1; // Range [-1, 1]
    mouseX.set(x);
    mouseY.set(y);
  };

  // ─── CREATE ROOM STATE ───────────────────────────────────────────────────
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
      
      // If user isn't logged in, auto-register/login as guest manager
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

  // ─── ENTER ROOM (JOIN BY CODE) STATE ─────────────────────────────────────
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
      className="min-h-screen bg-[#06090E] text-[#F4F6FB] overflow-x-hidden selection:bg-[#B81D1D] selection:text-white"
    >
      {/* =====================================================================
          1. MINIMAL GAME HEADER NAVIGATION
          ===================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 px-6 md:px-12 flex items-center justify-between border-b border-white/[0.07] bg-[#06090E]/85 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B81D1D] to-[#6A0C0C] flex items-center justify-center shadow-[0_0_20px_rgba(184,29,29,0.5)] border border-[#D92525]/40 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display text-2xl md:text-3xl tracking-wider leading-none text-white flex items-center gap-1.5">
                <span className="text-[#B81D1D]">DRAFT</span>WAR
                <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-[#B81D1D]/20 border border-[#B81D1D]/40 text-[#D92525] uppercase">
                  GAME
                </span>
              </div>
              <div className="font-mono text-[10px] text-[#8A95A8] tracking-widest uppercase">
                Tactical Auction Arena
              </div>
            </div>
          </button>
        </div>

        {/* Minimal Actions / Profile */}
        <div className="flex items-center gap-4">
          <a
            href="#how-to-play"
            className="hidden sm:inline-flex font-mono text-xs text-[#8A95A8] hover:text-[#F4F6FB] uppercase tracking-wider transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-white/10"
          >
            // How To Play
          </a>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/lobby')}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0B1017] border border-[#B81D1D]/40 hover:border-[#D92525] transition-all shadow-[0_0_15px_rgba(184,29,29,0.2)] group"
              >
                <div className="w-6 h-6 rounded-full bg-[#B81D1D] flex items-center justify-center text-xs font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-heading font-bold text-sm text-white tracking-wide uppercase">
                  {user.username}
                </span>
                <span className="font-mono text-xs text-[#E8B84B] font-bold">
                  {user.elo_rating || 1000} ELO
                </span>
                <ChevronRight className="w-4 h-4 text-[#8A95A8] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="font-heading font-bold text-xs md:text-sm uppercase tracking-wider px-4 py-2 rounded-lg text-[#8A95A8] hover:text-white hover:bg-white/[0.04] transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="font-heading font-bold text-xs md:text-sm uppercase tracking-wider px-4 py-2 rounded-lg bg-[#B81D1D] hover:bg-[#D92525] text-white shadow-[0_0_15px_rgba(184,29,29,0.4)] transition-all"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* =====================================================================
          SECTION 1: THE GAME TITLE / HERO LAUNCH SCREEN (DOMINANT VIEW)
          ===================================================================== */}
      <section className="relative w-full min-h-screen pt-24 pb-12 flex flex-col items-center justify-center overflow-hidden">
        {/* Deep Stadium Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[1100px] h-[550px] bg-[#B81D1D]/15 rounded-full blur-[140px]" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#D92525]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full h-[200px] bg-gradient-to-t from-[#06090E] via-[#06090E]/80 to-transparent z-20" />
        </div>

        {/* ── LAYER 1: BACKGROUND (Slow Parallax Drift: Pitch Grid & Geometry) ── */}
        <motion.div 
          style={{ x: bgX, y: bgY }}
          className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        >
          {/* Subtle tactical pitch markings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] md:w-[1200px] h-[800px] md:h-[1200px] rounded-full border border-white/[0.04] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] md:w-[650px] h-[450px] md:h-[650px] rounded-full border border-[#B81D1D]/10 pointer-events-none" />
          
          {/* Tactical crosshair lines */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

          {/* Goalpost outline & Pitch corner in background */}
          <div className="absolute top-28 left-12 opacity-30 hidden lg:block">
            <DoodleGoalpost size={110} color="rgba(244,246,251,0.25)" />
          </div>
          <div className="absolute top-36 right-16 opacity-30 hidden lg:block">
            <DoodleFormation size={120} color="rgba(244,246,251,0.2)" />
          </div>
        </motion.div>

        {/* ── LAYER 2: MIDGROUND (Tactical Football Doodles with Floating Loop) ── */}
        <motion.div 
          style={{ x: midX, y: midY }}
          className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
        >
          {/* Floating Sketched Football (Upper Left) */}
          <motion.div
            animate={{ 
              y: [0, -14, 0],
              rotate: [0, 8, -4, 0]
            }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-32 left-[8%] md:left-[14%]"
          >
            <DoodleFootball size={75} color="#F4F6FB" />
          </motion.div>

          {/* Tactical Whistle with Blast Waves (Upper Right) */}
          <motion.div
            animate={{ 
              y: [0, 12, 0],
              rotate: [0, -6, 4, 0]
            }}
            transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-36 right-[8%] md:right-[15%]"
          >
            <DoodleWhistle size={70} color="#F4F6FB" />
          </motion.div>

          {/* Cleat / Boot Sketch (Mid Left) */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [-12, -8, -12]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-1/2 -translate-y-12 left-[4%] md:left-[10%]"
          >
            <DoodleBoot size={85} color="#F4F6FB" />
          </motion.div>

          {/* Champion Crown (Above player / Mid Right) */}
          <motion.div
            animate={{ 
              y: [0, -16, 0],
              rotate: [4, -4, 4]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className="absolute top-[28%] right-[22%] hidden md:block"
          >
            <DoodleCrown size={65} color="#E8B84B" />
          </motion.div>

          {/* Jersey #10 (Mid Right) */}
          <motion.div
            animate={{ 
              y: [0, 14, 0],
              rotate: [6, 12, 6]
            }}
            transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
            className="absolute top-1/2 -translate-y-8 right-[5%] md:right-[12%]"
          >
            <DoodleJersey size={75} number="10" color="#F4F6FB" />
          </motion.div>

          {/* Referee Red & Yellow Cards (Lower Left) */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-36 left-[10%] md:left-[18%]"
          >
            <DoodleCards size={60} />
          </motion.div>

          {/* Championship Trophy (Lower Right) */}
          <motion.div
            animate={{ 
              y: [0, -12, 0],
              rotate: [-3, 3, -3]
            }}
            transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut', delay: 1.7 }}
            className="absolute bottom-36 right-[10%] md:right-[18%]"
          >
            <DoodleTrophy size={70} color="#E8B84B" />
          </motion.div>

          {/* Tactical Press & Run Arrows */}
          <div className="absolute top-[42%] left-[22%] hidden lg:block opacity-75">
            <DoodleTacticalArrow size={80} angle={-25} color="#D92525" />
          </div>
          <div className="absolute top-[58%] right-[24%] hidden lg:block opacity-75">
            <DoodlePressArrow size={75} angle={15} color="#F4F6FB" />
          </div>
        </motion.div>

        {/* ── LAYER 3: FOREGROUND (Fast Sparkles, Coins, Lightning & Coordinate Marks) ── */}
        <motion.div 
          style={{ x: fgX, y: fgY }}
          className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
        >
          {/* Lightning Strikes */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-28 left-[28%]"
          >
            <DoodleLightning size={45} color="#D92525" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 1.2 }}
            className="absolute top-[48%] right-[7%]"
          >
            <DoodleLightning size={40} color="#E8B84B" />
          </motion.div>

          {/* Sparkles & Coordinate Crosses */}
          <div className="absolute top-[22%] right-[32%]">
            <DoodleSparkle size={26} color="#F4F6FB" />
          </div>
          <div className="absolute bottom-[44%] left-[16%]">
            <DoodleSparkle size={22} color="#D92525" />
          </div>
          <div className="absolute top-[65%] left-[25%]">
            <DoodleCross size={20} color="#D92525" />
          </div>
          <div className="absolute top-[32%] left-[6%]">
            <DoodleCross size={22} color="#F4F6FB" />
          </div>
          <div className="absolute bottom-[28%] right-[28%]">
            <DoodleAuction size={55} color="#F4F6FB" />
          </div>
        </motion.div>

        {/* ── CENTER: THE FOOTBALLER (KEY VISUAL ANCHOR) ── */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 mt-2">
          {/* Footballer Composition Box */}
          <motion.div
            style={{ x: heroX, y: heroY }}
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center"
          >
            {/* Volumetric Battle Crimson Backglow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#B81D1D]/35 to-transparent blur-[50px] transform scale-110 pointer-events-none" />

            {/* Tactical Hexagon Halo behind player */}
            <div className="absolute w-[320px] sm:w-[420px] md:w-[520px] h-[320px] sm:h-[420px] md:h-[520px] rounded-full border-2 border-[#B81D1D]/30 border-dashed animate-[spin_60s_linear_infinite] pointer-events-none" />

            {/* Main Player Cutout Image Container */}
            <div className="relative w-[280px] sm:w-[380px] md:w-[440px] lg:w-[480px] h-[360px] sm:h-[460px] md:h-[520px] rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-white/10 bg-[#0B1017]">
              <img
                src="/assets/hero_footballer.jpg"
                alt="DraftWar Star Footballer"
                className="w-full h-full object-cover object-top filter contrast-[1.08] saturate-[1.12]"
              />
              {/* Bottom edge gradient vignette blending seamlessly into dark pitch */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06090E] via-transparent to-black/20 pointer-events-none" />
              {/* Crimson edge glow accent */}
              <div className="absolute inset-0 ring-1 ring-inset ring-[#B81D1D]/40 pointer-events-none" />
            </div>

            {/* Floating Tactical HUD Badge (Left: Player Rating) */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-3 sm:left-4 md:-left-12 bottom-16 sm:bottom-24 z-30 p-3 sm:p-4 rounded-xl bg-[#0B1017]/90 backdrop-blur-md border border-[#B81D1D]/50 shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#B81D1D] flex items-center justify-center font-display text-2xl font-bold text-white shadow-[0_0_15px_rgba(184,29,29,0.5)]">
                  94
                </div>
                <div>
                  <div className="font-heading text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    KEY VISUAL <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] animate-ping" />
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
              transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute -right-3 sm:right-4 md:-right-12 top-20 sm:top-28 z-30 p-3 sm:p-4 rounded-xl bg-[#0B1017]/90 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[#E8B84B]" />
                <div>
                  <div className="font-heading text-xs font-bold text-white uppercase tracking-wider">
                    CHEMISTRY: 98%
                  </div>
                  <div className="font-mono text-[10px] text-[#00E599]">
                    HIGH PRESS [4-3-3]
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── HERO TYPOGRAPHY & GAME BRANDING ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mt-6 z-30 max-w-3xl"
          >
            {/* Primary High-Voltage Game Headline */}
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.88] tracking-tight text-white uppercase">
              BID. BUILD. <span className="text-[#B81D1D] drop-shadow-[0_0_25px_rgba(184,29,29,0.5)]">BATTLE.</span>
            </h1>

            {/* Short Tagline */}
            <p className="mt-4 font-heading font-medium text-sm sm:text-base md:text-lg text-[#8A95A8] uppercase tracking-widest max-w-2xl mx-auto">
              Real-time football auction & tactical warfare simulation. Outbid rivals, build your dream XI, and dominate head-to-head matchdays.
            </p>

            {/* Technical Metadata Bar */}
            <div className="mt-4 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-[#8A95A8] uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-[#00E599]">
                <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
                Dixon-Coles Engine
              </span>
              <span>//</span>
              <span>2–4 Managers</span>
              <span>//</span>
              <span>120M CP Budget</span>
            </div>

            {/* =================================================================
                ONLY TWO PRIMARY ACTIONS (GAME CONTROLS)
                ================================================================= */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
              {/* PRIMARY ACTION 1: CREATE ROOM */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-1/2 py-4 px-6 rounded-xl bg-gradient-to-r from-[#B81D1D] to-[#D92525] hover:from-[#D92525] hover:to-[#B81D1D] text-white font-heading font-bold text-lg md:text-xl uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(184,29,29,0.5)] border border-[#D92525]/60 transition-all cursor-pointer group"
              >
                <Flame className="w-5 h-5 text-white animate-pulse" />
                <span>CREATE ROOM</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              {/* PRIMARY ACTION 2: ENTER ROOM */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowJoinModal(true)}
                className="w-full sm:w-1/2 py-4 px-6 rounded-xl bg-[#0B1017] hover:bg-[#B81D1D]/15 text-white font-heading font-bold text-lg md:text-xl uppercase tracking-wider flex items-center justify-center gap-3 border-2 border-[#D92525]/60 hover:border-[#D92525] transition-all cursor-pointer group"
              >
                <Hash className="w-5 h-5 text-[#D92525]" />
                <span>ENTER ROOM</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 text-[#8A95A8] group-hover:text-white transition-all" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: ONBOARDING / HOW TO PLAY (COMPACT 5-STEP GAME LOOP)
          ===================================================================== */}
      <section id="how-to-play" className="relative w-full py-20 px-6 md:px-12 border-t border-white/[0.08] bg-[#080C12]">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="font-mono text-xs text-[#B81D1D] uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B81D1D]" />
                THE GAMEPLAY LOOP
              </div>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none">
                HOW TO PLAY <span className="text-[#B81D1D]">DRAFTWAR</span>
              </h2>
            </div>
            <p className="font-heading text-sm md:text-base text-[#8A95A8] uppercase tracking-wider max-w-md">
              From room setup to the winner's podium in 15 intense match minutes.
            </p>
          </div>

          {/* 5-Step Compact Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* STEP 01 */}
            <div className="p-6 rounded-2xl bg-[#0B1017] border border-white/[0.07] hover:border-[#B81D1D]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-3xl font-bold text-[#B81D1D] group-hover:text-[#D92525] transition-colors">
                    01
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#B81D1D]/10 flex items-center justify-center text-[#B81D1D]">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wide mb-2">
                  ENTER ROOM
                </h3>
                <p className="text-xs text-[#8A95A8] leading-relaxed">
                  Host a war room or enter with a 6-character code. Go head-to-head with 2 to 4 managers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.05] font-mono text-[10px] text-[#8A95A8] uppercase">
                Step 1 of 5
              </div>
            </div>

            {/* STEP 02 */}
            <div className="p-6 rounded-2xl bg-[#0B1017] border border-white/[0.07] hover:border-[#B81D1D]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-3xl font-bold text-[#B81D1D] group-hover:text-[#D92525] transition-colors">
                    02
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#B81D1D]/10 flex items-center justify-center text-[#B81D1D]">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wide mb-2">
                  BID FOR PLAYERS
                </h3>
                <p className="text-xs text-[#8A95A8] leading-relaxed">
                  Live 10-second auction floor. Manage your 120M CP budget and outbid rivals under clock pressure.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.05] font-mono text-[10px] text-[#8A95A8] uppercase">
                Step 2 of 5
              </div>
            </div>

            {/* STEP 03 */}
            <div className="p-6 rounded-2xl bg-[#0B1017] border border-white/[0.07] hover:border-[#B81D1D]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-3xl font-bold text-[#B81D1D] group-hover:text-[#D92525] transition-colors">
                    03
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#B81D1D]/10 flex items-center justify-center text-[#B81D1D]">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wide mb-2">
                  BUILD YOUR XI
                </h3>
                <p className="text-xs text-[#8A95A8] leading-relaxed">
                  Choose your formation (4-3-3, 3-5-2). Position drafted stars to maximize club and national chemistry.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.05] font-mono text-[10px] text-[#8A95A8] uppercase">
                Step 3 of 5
              </div>
            </div>

            {/* STEP 04 */}
            <div className="p-6 rounded-2xl bg-[#0B1017] border border-white/[0.07] hover:border-[#B81D1D]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-3xl font-bold text-[#B81D1D] group-hover:text-[#D92525] transition-colors">
                    04
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#B81D1D]/10 flex items-center justify-center text-[#B81D1D]">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wide mb-2">
                  BATTLE
                </h3>
                <p className="text-xs text-[#8A95A8] leading-relaxed">
                  Live minute-by-minute tactical simulation. Track xG, dynamic fouls, and dramatic clutch goals.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.05] font-mono text-[10px] text-[#8A95A8] uppercase">
                Step 4 of 5
              </div>
            </div>

            {/* STEP 05 */}
            <div className="p-6 rounded-2xl bg-[#0B1017] border border-white/[0.07] hover:border-[#B81D1D]/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-3xl font-bold text-[#E8B84B]">
                    05
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#E8B84B]/10 flex items-center justify-center text-[#E8B84B]">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wide mb-2">
                  CLAIM THE CROWN
                </h3>
                <p className="text-xs text-[#8A95A8] leading-relaxed">
                  Find out which manager built the superior XI. Gain ELO rating points and unlock legendary accolades.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.05] font-mono text-[10px] text-[#E8B84B] uppercase">
                Step 5 of 5
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: MINIMAL TECHNICAL FOOTER (1 COMPACT STATUS BAR)
          ===================================================================== */}
      <footer className="w-full py-6 px-6 md:px-12 border-t border-white/[0.08] bg-[#06090E] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#00E599] animate-ping" />
          <span className="font-mono text-xs text-[#8A95A8]">
            ENGINE ONLINE // LATENCY 14MS // REGION EU-WEST
          </span>
        </div>

        <div className="font-mono text-xs text-[#8A95A8] uppercase tracking-wider">
          DRAFTWAR BUILD v2.4.0 · BATTLE CRIMSON EDITION
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 font-mono text-xs text-[#8A95A8] hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#B81D1D]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>SFX {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-mono text-xs text-[#8A95A8] hover:text-white uppercase transition-colors"
          >
            ↑ Top
          </button>
        </div>
      </footer>

      {/* =====================================================================
          MODAL 1: CREATE ROOM
          ===================================================================== */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-[#0B1017] border border-[#B81D1D]/50 shadow-[0_20px_50px_rgba(184,29,29,0.3)] overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-[#B81D1D]" />
                  <span className="font-heading font-bold text-lg text-white uppercase tracking-wider">
                    CREATE MATCH ROOM
                  </span>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-[#8A95A8] hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-5">
                {/* Guest name input if not logged in */}
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
                      className="w-full px-4 py-3 rounded-xl bg-[#06090E] border border-white/[0.1] text-white font-mono text-sm focus:border-[#B81D1D] focus:outline-none"
                    />
                  </div>
                )}

                {/* Edition Picker */}
                <div>
                  <label className="block text-xs font-mono text-[#8A95A8] uppercase tracking-wider mb-2">
                    Tournament Edition
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {EDITIONS.map(ed => (
                      <button
                        key={ed.slug}
                        onClick={() => setCreateEdition(ed.slug)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          createEdition === ed.slug
                            ? 'bg-[#B81D1D]/20 border-[#B81D1D] shadow-[0_0_15px_rgba(184,29,29,0.3)]'
                            : 'bg-[#121824] border-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div className="text-xl mb-1">{ed.icon}</div>
                        <div className="font-heading font-bold text-sm text-white uppercase">
                          {ed.name}
                        </div>
                        <div className="font-mono text-[10px] text-[#8A95A8]">
                          {ed.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Starting Budget & Timer */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-[#8A95A8] uppercase tracking-wider mb-2">
                      Budget (CP)
                    </label>
                    <select
                      value={createBudget}
                      onChange={e => setCreateBudget(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#06090E] border border-white/[0.1] text-white font-mono text-sm focus:border-[#B81D1D] focus:outline-none"
                    >
                      <option value={100}>100M CP</option>
                      <option value={120}>120M CP (Default)</option>
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
                      className="w-full px-3 py-2.5 rounded-xl bg-[#06090E] border border-white/[0.1] text-white font-mono text-sm focus:border-[#B81D1D] focus:outline-none"
                    >
                      <option value={8}>8s (Blitz)</option>
                      <option value={10}>10s (Standard)</option>
                      <option value={15}>15s (Strategic)</option>
                    </select>
                  </div>
                </div>

                {/* Max Managers */}
                <div>
                  <label className="block text-xs font-mono text-[#8A95A8] uppercase tracking-wider mb-2">
                    Opponents Count
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([2, 3, 4] as const).map(num => (
                      <button
                        key={num}
                        onClick={() => setCreateMaxPlayers(num)}
                        className={`py-2 rounded-lg font-mono text-xs font-bold transition-all ${
                          createMaxPlayers === num
                            ? 'bg-[#B81D1D] text-white'
                            : 'bg-[#121824] text-[#8A95A8] hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {num} Managers
                      </button>
                    ))}
                  </div>
                </div>

                {createError && (
                  <div className="p-3 rounded-lg bg-[#B81D1D]/20 border border-[#B81D1D] text-xs font-mono text-[#D92525]">
                    {createError}
                  </div>
                )}

                {/* Action Submit */}
                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#B81D1D] to-[#D92525] hover:from-[#D92525] hover:to-[#B81D1D] text-white font-heading font-bold text-lg uppercase tracking-wider shadow-[0_0_20px_rgba(184,29,29,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <span>INITIALIZING WAR ROOM...</span>
                  ) : (
                    <>
                      <span>LAUNCH ROOM</span>
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
              className="w-full max-w-md rounded-2xl bg-[#0B1017] border border-[#D92525]/60 shadow-[0_20px_50px_rgba(184,29,29,0.3)] overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Hash className="w-5 h-5 text-[#D92525]" />
                  <span className="font-heading font-bold text-lg text-white uppercase tracking-wider">
                    ENTER ROOM CODE
                  </span>
                </div>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="p-1 rounded-lg text-[#8A95A8] hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
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
                    className="w-full px-4 py-4 rounded-xl bg-[#06090E] border-2 border-white/[0.1] focus:border-[#D92525] text-white text-center font-mono font-bold text-2xl tracking-[0.3em] uppercase focus:outline-none shadow-inner"
                  />
                </div>

                {joinError && (
                  <div className="p-3 rounded-lg bg-[#B81D1D]/20 border border-[#B81D1D] text-xs font-mono text-[#D92525] text-center">
                    {joinError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={joinCode.trim().length !== 6}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#B81D1D] to-[#D92525] hover:from-[#D92525] hover:to-[#B81D1D] disabled:opacity-40 text-white font-heading font-bold text-lg uppercase tracking-wider shadow-[0_0_20px_rgba(184,29,29,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  <span>CONNECT TO MATCH</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
