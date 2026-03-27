'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ScoreList({ userId }: { userId: string }) {
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    const fetchScores = async () => {
      const { data } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      setScores(data || []);
    };

    fetchScores();
  }, [userId]);

  return (
    <div className="mt-6">
      <h2 className="font-semibold">Your Scores</h2>

      <ul>
        {scores.map((s) => (
          <li key={s.id}>
            {s.score} — {new Date(s.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
