'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Gamepad2, X } from 'lucide-react';

interface Activity {
  id: string;
  gameTitle: string;
  location: string;
  timestamp: string;
}

export function LiveActivityTicker() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the ticker
    const dismissed = localStorage.getItem('playz_live_activity_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
    setIsLoaded(true);

    // Initial fetch
    async function fetchActivities() {
      // 1. Fetch more than we need to allow for filtering
      const { data: rawActivities } = await supabase
        .from('LiveActivity')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (!rawActivities) return;

      // 2. Fetch all published game titles to verify existence
      const { data: games } = await supabase
        .from('Game')
        .select('title')
        .eq('isPublished', true);

      const validTitles = new Set(games?.map(g => g.title.trim().toLowerCase()) || []);

      // 3. Filter and take top 5
      const filtered = rawActivities
        .filter(a => a.gameTitle && validTitles.has(a.gameTitle.trim().toLowerCase()))
        .slice(0, 5);

      setActivities(filtered);
    }

    fetchActivities();

    // Subscribe to new activities
    const channel = supabase
      .channel('live_activity_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'LiveActivity' 
      }, async (payload) => {
        const newActivity = payload.new as Activity;
        
        // Verify game exists before adding
        const { data: gameExists } = await supabase
          .from('Game')
          .select('id')
          .ilike('title', newActivity.gameTitle.trim())
          .eq('isPublished', true)
          .single();

        if (gameExists) {
          setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('playz_live_activity_dismissed', 'true');
  };

  if (!isLoaded || isDismissed || activities.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 hidden md:block">
      <div className="glass p-4 rounded-2xl border border-white/5 shadow-2xl space-y-3 w-64 overflow-hidden relative group">
        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all"
        >
          <X className="w-3 h-3" />
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live Activity
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/20 pr-6">
            <Users className="w-3 h-3" />
            {Math.floor(Math.random() * 500) + 1200} Online
          </div>
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1 - index * 0.2, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 flex-shrink-0">
                  <Gamepad2 className="w-4 h-4 text-white/40" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-white/80 truncate">
                    Someone in <span className="text-emerald-500">{activity.location || 'the world'}</span>
                  </p>
                  <p className="text-[9px] text-white/30 truncate">
                    is playing <span className="text-white/60">{activity.gameTitle}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
