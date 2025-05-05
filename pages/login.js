'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();

    const adminId = process.env.NEXT_PUBLIC_ADMIN_ID;
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS;
    const agentId = process.env.NEXT_PUBLIC_AGENT_ID;
    const agentPass = process.env.NEXT_PUBLIC_AGENT_PASS;

    if (id === adminId && pass === adminPass) {
      localStorage.setItem('role', 'admin');
      router.push('/admin');
    } else if (id === agentId && pass === agentPass) {
      localStorage.setItem('role', 'agent');
      router.push('/agent');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl mb-4">Login</h2>
        <input
          type="text"
          placeholder="ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          Login
        </button>
      </form>
    </div>
  );
}
