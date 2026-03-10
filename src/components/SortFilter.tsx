'use client';

import { ChevronDown, BarChart3, TrendingUp, Star, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SortFilterProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

export function SortFilter({ currentSort, onSortChange }: SortFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { id: 'trend_score', label: 'Trending', icon: TrendingUp },
    { id: 'play_count', label: 'Most Popular', icon: BarChart3 },
    { id: 'quality_score', label: 'Best Quality', icon: Star },
    { id: 'newest', label: 'Newest', icon: Sparkles },
  ];

  const currentOption = options.find(opt => opt.id === currentSort) || options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-6 py-3 bg-dark-surface border border-neon-cyan/20 rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-neon-cyan/5 transition-all skew-x-[-12deg]"
      >
        <span className="skew-x-[12deg] flex items-center gap-3">
          <currentOption.icon className="w-4 h-4 text-neon-cyan cyber-text-glow" />
          {currentOption.label}
          <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-56 bg-dark-surface border border-neon-cyan/30 rounded-none overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.1)] z-50"
            >
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSortChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${
                    currentSort === opt.id 
                      ? 'bg-neon-cyan text-black' 
                      : 'text-white/60 hover:bg-neon-cyan/10 hover:text-neon-cyan'
                  }`}
                >
                  <opt.icon className={`w-4 h-4 ${currentSort === opt.id ? 'text-black' : 'text-neon-cyan'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
