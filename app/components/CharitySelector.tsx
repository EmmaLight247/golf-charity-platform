'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function CharitySelector({ userId }: { userId: string }) {
  const [charities, setCharities] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [percentage, setPercentage] = useState(10);

  useEffect(() => {
    const fetchCharities = async () => {
      const { data } = await supabase.from('charities').select('*');
      setCharities(data || []);
    };

    fetchCharities();
  }, []);

  const handleSave = async () => {
    if (percentage < 10) {
      alert('Minimum contribution is 10%');
      return;
    }

    await supabase
      .from('users')
      .update({
        charity_id: selected,
        contribution_percentage: percentage,
      })
      .eq('id', userId);

    alert('Charity updated!');
  };

  return (
    <div className="mt-6">
      <h2 className="font-semibold">Select Charity</h2>

      <select
        onChange={(e) => setSelected(e.target.value)}
        className="border p-2"
      >
        <option value="">Choose a charity</option>
        {charities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <div className="mt-2">
        <input
          type="number"
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
          className="border p-2"
        />
        <span>% contribution</span>
      </div>

      <button
        onClick={handleSave}
        className="bg-purple-500 text-white p-2 mt-2"
      >
        Save
      </button>
    </div>
  );
}
