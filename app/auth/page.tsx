'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) alert(error.message);
    else alert('Check your email!');
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    else alert('Logged in!');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <input
        type="email"
        placeholder="Email"
        className="p-2 border"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="p-2 border"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSignUp} className="bg-blue-500 text-white p-2">
        Sign Up
      </button>

      <button onClick={handleLogin} className="bg-green-500 text-white p-2">
        Login
      </button>
    </div>
  );
}
