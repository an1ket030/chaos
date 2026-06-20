import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LobbyPage } from './pages/lobby/LobbyPage';
import { WaitingRoomPage } from './pages/waiting/WaitingRoomPage';
import { AuctionRoomPage } from './pages/auction/AuctionRoomPage';
import { SquadBuilderPage } from './pages/squad-builder/SquadBuilderPage';
import { SimulationPage } from './pages/simulation/SimulationPage';
import { ResultsPage } from './pages/results/ResultsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { useAuthStore } from './store/authStore';
import { api } from './lib/api';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d0d' }}>
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8FF00', borderTopColor: 'transparent' }} />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
        <Route path="/room/:code" element={<ProtectedRoute><WaitingRoomPage /></ProtectedRoute>} />
        <Route path="/room/:code/auction" element={<ProtectedRoute><AuctionRoomPage /></ProtectedRoute>} />
        <Route path="/room/:code/squad-builder" element={<ProtectedRoute><SquadBuilderPage /></ProtectedRoute>} />
        <Route path="/room/:code/simulation" element={<ProtectedRoute><SimulationPage /></ProtectedRoute>} />
        <Route path="/room/:code/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
