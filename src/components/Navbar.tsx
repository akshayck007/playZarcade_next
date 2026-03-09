'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface NavbarProps {
  categories: Category[];
}

export function Navbar({ categories }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGenresOpen, setIsGenresOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tighter uppercase italic">
            PlayZ<span className="text-emerald-500 italic">Arcade</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/trending" className="hover:text-white transition-colors">Trending</Link>
            
            {/* Genres Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsGenresOpen(true)}
              onMouseLeave={() => setIsGenresOpen(false)}
            >
              <button className="flex items-center gap-1 hover:text-white transition-colors py-2">
                Genres <ChevronDown className={cn("w-4 h-4 transition-transform", isGenresOpen && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {isGenresOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 w-96 bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 shadow-2xl origin-top-left z-50"
                  >
                    <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                      {categories.map((cat) => (
                        <Link 
                          key={cat.id} 
                          href={`/${cat.slug}`}
                          className="px-4 py-2 rounded-xl hover:bg-white/5 text-white/80 hover:text-emerald-500 transition-colors text-sm font-bold uppercase tracking-tight"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search games..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </form>
          
          <Link 
            href="/login"
            className="bg-emerald-500 text-black px-6 py-1.5 rounded-full text-sm font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Login
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-white/60 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden absolute top-full left-0 w-full bg-[#0a0a0a] border-b border-white/10 overflow-hidden z-50"
          >
            <nav className="flex flex-col gap-4 py-6 px-6">
              <form onSubmit={handleSearch} className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search games..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </form>
              <Link href="/" className="text-lg font-bold uppercase tracking-tight" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link href="/trending" className="text-lg font-bold uppercase tracking-tight" onClick={() => setIsMenuOpen(false)}>Trending</Link>
              <Link href="/login" className="text-lg font-bold uppercase tracking-tight text-emerald-500" onClick={() => setIsMenuOpen(false)}>Login / Sign Up</Link>
              
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-white/30">All Genres</span>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <Link 
                      key={cat.id} 
                      href={`/${cat.slug}`}
                      className="px-4 py-2 rounded-xl bg-white/5 text-sm font-bold uppercase tracking-tight"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
