'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-context';

export default function HomePage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) {
      return;
    }
    router.replace(user ? '/chat' : '/login');
  }, [ready, user, router]);

  return (
    <main className="flex h-screen items-center justify-center text-slate-400">
      Loading
    </main>
  );
}
