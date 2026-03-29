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

const TABS = [
  { name: "Featured", slug: "featured", icon: <Sparkles className="w-4 h-4" /> },
  { name: "New Releases", slug: "new-releases", icon: <Clock className="w-4 h-4" /> },
  { name: "Editor's Choice", slug: "editors-choice", icon: <Star className="w-4 h-4" /> },
  { name: "Continue Playing", slug: "continue-playing", icon: <History className="w-4 h-4" /> },
];

export function HomeTabsSection() {
  const supabase = createClientComponentClient();
  const [activeTab, setActiveTab] = useState<string>('featured');
  const [showContinuePlaying, setShowContinuePlaying] = useState(false);
  const [games, setGames] = useState<any[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Check for history to show/hide Continue Playing tab
  useEffect(() => {
    const checkHistory = async () => {
      const hasLocalHistory = (JSON.parse(localStorage.getItem('playz_history') || '[]')).length > 0 || 
                             (localStorage.getItem('playz_recently_played') ? JSON.parse(localStorage.getItem('playz_recently_played')!).length > 0 : false);
      
      if (hasLocalHistory) {
        setShowContinuePlaying(true);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('UserHistory')
          .select('id')
          .eq('userId', session.user.id)
          .limit(1);
        if (data && data.length > 0) setShowContinuePlaying(true);
      }
    };
    checkHistory();
  }, [supabase]);

  const filteredTabs = TABS.filter(t => t.slug !== 'continue-playing' || showContinuePlaying);

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

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const { scrollLeft, clientWidth } = tabsContainerRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.5 
        : scrollLeft + clientWidth * 0.5;
      
      tabsContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchGamesForTab = async () => {
      setLoadingGames(true);
      try {
        let fetchedGames: any[] = [];

        if (activeTab === 'continue-playing') {
          const { data: { session } } = await supabase.auth.getSession();
          let historyIds: string[] = [];

          if (session?.user) {
            const { data } = await supabase
              .from('UserHistory')
              .select('gameId')
              .eq('userId', session.user.id)
              .order('lastPlayedAt', { ascending: false })
              .limit(30);
            if (data) historyIds = data.map(h => h.gameId);
          }

          const localHistory = JSON.parse(localStorage.getItem('playz_history') || '[]');
          const combined = [...new Set([...historyIds, ...localHistory])].slice(0, 30);

          if (combined.length > 0) {
            const { data } = await supabase
              .from("Game")
              .select("*, Category(name, slug)")
              .in("id", combined)
              .eq("isPublished", true);
            
            if (data) {
              fetchedGames = combined
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
        } else if (activeTab === 'featured') {
          const { data } = await supabase
            .from("Game")
            .select("*, Category(name, slug)")
            .eq("isPublished", true)
            .order("qualityScore", { ascending: false })
            .limit(30);
          fetchedGames = data || [];
        } else if (activeTab === 'editors-choice') {
          // Fallback to quality score if no manual items assigned
          const { data: section } = await supabase.from("Section").select("id").eq("slug", "editors-choice").maybeSingle();
          if (section) {
            const { data: items } = await supabase
              .from("SectionItem")
              .select("Game(*, Category(name, slug))")
              .eq("sectionId", section.id)
              .order("order", { ascending: true })
              .limit(30);
            if (items && items.length > 0) {
              fetchedGames = items.map(i => i.Game).filter(Boolean);
            }
          }
          
          if (fetchedGames.length === 0) {
            const { data } = await supabase
              .from("Game")
              .select("*, Category(name, slug)")
              .eq("isPublished", true)
              .order("trendScore", { ascending: false })
              .limit(30);
            fetchedGames = data || [];
          }
        }

        setGames(fetchedGames);
      } catch (e) {
        console.error('Failed to fetch games', e);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchGamesForTab();
  }, [activeTab, supabase]);

  return (
    <section className="space-y-8">
      {/* Tabs Header */}
      <div className="relative group/tabs-header">
        <div 
          ref={tabsContainerRef}
          className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {filteredTabs.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveTab(tab.slug)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${activeTab === tab.slug 
                  ? 'bg-neon-cyan text-black shadow-[0_0_20px_rgba(0,243,255,0.3)]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'}
              `}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Navigation Arrows */}
        <button 
          onClick={() => scrollTabs('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-full bg-gradient-to-r from-black/80 to-transparent flex items-center justify-start pl-1 text-white/40 hover:text-neon-cyan transition-all opacity-0 group-hover/tabs-header:opacity-100 z-10 md:hidden"
          aria-label="Scroll Tabs Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={() => scrollTabs('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-full bg-gradient-to-l from-black/80 to-transparent flex items-center justify-end pr-1 text-white/40 hover:text-neon-cyan transition-all opacity-0 group-hover/tabs-header:opacity-100 z-10 md:hidden"
          aria-label="Scroll Tabs Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
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
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 glass rounded-full flex items-center justify-center text-white/50 hover:text-neon-cyan hover:border-neon-cyan/50 transition-all opacity-100 md:opacity-0 md:group-hover/tabs:opacity-100 z-20"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 glass rounded-full flex items-center justify-center text-white/50 hover:text-neon-cyan hover:border-neon-cyan/50 transition-all opacity-100 md:opacity-0 md:group-hover/tabs:opacity-100 z-20"
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
