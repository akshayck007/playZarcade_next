'use client';

import { useState, useEffect } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CategoryTile } from "./CategoryTile";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onApply: (categories: string[]) => void;
}

export function CategoryModal({ isOpen, onClose, selectedCategories, onApply }: CategoryModalProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [tempSelected, setTempSelected] = useState<string[]>(selectedCategories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedCategories);
      fetchCategories();
    }
  }, [isOpen, selectedCategories]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (slug: string) => {
    setTempSelected(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = () => {
    onApply(tempSelected);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-dark-surface border border-neon-cyan/20 rounded-none overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.1)]"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-neon-cyan cyber-text-glow">Genre Protocol</h2>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Select target categories for filtering</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 glass rounded-none flex items-center justify-center hover:bg-white/10 transition-colors skew-x-[-12deg]"
              >
                <X className="w-5 h-5 skew-x-[12deg]" />
              </button>
            </div>

            {/* Search */}
            <div className="px-8 py-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-neon-cyan transition-colors" />
                <input 
                  type="text"
                  placeholder="SEARCH GENRES..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-none py-4 pl-12 pr-4 text-xs font-mono focus:outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="px-8 pb-8 max-h-[400px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">ACCESSING GENRES...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredCategories.map(cat => (
                    <CategoryTile 
                      key={cat.id}
                      category={cat}
                      isSelected={tempSelected.includes(cat.slug)}
                      onToggle={toggleCategory}
                    />
                  ))}
                  {filteredCategories.length === 0 && (
                    <div className="col-span-full py-10 text-center">
                      <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No categories found matching &quot;{search}&quot;</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 bg-white/5 border-t border-white/5 flex items-center justify-between">
              <button 
                onClick={() => setTempSelected([])}
                className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
              >
                Clear All
              </button>
              <button 
                onClick={handleApply}
                className="cyber-button text-xs"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
