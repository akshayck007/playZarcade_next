'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { CategoryTabs } from "./CategoryTabs";
import { SortFilter } from "./SortFilter";
import { GameCard } from "./GameCard";
import { CategoryModal } from "./CategoryModal";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function TrendingSection() {
  const [activeTab, setActiveTab] = useState('trending');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState('trend_score');
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastGameElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prev => prev + 8);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  // Fetch games based on filters
  const fetchGames = useCallback(async (reset = false, targetOffset: number) => {
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    try {
      let categoriesParam = selectedCategories.join(',');
      
      // If tab is active and not 'trending', add it to categories
      if (activeTab !== 'trending' && !selectedCategories.includes(activeTab)) {
        categoriesParam = categoriesParam ? `${categoriesParam},${activeTab}` : activeTab;
      }

      const res = await fetch(`/api/games?categories=${categoriesParam}&sort=${sort}&limit=8&offset=${targetOffset}`);
      const data = await res.json();
      
      if (data.success) {
        if (reset) {
          setGames(data.games);
        } else {
          setGames(prev => [...prev, ...data.games]);
        }
        setHasMore(data.games.length === 8);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, selectedCategories, sort]);

  useEffect(() => {
    fetchGames(true, 0);
  }, [activeTab, selectedCategories, sort, fetchGames]);

  useEffect(() => {
    if (offset > 0) {
      fetchGames(false, offset);
    }
  }, [offset, fetchGames]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedCategories([]); // Clear multi-select when switching main tabs
    if (tab === 'trending') {
      setSort('trend_score');
    }
  };

  const handleApplyCategories = (categories: string[]) => {
    setSelectedCategories(categories);
    if (categories.length > 0) {
      setActiveTab('custom'); // Mark as custom if categories are selected via modal
    } else {
      setActiveTab('trending');
    }
  };

  return (
    <div className="space-y-8">
      {/* Task 3 & 6: Tabs and Sort - Now at the top */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <CategoryTabs 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            onOpenMore={() => setIsModalOpen(true)}
          />
          {/* Hide sort filter for trending tab as requested */}
          {activeTab !== 'trending' && (
            <SortFilter currentSort={sort} onSortChange={setSort} />
          )}
        </div>

        {/* Game Grid */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              >
                <Loader2 className="w-10 h-10 text-neon-cyan animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">ACCESSING DATABASE...</span>
              </motion.div>
            ) : (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6"
              >
                {games.map((game, index) => {
                  if (games.length === index + 1) {
                    return (
                      <div ref={lastGameElementRef} key={game.id}>
                        <GameCard game={game} />
                      </div>
                    );
                  } else {
                    return <GameCard key={game.id} game={game} />;
                  }
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!loading && games.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p className="text-white/20 font-black uppercase tracking-widest">No games found for this filter</p>
              <button 
                onClick={() => {
                  setActiveTab('trending');
                  setSelectedCategories([]);
                }}
                className="text-xs font-bold text-neon-cyan uppercase tracking-widest hover:underline"
              >
                Reset Connection
              </button>
            </div>
          )}

          {/* Loading More Spinner */}
          {loadingMore && (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-neon-cyan animate-spin" />
            </div>
          )}
        </div>
      </section>

      {/* Task 4 & 5: Category Modal */}
      <CategoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedCategories={selectedCategories}
        onApply={handleApplyCategories}
      />
    </div>
  );
}
