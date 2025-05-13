// src/app/dashboard/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAgent } from 'src/context/AgentContext';
import NumberChart from '@/components/NumberChart';
import PlayerInput from '@/components/PlayerInput';

import Link from 'next/link';
import Win from '@/components/Win';
const DashboardPage = () => {
  const { agentId, logout } = useAgent();
  const router = useRouter();

  useEffect(() => {
    if (!agentId) {
      router.push('/login');  // If no agentId, redirect to login
    }
  }, [agentId, router]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <nav className="bg-gray-900 bg-opacity-80 border-b border-yellow-500 shadow-lg">
        <div className="flex justify-center items-center py-3 border-b border-yellow-500">
          <span className="text-3xl font-extrabold text-yellow-400 tracking-wide drop-shadow-lg hover:animate-pulse cursor-default">
            🎯 Thai Lottery Agent (ID: {agentId})
          </span>
        </div>

        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-8">
            <a href="/reports" className="hover:text-pink-400 hover:underline text-lg font-semibold transition duration-200">
              📊 Reports
            </a>
            <a href="/game" className="hover:text-pink-400 hover:underline text-lg font-semibold transition duration-200">
              🎮 Game
            </a>
          </div>

          <button
            onClick={logout}
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
};

export default DashboardPage;
