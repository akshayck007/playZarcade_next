'use client';

// Error boundary for the application
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-4xl font-black uppercase tracking-tighter">Something went wrong!</h2>
        <p className="text-white/40 max-w-md mx-auto">We encountered an unexpected error. Please try refreshing the page or contact support if the issue persists.</p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors"
        >
          Try again
        </button>
        <Link 
          href="/"
          className="glass px-8 py-3 rounded-full font-bold uppercase tracking-tight hover:bg-white/10 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
