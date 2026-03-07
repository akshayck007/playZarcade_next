import Link from 'next/link';
import { Search } from 'lucide-react';

export const runtime = "edge";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8">
      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
        <Search className="w-12 h-12 text-white/20" />
      </div>
      <div className="space-y-2">
        <h2 className="text-4xl font-black uppercase tracking-tighter">404 - Page Not Found</h2>
        <p className="text-white/40 max-w-md mx-auto">The page you are looking for doesn&apos;t exist or has been moved to a new location. Try searching for your favorite game!</p>
      </div>
      <div className="flex gap-4">
        <Link 
          href="/"
          className="bg-emerald-500 text-black px-12 py-4 rounded-full font-black uppercase tracking-tight text-xl hover:bg-emerald-400 transition-colors"
        >
          Back to Arcade
        </Link>
      </div>
    </div>
  );
}
