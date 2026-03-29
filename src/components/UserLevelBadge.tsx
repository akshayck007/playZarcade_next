'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Star } from 'lucide-react';
import { motion } from 'motion/react';

export function UserLevelBadge() {
  const [stats, setStats] = useState<{ xp: number; level: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('Profile')
        .select('xp, level')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setStats(data);
      }
      setLoading(false);
    }

    fetchStats();

    // Subscribe to changes
    const channel = supabase
      .channel('user_stats_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'Profile' 
      }, (payload) => {
        setStats(payload.new as any);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading || !stats) return null;

  const xpToNextLevel = stats.level * 1000;
  const progress = (stats.xp % 1000) / 10;

  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
          <span className="text-[10px] font-black text-emerald-500">LVL</span>
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] font-black text-black">
          {stats.level}
        </div>
      </div>
      
      <div className="hidden md:block space-y-1">
        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
          <span>XP Progress</span>
          <span>{stats.xp % 1000} / 1000</span>
        </div>
        <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          />
        </div>
      </div>
    </div>
  );
}
