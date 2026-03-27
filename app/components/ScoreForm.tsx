'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ScoreForm({ userId }: { userId: string }) {
  const [score, setScore] = useState('');

  const handleAddScore = async () => {
    const scoreValue = parseInt(score);

    if (scoreValue < 1 || scoreValue > 45) {
      alert('Score must be between 1 and 45');
      return;
    }

    // Fetch existing scores
    const { data: scores } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    // If 5 scores exist, delete oldest
    if (scores && scores.length >= 5) {
      const oldest = scores[0];

      await supabase
        .from('scores')
        .delete()
        .eq('id', oldest.id);
    }

    // Insert new score
    await supabase.from('scores').insert({
      user_id: userId,
      score: scoreValue,
    });

    alert('Score added!');
    setScore('');
  };

  return (
    <div className="mt-6">
      <h2 className="font-semibold">Add Score</h2>

      <input
        type="number"
        placeholder="Enter score (1-45)"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        className="border p-2 mr-2"
      />

      <button
        onClick={handleAddScore}
        className="bg-blue-500 text-white p-2"
      >
        Submit
      </button>
    </div>
  );
}
