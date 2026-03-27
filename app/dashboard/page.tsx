'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ScoreForm from '../components/ScoreForm';
import ScoreList from '../components/ScoreList';
import CharitySelector from '../components/CharitySelector';
import Subscription from '../components/Subscription';
import DrawSystem from '../components/DrawSystem';
import Winnings from '../components/Winnings';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserAndProfile = async () => {
      // 1. Get auth user
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        window.location.href = '/auth';
        return;
      }

      setUser(authData.user);

      // 2. Get subscription status from public.users table (PRD requirement)
      const { data: profile } = await supabase
        .from('users')
        .select('is_subscribed')
        .eq('id', authData.user.id)
        .single();

      setIsSubscribed(profile?.is_subscribed || false);
      setLoading(false);
    };

    getUserAndProfile();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading your dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Welcome,</span>
          <span className="font-semibold text-white">{user?.email}</span>
        </div>
      </div>

      {/* Subscription Status Bar (PRD §10) */}
      <div className="mb-8 p-5 bg-zinc-900 border border-gray-700 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-5 h-5 rounded-2xl ${isSubscribed ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
          <div>
            <p className="font-semibold text-lg">
              Subscription:{' '}
              <span className={isSubscribed ? 'text-emerald-400' : 'text-red-400'}>
                {isSubscribed ? 'ACTIVE ✅' : 'INACTIVE'}
              </span>
            </p>
            {isSubscribed && <p className="text-xs text-gray-400">You can now enter draws and win prizes</p>}
          </div>
        </div>
        {!isSubscribed && (
          <p className="text-amber-400 font-medium text-sm">Activate subscription below to unlock draws →</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Scores & Charity */}
        <div className="lg:col-span-7 space-y-8">
          <ScoreForm userId={user.id} />
          <ScoreList userId={user.id} />
          <CharitySelector userId={user.id} />
        </div>

        {/* Right Column - Subscription, Draw & Winnings */}
        <div className="lg:col-span-5 space-y-8">
          <Subscription userId={user.id} />

          {/* Run Draw only for subscribed users (matches PRD) */}
          {isSubscribed && <DrawSystem />}

          <Winnings userId={user.id} />
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 mt-16">
        Golf Charity Subscription Platform • Digital Heroes PRD Assignment
      </p>
    </div>
  );
}