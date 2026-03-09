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
      className={`relative p-4 rounded-2xl border transition-all text-left group overflow-hidden ${
        isSelected 
          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
          : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-black uppercase tracking-tight truncate">{category.name}</span>
        {isSelected && (
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-black" />
          </div>
        )}
      </div>
      
      {/* Subtle background pattern or accent */}
      <div className={`absolute -right-2 -bottom-2 w-12 h-12 rounded-full blur-2xl transition-opacity ${
        isSelected ? 'bg-emerald-500/20 opacity-100' : 'bg-white/5 opacity-0'
      }`} />
    </button>
  );
}
