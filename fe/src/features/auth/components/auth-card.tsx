'use client';

interface AuthCardProps {
  title: string;
  error: string | null;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthCard({ title, error, children, footer }: AuthCardProps) {
  return (
    <main className="flex h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold text-slate-800">{title}</h1>
        {error ? (
          <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {children}
        <div className="mt-4 text-center text-sm text-slate-500">{footer}</div>
      </div>
    </main>
  );
}
