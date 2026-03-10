'use client';

import { motion } from "motion/react";
import { ChevronRight, Flame, Users, Swords, Car } from "lucide-react";

interface CategoryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenMore: () => void;
}

export function CategoryTabs({ activeTab, onTabChange, onOpenMore }: CategoryTabsProps) {
  const tabs = [
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'multiplayer-games', label: 'Multiplayer', icon: Users },
    { id: 'action-games', label: 'Action', icon: Swords },
    { id: 'racing-games', label: 'Racing', icon: Car },
  ];

  return (
    <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 no-scrollbar">
      <div className="flex items-center gap-2">
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

      <button
        onClick={onOpenMore}
        className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all whitespace-nowrap group border border-white/5 skew-x-[-12deg]"
      >
        <span className="skew-x-[12deg] flex items-center gap-2">
          More
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
    </div>
  );
}
