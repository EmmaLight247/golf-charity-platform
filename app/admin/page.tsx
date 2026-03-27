'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [winnings, setWinnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== 'paroisseterredegoshen@gmail.com') {
      alert('Access denied');
      window.location.href = '/dashboard';
    }
  };

  checkAdmin();
}, []);


  const fetchData = async () => {
    setLoading(true);

    // Fetch users
    const { data: usersData } = await supabase
      .from('users')
      .select('*');

    // Fetch winnings
    const { data: winningsData } = await supabase
      .from('winnings')
      .select('*')
      .order('created_at', { ascending: false });

    setUsers(usersData || []);
    setWinnings(winningsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Mark as paid
  const markAsPaid = async (id: string) => {
    const { error } = await supabase
      .from('winnings')
      .update({
        status: 'paid',
        paid: true,
      })
      .eq('id', id);

    if (error) {
      alert('Error updating status');
    } else {
      alert('✅ Marked as paid');
      fetchData();
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading admin panel...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* USERS */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Users</h2>

        <div className="bg-zinc-900 p-4 rounded-xl space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex justify-between border-b border-gray-700 pb-2">
              <span>{u.email}</span>
              <span className={u.is_subscribed ? 'text-green-400' : 'text-red-400'}>
                {u.is_subscribed ? 'Subscribed' : 'Not Subscribed'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* WINNINGS */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Winnings Management</h2>

        <div className="bg-zinc-900 p-4 rounded-xl space-y-4">
          {winnings.map((w) => (
            <div
              key={w.id}
              className="flex justify-between items-center bg-zinc-800 p-4 rounded-xl"
            >
              <div>
                <div className="font-medium">
                  User: {w.user_id.slice(0, 6)}...
                </div>
                <div className="text-sm text-gray-400">
                  {w.match_count}-match • ${w.prize_amount}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    w.status === 'paid'
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-400 text-black'
                  }`}
                >
                  {w.status}
                </span>

                {w.status !== 'paid' && (
                  <button
                    onClick={() => markAsPaid(w.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
