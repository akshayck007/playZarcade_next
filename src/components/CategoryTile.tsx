'use client';

import { Check } from "lucide-react";

interface CategoryTileProps {
  category: any;
  isSelected: boolean;
  onToggle: (slug: string) => void;
}

export function CategoryTile({ category, isSelected, onToggle }: CategoryTileProps) {
  return (
    <button
      onClick={() => onToggle(category.slug)}
      className={`relative p-4 rounded-none border transition-all text-left group overflow-hidden skew-x-[-12deg] ${
        isSelected 
          ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.2)]' 
          : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center justify-between gap-2 skew-x-[12deg]">
        <span className="text-[10px] font-black uppercase tracking-widest truncate">{category.name}</span>
        {isSelected && (
          <div className="w-4 h-4 bg-neon-cyan rounded-none flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-black" />
          </div>
        )}
      </div>
      
      {/* Subtle background pattern or accent */}
      <div className={`absolute -right-2 -bottom-2 w-12 h-12 rounded-none blur-2xl transition-opacity ${
        isSelected ? 'bg-neon-cyan/20 opacity-100' : 'bg-white/5 opacity-0'
      }`} />
    </button>
  );
}
