'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentPage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'agent') {
      router.push('/login');
    }
  }, []);

  return <div>Welcome, Agent! 💼</div>;
}
