'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Winnings({ userId }: { userId: string }) {
  const [wins, setWins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWinnings = async () => {
    console.log('🔍 Logged in userId:', userId);

    const { data, error } = await supabase
      .from('winnings')
      .select('*')
     // remove ordering for now .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Fetch error:', error);
    } else {
      console.log('✅ ALL winnings from DB:', data);
    }

    setWins(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchWinnings();
    }
  }, [userId]);

  const totalWon = wins.reduce((sum, w) => sum + (w.prize_amount || 0), 0);

  return (
    <div className="mt-6 p-6 border border-gray-700 rounded-2xl bg-zinc-900">
      <h2 className="font-semibold text-xl mb-4">Your Winnings</h2>

      <div className="text-3xl font-bold text-emerald-400 mb-6">
        <div className="text-sm text-gray-400">Total Won</div>
<div className="text-4xl font-bold text-emerald-400">
  ${totalWon}
</div>

      </div>

      {loading ? (
        <p className="text-gray-400">Loading winnings...</p>
      ) : wins.length === 0 ? (
        <p className="text-gray-400 italic">
          No winnings found (check console)
        </p>
      ) : (
        <div className="space-y-4">
          {wins.map((w) => (
            <div
              key={w.id}
              className="flex justify-between items-center bg-zinc-800 p-4 rounded-xl"
            >
              <div>
                <span className="font-medium">
                  {w.match_count}-number match
                </span>
                <span className="ml-3 text-xs text-gray-400">
                  Draw: {w.draw_id?.slice(0, 8)}...
                </span>
              </div>

              <div className="text-right">
                <div className="font-bold text-emerald-400">
                  ${w.prize_amount}
                </div>
                <div
  className={`text-xs px-3 py-1 rounded-full inline-block ${
    w.status === 'paid'
      ? 'bg-green-500 text-white'
      : 'bg-yellow-400 text-black'
  }`}
>
  {w.status === 'paid' ? 'PAID ✅' : 'PENDING ⏳'}
</div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
