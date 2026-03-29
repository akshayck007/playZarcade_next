'use client';

import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronRight, Flame, Users, Swords, Car, Sparkles, ChevronLeft } from "lucide-react";

interface CategoryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenMore: () => void;
}

export function CategoryTabs({ activeTab, onTabChange, onOpenMore }: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const tabs = [
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'multiplayer-games', label: 'Multiplayer', icon: Users },
    { id: 'action-games', label: 'Action', icon: Swords },
    { id: 'racing-games', label: 'Racing', icon: Car },
    { id: 'puzzle-games', label: 'Puzzle', icon: Sparkles },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.5 
        : scrollLeft + clientWidth * 0.5;
      
      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-1 min-w-0">
      <div className="relative group/category-tabs flex-grow overflow-hidden">
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap skew-x-[-12deg] group ${
                activeTab === tab.id 
                  ? 'text-black' 
                  : 'text-white/40 hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.4)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2 skew-x-[12deg]">
                <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-black' : 'text-neon-cyan group-hover:scale-110 transition-transform'}`} />
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-8 bg-gradient-to-r from-black/80 to-transparent flex items-center justify-start pl-1 text-white/40 hover:text-neon-cyan transition-all opacity-0 group-hover/category-tabs:opacity-100 z-10 md:hidden"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-8 bg-gradient-to-l from-black/80 to-transparent flex items-center justify-end pr-1 text-white/40 hover:text-neon-cyan transition-all opacity-0 group-hover/category-tabs:opacity-100 z-10 md:hidden"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={onOpenMore}
        className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all whitespace-nowrap group border border-white/5 skew-x-[-12deg] shrink-0"
      >
        <span className="skew-x-[12deg] flex items-center gap-2">
          More
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
    </div>
  );
}
