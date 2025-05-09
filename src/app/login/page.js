// src/app/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgent } from '../../context/AgentContext';

const LoginPage = () => {
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAgent();

  const handleLogin = (e) => {
    e.preventDefault();

    const agentId = process.env.NEXT_PUBLIC_AGENT_ID;
    const agentPass = process.env.NEXT_PUBLIC_AGENT_PASS;

    if (id === agentId && pass === agentPass) {
      login(id);  // Set agentId in context and localStorage
      router.push('/');  // Redirect to dashboard after login
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-red-900 to-black text-white p-4">
      <form onSubmit={handleLogin} className="bg-gray-900 bg-opacity-90 p-8 rounded-xl shadow-2xl w-full max-w-sm">
        <h2 className="text-4xl font-bold text-center mb-6 text-yellow-400 animate-pulse">
          🎰 Login 🎰
        </h2>

        <input
          type="text"
          placeholder="🎫 ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-black border-2 border-yellow-400 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <input
          type="password"
          placeholder="🔑 Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-black border-2 border-yellow-400 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />

        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded shadow transition duration-300"
        >
          🎲 Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
