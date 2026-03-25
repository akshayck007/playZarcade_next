'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Gamepad2, Filter, Search, LayoutGrid, List, SlidersHorizontal, ChevronDown, Monitor, Cpu, Trophy, Flame, History, Star, Clock, Play } from 'lucide-react';
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
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://picsum.photos/seed/retro-arcade/1920/1080?blur=10"
            alt="Retro Background"
            fill
            className="object-cover opacity-20 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]"></div>
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-4">
              RETRO<span className="text-neon-cyan cyber-text-glow">ARCADE</span>
            </h1>
            <p className="text-sm md:text-base text-white/40 font-mono uppercase tracking-[0.2em]">
              Legacy Protocol v2.5 // Pixel-Perfect Emulation
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-72 border-r border-white/5 p-6 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
          <div className="space-y-8">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6 flex items-center gap-2">
                <Monitor className="w-3 h-3" /> Systems
              </h3>
              <div className="space-y-1">
                {CONSOLES.map((console) => (
                  <button
                    key={console.id}
                    onClick={() => setSelectedConsole(console.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wider group",
                      selectedConsole === console.id 
                        ? "bg-neon-cyan text-black shadow-[0_0_20px_rgba(0,243,255,0.2)]" 
                        : "text-white/40 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <console.icon className={cn("w-4 h-4", selectedConsole === console.id ? "text-black" : "text-white/20 group-hover:text-neon-cyan")} />
                    {console.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6 flex items-center gap-2">
                <Filter className="w-3 h-3" /> Genres
              </h3>
              <div className="grid grid-cols-1 gap-1">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all",
                      selectedGenre === genre 
                        ? "text-neon-cyan border-l-2 border-neon-cyan pl-6" 
                        : "text-white/30 hover:text-white/60"
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
          <div className="lg:hidden sticky top-[72px] z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 overflow-x-auto flex gap-2 scrollbar-hide">
            {CONSOLES.map((console) => (
              <button
                key={console.id}
                onClick={() => setSelectedConsole(console.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all shrink-0 text-[10px] font-black uppercase tracking-widest",
                  selectedConsole === console.id 
                    ? "bg-neon-cyan text-black border-neon-cyan" 
                    : "bg-white/5 border-white/10 text-white/40"
                )}
              >
                <console.icon className="w-3 h-3" />
                {console.name}
              </button>
            ))}
          </div>

          {/* Search & Sort Bar */}
          <div className="sticky top-[72px] lg:top-[72px] z-30 bg-[#050505]/60 backdrop-blur-md border-b border-white/5 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="text" 
                  placeholder="SEARCH LEGACY DATABASE..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-neon-cyan/50 transition-all font-mono uppercase tracking-widest"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 w-full sm:w-auto">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id)}
                      className={cn(
                        "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg transition-all text-[9px] font-black uppercase tracking-tighter",
                        sortBy === option.id 
                          ? "bg-white/10 text-white shadow-inner" 
                          : "text-white/20 hover:text-white/40"
                      )}
                      title={option.name}
                    >
                      <option.icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          <main className="p-6 lg:p-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-12 h-12 rounded-full border-t-2 border-neon-cyan animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 animate-pulse">
                  Synchronizing Legacy Data...
                </p>
              </div>
            ) : games.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8">
                {games.map((game, index) => (
                  <GameItem key={game.id} game={game} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
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
      </div>
    </div>
  );
}

function GameItem({ game, index }: { game: any, index: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link 
        href={`/game/${game.slug}`}
        className="group block relative bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-neon-cyan/50 transition-all hover:shadow-[0_0_40px_rgba(0,243,255,0.15)]"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-dark-surface flex items-center justify-center">
          {!imgError && game.thumbnail ? (
            <Image 
              src={game.thumbnail}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-white/5 group-hover:text-neon-cyan/20 transition-colors">
              <Gamepad2 className="w-16 h-16" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">{game.console}</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
          
          {/* Console Badge */}
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest text-neon-cyan group-hover:bg-neon-cyan group-hover:text-black transition-all">
            {game.console}
          </div>

          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
            <div className="w-14 h-14 rounded-full bg-neon-cyan flex items-center justify-center text-black shadow-[0_0_30px_rgba(0,243,255,0.6)] transform scale-50 group-hover:scale-100 transition-transform">
              <Play className="w-7 h-7 fill-current ml-1" />
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-5">
          <h3 className="text-[11px] lg:text-xs font-black uppercase tracking-tight text-white group-hover:text-neon-cyan transition-colors truncate mb-2">
            {game.title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">
              {game.Category?.name || 'Retro'}
            </span>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-white/30">
              <Flame className="w-3 h-3 text-orange-500 animate-pulse" />
              {game.playCount?.toLocaleString() || '0'}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
