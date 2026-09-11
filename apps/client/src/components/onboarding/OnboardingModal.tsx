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

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      badge: 'TACTICAL AUCTIONS',
      title: 'BUILD YOUR SQUAD UNDER PRESSURE',
      subtitle: 'Bid on elite real-world footballers in high-stakes live auction rounds.',
      icon: Gavel,
      accentColor: 'text-dw-fire',
      borderColor: 'border-dw-fire/40',
      bgGlow: 'from-dw-fire/10 to-transparent',
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
        <div className="bg-dw-void/80 border border-dw-border p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 bg-gradient-to-br from-dw-fire to-dw-gold rounded-lg flex items-center justify-center font-display text-2xl text-dw-void font-bold shadow-lg shadow-dw-fire/20">
              91
            </div>
            <div>
              <div className="text-xs font-mono text-dw-fire uppercase tracking-widest">ST • REAL MADRID</div>
              <div className="font-heading text-lg font-bold text-dw-text-primary tracking-wide">KYLIAN MBAPPÉ</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-dw-text-secondary uppercase">CURRENT BID</div>
            <div className="font-display text-2xl text-dw-fire">42 CP</div>
          </div>
        </div>
      ),
    },
    {
      badge: 'DISRUPTION ENGINE',
      title: 'SURVIVE THE CHAOS CARDS',
      subtitle: 'Calculated strategy meets total unpredictability. No match is ever safe.',
      icon: Zap,
      accentColor: 'text-dw-chaos',
      borderColor: 'border-dw-chaos/40',
      bgGlow: 'from-dw-chaos/10 to-transparent',
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
        <div className="bg-dw-void/80 border border-dw-chaos/40 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-dw-chaos/20 to-transparent pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-dw-chaos/20 border border-dw-chaos/40 flex items-center justify-center text-dw-chaos shrink-0">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono text-dw-chaos font-bold uppercase tracking-widest">CHAOS CARD INCOMING</div>
            <div className="font-heading text-lg font-bold text-dw-text-primary">EGO CLASH • SQUAD THEFT</div>
            <div className="text-xs text-dw-text-secondary">Steals the highest rated player from the current leader!</div>
          </div>
        </div>
      ),
    },
    {
      badge: 'GLORY & PROGRESSION',
      title: 'SIMULATE MATCHES & CLIMB ELO',
      subtitle: 'Lock in your tactical formation and watch your 11 battle for tournament victory.',
      icon: Trophy,
      accentColor: 'text-dw-gold',
      borderColor: 'border-dw-gold/40',
      bgGlow: 'from-dw-gold/10 to-transparent',
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
        <div className="bg-dw-void/80 border border-dw-border p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-dw-gold/20 border border-dw-gold/40 flex items-center justify-center text-dw-gold font-display text-xl">
              1st
            </div>
            <div>
              <div className="font-heading font-bold text-dw-text-primary">TOURNAMENT CHAMPION</div>
              <div className="text-xs text-dw-text-secondary font-mono">+24 ELO • BEST VALUE AWARD</div>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-dw-gold bg-dw-gold/10 border border-dw-gold/30 px-3 py-1 rounded-full">
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
      localStorage.setItem('draftwar_onboarding_seen', 'true');
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleDismiss = () => {
    localStorage.setItem('draftwar_onboarding_seen', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dw-void/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-dw-surface border border-dw-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${current.bgGlow} pointer-events-none transition-colors duration-500`} />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between p-6 pb-2 border-b border-dw-border/50">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider border ${current.borderColor} ${current.accentColor}`}>
              {current.badge}
            </span>
            <span className="text-xs font-mono text-dw-text-ghost">
              STEP {currentStep + 1} OF {slides.length}
            </span>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-dw-text-secondary hover:text-dw-text-primary hover:bg-dw-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="relative p-6 space-y-6 flex-1">
          <div>
            <h2 className="font-display text-3xl tracking-wide text-dw-text-primary mb-1">
              {current.title}
            </h2>
            <p className="text-sm text-dw-text-secondary">
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
                <div key={idx} className="bg-dw-elevated/40 border border-dw-border/60 p-3.5 rounded-xl flex gap-3 items-start">
                  <div className="p-2 rounded-lg bg-dw-surface border border-dw-border text-dw-text-primary shrink-0 mt-0.5">
                    <ItemIcon className="w-4 h-4 text-dw-fire" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-dw-text-primary uppercase tracking-wider">{item.title}</h4>
                    <p className="text-[12px] text-dw-text-secondary mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="relative flex items-center justify-between p-6 pt-4 border-t border-dw-border/50 bg-dw-elevated/20">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-dw-fire' : 'w-2 bg-dw-border hover:bg-dw-text-ghost'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-lg text-xs font-bold font-sans uppercase tracking-wider text-dw-text-secondary hover:text-dw-text-primary hover:bg-dw-elevated transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-lg text-xs font-bold font-sans uppercase tracking-wider bg-dw-fire hover:bg-dw-fire-dim text-white shadow-lg shadow-dw-fire/20 flex items-center gap-2 transition-all transform active:scale-95"
            >
              {isLast ? (
                <>
                  Enter The War Room
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next Briefing
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
