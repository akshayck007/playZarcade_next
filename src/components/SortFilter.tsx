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
        className="flex items-center gap-3 px-6 py-3 glass rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
      >
        <currentOption.icon className="w-4 h-4 text-emerald-500" />
        {currentOption.label}
        <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-56 bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
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
                      ? 'bg-emerald-500 text-black' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <opt.icon className={`w-4 h-4 ${currentSort === opt.id ? 'text-black' : 'text-emerald-500'}`} />
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
