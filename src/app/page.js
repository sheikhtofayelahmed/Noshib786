'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminPage from './admin/page';
import NumberChart from '@/components/NumberChart';
import PlayerInput from '@/components/PlayerInput';

export default function HomePage() {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      router.push('/login');  // 🚀 auto-redirect
    } else {
      setRole(storedRole);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400">
        <p className="animate-pulse">Loading...</p>
      </div>
    );
  }

  if (role === 'admin') {
    return <AdminPage />;
  }

  if (role === 'agent') {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-4xl font-bold text-center text-yellow-400 mb-4">🎲 Agent Dashboard 🎲</h1>
        <NumberChart />
        <PlayerInput />
      </div>
    );
  }

  // fallback (should never hit, but safe to have)
  return null;
}
