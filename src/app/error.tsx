'use client';

import { useEffect } from 'react';
import { RefreshCcw, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
      </div>

      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl font-black uppercase tracking-tighter cyber-text-glow text-red-500">
          System Error
        </h1>
        <p className="text-white/40 font-mono text-sm leading-relaxed">
          [CRITICAL_FAILURE]: An unexpected error has occurred in the arcade systems. 
          The current operation could not be completed.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-black/50 border border-white/5 rounded-xl text-left overflow-auto max-h-40">
            <code className="text-[10px] text-red-400 font-mono">
              {error.message}
            </code>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-white/5 border border-white/10 rounded-full font-black uppercase tracking-tight hover:bg-white/10 hover:border-white/20 transition-all group"
        >
          <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          Reboot System
        </button>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-500 text-black rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          <Home className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
}
