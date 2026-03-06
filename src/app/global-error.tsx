'use client';

// Global error boundary for the root layout
import { useEffect } from 'react';

export default function GlobalError({
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
    <html>
      <body>
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Critical Error</h2>
          <p className="text-white/40 mb-8 max-w-md">A critical error occurred in the application root. Please try refreshing.</p>
          <button
            onClick={() => reset()}
            className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
