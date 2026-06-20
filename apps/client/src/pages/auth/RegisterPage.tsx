import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

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
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 bg-dark-elevated/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400">
            Join The Club
          </h1>
          <p className="text-gray-400 tracking-widest text-sm uppercase">Create Your Manager Profile</p>
        </div>

        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm font-bold text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Manager Name (Username)" 
            type="text" 
            value={username} 
            onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} 
            placeholder="e.g. Pep_Guardiola"
            maxLength={32}
            required
          />
          <Input 
            label="Email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="you@example.com"
            required
          />
          <Input 
            label="Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Minimum 8 characters"
            minLength={8}
            required
          />
          <Button type="submit" className="w-full !bg-[#C8FF00] !text-black hover:!bg-[#b8ef00] font-black tracking-widest" size="lg" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="mt-8 text-center text-gray-400 text-sm">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-bold">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
