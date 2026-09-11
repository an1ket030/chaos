import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  ArrowLeft,
  Shield,
  Zap,
  Coins,
  History,
  Award,
  Medal,
  Calendar,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Avatar } from '../../components/ui/Avatar';
import { useAuthStore } from '../../store/authStore';

interface ProfileData {
  id: string;
  username: string;
  avatar_url?: string;
  elo_rating: number;
  games_played: number;
  games_won: number;
  total_cp_spent: number;
  best_squad_rating: number;
  favorite_formation?: string;
  chaos_cards_received: number;
  created_at: string;
}

interface GameHistoryItem {
  id: string;
  room_code: string;
  edition: string;
  mode: string;
  completed_at: string;
  formation?: string;
  squad_rating?: number;
  chemistry?: number;
  cp_spent?: number;
  chaos_cards_received?: number;
  elo_change?: number;
  position?: number;
  winner_username?: string;
}

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'matches' | 'stats' | 'achievements'>('matches');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetId = id || currentUser?.id;

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/profile/${targetId}`),
      api.get(`/profile/${targetId}/games`).catch(() => ({ data: [] })),
    ])
      .then(([profileRes, gamesRes]) => {
        setProfile(profileRes.data);
        setGames(gamesRes.data || []);
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        setError('Manager profile could not be retrieved.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [targetId]);

  const getEloDetails = (elo: number) => {
    if (elo >= 2200) return { tier: 'Elite', color: '#E8B84B', bg: 'rgba(232,184,75,0.12)', border: 'rgba(232,184,75,0.3)' };
    if (elo >= 1900) return { tier: 'Diamond', color: '#9B5DE5', bg: 'rgba(155,93,229,0.12)', border: 'rgba(155,93,229,0.3)' };
    if (elo >= 1600) return { tier: 'Platinum', color: '#3D8EFF', bg: 'rgba(61,142,255,0.12)', border: 'rgba(61,142,255,0.3)' };
    if (elo >= 1300) return { tier: 'Gold', color: '#F1C40F', bg: 'rgba(241,196,15,0.12)', border: 'rgba(241,196,15,0.3)' };
    if (elo >= 1000) return { tier: 'Silver', color: '#BDC3C7', bg: 'rgba(189,195,199,0.12)', border: 'rgba(189,195,199,0.3)' };
    return { tier: 'Bronze', color: '#CD7F32', bg: 'rgba(205,127,50,0.12)', border: 'rgba(205,127,50,0.3)' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dw-void flex flex-col items-center justify-center text-dw-text-primary gap-4">
        <div className="w-12 h-12 border-4 border-dw-border border-t-dw-fire rounded-full animate-spin" />
        <span className="font-heading tracking-widest text-dw-text-secondary text-sm uppercase">Accessing Dossier...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-dw-void flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-2xl bg-dw-danger/10 border border-dw-danger/30 text-dw-danger mb-4">
          <Shield className="w-10 h-10" />
        </div>
        <h2 className="font-display text-2xl text-dw-text-primary uppercase mb-2">Tactical Dossier Not Found</h2>
        <p className="text-sm text-dw-text-secondary max-w-sm mb-6">{error || 'This manager does not exist or has no recorded match history.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-dw-surface border border-dw-border hover:border-dw-fire text-dw-text-primary font-bold text-xs uppercase tracking-wider transition-all"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  const eloDetails = getEloDetails(profile.elo_rating ?? 1000);
  const winRate = profile.games_played > 0
    ? Math.round((profile.games_won / profile.games_played) * 100)
    : 0;
  const avgSpend = profile.games_played > 0
    ? Math.round(profile.total_cp_spent / profile.games_played)
    : 0;

  const achievementsList = [
    {
      title: 'WAR ROOM INITIATE',
      desc: 'Enlist and complete your first tactical squad auction.',
      unlocked: profile.games_played >= 1,
      icon: Medal,
      color: 'text-dw-steel',
    },
    {
      title: 'CROWNED CHAMPION',
      desc: 'Finish 1st in a live multi-manager tournament.',
      unlocked: profile.games_won >= 1,
      icon: Trophy,
      color: 'text-dw-gold',
    },
    {
      title: 'CHAOS SURVIVOR',
      desc: 'Withstand 10 or more Chaos Cards across your career.',
      unlocked: profile.chaos_cards_received >= 10,
      icon: Zap,
      color: 'text-dw-chaos',
    },
    {
      title: 'CENTURION SPENDER',
      desc: 'Expend over 500 total CP in competitive bidding.',
      unlocked: profile.total_cp_spent >= 500,
      icon: Coins,
      color: 'text-dw-fire',
    },
    {
      title: 'ELITE MASTERCLASS',
      desc: 'Draft a squad with an overall rating of 88 or higher.',
      unlocked: Number(profile.best_squad_rating) >= 88,
      icon: Sparkles,
      color: 'text-dw-gold',
    },
    {
      title: 'WARLORD RANK',
      desc: 'Attain Gold Tier or higher in competitive ELO.',
      unlocked: profile.elo_rating >= 1300,
      icon: TrendingUp,
      color: 'text-dw-fire',
    },
  ];

  return (
    <div className="min-h-screen bg-dw-void text-dw-text-primary relative selection:bg-dw-fire selection:text-white">
      {/* Background Matrix Grid */}
      <div className="fixed inset-0 bg-grid opacity-50 pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-dw-surface/80 backdrop-blur-md border-b border-dw-border px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-dw-text-secondary hover:text-dw-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Hub Command
        </button>

        <div className="font-display text-2xl tracking-wider text-dw-fire">
          DRAFTWAR
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border"
            style={{
              color: eloDetails.color,
              background: eloDetails.bg,
              borderColor: eloDetails.border,
            }}
          >
            {eloDetails.tier}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Manager Dossier Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dw-surface border border-dw-border rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-dw-fire/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            <div className="relative">
              <Avatar
                username={profile.username}
                url={profile.avatar_url}
                size="xl"
              />
              <div
                className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-wider uppercase border shadow-lg"
                style={{
                  color: eloDetails.color,
                  background: '#0F1520',
                  borderColor: eloDetails.border,
                }}
              >
                {eloDetails.tier}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="font-display text-4xl md:text-5xl tracking-wide uppercase">
                  {profile.username}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="font-mono text-sm px-3 py-1 rounded-lg bg-dw-elevated border border-dw-border text-dw-fire font-bold">
                    {profile.elo_rating} ELO
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono text-dw-text-secondary pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-dw-steel" />
                  Commissioned: {new Date(profile.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-dw-gold" />
                  Tactics: {profile.favorite_formation || '4-3-3'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tactical Performance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Tournaments Won', val: profile.games_won, icon: Trophy, color: 'text-dw-gold' },
            { label: 'Total Matches', val: profile.games_played, icon: Activity, color: 'text-dw-steel' },
            { label: 'Win Rate', val: `${winRate}%`, icon: TrendingUp, color: 'text-dw-success' },
            { label: 'Best Squad OVR', val: profile.best_squad_rating ? Number(profile.best_squad_rating).toFixed(1) : '—', icon: Sparkles, color: 'text-dw-gold' },
            { label: 'Avg Spend / Match', val: `${avgSpend} CP`, icon: Coins, color: 'text-dw-fire' },
            { label: 'Chaos Survived', val: profile.chaos_cards_received, icon: Zap, color: 'text-dw-chaos' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-dw-surface border border-dw-border/70 p-4 rounded-xl flex flex-col items-center justify-center text-center hover:border-dw-border-active transition-all"
              >
                <Icon className={`w-4 h-4 mb-2 ${item.color}`} />
                <div className="font-display text-2xl md:text-3xl tracking-tight leading-none mb-1">
                  {item.val}
                </div>
                <div className="text-[10px] font-mono text-dw-text-secondary uppercase tracking-wider">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-dw-border pb-1">
          {[
            { id: 'matches', label: 'Match History', icon: History },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'stats', label: 'Tactical Breakdown', icon: Shield },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-heading text-sm uppercase tracking-wider font-bold transition-all ${
                  isActive
                    ? 'bg-dw-surface text-dw-fire border-t-2 border-dw-fire border-x border-dw-border'
                    : 'text-dw-text-secondary hover:text-dw-text-primary hover:bg-dw-surface/40'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Match History */}
        {activeTab === 'matches' && (
          <div className="space-y-3">
            {games.length === 0 ? (
              <div className="bg-dw-surface border border-dw-border p-8 rounded-2xl text-center">
                <History className="w-10 h-10 text-dw-text-ghost mx-auto mb-3" />
                <h3 className="font-heading text-lg font-bold uppercase text-dw-text-primary mb-1">No Matches Recorded</h3>
                <p className="text-xs text-dw-text-secondary mb-4">Complete your first auction tournament to record combat history.</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-5 py-2 rounded-xl bg-dw-fire text-white font-bold text-xs uppercase tracking-wider"
                >
                  Join an Auction
                </button>
              </div>
            ) : (
              games.map((g) => {
                const isWinner = g.position === 1;
                const positionText = g.position ? `${g.position}${['st', 'nd', 'rd', 'th'][Math.min(g.position - 1, 3)]}` : 'Finished';
                const eloDelta = g.elo_change ?? 0;

                return (
                  <div
                    key={g.id}
                    className="bg-dw-surface border border-dw-border hover:border-dw-border-active p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-display text-xl shrink-0 border ${
                          isWinner
                            ? 'bg-dw-gold/20 text-dw-gold border-dw-gold/40'
                            : 'bg-dw-elevated text-dw-text-secondary border-dw-border'
                        }`}
                      >
                        {g.position === 1 ? '🥇' : g.position === 2 ? '🥈' : g.position === 3 ? '🥉' : `${g.position || '—'}`}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-base uppercase text-dw-text-primary">
                            {g.edition ? g.edition.replace('-', ' ') : 'War Room'}
                          </span>
                          <span className="font-mono text-[11px] text-dw-text-ghost">
                            #{g.room_code}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-dw-text-secondary mt-0.5 flex items-center gap-3">
                          <span>{new Date(g.completed_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{g.formation || '4-3-3'}</span>
                          {g.squad_rating ? (
                            <>
                              <span>•</span>
                              <span className="text-dw-gold font-bold">{Number(g.squad_rating).toFixed(1)} OVR</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-dw-border/50">
                      <div className="text-left sm:text-right">
                        <div className="text-[10px] font-mono text-dw-text-secondary uppercase">FINISH</div>
                        <div className="font-heading font-bold text-sm text-dw-text-primary uppercase">
                          {positionText}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-mono text-dw-text-secondary uppercase">ELO IMPACT</div>
                        <div
                          className={`font-mono font-bold text-sm ${
                            eloDelta > 0
                              ? 'text-dw-success'
                              : eloDelta < 0
                              ? 'text-dw-danger'
                              : 'text-dw-text-secondary'
                          }`}
                        >
                          {eloDelta > 0 ? `+${eloDelta}` : eloDelta}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Achievements */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievementsList.map((ach, idx) => {
              const AchIcon = ach.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                    ach.unlocked
                      ? 'bg-dw-surface border-dw-border shadow-lg'
                      : 'bg-dw-elevated/40 border-dw-border/40 opacity-50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      ach.unlocked
                        ? 'bg-dw-elevated border-dw-border text-dw-gold'
                        : 'bg-dw-void border-dw-border text-dw-text-ghost'
                    }`}
                  >
                    <AchIcon className={`w-6 h-6 ${ach.unlocked ? ach.color : 'text-dw-text-ghost'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-dw-text-primary">
                        {ach.title}
                      </h4>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                          ach.unlocked
                            ? 'bg-dw-success/10 text-dw-success border-dw-success/30'
                            : 'bg-dw-void text-dw-text-ghost border-dw-border'
                        }`}
                      >
                        {ach.unlocked ? 'CLAIMED' : 'LOCKED'}
                      </span>
                    </div>
                    <p className="text-xs text-dw-text-secondary leading-relaxed">{ach.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Tactical Breakdown */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-dw-surface border border-dw-border p-6 rounded-2xl space-y-4">
              <h3 className="font-heading font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-5 h-5 text-dw-fire" />
                Combat Profile
              </h3>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between py-2 border-b border-dw-border/50">
                  <span className="text-dw-text-secondary">Preferred Formation</span>
                  <span className="font-bold text-dw-text-primary">{profile.favorite_formation || '4-3-3'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dw-border/50">
                  <span className="text-dw-text-secondary">Competitive Rank</span>
                  <span className="font-bold" style={{ color: eloDetails.color }}>{eloDetails.tier}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dw-border/50">
                  <span className="text-dw-text-secondary">Best Squad Rating</span>
                  <span className="font-bold text-dw-gold">{profile.best_squad_rating ? `${Number(profile.best_squad_rating).toFixed(1)} OVR` : '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dw-border/50">
                  <span className="text-dw-text-secondary">Chaos Encounters</span>
                  <span className="font-bold text-dw-chaos">{profile.chaos_cards_received} Events</span>
                </div>
              </div>
            </div>

            <div className="bg-dw-surface border border-dw-border p-6 rounded-2xl space-y-4">
              <h3 className="font-heading font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                <Coins className="w-5 h-5 text-dw-gold" />
                Financial Intelligence
              </h3>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between py-2 border-b border-dw-border/50">
                  <span className="text-dw-text-secondary">Total Capital Expended</span>
                  <span className="font-bold text-dw-fire">{profile.total_cp_spent} CP</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dw-border/50">
                  <span className="text-dw-text-secondary">Average Bid Expenditure</span>
                  <span className="font-bold text-dw-text-primary">{avgSpend} CP / Match</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dw-border/50">
                  <span className="text-dw-text-secondary">Win Efficiency Ratio</span>
                  <span className="font-bold text-dw-success">{winRate}% Victories</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dw-border/50">
                  <span className="text-dw-text-secondary">Monetary Discipline</span>
                  <span className="font-bold text-dw-text-secondary">
                    {avgSpend > 110 ? 'High Risk Spender' : avgSpend > 80 ? 'Balanced Strategist' : 'Value Hoarder'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
