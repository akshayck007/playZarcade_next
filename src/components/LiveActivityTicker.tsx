'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Gamepad2 } from 'lucide-react';

interface Activity {
  id: string;
  gameTitle: string;
  location: string;
  timestamp: string;
}

export function LiveActivityTicker() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Initial fetch
    async function fetchActivities() {
      const { data } = await supabase
        .from('LiveActivity')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);
      if (data) setActivities(data);
    }

    fetchActivities();

    // Subscribe to new activities
    const channel = supabase
      .channel('live_activity_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'LiveActivity' 
      }, (payload) => {
        setActivities(prev => [payload.new as Activity, ...prev.slice(0, 4)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (activities.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 hidden md:block">
      <div className="glass p-4 rounded-2xl border border-white/5 shadow-2xl space-y-3 w-64 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live Activity
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/20">
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
