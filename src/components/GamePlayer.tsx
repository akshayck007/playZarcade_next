'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Maximize2, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface GamePlayerProps {
  iframeUrl: string;
  title: string;
}

export function GamePlayer({ iframeUrl, title }: GamePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [playTime, setPlayTime] = useState(0);
  const [xpGained, setXpGained] = useState<number | null>(null);

  const logActivity = useCallback(async () => {
    const locations = ['New York', 'London', 'Tokyo', 'Paris', 'Berlin', 'Sydney', 'Mumbai', 'São Paulo', 'Toronto', 'Dubai'];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    await supabase
      .from('LiveActivity')
      .insert({ 
        gameTitle: title,
        location: randomLocation,
        timestamp: new Date().toISOString()
      });
  }, [title]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayTime(prev => prev + 1);
    }, 1000);

    // Log initial activity
    logActivity();

    return () => clearInterval(interval);
  }, [logActivity]);

  // Award XP every 30 seconds
  useEffect(() => {
    if (playTime > 0 && playTime % 30 === 0) {
      awardXP(3); // 3 XP per 30 seconds
    }
  }, [playTime]);

  async function awardXP(amount: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: stats } = await supabase
      .from('UserStats')
      .select('xp, level')
      .eq('id', user.id)
      .maybeSingle();

    if (stats) {
      const newXp = stats.xp + amount;
      const newLevel = Math.floor(newXp / 1000) + 1;
      
      await supabase
        .from('UserStats')
        .update({ 
          xp: newXp, 
          level: newLevel,
          totalPlayTime: (stats.totalPlayTime || 0) + 30,
          lastUpdated: new Date().toISOString()
        })
        .eq('id', user.id);

      setXpGained(amount);
      setTimeout(() => setXpGained(null), 3000);
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="game-container relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl group"
    >
      <iframe 
        src={iframeUrl} 
        className="w-full h-full border-0"
        allowFullScreen
        title={title}
      />

      {/* XP Gain Notification */}
      <AnimatePresence>
        {xpGained && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-500 text-black px-4 py-2 rounded-full font-black text-xs shadow-[0_0_20px_rgba(16,185,129,0.5)] z-20"
          >
            <Trophy className="w-4 h-4" />
            +{xpGained} XP GAINED!
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Fullscreen Overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
          onClick={toggleFullscreen}
          className="glass p-3 rounded-full hover:bg-white/10 transition-colors"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
