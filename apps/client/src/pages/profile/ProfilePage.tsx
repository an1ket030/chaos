import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Avatar } from '../../components/ui/Avatar';

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/profile/${id}`).then(res => setProfile(res.data)).catch(console.error);
    }
  }, [id]);

  if (!profile) return <div className="min-h-screen bg-dark flex items-center justify-center text-primary">Loading...</div>;

  return (
    <div className="min-h-screen bg-dark text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-dark-elevated border border-white/10 rounded-3xl p-8 flex items-center gap-8 mb-8">
          <Avatar username={profile.username} url={profile.avatar_url} size="xl" />
          <div>
            <h1 className="text-4xl font-black uppercase tracking-wider mb-2">{profile.username}</h1>
            <div className="text-primary font-mono tracking-widest font-bold">ELO: {profile.elo_rating}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-dark border border-white/5 p-6 rounded-2xl text-center">
            <div className="text-4xl font-black mb-2">{profile.games_played}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Games Played</div>
          </div>
          <div className="bg-dark border border-white/5 p-6 rounded-2xl text-center">
            <div className="text-4xl font-black mb-2 text-primary">{profile.games_won}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tournaments Won</div>
          </div>
          <div className="bg-dark border border-white/5 p-6 rounded-2xl text-center">
            <div className="text-4xl font-black mb-2 text-purple-400">{profile.chaos_cards_received}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Chaos Survived</div>
          </div>
        </div>
      </div>
    </div>
  );
}
