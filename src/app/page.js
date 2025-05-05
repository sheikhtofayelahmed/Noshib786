'use client';

import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-yellow-400">🛡️ Admin Dashboard 🛡️</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded shadow"
        >
          🚪 Logout
        </button>
      </div>
      {/* Your admin content here */}
      <p>Welcome, Admin!</p>
    </div>
  );
}
