'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import AdminPage from './admin/page';
import NumberChart from '@/components/NumberChart';
import PlayerInput from '@/components/PlayerInput';

import Link from 'next/link';
import Win from '@/components/Win';
export default function HomePage() {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('role');
    router.push('/login');
  };
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

  // if (role === 'admin') {
  //   return <AdminPage />;
  // }

  if (role === 'agent') {
    return (
      <div className="min-h-screen bg-black text-white p-6">
       <nav className="bg-gray-900 bg-opacity-80 border-b border-yellow-500 shadow-lg">
  {/* Top: Website name */}
  <div className="flex justify-center items-center py-3 border-b border-yellow-500">
    <span className="text-3xl font-extrabold text-yellow-400 tracking-wide drop-shadow-lg hover:animate-pulse cursor-default">
      🎯 Thai Lottery Agent
    </span>
  </div>

  {/* Bottom: Links + Logout */}
  <div className="flex justify-between items-center px-6 py-4">
    <div className="flex items-center space-x-8">
      <Link
        href="/agent/reports"
        className="hover:text-pink-400 hover:underline text-lg font-semibold transition duration-200"
      >
        📊 Reports
      </Link>
      <Link
        href="/agent/game"
        className="hover:text-pink-400 hover:underline text-lg font-semibold transition duration-200"
      >
        🎮 Game
      </Link>
    </div>

    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded shadow transition duration-200"
    >
      🚪 Logout
    </button>
  </div>
</nav>


        {/* <h1 className="text-4xl font-bold text-center text-yellow-400 mb-4">🎲 Agent Dashboard 🎲</h1> */}
        <Win straightWin="456" singleWin="7" />
        <PlayerInput />
        <NumberChart />
        
      </div>
    );
  }

  // fallback (should never hit, but safe to have)
  return null;
}
