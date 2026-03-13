'use client';

import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Zap, Palette } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes = [
    { id: 'cyber-pink', label: 'Cyber Pink', icon: Zap, color: 'text-neon-magenta' },
    { id: 'midnight', label: 'Midnight', icon: Moon, color: 'text-neon-cyan' },
  ] as const;

  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-neon-cyan/50 transition-all group"
      >
        <currentTheme.icon className={cn("w-4 h-4", currentTheme.color)} />
        <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Theme</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-48 bg-dark-surface border border-white/10 rounded-xl p-2 shadow-2xl z-[100]"
          >
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Interface</p>
            </div>
            <div className="space-y-1">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all",
                    theme === t.id 
                      ? "bg-neon-cyan/10 text-neon-cyan" 
                      : "hover:bg-white/5 text-white/60 hover:text-white"
                  )}
                >
                  <t.icon className={cn("w-4 h-4", theme === t.id ? "text-neon-cyan" : t.color)} />
                  {t.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
