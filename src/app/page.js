'use client';

import { useEffect, useState } from 'react';
import AdminPage from './admin/page';
import AgentPage from './agent/page';

export default function HomePage() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole === 'admin' || storedRole === 'agent') {
      setRole(storedRole);
    } else {
      setRole('unknown');
    }
  }, []);

  if (role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-yellow-400">
        <p>Loading...</p>
      </div>
    );
  }

  if (role === 'admin') {
    return <AdminPage />;
  }

  if (role === 'agent') {
    return <AgentPage />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-red-400">
      <p className="mb-4">Invalid or missing role. Please log in again.</p>
      <a href="/login" className="underline text-yellow-400">Go to Login</a>
    </div>
  );
}
