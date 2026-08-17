'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-context';
import { AuthCard } from '@/features/auth/components/auth-card';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await register(email, password, displayName);
      router.replace('/chat');
    } catch {
      setError('Could not create the account');
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthCard
      title="Create account"
      error={error}
      footer={
        <Link href="/login" className="text-blue-600 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <input
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Display name"
          required
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password (min 8 characters)"
          minLength={8}
          required
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Create account
        </button>
      </form>
    </AuthCard>
  );
}
