'use client';

import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";

interface CategoryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenMore: () => void;
}

export function CategoryTabs({ activeTab, onTabChange, onOpenMore }: CategoryTabsProps) {
  const tabs = [
    { id: 'trending', label: 'Trending' },
    { id: 'multiplayer-games', label: 'Multiplayer' },
    { id: 'action-games', label: 'Action' },
    { id: 'racing-games', label: 'Racing' },
  ];

  return (
    <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 no-scrollbar">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-black' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-emerald-500 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onOpenMore}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest text-white/40 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all whitespace-nowrap group"
      >
        More
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
