'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-context';
import { ChatShell } from '@/features/chat/components/chat-shell';

export default function ChatPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) {
      router.replace('/login');
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <main className="flex h-screen items-center justify-center text-slate-400">
        Loading
      </main>
    );
  }

  return <ChatShell />;
}
