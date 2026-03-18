'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'motion/react';

interface FavoriteButtonProps {
  gameId: string;
  className?: string;
}

export function FavoriteButton({ gameId, className }: FavoriteButtonProps) {
  const supabase = createClientComponentClient();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkFavorite = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data, error } = await supabase
          .from('UserFavorite')
          .select('id')
          .eq('userId', session.user.id)
          .eq('gameId', gameId)
          .maybeSingle();

        if (data) setIsFavorite(true);
      } else {
        // Fallback to localStorage for guests
        const stored = localStorage.getItem('playz_favorites');
        if (stored) {
          try {
            const ids = JSON.parse(stored);
            if (ids.includes(gameId)) setIsFavorite(true);
          } catch (e) {}
        }
      }
      setLoading(false);
    };

    checkFavorite();
  }, [gameId, supabase]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (user) {
      if (isFavorite) {
        const { error } = await supabase
          .from('UserFavorite')
          .delete()
          .eq('userId', user.id)
          .eq('gameId', gameId);
        
        if (!error) setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from('UserFavorite')
          .insert({ userId: user.id, gameId: gameId });
        
        if (!error) setIsFavorite(true);
      }
    } else {
      // Guest logic
      const stored = localStorage.getItem('playz_favorites');
      let ids: string[] = [];
      if (stored) {
        try {
          ids = JSON.parse(stored);
        } catch (e) {}
      }

      if (isFavorite) {
        ids = ids.filter(id => id !== gameId);
        setIsFavorite(false);
      } else {
        ids.push(gameId);
        setIsFavorite(true);
      }
      localStorage.setItem('playz_favorites', JSON.stringify(ids));
    }
  };

  if (loading) return <div className={cn("w-8 h-8 rounded-full bg-white/5 animate-pulse", className)} />;

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleFavorite}
      className={cn(
        "p-2 rounded-full transition-all duration-300",
        isFavorite 
          ? "bg-neon-magenta text-white shadow-[0_0_15px_rgba(255,0,255,0.4)]" 
          : "bg-white/10 text-white/40 hover:bg-white/20 hover:text-white",
        className
      )}
    >
      <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
    </motion.button>
  );
}
