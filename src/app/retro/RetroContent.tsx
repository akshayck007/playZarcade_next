'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Gamepad2, Filter, Search, LayoutGrid, List, SlidersHorizontal, ChevronDown, Monitor, Cpu, Trophy, Flame, History, Star, Clock, Play, ArrowRight } from 'lucide-react';
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

export default function RetroContent({ initialGames, retroEnabled: initialRetroEnabled }: { initialGames: any[], retroEnabled: boolean }) {
  const supabase = createClientComponentClient();
  const [games, setGames] = useState<any[]>(initialGames);
  const [isLoading, setIsLoading] = useState(false);
  const [retroEnabled, setRetroEnabled] = useState(initialRetroEnabled);
  const [selectedConsole, setSelectedConsole] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [sortBy, setSortBy] = useState('popularity');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      // Skip first load since we have initialGames
      if (selectedConsole === 'all' && selectedGenre === 'All Genres' && sortBy === 'popularity' && !searchQuery && games.length === initialGames.length) {
        return;
      }

      setIsLoading(true);
      try {
        // Fetch retro games
        let query = supabase
          .from('Game')
          .select('*, Category(*)')
          .eq('isPublished', true)
          .eq('isRetro', true);

        if (selectedConsole !== 'all') {
          query = query.eq('console', selectedConsole);
        }

        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }

        // Sorting logic
        if (sortBy === 'newest') {
          query = query.order('createdAt', { ascending: false });
        } else if (sortBy === 'alphabetical') {
          query = query.order('title', { ascending: true });
        } else if (sortBy === 'rating') {
          query = query.order('rating', { ascending: false });
        } else {
          query = query.order('playCount', { ascending: false });
        }

        const { data: retroGames } = await query;
        
        // Client-side genre filtering
        let filteredGames = retroGames || [];
        if (selectedGenre !== 'All Genres') {
          filteredGames = filteredGames.filter(g => 
            g.Category?.name === selectedGenre || 
            (g.tags && g.tags.includes(selectedGenre.toLowerCase()))
          );
        }

        setGames(filteredGames);
      } catch (err) {
        console.error('Error fetching retro games:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedConsole, selectedGenre, sortBy, searchQuery, supabase, initialGames.length]);

  if (!retroEnabled) {
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
      {/* Hero Section - Editorial Style */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://picsum.photos/seed/retro-arcade-hero/1920/1080?blur=10"
            alt="Retro Background"
            fill
            className="object-cover opacity-20 grayscale scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]"></div>
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-block px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-neon-cyan mb-6">
              Retro Mode Active
            </div>
            <h1 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter italic leading-[0.85] mb-6 mix-blend-difference">
              RETRO<br />
              <span className="text-neon-cyan cyber-text-glow">ARCADE</span>
            </h1>
            <p className="text-xs md:text-sm text-white/40 font-mono uppercase tracking-[0.4em] max-w-2xl mx-auto">
              Accessing the global retro database. Pixel-perfect emulation for the modern era.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-80 border-r border-white/5 p-8 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
          <div className="space-y-10">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 mb-8 flex items-center gap-3">
                <Monitor className="w-3.5 h-3.5" /> Systems
              </h3>
              <div className="space-y-2">
                {CONSOLES.map((console) => (
                  <button
                    key={console.id}
                    onClick={() => setSelectedConsole(console.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all text-[12px] font-black uppercase tracking-widest group relative overflow-hidden",
                      selectedConsole === console.id 
                        ? "bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.1)]" 
                        : "text-white/40 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <console.icon className={cn("w-4 h-4", selectedConsole === console.id ? "text-black" : "text-white/20 group-hover:text-neon-cyan")} />
                      {console.name}
                    </div>
                    {selectedConsole === console.id && (
                      <ArrowRight className="w-4 h-4 relative z-10" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 mb-8 flex items-center gap-3">
                <Filter className="w-3.5 h-3.5" /> Genres
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={cn(
                      "w-full text-left px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-transparent",
                      selectedGenre === genre 
                        ? "text-neon-cyan bg-neon-cyan/5 border-neon-cyan/20" 
                        : "text-white/30 hover:text-white/60 hover:bg-white/5"
                    )}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Console Bar */}
          <div className="lg:hidden sticky top-[72px] z-40 bg-[#050505]/90 backdrop-blur-2xl border-b border-white/10 px-4 py-4 overflow-x-auto flex gap-3 scrollbar-hide">
            {CONSOLES.map((console) => (
              <button
                key={console.id}
                onClick={() => setSelectedConsole(console.id)}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 rounded-xl border transition-all shrink-0 text-[11px] font-black uppercase tracking-widest",
                  selectedConsole === console.id 
                    ? "bg-white text-black border-white shadow-[0_10px_20px_rgba(255,255,255,0.1)]" 
                    : "bg-white/5 border-white/10 text-white/40"
                )}
              >
                <console.icon className="w-4 h-4" />
                {console.name}
              </button>
            ))}
          </div>

          {/* Search & Sort Bar */}
          <div className="sticky top-[72px] lg:top-[72px] z-30 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-8 py-6">
            <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
              <div className="relative w-full xl:w-[500px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="text" 
                  placeholder="SEARCH RETRO DATABASE..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs focus:outline-none focus:border-neon-cyan/50 transition-all font-mono uppercase tracking-[0.2em] placeholder:text-white/10"
                />
              </div>

              <div className="flex items-center gap-3 w-full xl:w-auto">
                <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/10 w-full xl:w-auto">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id)}
                      className={cn(
                        "flex-1 xl:flex-none flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest",
                        sortBy === option.id 
                          ? "bg-white text-black shadow-xl" 
                          : "text-white/20 hover:text-white/40"
                      )}
                      title={option.name}
                    >
                      <option.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          <main className="p-8 lg:p-12">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-48 gap-6">
                <div className="w-16 h-16 rounded-full border-t-2 border-neon-cyan animate-spin shadow-[0_0_30px_rgba(0,243,255,0.2)]"></div>
                <div className="space-y-2 text-center">
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 animate-pulse">
                    Loading Games...
                  </p>
                  <p className="text-[9px] font-mono text-white/10 uppercase tracking-widest">Accessing game library</p>
                </div>
              </div>
            ) : games.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-8 lg:gap-10">
                {games.map((game, index) => (
                  <GameItem key={game.id} game={game} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-48 border border-dashed border-white/10 rounded-[40px] bg-white/[0.01] flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8">
                  <Gamepad2 className="w-10 h-10 text-white/10" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter italic text-white/20 mb-3">
                  No Retro Games Found
                </h3>
                <p className="text-xs text-white/10 font-mono uppercase tracking-widest">
                  The requested library is currently empty.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function GameItem({ game, index }: { game: any, index: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link 
        href={`/game/${game.slug}`}
        className="group block relative bg-[#0a0a0a] border border-white/5 rounded-[32px] overflow-hidden hover:border-white/20 transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-[#0d0d0d] flex items-center justify-center">
          {!imgError && game.thumbnail ? (
            <Image 
              src={game.thumbnail}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.4] group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-white/5 group-hover:text-neon-cyan/20 transition-colors">
              <Gamepad2 className="w-20 h-20" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em]">{game.console}</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90 group-hover:opacity-60 transition-opacity"></div>
          
          {/* Console Badge */}
          <div className="absolute top-5 left-5 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-white group-hover:bg-neon-cyan group-hover:text-black transition-all">
            {game.console}
          </div>

          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-[4px]">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black shadow-[0_0_40px_rgba(255,255,255,0.3)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <h3 className="text-[13px] font-black uppercase tracking-tight text-white group-hover:text-neon-cyan transition-colors truncate mb-3">
            {game.title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] group-hover:text-white/40 transition-colors">
              {game.Category?.name || 'Retro'}
            </span>
            <div className="flex items-center gap-2 text-[10px] font-black text-white/30">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              {game.playCount?.toLocaleString() || '0'}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
