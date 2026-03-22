'use client';

import { useEffect, useState, useRef } from 'react';
import { GameCard } from './GameCard';
import { Sparkles, Loader2, ChevronLeft, ChevronRight, History, Star, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Section {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export function HomeTabsSection() {
  const supabase = createClientComponentClient();
  const [activeTab, setActiveTab] = useState<string>('featured');
  const [tabs, setTabs] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loadingTabs, setLoadingTabs] = useState(true);
  const [loadingGames, setLoadingGames] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getIcon = (slug: string) => {
    switch (slug) {
      case 'featured': return <Sparkles className="w-4 h-4" />;
      case 'continue-playing': return <History className="w-4 h-4" />;
      case 'new-releases': return <Clock className="w-4 h-4" />;
      case 'editors-choice': return <Star className="w-4 h-4" />;
      case 'top-games': return <TrendingUp className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    const fetchTabs = async () => {
      setLoadingTabs(true);
      try {
        const { data } = await supabase
          .from("Section")
          .select("*")
          .order("order", { ascending: true });
        
        if (data && data.length > 0) {
          setTabs(data);
          // Only set active tab if not already set or if current active tab is not in new tabs
          if (!data.find(t => t.slug === activeTab)) {
            setActiveTab(data[0].slug);
          }
        }
      } catch (e) {
        console.error('Failed to fetch tabs', e);
      } finally {
        setLoadingTabs(false);
      }
    };
    fetchTabs();
  }, [supabase]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      
      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchGamesForTab = async () => {
      console.log('[HomeTabsSection] Fetching games for tab:', activeTab);
      setLoadingGames(true);
      try {
        let fetchedGames: any[] = [];

        if (activeTab === 'continue-playing') {
          let history = JSON.parse(localStorage.getItem('playz_history') || '[]');
          
          // Fallback to playz_recently_played if history is empty (migration)
          if (history.length === 0) {
            const stored = localStorage.getItem('playz_recently_played');
            if (stored) {
              try {
                const recent = JSON.parse(stored);
                history = recent.map((g: any) => g.id).filter(Boolean);
                if (history.length > 0) {
                  localStorage.setItem('playz_history', JSON.stringify(history));
                }
              } catch (e) {}
            }
          }

          if (history.length > 0) {
            const { data } = await supabase
              .from("Game")
              .select("*, Category(name, slug)")
              .in("id", history.slice(0, 30))
              .eq("isPublished", true);
            
            // Reorder to match history
            if (data) {
              fetchedGames = history
                .map((id: string) => data.find(g => g.id === id))
                .filter(Boolean);
            }
          }
        } else if (activeTab === 'new-releases') {
          const { data } = await supabase
            .from("Game")
            .select("*, Category(name, slug)")
            .eq("isPublished", true)
            .order("createdAt", { ascending: false })
            .limit(30);
          fetchedGames = data || [];
        } else {
          // Featured or Editor's Choice
          const { data: section } = await supabase
            .from("Section")
            .select("id")
            .eq("slug", activeTab)
            .maybeSingle();

          let manualGames: any[] = [];
          if (section) {
            const { data: items } = await supabase
              .from("SectionItem")
              .select("*, Game(*, Category(name, slug))")
              .eq("sectionId", section.id)
              .order("order", { ascending: true })
              .limit(30);

            if (items && items.length > 0) {
              manualGames = items.map(item => item.Game).filter(Boolean);
            }
          }
          
          if (activeTab === 'featured') {
            // Fetch automatic featured games
            const { data: autoGames } = await supabase
              .from("Game")
              .select("*, Category(name, slug)")
              .eq("isFeatured", true)
              .eq("isPublished", true)
              .order("qualityScore", { ascending: false })
              .limit(30);
            
            // Merge manual and automatic, manual first, no duplicates
            const merged = [...manualGames];
            if (autoGames) {
              autoGames.forEach(ag => {
                if (!merged.find(mg => mg.id === ag.id)) {
                  merged.push(ag);
                }
              });
            }
            fetchedGames = merged.slice(0, 30);
          } else {
            fetchedGames = manualGames;
          }
        }

        setGames(fetchedGames);
      } catch (e) {
        console.error('Failed to fetch games for tab', e);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchGamesForTab();
  }, [activeTab, supabase]);

  return (
    <section className="space-y-8">
      {/* Tabs Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
          {loadingTabs ? (
            <div className="flex items-center gap-4 px-6 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-white/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Loading Tabs...</span>
            </div>
          ) : (
            tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.slug)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                  ${activeTab === tab.slug 
                    ? 'bg-neon-cyan text-black shadow-[0_0_20px_rgba(0,243,255,0.3)]' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'}
                `}
              >
                {getIcon(tab.slug)}
                {tab.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Games List */}
      <div className="relative group/tabs">
        {loadingGames ? (
          <div className="h-[300px] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/10">Fetching Data...</span>
          </div>
        ) : games.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center gap-4 glass rounded-3xl border border-white/5">
            <p className="text-white/20 font-black uppercase tracking-widest">No games found in this section</p>
          </div>
        ) : (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0"
          >
            {games.map((game, index) => (
              <div
                key={`${activeTab}-${game.id}`}
                className="min-w-[280px] md:min-w-[320px] snap-start"
              >
                <GameCard game={game} />
              </div>
            ))}
          </motion.div>
        )}
        
        {/* Navigation Arrows */}
        {!loadingGames && games.length > 0 && (
          <>
            <button 
              onClick={() => scroll('left')}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 glass rounded-full flex items-center justify-center text-white/50 hover:text-neon-cyan hover:border-neon-cyan/50 transition-all opacity-0 group-hover/tabs:opacity-100 hidden md:flex z-20"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 glass rounded-full flex items-center justify-center text-white/50 hover:text-neon-cyan hover:border-neon-cyan/50 transition-all opacity-0 group-hover/tabs:opacity-100 hidden md:flex z-20"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Gradient Fades for Scroll */}
            <div className="absolute left-0 top-0 bottom-6 w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none opacity-0 group-hover/tabs:opacity-100 transition-opacity hidden md:block" />
            <div className="absolute right-0 top-0 bottom-6 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none opacity-0 group-hover/tabs:opacity-100 transition-opacity hidden md:block" />
          </>
        )}
      </div>
    </section>
  );
}
