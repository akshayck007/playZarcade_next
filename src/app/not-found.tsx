import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-neon-cyan/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative w-24 h-24 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full flex items-center justify-center">
          <Search className="w-12 h-12 text-neon-cyan" />
        </div>
      </div>

      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl font-black uppercase tracking-tighter cyber-text-glow text-neon-cyan">
          404: Protocol Not Found
        </h1>
        <p className="text-white/40 font-mono text-sm leading-relaxed">
          [ERROR_404]: The requested game or page does not exist in the arcade database. 
          It may have been moved, deleted, or never existed.
        </p>
      </div>

      <Link
        href="/"
        className="flex items-center justify-center gap-2 px-8 py-3 bg-neon-cyan text-black rounded-full font-black uppercase tracking-tight hover:bg-white transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)]"
      >
        <Home className="w-4 h-4" />
        Return to Base
      </Link>
    </div>
  );
}
