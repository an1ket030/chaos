import React, { useState } from 'react';
import {
  Gavel,
  Zap,
  Trophy,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Sparkles,
  ShieldAlert,
  Coins,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  if (!isOpen) return null;

  const markComplete = async () => {
    localStorage.setItem('draftwar_onboarding_seen', 'true');
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await api.post(
          '/auth/complete-onboarding',
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (user) {
          setUser({ ...user, has_completed_onboarding: true });
        }
      } catch (err) {
        console.warn('Failed to record onboarding completion on server:', err);
      }
    }
    onClose();
  };

  const slides = [
    {
      badge: 'TACTICAL AUCTIONS',
      title: 'BUILD YOUR SQUAD UNDER PRESSURE',
      subtitle: 'Bid on elite real-world footballers in high-stakes live auction rounds.',
      icon: Gavel,
      accentColor: 'text-[#FF6B2B]',
      borderColor: 'border-[#FF6B2B]/40',
      bulletPoints: [
        {
          icon: Coins,
          title: 'Finite CP Budget',
          desc: 'Manage your starting Club Points strictly. Spend big on a talisman or build deep squad balance.',
        },
        {
          icon: Gavel,
          title: 'Live Bidding Clock',
          desc: '10-second timer resets on every new bid. Skip together to cycle unwanted players quickly.',
        },
      ],
      previewGraphic: (
        <div className="bg-[#161E2E] border border-[#2A364F] p-4 rounded-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 bg-gradient-to-br from-[#FF6B2B] to-[#F59E0B] rounded flex items-center justify-center font-display text-2xl text-[#080C12] font-bold shadow-md shadow-[#FF6B2B]/20">
              91
            </div>
            <div>
              <div className="text-xs font-mono text-[#FF6B2B] uppercase tracking-widest">ST • REAL MADRID</div>
              <div className="font-heading text-lg font-bold text-white tracking-wide">KYLIAN MBAPPÉ</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-[#8A95A8] uppercase">CURRENT BID</div>
            <div className="font-display text-2xl text-[#FF6B2B]">42 CP</div>
          </div>
        </div>
      ),
    },
    {
      badge: 'DISRUPTION ENGINE',
      title: 'SURVIVE THE CHAOS CARDS',
      subtitle: 'Calculated strategy meets total unpredictability. No match is ever safe.',
      icon: Zap,
      accentColor: 'text-[#9B5DE5]',
      borderColor: 'border-[#9B5DE5]/40',
      bulletPoints: [
        {
          icon: ShieldAlert,
          title: '14 Unique Disruptions',
          desc: 'Transfer bans, budget swaps, blind bags, and tax audits fire mid-auction to flip standings.',
        },
        {
          icon: Sparkles,
          title: 'Adaptive Strategy',
          desc: 'Pivot on the fly when your top rival gets audited or when a sudden windfall hits your treasury.',
        },
      ],
      previewGraphic: (
        <div className="bg-[#161E2E] border border-[#9B5DE5]/50 p-4 rounded-lg flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-lg bg-[#9B5DE5]/20 border border-[#9B5DE5]/40 flex items-center justify-center text-[#9B5DE5] shrink-0">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono text-[#9B5DE5] font-bold uppercase tracking-widest">CHAOS CARD INCOMING</div>
            <div className="font-heading text-lg font-bold text-white">EGO CLASH • SQUAD THEFT</div>
            <div className="text-xs text-[#8A95A8]">Steals the highest rated player from the current leader!</div>
          </div>
        </div>
      ),
    },
    {
      badge: 'GLORY & PROGRESSION',
      title: 'SIMULATE MATCHES & CLIMB ELO',
      subtitle: 'Lock in your tactical formation and watch your 11 battle for tournament victory.',
      icon: Trophy,
      accentColor: 'text-[#F59E0B]',
      borderColor: 'border-[#F59E0B]/40',
      bulletPoints: [
        {
          icon: Trophy,
          title: 'Live 2D Match Simulation',
          desc: 'Watch goals, defensive stands, and red cards unfold with weighted tactical engine physics.',
        },
        {
          icon: CheckCircle2,
          title: 'Ranked Tiers & Accolades',
          desc: 'Earn ELO points, unlock Manager Levels, claim the Best Value award, and share victory cards.',
        },
      ],
      previewGraphic: (
        <div className="bg-[#161E2E] border border-[#2A364F] p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B] font-display text-xl">
              1st
            </div>
            <div>
              <div className="font-heading font-bold text-white">TOURNAMENT CHAMPION</div>
              <div className="text-xs text-[#8A95A8] font-mono">+24 ELO • BEST VALUE AWARD</div>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3 py-1 rounded">
            GOLD TIER
          </span>
        </div>
      ),
    },
  ];

  const current = slides[currentStep];
  const isLast = currentStep === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      markComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080C12]/95 animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0F1520] border-2 border-[#2A364F] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Tactical Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#FF6B2B]" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#FF6B2B]" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#FF6B2B]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#FF6B2B]" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between p-6 pb-4 border-b border-[#2A364F] bg-[#161E2E]">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider border ${current.borderColor} ${current.accentColor} bg-[#080C12]`}
            >
              {current.badge}
            </span>
            <span className="text-xs font-mono text-[#8A95A8]">
              PHASE {currentStep + 1} OF {slides.length}
            </span>
          </div>

          <button
            onClick={markComplete}
            className="p-1.5 rounded text-[#8A95A8] hover:text-white hover:bg-[#0F1520] transition-colors"
            title="Skip Briefing"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="relative p-6 space-y-6 flex-1 bg-[#0F1520]">
          <div>
            <h2 className="font-display text-3xl tracking-wide text-white mb-1">
              {current.title}
            </h2>
            <p className="text-sm text-[#8A95A8]">
              {current.subtitle}
            </p>
          </div>

          {/* Graphic Preview */}
          {current.previewGraphic}

          {/* Bullet Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {current.bulletPoints.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#161E2E] border border-[#2A364F] p-3.5 rounded-lg flex gap-3 items-start"
                >
                  <div className="p-2 rounded bg-[#0F1520] border border-[#2A364F] text-[#FF6B2B] shrink-0 mt-0.5">
                    <ItemIcon className="w-4 h-4 text-[#FF6B2B]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{item.title}</h4>
                    <p className="text-[12px] text-[#8A95A8] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="relative flex items-center justify-between p-6 pt-4 border-t border-[#2A364F] bg-[#161E2E]">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-[#FF6B2B]' : 'w-2 bg-[#2A364F] hover:bg-[#8A95A8]'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded text-xs font-bold font-mono uppercase tracking-wider text-[#8A95A8] hover:text-white hover:bg-[#0F1520] border border-transparent hover:border-[#2A364F] transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded text-xs font-bold font-mono uppercase tracking-wider bg-[#FF6B2B] hover:bg-[#E55A1F] text-white shadow-lg shadow-[#FF6B2B]/20 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              {isLast ? (
                <>
                  Enter Tactical Arena
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next Dossier
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
