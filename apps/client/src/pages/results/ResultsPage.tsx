import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function ResultsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark text-white p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-dark to-dark pointer-events-none"></div>
      
      <div className="bg-dark-elevated border border-primary/30 rounded-3xl p-12 max-w-2xl w-full text-center relative z-10 shadow-[0_0_50px_rgba(200,255,0,0.1)]">
        <div className="text-6xl mb-6">🏆</div>
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600">Tournament Winner</h1>
        <p className="text-gray-400 mb-12 tracking-widest uppercase text-sm">The chaos has settled.</p>
        
        <div className="bg-dark p-6 rounded-2xl border border-white/10 mb-10">
          <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Final Standings</div>
          <div className="text-3xl font-black text-white">Results calculating...</div>
        </div>

        <Button size="lg" className="w-full" onClick={() => navigate('/')}>
          Return to Lobby
        </Button>
      </div>
    </div>
  );
}
