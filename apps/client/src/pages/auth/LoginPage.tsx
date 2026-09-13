import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      setUser(data.user);
      navigate('/lobby');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#06090E] text-[#F0F4FF] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Main Editorial Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-[#0F1520] border-2 border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10"
      >
        
        {/* Left Editorial Poster Panel (Hidden on Mobile) */}
        <div className="hidden md:flex md:col-span-5 relative flex-col justify-between p-8 border-r border-white/10 bg-[#0A0E15] overflow-hidden">
          {/* Ambient Image Background */}
          <div className="absolute inset-0 opacity-40">
            <img 
              src="/assets/hero_footballer.jpg" 
              alt="DraftWar Star" 
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E15] via-[#0A0E15]/60 to-transparent" />
          </div>

          {/* Top Stamp */}
          <div className="relative z-10">
            <span className="font-mono text-[10px] text-[#D92525] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-[#B81D1D]/15 border border-[#B81D1D]/40">
              OPERATOR ACCESS // v2.4
            </span>
            <div className="font-display text-4xl font-black text-white mt-2">
              DRAFT<span className="text-[#B81D1D]">WAR</span>
            </div>
          </div>

          {/* Bottom Editorial Quote */}
          <div className="relative z-10">
            <p className="font-editorial italic text-lg text-white/90 leading-snug">
              "Squads are not built on luck. They are forged under pressure."
            </p>
            <span className="font-mono text-[10px] text-[#8A95A8] tracking-widest uppercase block mt-2">
              — WAR ROOM PROTOCOL
            </span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          
          <div>
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
              <Link 
                to="/" 
                className="font-mono text-xs text-[#8A95A8] hover:text-[#D92525] transition-colors flex items-center gap-1"
              >
                ← BACK TO ARENA
              </Link>
              <span className="font-mono text-[10px] text-white/40 uppercase">
                SECURE AUTH GATEWAY
              </span>
            </div>

            <div className="mb-6">
              <h2 className="font-display text-4xl font-black uppercase text-white tracking-wide">
                MANAGER LOGIN
              </h2>
              <p className="text-xs text-[#8A95A8] mt-1 font-mono">
                ENTER CREDENTIALS TO RESUME TACTICAL COMMAND
              </p>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl text-xs font-mono font-bold bg-[#D92525]/10 border border-[#D92525]/40 text-[#D92525]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#8A95A8] block mb-1">
                  OFFICIAL EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="manager@draftwar.gg"
                  required
                  className="w-full bg-[#161E2E] border border-white/10 focus:border-[#B81D1D] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#8A95A8] block mb-1">
                  ACCESS CIPHER (PASSWORD)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#161E2E] border border-white/10 focus:border-[#B81D1D] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#B81D1D] to-[#D92525] text-white font-heading font-black text-base uppercase tracking-widest shadow-[0_0_20px_rgba(184,29,29,0.4)] hover:shadow-[0_0_30px_rgba(184,29,29,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="font-mono text-xs">CONNECTING...</span>
                ) : (
                  <>
                    <span>ENTER WAR ROOM</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick One-Click Demo Logins */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#8A95A8] block mb-2">
                ⚡ 1-CLICK TEST CREDENTIALS (INSTANT DEV ACCESS)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('jose@ex.com')}
                  className="flex-1 py-2 rounded-lg bg-[#161E2E] hover:bg-[#1C263A] border border-white/10 text-xs font-mono text-[#D92525] transition-colors"
                >
                  Jose (Tactician)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('carlo@ex.com')}
                  className="flex-1 py-2 rounded-lg bg-[#161E2E] hover:bg-[#1C263A] border border-white/10 text-xs font-mono text-[#E8B84B] transition-colors"
                >
                  Carlo (Champion)
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 text-center text-xs font-mono text-[#8A95A8]">
            Need commissioning?{' '}
            <Link to="/register" className="text-[#D92525] font-bold hover:underline">
              REGISTER NEW MANAGER →
            </Link>
          </div>

        </div>

      </motion.div>

    </div>
  );
}
