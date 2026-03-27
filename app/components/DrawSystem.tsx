'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

// ✅ Define user type (fixes TypeScript errors)
type UserType = {
  id: string;
};

function generateDrawNumbers() {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

export default function DrawSystem() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runDraw = async (forceWin = false) => {
    setLoading(true);
    setResult(null);

    try {
      const drawNumbers = generateDrawNumbers();

      // ✅ Insert new draw
      const { data: draw, error: drawError } = await supabase
        .from('draws')
        .insert({ numbers: drawNumbers })
        .select()
        .single();

      if (drawError) throw drawError;

      // ✅ Get current logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      // 🔐 Admin check (ONLY admin can run draw)
      if (user.email !== 'paroisseterredegoshen@gmail.com') {
        alert('Only admin can run draws');
        setLoading(false);
        return;
      }

      // ✅ Get all subscribed users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('is_subscribed', true);

      if (usersError) throw usersError;

      const usersList: UserType[] = users || [];

      let winnersCount = 0;

      // ✅ Loop through users
      for (const u of usersList) {
        const { data: scores } = await supabase
          .from('scores')
          .select('score')
          .eq('user_id', u.id)
          .order('date', { ascending: false })
          .limit(5);

        const userScores = scores?.map((s: any) => s.score) || [];

        let matchCount = userScores.filter((s: number) =>
          drawNumbers.includes(s)
        ).length;

        // 🧪 Force win for testing
        if (forceWin && u.id === user.id) {
          matchCount = 5;
        }

        // ✅ Only winners (3+ matches)
        if (matchCount >= 3) {
          await supabase.from('winnings').insert({
            user_id: u.id,
            draw_id: draw.id,
            match_count: matchCount,
            status: 'pending',
            prize_amount:
              matchCount === 5 ? 400 :
              matchCount === 4 ? 200 :
              100,
          });

          winnersCount++;
        }
      }

      // ✅ Result message
      const msg = forceWin
        ? '🎉 TEST WIN FORCED! You now have a 5-match win.'
        : `Draw completed! ${winnersCount} winner(s) found.`;

      setResult({
        drawNumbers,
        winnersCount,
        message: msg,
      });

      alert(msg);

      // Reload to refresh dashboard
      window.location.reload();

    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 p-6 border border-gray-700 rounded-2xl bg-zinc-900">
      <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <span>🎲</span> Run Monthly Draw
      </h2>

      <div className="flex gap-3">
        <button
          onClick={() => runDraw(false)}
          disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition"
        >
          {loading ? 'Running…' : '🚀 Run Normal Draw'}
        </button>

        <button
          onClick={() => runDraw(true)}
          disabled={loading}
          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition"
        >
          🧪 Force Win (Test)
        </button>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-xl">
          <p className="font-mono text-sm mb-2">
            Drawn: <span className="font-bold">{result.drawNumbers.join(' – ')}</span>
          </p>
          <p className="text-green-400">{result.message}</p>
        </div>
      )}
    </div>
  );
}
