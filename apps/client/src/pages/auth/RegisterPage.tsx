import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export function RegisterPage() {
  const [username, setUsername] = useState('');
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
      const { data } = await api.post('/auth/register', { username, email, password });
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      setUser(data.user);
      navigate('/lobby');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickGuest = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setUsername(`manager_${randomSuffix}`);
    setEmail(`manager_${randomSuffix}@draftwar.gg`);
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
              src="/assets/striker_clash.jpg" 
              alt="DraftWar Striker" 
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E15] via-[#0A0E15]/60 to-transparent" />
          </div>

          {/* Top Stamp */}
          <div className="relative z-10">
            <span className="font-mono text-[10px] text-[#00E599] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-[#00E599]/10 border border-[#00E599]/30">
              NEW COMMISSION // ROSTER ENLISTMENT
            </span>
            <div className="font-display text-4xl font-black text-white mt-2">
              DRAFT<span className="text-[#B81D1D]">WAR</span>
            </div>
          </div>

          {/* Bottom Editorial Quote */}
          <div className="relative z-10">
            <p className="font-editorial italic text-lg text-white/90 leading-snug">
              "Claim your club colors. Take your seat on the auction block."
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
                COMMISSIONING DESK
              </span>
            </div>

            <div className="mb-6">
              <h2 className="font-display text-4xl font-black uppercase text-white tracking-wide">
                CREATE MANAGER
              </h2>
              <p className="text-xs text-[#8A95A8] mt-1 font-mono">
                ENLIST YOUR CALLSIGN AND ENTER THE MULTIPLAYER ELO ARENA
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
                  CALLSIGN (USERNAME)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. Tactician_Prime"
                  required
                  minLength={3}
                  maxLength={32}
                  className="w-full bg-[#161E2E] border border-white/10 focus:border-[#B81D1D] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                />
              </div>

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
                  ACCESS CIPHER (PASSWORD - MIN 8 CHARACTERS)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={8}
                  className="w-full bg-[#161E2E] border border-white/10 focus:border-[#B81D1D] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#B81D1D] to-[#D92525] text-white font-heading font-black text-base uppercase tracking-widest shadow-[0_0_20px_rgba(184,29,29,0.4)] hover:shadow-[0_0_30px_rgba(184,29,29,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="font-mono text-xs">ENLISTING...</span>
                ) : (
                  <>
                    <span>ENLIST AS MANAGER</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Guest Auto-fill */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleQuickGuest}
                className="font-mono text-xs text-[#8A95A8] hover:text-white underline transition-colors"
              >
                ⚡ Auto-generate test manager credentials
              </button>
            </div>
          </div>

          <div className="pt-6 text-center text-xs font-mono text-[#8A95A8]">
            Already commissioned?{' '}
            <Link to="/login" className="text-[#D92525] font-bold hover:underline">
              MANAGER LOGIN →
            </Link>
          </div>

        </div>

      </motion.div>

    </div>
  );
}
