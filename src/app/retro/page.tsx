'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Gamepad2, Filter, Search, LayoutGrid, List, SlidersHorizontal, ChevronDown, Monitor, Cpu, Trophy, Flame, History, Star, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const CONSOLES = [
  { id: 'all', name: 'All Consoles', icon: LayoutGrid },
  { id: 'nes', name: 'NES', icon: Monitor },
  { id: 'snes', name: 'SNES', icon: Cpu },
  { id: 'gba', name: 'Game Boy Advance', icon: Gamepad2 },
  { id: 'n64', name: 'Nintendo 64', icon: Trophy },
  { id: 'genesis', name: 'Sega Genesis', icon: Monitor },
  { id: 'mame', name: 'Arcade (MAME)', icon: Monitor },
  { id: 'psx', name: 'PlayStation 1', icon: Gamepad2 },
  { id: 'psp', name: 'PSP', icon: Gamepad2 },
  { id: 'play', name: 'PlayStation 2', icon: Gamepad2 },
];

const GENRES = [
  'All Genres',
  'Action',
  'Adventure',
  'Platformer',
  'RPG',
  'Puzzle',
  'Sports',
  'Racing',
  'Fighting',
  'Shooter',
];

const SORT_OPTIONS = [
  { id: 'popularity', name: 'Most Popular', icon: Flame },
  { id: 'newest', name: 'Newest Added', icon: Clock },
  { id: 'rating', name: 'Top Rated', icon: Star },
  { id: 'alphabetical', name: 'A-Z', icon: List },
];

export default function RetroPage() {
  const supabase = createClientComponentClient();
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retroEnabled, setRetroEnabled] = useState(true);
  const [selectedConsole, setSelectedConsole] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [sortBy, setSortBy] = useState('popularity');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch settings first
        const { data: settings } = await supabase
          .from("Settings")
          .select("retroEnabled")
          .eq("id", "global")
          .maybeSingle();
        
        if (settings && settings.retroEnabled === false) {
          setRetroEnabled(false);
          setIsLoading(false);
          return;
        }

        // Fetch retro games
        let query = supabase
          .from('Game')
          .select('*, Category(*)')
          .eq('isPublished', true)
          .eq('isRetro', true);

        if (selectedConsole !== 'all') {
          query = query.eq('console', selectedConsole);
        }

        if (selectedGenre !== 'All Genres') {
          query = query.filter('Category.name', 'eq', selectedGenre);
        }

        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }

        // Sorting logic (simplified for now)
        if (sortBy === 'newest') {
          query = query.order('createdAt', { ascending: false });
        } else if (sortBy === 'alphabetical') {
          query = query.order('title', { ascending: true });
        } else {
          query = query.order('playCount', { ascending: false });
        }

        const { data: retroGames } = await query;
        setGames(retroGames || []);
      } catch (err) {
        console.error('Error fetching retro games:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedConsole, selectedGenre, sortBy, searchQuery, supabase]);

  if (!isLoading && !retroEnabled) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
          <Gamepad2 className="w-12 h-12 text-white/20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Retro Arcade Offline</h2>
          <p className="text-white/40 max-w-md mx-auto">The retro section is currently disabled by the administrator. Please check back later or explore our modern collection!</p>
        </div>
        <Link href="/" className="bg-neon-cyan text-black px-8 py-3 rounded-full font-black uppercase tracking-tight hover:bg-white transition-colors">
          Return to Base
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-neon-cyan selection:text-black">
      {/* Hero Section - Editorial/Magazine Style */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://picsum.photos/seed/retro-arcade/1920/1080?blur=10"
            alt="Retro Background"
            fill
            className="object-cover opacity-20 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]"></div>
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-black uppercase tracking-[0.3em] mb-6 animate-pulse">
              Legacy Protocol Initialized
            </span>
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter italic mb-6 leading-none">
              RETRO<span className="text-neon-cyan cyber-text-glow">ARCADE</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
              Experience the golden age of gaming. Pixel-perfect emulation for NES, SNES, GBA, and more. No downloads, just play.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="#games" className="bg-neon-cyan text-black px-8 py-4 rounded-full font-black uppercase tracking-tight hover:bg-white transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                Browse Collection
              </Link>
              <Link href="/test-ps2" className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-black uppercase tracking-tight hover:bg-white/10 transition-all backdrop-blur-md flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Test Custom ISO
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar - Hardware/Specialist Tool Style */}
      <div className="sticky top-[72px] z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
            {CONSOLES.map((console) => (
              <button
                key={console.id}
                onClick={() => setSelectedConsole(console.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shrink-0 text-[10px] font-black uppercase tracking-widest",
                  selectedConsole === console.id 
                    ? "bg-neon-cyan text-black border-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.3)]" 
                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white"
                )}
              >
                <console.icon className="w-3.5 h-3.5" />
                {console.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text" 
                placeholder="SEARCH RETRO TITLES..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-neon-cyan/50 transition-all font-mono"
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "p-2 rounded-xl border transition-all",
                isFilterOpen ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan" : "bg-white/5 border-white/10 text-white/40"
              )}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Advanced Filters Dropdown */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="max-w-7xl mx-auto pt-6 pb-2 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5 mt-4">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4 flex items-center gap-2">
                    <Filter className="w-3 h-3" /> Genre Filter
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-tight transition-all",
                          selectedGenre === genre 
                            ? "bg-white/10 border-white/30 text-white" 
                            : "bg-transparent border-white/5 text-white/30 hover:border-white/10"
                        )}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4 flex items-center gap-2">
                    <LayoutGrid className="w-3 h-3" /> Sort By
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSortBy(option.id)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-tight transition-all",
                          sortBy === option.id 
                            ? "bg-white/10 border-white/30 text-white" 
                            : "bg-transparent border-white/5 text-white/30 hover:border-white/10"
                        )}
                      >
                        <option.icon className="w-4 h-4" />
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Games Grid - Technical Dashboard Style */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 rounded-full border-t-2 border-neon-cyan animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 animate-pulse">
              Accessing Legacy Vault...
            </p>
          </div>
        ) : games.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link 
                  href={`/game/${game.slug}`}
                  className="group block relative bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-neon-cyan/50 transition-all hover:shadow-[0_0_30px_rgba(0,243,255,0.1)]"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image 
                      src={game.thumbnail}
                      alt={game.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60"></div>
                    
                    {/* Console Badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest text-neon-cyan">
                      {game.console}
                    </div>

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                      <div className="w-12 h-12 rounded-full bg-neon-cyan flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,243,255,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-xs font-black uppercase tracking-tight text-white group-hover:text-neon-cyan transition-colors truncate mb-1">
                      {game.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                        {game.Category?.name}
                      </span>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-white/30">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {game.playCount?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl">
            <Gamepad2 className="w-16 h-16 text-white/10 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white/40 mb-2">
              No Legacy Data Found
            </h3>
            <p className="text-sm text-white/20 font-medium">
              Try adjusting your filters or search query.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
