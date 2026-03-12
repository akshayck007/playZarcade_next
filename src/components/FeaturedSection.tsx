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
        // Fetch settings to check mode
        const { data: settings } = await supabase
          .from("Settings")
          .select("featuredMode")
          .eq("id", "global")
          .maybeSingle();

        const mode = settings?.featuredMode || 'manual';

        if (mode === 'quality') {
          const { data, error } = await supabase
            .from("Game")
            .select("*, Category(name, slug)")
            .eq("isPublished", true)
            .order("qualityScore", { ascending: false })
            .limit(10);
          
          if (error) throw error;
          setFeaturedGames(data || []);
          setLoading(false);
          return;
        }

        // First try to fetch from SectionItem for custom ordering
        const { data: sectionData } = await supabase
          .from("Section")
          .select("id")
          .eq("slug", "featured")
          .maybeSingle();

        if (sectionData) {
          const { data: items, error } = await supabase
            .from("SectionItem")
            .select("*, Game(*, Category(name, slug))")
            .eq("sectionId", sectionData.id)
            .order("order", { ascending: true });

          if (!error && items && items.length > 0) {
            setFeaturedGames(items.map(item => item.Game).filter(Boolean));
            setLoading(false);
            return;
          }
        }

        // Fallback to isFeatured if no section items found
        const { data, error } = await supabase
          .from("Game")
          .select("*, Category(name, slug)")
          .eq("isFeatured", true)
          .eq("isPublished", true)
          .order("trendScore", { ascending: false })
          .limit(10);
        
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

      <div className="relative group/featured">
        <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0">
          {featuredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="min-w-[280px] md:min-w-[320px] snap-start"
            >
              <GameCard game={game} />
            </motion.div>
          ))}
        </div>
        
        {/* Gradient Fades for Scroll */}
        <div className="absolute left-0 top-0 bottom-6 w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none opacity-0 group-hover/featured:opacity-100 transition-opacity hidden md:block" />
        <div className="absolute right-0 top-0 bottom-6 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none opacity-0 group-hover/featured:opacity-100 transition-opacity hidden md:block" />
      </div>
    </section>
  );
}
