'use client';

import { useEffect, useState } from 'react';
import { GameCard } from './GameCard';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';

export function FeaturedSection() {
  const [featuredGames, setFeaturedGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from("Game")
          .select("*, Category(name, slug)")
          .eq("isFeatured", true)
          .eq("isPublished", true)
          .limit(8);
        
        if (error) throw error;
        setFeaturedGames(data || []);
      } catch (e) {
        console.error('Failed to fetch featured games', e);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-neon-cyan animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Loading Featured Content...</span>
      </div>
    );
  }

  if (featuredGames.length === 0) return null;

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 cyber-text-glow text-neon-cyan">
          <Sparkles className="w-6 h-6" />
          Featured <span className="text-white">Games</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
        {featuredGames.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GameCard game={game} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
