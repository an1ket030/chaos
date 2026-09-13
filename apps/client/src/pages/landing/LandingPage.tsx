import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { 
  Trophy, Flame, ShieldAlert, Zap, Users, ArrowRight, Play, Sparkles, 
  RotateCcw, CheckCircle2, ChevronRight, Activity, Eye, Compass, Crosshair
} from 'lucide-react';

// Sample player data for interactive modules
const DEMO_PLAYERS = [
  { id: 'vini', name: 'Vinícius Jr.', position: 'LW', rating: 92, club: 'Real Madrid', nation: 'Brazil', baseValue: 16, pace: 95, shoot: 84, pass: 81, drib: 92 },
  { id: 'haaland', name: 'Erling Haaland', position: 'ST', rating: 91, club: 'Man City', nation: 'Norway', baseValue: 18, pace: 89, shoot: 93, pass: 68, drib: 80 },
  { id: 'rodri', name: 'Rodri', position: 'CDM', rating: 91, club: 'Man City', nation: 'Spain', baseValue: 15, pace: 66, shoot: 79, pass: 88, drib: 84 },
  { id: 'bellingham', name: 'Jude Bellingham', position: 'CAM', rating: 90, club: 'Real Madrid', nation: 'England', baseValue: 17, pace: 80, shoot: 86, pass: 83, drib: 88 },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Kinetic Preloader state
  const [preloaded, setPreloaded] = useState(false);
  
  // Interactive Mini-Auction state
  const [currentBid, setCurrentBid] = useState(24);
  const [highestBidder, setHighestBidder] = useState('Tactician_Rex');
  const [timerSeconds, setTimerSeconds] = useState(8);
  const [bidHistory, setBidHistory] = useState<Array<{ user: string; amount: number; time: string }>>([
    { user: 'Commander_Voss', amount: 20, time: '3s ago' },
    { user: 'Tactician_Rex', amount: 24, time: 'Just now' },
  ]);
  const [chaosCardActive, setChaosCardActive] = useState<string | null>(null);

  // Interactive Pitch Formation state
  const [activeFormation, setActiveFormation] = useState<'4-3-3' | '3-5-2' | '4-2-3-1'>('4-3-3');
  const [selectedDemoCard, setSelectedDemoCard] = useState(0);

  // Auto-dismiss preloader quickly
  useEffect(() => {
    const timer = setTimeout(() => setPreloaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Mini Auction countdown ticker
  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => (prev > 1 ? prev - 1 : 10));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  // Handle user test-bid in interactive demo
  const handleTestBid = (increment: number) => {
    const newAmount = currentBid + increment;
    setCurrentBid(newAmount);
    setHighestBidder(user?.username || 'You (Manager)');
    setTimerSeconds(10);
    setBidHistory(prev => [
      { user: user?.username || 'You (Manager)', amount: newAmount, time: 'Just now' },
      ...prev.slice(0, 3),
    ]);

    // Simulate rival AI counter-bid after 2.5s if not at high ceiling
    if (newAmount < 45) {
      setTimeout(() => {
        const rivalNames = ['Commander_Voss', 'Cipher_Zero', 'Overwatch_Prime'];
        const randomRival = rivalNames[Math.floor(Math.random() * rivalNames.length)];
        const counterBid = newAmount + (Math.random() > 0.5 ? 2 : 5);
        setCurrentBid(counterBid);
        setHighestBidder(randomRival);
        setTimerSeconds(10);
        setBidHistory(p => [
          { user: randomRival, amount: counterBid, time: 'Just now' },
          ...p.slice(0, 3)
        ]);
      }, 2400);
    }
  };

  // Trigger test chaos card
  const handleTriggerChaos = () => {
    const chaosEffects = [
      'PRICE BOMB: +10 CP instant bid penalty',
      'FROZEN BUDGET: Manager locked for 1 round',
      'BLIND BID: Next 3 bids are hidden',
      'DOUBLE OR NOTHING: Winner gets 2x chemistry boost'
    ];
    const picked = chaosEffects[Math.floor(Math.random() * chaosEffects.length)];
    setChaosCardActive(picked);
    setTimeout(() => setChaosCardActive(null), 3500);
  };

  const handleEnterGame = () => {
    if (isAuthenticated) {
      navigate('/lobby');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#06090E] text-[#F0F4FF] overflow-x-hidden selection:bg-[#FF5500] selection:text-white">
      
      {/* ===== KINETIC PRELOADER OVERLAY ===== */}
      <AnimatePresence>
        {!preloaded && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-[#06090E] flex flex-col items-center justify-center font-mono"
          >
            <div className="flex items-center gap-3 text-xs tracking-widest text-[#FF5500] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-ping" />
              <span>TACTICAL ENGINE INITIALIZING // v2.4</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl tracking-wider text-white">
              DRAFT<span className="text-[#FF5500]">WAR</span>
            </h1>
            <div className="w-48 h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
                className="h-full bg-[#FF5500]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== EDITORIAL MASTHEAD NAVIGATION ===== */}
      <header className="sticky top-0 z-40 bg-[#06090E]/90 backdrop-blur-md border-b border-white/[0.08] px-6 md:px-12 h-20 flex items-center justify-between">
        {/* Brand Lockup */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-baseline gap-2 group text-left"
          >
            <span className="font-display text-3xl md:text-4xl tracking-wider font-black text-white group-hover:text-[#FF5500] transition-colors">
              DRAFT<span className="text-[#FF5500]">WAR</span>
            </span>
            <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest px-2 py-0.5 rounded bg-white/[0.06] text-[#8A95A8] border border-white/10">
              TACTICAL ENGINE
            </span>
          </button>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-8 font-heading font-bold text-sm tracking-wider uppercase text-[#8A95A8]">
          <a href="#arena" className="hover:text-[#FF5500] transition-colors">The Bidding Floor</a>
          <a href="#chemistry" className="hover:text-[#FF5500] transition-colors">Tactical Pitch</a>
          <a href="#clash" className="hover:text-[#FF5500] transition-colors">Live Simulation</a>
          <a href="#manifesto" className="hover:text-[#FF5500] transition-colors">Playbook</a>
        </nav>

        {/* Actions & Room Counter */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-[#00E599] bg-[#00E599]/10 border border-[#00E599]/30 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] animate-pulse" />
            <span>24 LIVE ROOMS</span>
          </div>

          <button
            onClick={handleEnterGame}
            className="relative group overflow-hidden px-6 py-2.5 rounded-lg bg-[#FF5500] text-white font-heading font-bold tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(255,85,0,0.4)] hover:shadow-[0_0_30px_rgba(255,85,0,0.7)] transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isAuthenticated ? 'ENTER WAR ROOM' : 'PLAY DRAFTWAR'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF5500] via-[#FF8844] to-[#FF5500] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </header>

      {/* ===== HERO SECTION ("FORGE YOUR XI") ===== */}
      <section className="relative min-h-[92vh] flex flex-col justify-center pt-8 pb-16 px-6 md:px-12 lg:px-16 overflow-hidden border-b border-white/[0.08]">
        {/* Background Grid & Radar Circle Lines */}
        <div className="absolute inset-0 bg-grid pointer-events-none opacity-40" />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full border border-white/[0.04] pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-[450px] h-[450px] rounded-full border border-dashed border-[#FF5500]/20 pointer-events-none animate-[spin_60s_linear_infinite]" />
        
        {/* Ambient Fire Glow Behind Cutout */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#FF5500]/15 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Hero Column: Sliced Monumental Headlines & Manifesto */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Top Editorial Eyebrow Tag */}
            <div className="inline-flex items-center gap-3">
              <span className="font-mono text-xs text-[#FF5500] font-bold tracking-widest px-3 py-1 rounded bg-[#FF5500]/10 border border-[#FF5500]/30 uppercase">
                SEASON 2026 // MULTIPLAYER AUCTION
              </span>
              <span className="text-white/40 font-mono text-xs">·</span>
              <span className="font-mono text-xs text-[#8A95A8] tracking-widest uppercase">
                TACTICAL CLASH ARENA
              </span>
            </div>

            {/* Sliced Monumental Display Typography */}
            <div className="flex flex-col select-none">
              <h1 className="font-display text-7xl sm:text-8xl md:text-9xl tracking-tight leading-[0.85] uppercase text-white font-black">
                FORGE <span className="text-stroke-orange">YOUR</span>
              </h1>
              <div className="flex items-baseline gap-4">
                <h1 className="font-display text-7xl sm:text-8xl md:text-9xl tracking-tight leading-[0.85] uppercase text-[#FF5500] font-black">
                  STARTING XI.
                </h1>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="h-[2px] w-12 bg-[#FF5500]" />
                <span className="font-editorial italic text-2xl sm:text-3xl text-[#F4EFE6]/90 font-bold">
                  "Every superstar has a price under chaos."
                </span>
              </div>
            </div>

            {/* Sub-Manifesto Paragraph */}
            <p className="text-base sm:text-lg text-[#8A95A8] max-w-xl font-normal leading-relaxed">
              Drop into real-time bidding wars against rival managers. Snatch world-class icons, 
              counter unexpected chaos cards, and assemble tactical squad chemistry that conquers the match pitch.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={handleEnterGame}
                className="px-8 py-4 rounded-xl bg-[#FF5500] text-white font-heading font-black tracking-widest text-lg uppercase shadow-[0_0_30px_rgba(255,85,0,0.5)] hover:shadow-[0_0_45px_rgba(255,85,0,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                <span>HOST A WAR ROOM</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="#arena"
                className="px-8 py-4 rounded-xl bg-[#0F1520] text-white border border-white/15 hover:border-[#FF5500]/50 hover:bg-[#161E2E] font-heading font-bold tracking-widest text-lg uppercase transition-all flex items-center gap-3"
              >
                <Play className="w-4 h-4 text-[#FF5500]" />
                <span>TRY LIVE BID ARENA</span>
              </a>
            </div>

            {/* Key Football Data Strip (Lucas Moretti / Micki 7 Reference Style) */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/[0.08] max-w-lg">
              <div>
                <div className="font-display text-4xl sm:text-5xl font-black text-white">11</div>
                <div className="font-mono text-[10px] text-[#8A95A8] uppercase tracking-widest mt-1">Starting XI Slots</div>
              </div>
              <div className="border-l border-white/10 pl-6">
                <div className="font-display text-4xl sm:text-5xl font-black text-[#FF5500]">0.4<span className="text-xl">s</span></div>
                <div className="font-mono text-[10px] text-[#8A95A8] uppercase tracking-widest mt-1">Live Bid Reflex</div>
              </div>
              <div className="border-l border-white/10 pl-6">
                <div className="font-display text-4xl sm:text-5xl font-black text-[#E8B84B]">100%</div>
                <div className="font-mono text-[10px] text-[#8A95A8] uppercase tracking-widest mt-1">Pure Tactics</div>
              </div>
            </div>

          </div>

          {/* Right Hero Column: Dramatic Cutout & Floating Editorial Data Widgets */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* The Main Hero Footballer Cutout */}
            <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/15 group">
              <img 
                src="/assets/hero_footballer.jpg" 
                alt="DraftWar Elite Footballer" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              {/* Bottom Gradient Fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06090E] via-transparent to-transparent opacity-80" />
              
              {/* Overlaid Editorial Headline on Photo (Lucas Moretti Style) */}
              <div className="absolute bottom-6 left-6 right-6">
                <span className="font-mono text-xs uppercase tracking-widest text-[#FF5500] font-bold block mb-1">
                  MARQUEE AUCTION TARGET
                </span>
                <div className="font-display text-4xl sm:text-5xl font-black text-white leading-none">
                  LUCAS MORETTI
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20 font-mono text-xs">
                  <span className="text-[#8A95A8]">BASE VALUATION</span>
                  <span className="text-[#FF5500] font-bold text-sm">18.5 CP</span>
                </div>
              </div>
            </div>

            {/* Floating Live Matchup Pill (Right Edge) */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-4 -right-4 sm:-right-8 bg-[#0F1520] border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 z-20 backdrop-blur-md"
            >
              <div className="w-3 h-3 rounded-full bg-[#FF5500] animate-ping" />
              <div>
                <div className="font-mono text-[9px] text-[#8A95A8] uppercase tracking-widest">WAR ROOM LIVE</div>
                <div className="font-heading font-black text-sm text-white uppercase tracking-wider">
                  Jose's XI <span className="text-[#FF5500]">vs</span> Carlo's XI
                </div>
              </div>
            </motion.div>

            {/* Floating Player Chemistry Dossier Pill (Left Edge) */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-6 -left-4 sm:-left-8 bg-[#0F1520] border border-[#E8B84B]/40 p-4 rounded-2xl shadow-2xl flex items-center gap-4 z-20"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E8B84B]/10 border border-[#E8B84B]/30 flex items-center justify-center font-display text-xl text-[#E8B84B]">
                94
              </div>
              <div>
                <div className="font-mono text-[9px] text-[#8A95A8] uppercase tracking-widest">SQUAD CHEMISTRY</div>
                <div className="font-heading font-black text-sm text-[#E8B84B] uppercase tracking-wider">
                  REAL MADRID + BRAZIL SYNERGY
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ===== INFINITE EDITORIAL TICKER TAPE ===== */}
      <div className="bg-[#FF5500] text-black py-3 overflow-hidden whitespace-nowrap select-none font-display text-xl md:text-2xl tracking-wider font-black">
        <div className="inline-flex gap-8 animate-[marquee_25s_linear_infinite]">
          <span>⚡ LIVE SQUAD AUCTION</span>
          <span>•</span>
          <span>11 PLAYERS PER FORMATION</span>
          <span>•</span>
          <span>CHAOS DISRUPTION ENGINE</span>
          <span>•</span>
          <span>DIXON-COLES EXPECTED GOAL SIMULATION</span>
          <span>•</span>
          <span>MULTIPLAYER ELO PROVING GROUNDS</span>
          <span>•</span>
          <span>BUILT. BID. DOMINATE.</span>
          <span>•</span>
          <span>⚡ LIVE SQUAD AUCTION</span>
          <span>•</span>
          <span>11 PLAYERS PER FORMATION</span>
          <span>•</span>
          <span>CHAOS DISRUPTION ENGINE</span>
          <span>•</span>
          <span>DIXON-COLES EXPECTED GOAL SIMULATION</span>
          <span>•</span>
        </div>
      </div>

      {/* ===== SECTION 01: THE EDITORIAL MANIFESTO (Cream Paper Contrast) ===== */}
      <section id="manifesto" className="bg-[#F4EFE6] text-[#111620] py-24 px-6 md:px-12 lg:px-16 border-b border-black/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Chapter Badge & Title */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#FF5500] uppercase tracking-widest mb-2">
                <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                CHAPTER 01 // THE MANIFESTO
              </div>
              <h2 className="font-display text-5xl sm:text-7xl font-black tracking-tight leading-none uppercase text-[#111620]">
                FANTASY FOOTBALL <br />
                <span className="text-[#B81D1D]">WAS BROKEN.</span> WE FORGED WAR.
              </h2>
            </div>
            <p className="font-editorial italic text-xl md:text-2xl max-w-md text-[#3D4654] leading-snug">
              "No waiting for weekend match results. Experience the entire drama of a transfer window and match day in 15 minutes."
            </p>
          </div>

          {/* 3 Asymmetric Editorial Pillars (Fuego / Polar Style) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="bg-white border-2 border-black/10 p-8 rounded-2xl editorial-shadow hover:translate-y-[-4px] transition-transform flex flex-col justify-between min-h-[320px]">
              <div>
                <span className="font-display text-6xl font-black text-[#B81D1D]">01</span>
                <h3 className="font-heading font-black text-2xl uppercase tracking-wider mt-4 text-[#111620]">
                  The Live Bidding Floor
                </h3>
                <p className="text-sm text-[#3D4654] mt-3 leading-relaxed">
                  Every player goes on the live auction block. Outbid your rivals with tactical budget management. 
                  Force them into bankruptcy or snipe an icon on the final second.
                </p>
              </div>
              <div className="font-mono text-xs text-[#FF5500] font-bold uppercase tracking-widest pt-6 border-t border-black/10 flex items-center gap-2">
                <span>AUCTION SPEED: 8s - 15s</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white border-2 border-black/10 p-8 rounded-2xl editorial-shadow hover:translate-y-[-4px] transition-transform flex flex-col justify-between min-h-[320px]">
              <div>
                <span className="font-display text-6xl font-black text-[#FF5500]">02</span>
                <h3 className="font-heading font-black text-2xl uppercase tracking-wider mt-4 text-[#111620]">
                  Chaos Wheel Disruptions
                </h3>
                <p className="text-sm text-[#3D4654] mt-3 leading-relaxed">
                  A random spin changes everything: Time bombs, frozen budgets, player swaps, and budget taxes. 
                  Adapt instantly or watch your grand transfer plan evaporate.
                </p>
              </div>
              <div className="font-mono text-xs text-[#FF5500] font-bold uppercase tracking-widest pt-6 border-t border-black/10 flex items-center gap-2">
                <span>DISRUPTIONS: ACTIVE</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white border-2 border-black/10 p-8 rounded-2xl editorial-shadow hover:translate-y-[-4px] transition-transform flex flex-col justify-between min-h-[320px]">
              <div>
                <span className="font-display text-6xl font-black text-[#111620]">03</span>
                <h3 className="font-heading font-black text-2xl uppercase tracking-wider mt-4 text-[#111620]">
                  Calibrated Match Engine
                </h3>
                <p className="text-sm text-[#3D4654] mt-3 leading-relaxed">
                  Natural positions, chemistry multipliers, and goalkeeper penalties determine the victor. 
                  Streamed minute-by-minute with live broadcast commentary.
                </p>
              </div>
              <div className="font-mono text-xs text-[#FF5500] font-bold uppercase tracking-widest pt-6 border-t border-black/10 flex items-center gap-2">
                <span>PHYSICS: DIXON-COLES</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===== SECTION 02: PLAYER TIERS (Micki 7 Inspired Presentation) ===== */}
      <section className="py-24 px-6 md:px-12 lg:px-16 border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto w-full">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#FF5500] uppercase tracking-widest mb-2">
                <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
                CHAPTER 02 // SQUAD ASSETS
              </div>
              <h2 className="font-display text-5xl sm:text-7xl font-black tracking-tight leading-none uppercase text-white">
                ROSTER TIERS & <span className="text-[#FF5500]">STATISTICAL POWER</span>
              </h2>
            </div>
            <p className="font-mono text-xs text-[#8A95A8] max-w-sm uppercase tracking-wider">
              [OVER 250+ REAL-WORLD SUPERSTARS ACROSS 6 EDITIONS INCLUDING WORLD CUP & LEGENDS]
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEMO_PLAYERS.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => setSelectedDemoCard(idx)}
                className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 border-2 relative overflow-hidden flex flex-col justify-between min-h-[380px]
                  ${selectedDemoCard === idx 
                    ? 'border-[#FF5500] bg-[#161E2E] shadow-[0_0_30px_rgba(255,85,0,0.4)] scale-105' 
                    : 'border-white/10 bg-[#0F1520] hover:border-white/30'
                  }
                `}
              >
                {/* Top Card Badges */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-display text-5xl font-black text-white leading-none">
                      {p.rating}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#FF5500] block mt-1">
                      {p.position}
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded bg-white/10 font-mono text-[10px] text-white/80">
                    {p.club}
                  </span>
                </div>

                {/* Player Name and Nation */}
                <div className="my-6">
                  <div className="font-heading font-black text-2xl uppercase tracking-wider text-white">
                    {p.name}
                  </div>
                  <div className="font-mono text-xs text-[#8A95A8]">
                    {p.nation} · Base {p.baseValue} CP
                  </div>
                </div>

                {/* Mini Stat Matrix */}
                <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/10 font-mono text-center">
                  <div>
                    <div className="text-[10px] text-[#8A95A8]">PAC</div>
                    <div className="text-xs font-bold text-white">{p.pace}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8A95A8]">SHO</div>
                    <div className="text-xs font-bold text-white">{p.shoot}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8A95A8]">PAS</div>
                    <div className="text-xs font-bold text-white">{p.pass}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8A95A8]">DRI</div>
                    <div className="text-xs font-bold text-white">{p.drib}</div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedDemoCard === idx && (
                  <div className="absolute top-0 right-0 w-8 h-8 bg-[#FF5500] flex items-center justify-center rounded-bl-xl text-black">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===== SECTION 03: INTERACTIVE LIVE BIDDING ARENA ===== */}
      <section id="arena" className="py-24 px-6 md:px-12 lg:px-16 bg-[#0B1017] border-b border-white/[0.08] relative overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#FF5500] uppercase tracking-widest mb-3 px-3 py-1 rounded bg-[#FF5500]/10 border border-[#FF5500]/30">
              <Sparkles className="w-3 h-3 text-[#FF5500]" />
              INTERACTIVE DEMO // CHAPTER 03
            </div>
            <h2 className="font-display text-5xl sm:text-7xl font-black tracking-tight leading-none uppercase text-white">
              TEST THE <span className="text-[#FF5500]">BIDDING ARENA</span>
            </h2>
            <p className="text-base text-[#8A95A8] mt-4 font-normal">
              Click a bid button below to experience the real-time thrill of our live auction floor against an AI rival manager!
            </p>
          </div>

          {/* Interactive Bidding Board Container */}
          <div className="max-w-4xl mx-auto bg-[#0F1520] border-2 border-[#FF5500]/40 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(255,85,0,0.2)] relative overflow-hidden">
            
            {/* Chaos Card Flash Overlay */}
            <AnimatePresence>
              {chaosCardActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-30 bg-[#9B5DE5]/90 flex flex-col items-center justify-center p-6 text-center text-white"
                >
                  <Flame className="w-16 h-16 text-yellow-300 animate-bounce mb-2" />
                  <span className="font-mono text-xs uppercase tracking-widest font-bold text-yellow-300">
                    CHAOS DISRUPTION TRIGGERED
                  </span>
                  <div className="font-display text-4xl sm:text-5xl font-black mt-2">
                    {chaosCardActive}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Target Player Info */}
              <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
                <span className="font-mono text-[10px] text-[#8A95A8] tracking-widest uppercase mb-1">
                  CURRENT LOT #04 // 11
                </span>
                <div className="font-display text-4xl font-black text-white">
                  VINÍCIUS JR.
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-[#FF5500] font-bold mt-1">
                  <span>REAL MADRID</span> · <span>BRAZIL</span> · <span>92 OVR</span>
                </div>

                {/* Circular SVG Timer */}
                <div className="relative w-28 h-28 my-6 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
                    <circle 
                      cx="56" cy="56" r="48" 
                      stroke={timerSeconds <= 3 ? '#FF3B3B' : '#FF5500'} 
                      strokeWidth="6" 
                      strokeDasharray="301"
                      strokeDashoffset={301 - (301 * timerSeconds) / 10}
                      strokeLinecap="round"
                      fill="transparent" 
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="font-display text-4xl font-black text-white">{timerSeconds}</span>
                    <span className="font-mono text-[8px] text-[#8A95A8] uppercase">SECONDS</span>
                  </div>
                </div>

                <button
                  onClick={handleTriggerChaos}
                  className="px-4 py-2 rounded-lg bg-[#9B5DE5]/20 border border-[#9B5DE5]/40 text-[#9B5DE5] hover:bg-[#9B5DE5] hover:text-white font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>SIMULATE CHAOS WHEEL</span>
                </button>
              </div>

              {/* Right Column: High Bid & Interactive Buttons */}
              <div className="md:col-span-7 bg-[#161E2E] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <span className="font-mono text-[10px] text-[#8A95A8] tracking-widest uppercase">LEADING MANAGER</span>
                      <div className="font-heading font-black text-lg text-white uppercase">{highestBidder}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] text-[#8A95A8] tracking-widest uppercase">HIGH BID</span>
                      <div className="font-display text-5xl font-black text-[#FF5500] leading-none">{currentBid} CP</div>
                    </div>
                  </div>

                  {/* Bid History Feed */}
                  <div className="py-4 space-y-2">
                    <span className="font-mono text-[9px] text-[#8A95A8] uppercase tracking-widest block">BID LOG</span>
                    {bidHistory.map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-mono text-[#8A95A8]">
                        <span className="text-white">{b.user}</span>
                        <span className="text-[#FF5500] font-bold">+{b.amount} CP</span>
                        <span>{b.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleTestBid(1)}
                    className="py-3 rounded-xl bg-[#0F1520] hover:bg-[#FF5500] hover:text-white text-[#FF5500] border border-[#FF5500]/40 font-heading font-black text-lg tracking-wider transition-all active:scale-95"
                  >
                    +1 CP
                  </button>
                  <button
                    onClick={() => handleTestBid(5)}
                    className="py-3 rounded-xl bg-[#FF5500] text-white font-heading font-black text-lg tracking-wider shadow-[0_0_15px_rgba(255,85,0,0.4)] hover:shadow-[0_0_25px_rgba(255,85,0,0.7)] transition-all active:scale-95"
                  >
                    +5 CP
                  </button>
                  <button
                    onClick={() => handleTestBid(10)}
                    className="py-3 rounded-xl bg-[#0F1520] hover:bg-[#FF5500] hover:text-white text-[#FF5500] border border-[#FF5500]/40 font-heading font-black text-lg tracking-wider transition-all active:scale-95"
                  >
                    +10 CP
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ===== SECTION 04: TACTICAL PITCH & CHEMISTRY MATRIX ===== */}
      <section id="chemistry" className="py-24 px-6 md:px-12 lg:px-16 border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Formations & Science */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#00E599] uppercase tracking-widest mb-3 px-3 py-1 rounded bg-[#00E599]/10 border border-[#00E599]/30">
              <Compass className="w-3 h-3 text-[#00E599]" />
              CHAPTER 04 // TACTICAL ARCHITECTURE
            </div>
            <h2 className="font-display text-5xl sm:text-7xl font-black tracking-tight leading-none uppercase text-white">
              CHEMISTRY <br /><span className="text-[#00E599]">CHANGES EVERYTHING.</span>
            </h2>

            <p className="text-base text-[#8A95A8] mt-6 leading-relaxed">
              Buying individual 90+ superstars won't win matches if they have zero synergy. 
              DraftWar pairs club teammates and national compatriots to boost team performance by up to <strong className="text-white">+15%</strong>. 
              Put an outfield player in goal, and suffer a catastrophic <strong className="text-[#FF3B3B]">50% defense penalty</strong>.
            </p>

            {/* Formation Selector Pills */}
            <div className="flex items-center gap-3 mt-8">
              {(['4-3-3', '3-5-2', '4-2-3-1'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setActiveFormation(fmt)}
                  className={`px-5 py-2.5 rounded-xl font-heading font-bold text-sm uppercase tracking-wider transition-all
                    ${activeFormation === fmt 
                      ? 'bg-[#00E599] text-black shadow-[0_0_20px_rgba(0,229,153,0.5)]' 
                      : 'bg-[#161E2E] text-[#8A95A8] hover:text-white border border-white/10'
                    }
                  `}
                >
                  {fmt} FORMATION
                </button>
              ))}
            </div>

            {/* Chemistry Multipliers Breakdown */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
              <div className="bg-[#0F1520] p-4 rounded-xl border border-white/10">
                <div className="font-display text-3xl font-black text-[#00E599]">+5 CHEM</div>
                <div className="font-mono text-xs text-[#8A95A8] mt-1">Same Nationality Link</div>
              </div>
              <div className="bg-[#0F1520] p-4 rounded-xl border border-white/10">
                <div className="font-display text-3xl font-black text-[#E8B84B]">+3 CHEM</div>
                <div className="font-mono text-xs text-[#8A95A8] mt-1">Same Club Link</div>
              </div>
            </div>

          </div>

          {/* Right Column: Proportional Pitch Wireframe Graphic */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="w-full max-w-md aspect-[3/4] bg-[#0F1520] border-2 border-white/20 rounded-2xl relative p-4 overflow-hidden pitch-surface shadow-2xl">
              
              {/* Pitch Markings */}
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/25 -translate-y-1/2" />
              <div className="absolute left-1/2 top-1/2 w-28 h-28 border border-white/25 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute left-1/2 top-0 w-44 h-16 border-b border-x border-white/25 -translate-x-1/2 rounded-b-md" />
              <div className="absolute left-1/2 bottom-0 w-44 h-16 border-t border-x border-white/25 -translate-x-1/2 rounded-t-md" />

              {/* Sample Synergy Nodes */}
              <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#00E599] text-black font-heading font-black text-xs flex items-center justify-center shadow-[0_0_15px_#00E599]">
                GK
              </div>
              <div className="absolute top-[32%] left-[20%] w-10 h-10 rounded-full bg-white/90 text-black font-heading font-black text-xs flex items-center justify-center">
                LB
              </div>
              <div className="absolute top-[30%] left-[40%] w-10 h-10 rounded-full bg-white/90 text-black font-heading font-black text-xs flex items-center justify-center">
                CB
              </div>
              <div className="absolute top-[30%] left-[60%] w-10 h-10 rounded-full bg-white/90 text-black font-heading font-black text-xs flex items-center justify-center">
                CB
              </div>
              <div className="absolute top-[32%] right-[20%] w-10 h-10 rounded-full bg-white/90 text-black font-heading font-black text-xs flex items-center justify-center">
                RB
              </div>

              {/* Midfield Nodes */}
              <div className="absolute top-[55%] left-[28%] w-10 h-10 rounded-full bg-[#E8B84B] text-black font-heading font-black text-xs flex items-center justify-center shadow-[0_0_15px_#E8B84B]">
                CM
              </div>
              <div className="absolute top-[52%] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#E8B84B] text-black font-heading font-black text-xs flex items-center justify-center shadow-[0_0_15px_#E8B84B]">
                CM
              </div>
              <div className="absolute top-[55%] right-[28%] w-10 h-10 rounded-full bg-[#E8B84B] text-black font-heading font-black text-xs flex items-center justify-center shadow-[0_0_15px_#E8B84B]">
                CM
              </div>

              {/* Front Three Attack Nodes */}
              <div className="absolute top-[80%] left-[20%] w-10 h-10 rounded-full bg-[#FF5500] text-white font-heading font-black text-xs flex items-center justify-center shadow-[0_0_15px_#FF5500]">
                LW
              </div>
              <div className="absolute top-[84%] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#FF5500] text-white font-heading font-black text-xs flex items-center justify-center shadow-[0_0_15px_#FF5500]">
                ST
              </div>
              <div className="absolute top-[80%] right-[20%] w-10 h-10 rounded-full bg-[#FF5500] text-white font-heading font-black text-xs flex items-center justify-center shadow-[0_0_15px_#FF5500]">
                RW
              </div>

              {/* Overlay Label */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm p-2 rounded-lg border border-white/10 text-center font-mono text-[10px] text-[#00E599]">
                ● PROPORTIONAL 3:4 PITCH · FORMATION ACTIVE: {activeFormation}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ===== SECTION 05: TWO MANAGERS. ONE MATCH. (Striker Clash & Duels) ===== */}
      <section id="clash" className="py-24 px-6 md:px-12 lg:px-16 bg-[#B81D1D]/10 border-b border-white/[0.08] relative overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Striker Photographic Cutout */}
          <div className="lg:col-span-5 relative flex items-center justify-center order-2 lg:order-1">
            <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#B81D1D]/50">
              <img 
                src="/assets/striker_clash.jpg" 
                alt="DraftWar Striker Climax" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B81D1D] font-bold">
                  POST-MATCH CELEBRATION
                </span>
                <div className="font-display text-4xl font-black text-white leading-tight">
                  CLASH OF TITANS
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clash Narrative */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#B81D1D] uppercase tracking-widest mb-3 px-3 py-1 rounded bg-[#B81D1D]/20 border border-[#B81D1D]/40">
              <Crosshair className="w-3 h-3 text-[#B81D1D]" />
              CHAPTER 05 // THE MATCH CLIMAX
            </div>

            <h2 className="font-display text-5xl sm:text-7xl font-black tracking-tight leading-none uppercase text-white">
              TWO MANAGERS. <br />
              <span className="text-[#B81D1D]">ONE FINAL WHISTLE.</span>
            </h2>

            <p className="text-base text-[#8A95A8] mt-6 leading-relaxed">
              When both managers confirm their tactical Starting XI, the 3-second synchronized countdown triggers. 
              The match simulator takes over, calculating possession, defensive intercepts, tactical assists, and stunning goals minute-by-minute.
            </p>

            <div className="mt-8 p-6 rounded-2xl bg-[#0F1520] border border-white/10 space-y-4">
              <div className="flex items-center justify-between font-heading font-black text-xl text-white">
                <span>JOSE'S XI</span>
                <span className="text-[#B81D1D] font-display text-3xl">2 — 1</span>
                <span>CARLO'S XI</span>
              </div>
              <div className="font-mono text-xs text-[#8A95A8] border-t border-white/10 pt-3 flex items-center justify-between">
                <span>[88'] ⚽ GOAL! Vinícius Jr. (Winner)</span>
                <span className="text-[#00E599] font-bold">+18 ELO RATING</span>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleEnterGame}
                className="px-8 py-4 rounded-xl bg-[#B81D1D] text-white font-heading font-black text-lg uppercase tracking-widest shadow-[0_0_30px_rgba(184,29,29,0.5)] hover:scale-105 active:scale-95 transition-all"
              >
                PROVE YOUR TACTICS NOW
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ===== GRAND FINALE CTA BANNER ===== */}
      <section className="py-24 px-6 md:px-12 text-center relative overflow-hidden bg-gradient-to-b from-[#06090E] to-[#0D131D]">
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="font-mono text-xs uppercase tracking-widest text-[#FF5500] font-bold">
            ARE YOU READY FOR HIGH-STAKES FOOTBALL?
          </span>
          <h2 className="font-display text-6xl sm:text-8xl md:text-9xl font-black uppercase text-white tracking-tight mt-3 mb-6">
            YOUR SQUAD <br /><span className="text-stroke-orange">IS WAITING.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#8A95A8] max-w-xl mx-auto mb-10">
            Join thousands of managers drafting in real time. Host a private war room with your friends or enter public matchmaking.
          </p>

          <button
            onClick={handleEnterGame}
            className="px-10 py-5 rounded-2xl bg-[#FF5500] text-white font-heading font-black text-xl uppercase tracking-widest shadow-[0_0_40px_rgba(255,85,0,0.6)] hover:shadow-[0_0_60px_rgba(255,85,0,0.9)] hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3"
          >
            <span>ENTER WAR ROOM NOW</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* ===== EDITORIAL FOOTER ===== */}
      <footer className="border-t border-white/[0.08] bg-[#06090E] py-12 px-6 md:px-12 font-mono text-xs text-[#8A95A8] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl font-black text-white">DRAFT<span className="text-[#FF5500]">WAR</span></span>
          <span className="text-white/20">|</span>
          <span>EST. 2026</span>
          <span className="text-white/20">|</span>
          <span>TACTICAL ENGINE v2.4</span>
        </div>
        <div>
          <span>BUILT FOR PURE TACTICAL FOOTBALL ENTHUSIASTS</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#manifesto" className="hover:text-white transition-colors">PLAYBOOK</a>
          <a href="#arena" className="hover:text-white transition-colors">BIDDING FLOOR</a>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[#FF5500] hover:underline">
            BACK TO TOP ↑
          </button>
        </div>
      </footer>

    </div>
  );
}
