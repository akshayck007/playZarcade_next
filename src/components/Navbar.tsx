'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, Menu, X, Loader2, Play, LogOut, User, Home, Flame, History, ShieldCheck, LogIn, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ThemeToggle } from './ThemeToggle';
import { isAdmin } from '@/lib/auth';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface NavbarProps {
  categories: Category[];
}

export function Navbar({ categories }: NavbarProps) {
  const supabase = createClientComponentClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGenresOpen, setIsGenresOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [user, setUser] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      setShowSuggestions(true);
      try {
        const res = await fetch(`/api/games?q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.games);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
      setShowSuggestions(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase italic cyber-text-glow text-neon-cyan">
            PlayZ<span className="text-white italic">Arcade</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-widest text-white/60">
            <Link href="/" className="hover:text-neon-cyan transition-colors flex items-center gap-2">
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
            <Link href="/trending" className="hover:text-neon-cyan transition-colors flex items-center gap-2">
              <Flame className="w-3.5 h-3.5" />
              Trending
            </Link>
            <Link href="/blog" className="hover:text-neon-cyan transition-colors flex items-center gap-2">
              <Newspaper className="w-3.5 h-3.5" />
              Blog
            </Link>
            
            {/* Genres Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsGenresOpen(true)}
              onMouseLeave={() => setIsGenresOpen(false)}
            >
              <button className="flex items-center gap-1 hover:text-white transition-colors py-2">
                Genres <ChevronDown className={cn("w-4 h-4 transition-transform", isGenresOpen && "rotate-180")} />
              </button>
              
              {isGenresOpen && (
                <div 
                  className="absolute top-full left-0 w-96 bg-dark-surface border border-neon-cyan/20 rounded-2xl p-4 shadow-[0_0_50px_rgba(0,243,255,0.1)] origin-top-left z-50"
                >
                  <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-neon-cyan/10">
                    {categories.map((cat) => (
                      <Link 
                        key={cat.id} 
                        href={`/${cat.slug}`}
                        className="px-4 py-2 rounded-xl hover:bg-neon-cyan/10 text-white/80 hover:text-neon-cyan transition-colors text-xs font-black uppercase tracking-widest"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 hover:text-neon-cyan transition-colors">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 text-neon-cyan animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-white/30" />
                )}
              </button>
              <input 
                type="text" 
                placeholder="SEARCH PROTOCOL..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-1.5 text-xs w-64 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all font-mono"
              />
            </form>

            {showSuggestions && (searchQuery.length >= 2) && (
              <div
                className="absolute top-full right-0 mt-2 w-[400px] bg-dark-surface border border-neon-cyan/20 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.15)] z-[60]"
              >
                <div className="p-2 space-y-1">
                  {suggestions.length > 0 ? (
                    <>
                      <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5 mb-1">
                        Matching Protocols
                      </div>
                      {suggestions.map((game) => (
                        <Link
                          key={game.id}
                          href={`/game/${game.slug}`}
                          onClick={() => setShowSuggestions(false)}
                          className="flex items-center gap-3 p-2 hover:bg-neon-cyan/10 rounded-lg group transition-colors"
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10">
                            <Image
                              src={game.thumbnail}
                              alt={game.title}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-black uppercase tracking-tight text-white group-hover:text-neon-cyan transition-colors truncate">
                              {game.title}
                            </div>
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                              {game.Category?.name}
                            </div>
                          </div>
                          <Play className="w-4 h-4 text-neon-cyan opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" />
                        </Link>
                      ))}
                      <button
                        onClick={handleSearch}
                        className="w-full mt-2 p-3 text-[10px] font-black uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan/5 transition-colors border-t border-white/5"
                      >
                        View all results for &quot;{searchQuery}&quot;
                      </button>
                    </>
                  ) : !isSearching ? (
                    <div className="p-8 text-center">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/20">
                        No matching protocols found
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 flex flex-col items-center gap-3">
                      <Loader2 className="w-6 h-6 text-neon-cyan animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Accessing Database...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <ThemeToggle />

          {user ? (
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center overflow-hidden hover:border-neon-cyan transition-all"
              >
                {user.user_metadata?.avatar_url ? (
                  <Image 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    width={40} 
                    height={40} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-5 h-5 text-neon-cyan" />
                )}
              </button>

                {isProfileOpen && (
                  <div
                    className="absolute top-full right-0 mt-2 w-48 bg-dark-surface border border-white/10 rounded-xl p-2 shadow-2xl z-50"
                  >
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 truncate">
                        {user.email}
                      </p>
                    </div>
                    {isAdmin(user) && (
                      <Link 
                        href="/admin" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-xs font-bold transition-colors text-emerald-500"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button 
                      onClick={async () => {
                        await supabase.auth.signOut();
                        setIsProfileOpen(false);
                        router.refresh();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-500 text-xs font-bold transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
            </div>
          ) : (
            <Link 
              href="/login"
              className="cyber-button text-xs flex items-center gap-2"
            >
              <span className="hidden sm:inline">Login</span>
              <LogIn className="w-4 h-4 sm:hidden" />
            </Link>
          )}

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
      {isMenuOpen && (
        <div 
          className="md:hidden absolute top-full left-0 w-full bg-[#0a0a0a] border-b border-white/10 overflow-hidden z-50"
        >
          <nav className="flex flex-col gap-4 py-6 px-6">
            <div className="relative mb-4">
              <form onSubmit={handleSearch} className="relative">
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 hover:text-neon-cyan transition-colors">
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 text-neon-cyan animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 text-white/30" />
                  )}
                </button>
                <input 
                  type="text" 
                  placeholder="SEARCH PROTOCOL..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm w-full focus:outline-none focus:border-neon-cyan/50 transition-all font-mono"
                />
              </form>

              {showSuggestions && searchQuery.length >= 2 && suggestions.length > 0 && (
                <div
                  className="mt-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                >
                  {suggestions.map((game) => (
                    <Link
                      key={game.id}
                      href={`/game/${game.slug}`}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowSuggestions(false);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-neon-cyan/10 transition-colors border-b border-white/5 last:border-0"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                        <Image
                          src={game.thumbnail}
                          alt={game.title}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black uppercase tracking-tight text-white truncate">
                          {game.title}
                        </div>
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                          {game.Category?.name}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Interface Theme</span>
              <ThemeToggle />
            </div>

            <Link href="/" className="text-lg font-bold uppercase tracking-tight flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
              <Home className="w-5 h-5 text-neon-cyan" />
              Home
            </Link>
            <Link href="/trending" className="text-lg font-bold uppercase tracking-tight flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
              <Flame className="w-5 h-5 text-neon-cyan" />
              Trending
            </Link>
            <Link href="/blog" className="text-lg font-bold uppercase tracking-tight flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
              <Newspaper className="w-5 h-5 text-neon-cyan" />
              Blog
            </Link>
            <Link href="/recently-played" className="text-lg font-bold uppercase tracking-tight flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
              <History className="w-5 h-5 text-neon-cyan" />
              Recently Played
            </Link>
            
            {user ? (
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  setIsMenuOpen(false);
                  router.refresh();
                }}
                className="text-lg font-bold uppercase tracking-tight text-red-500 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            ) : (
              <Link href="/login" className="text-lg font-bold uppercase tracking-tight text-emerald-500" onClick={() => setIsMenuOpen(false)}>Login / Sign Up</Link>
            )}
            
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
        </div>
      )}
    </header>
  );
}
