import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

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
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-grid relative overflow-hidden"
      style={{ background: '#080C12' }}
    >
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,107,43,0.07) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(155,93,229,0.07) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0, 0.2, 1] }}
        className="w-full max-w-md relative z-10"
        style={{
          background: 'rgba(15,21,32,0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '40px',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="font-display text-5xl mb-2 tracking-wider"
            style={{ color: '#FF6B2B', textShadow: '0 0 30px rgba(255,107,43,0.4)' }}
          >
            DRAFTWAR
          </div>
          <p className="dw-label" style={{ color: '#8A95A8' }}>
            Build your squad. Win the war.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 px-4 py-3 rounded-lg text-sm font-bold text-center"
            style={{ background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.4)', color: '#FF3B3B' }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="dw-label block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="dw-input"
            />
          </div>
          <div>
            <label className="dw-label block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="dw-input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-heading font-bold text-base uppercase tracking-widest transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isLoading ? '#CC5522' : '#FF6B2B',
              color: 'white',
              boxShadow: isLoading ? 'none' : '0 0 24px rgba(255,107,43,0.4)',
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm" style={{ color: '#8A95A8' }}>
          No account?{' '}
          <Link
            to="/register"
            className="font-bold transition-colors"
            style={{ color: '#FF6B2B' }}
          >
            Create one — it's free
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
