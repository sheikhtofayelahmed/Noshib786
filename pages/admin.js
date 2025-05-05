'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      router.push('/login');
    }
  }, []);

  return (
    <div>
      <div>Welcome, Admin! 🎰</div>
      <button
        onClick={() => {
          localStorage.removeItem('role');
          router.push('/login');
        }}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
  
}
