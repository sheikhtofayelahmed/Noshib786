// src/app/dashboard/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAgent } from 'src/context/AgentContext';
import NumberChart from '@/components/NumberChart';
import PlayerInput from '@/components/PlayerInput';

import Link from 'next/link';
import Win from '@/components/Win';
import Navigation from '@/components/Navigation';
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
      <Navigation></Navigation>

        {/* <h1 className="text-4xl font-bold text-center text-yellow-400 mb-4">🎲 Agent Dashboard 🎲</h1> */}
        <Win straightWin="456" singleWin="7" />
        <PlayerInput />
        <NumberChart />
    </div>
  );
};

export default DashboardPage;
