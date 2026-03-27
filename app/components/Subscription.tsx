'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SubscriptionProps {
  userId: string;
}

export default function Subscription({ userId }: SubscriptionProps) {
  const [loading, setLoading] = useState(false);

  const activateSubscription = async (plan: 'monthly' | 'yearly') => {
    if (!userId) {
      alert('User not found');
      return;
    }

    setLoading(true);

    const expiresAt = plan === 'monthly'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('users')
      .update({
        is_subscribed: true,
        subscription_status: 'active',
        plan_type: plan,
        expires_at: expiresAt,
      })
      .eq('id', userId);

    if (error) {
      console.error('=== SUBSCRIPTION ERROR ===', error);
      alert('Subscription error: ' + error.message);
    } else {
      alert(`✅ ${plan.toUpperCase()} subscription activated!`);
      window.location.reload();
    }

    setLoading(false);
  };

  return (
    <div className="p-6 border border-gray-700 rounded-2xl bg-zinc-900">
      <h2 className="text-2xl font-bold mb-6 text-white">Activate Subscription</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => activateSubscription('monthly')}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-8 py-6 rounded-2xl font-semibold text-lg transition-all"
        >
          <div className="text-sm opacity-75">Monthly</div>
          <div className="text-3xl font-bold">$20</div>
          <div className="text-xs mt-1">Billed monthly • 10% to charity</div>
        </button>

        <button
          onClick={() => activateSubscription('yearly')}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-8 py-6 rounded-2xl font-semibold text-lg transition-all relative"
        >
          <div className="absolute -top-3 right-4 bg-amber-400 text-black text-xs font-bold px-3 py-1 rounded-full">
            SAVE 17%
          </div>
          <div className="text-sm opacity-75">Yearly</div>
          <div className="text-3xl font-bold">$200</div>
          <div className="text-xs mt-1">Billed yearly • Best value</div>
        </button>
      </div>
    </div>
  );
}