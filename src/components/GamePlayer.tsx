'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Maximize2, Trophy, ExternalLink, AlertCircle, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

interface GamePlayerProps {
  gameId: string;
  iframeUrl: string;
  title: string;
  thumbnail: string;
}

export function GamePlayer({ gameId, iframeUrl, title, thumbnail }: GamePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [playTime, setPlayTime] = useState(0);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [iframeError, setIframeError] = useState(false);

  const logActivity = useCallback(async () => {
    const locations = ['New York', 'London', 'Tokyo', 'Paris', 'Berlin', 'Sydney', 'Mumbai', 'São Paulo', 'Toronto', 'Dubai'];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    // 1. Log Live Activity
    await supabase
      .from('LiveActivity')
      .insert({ 
        gameTitle: title,
        location: randomLocation,
        timestamp: new Date().toISOString()
      });

    // 2. Increment Play Count and Trend Score
    // We use a small increment for trendScore on each play to reflect internal popularity
    const { data: game } = await supabase
      .from('Game')
      .select('playCount, trendScore')
      .eq('id', gameId)
      .single();

    if (game) {
      await supabase
        .from('Game')
        .update({ 
          playCount: (game.playCount || 0) + 1,
          trendScore: (game.trendScore || 0) + 1, // Internal play boost
          updatedAt: new Date().toISOString()
        })
        .eq('id', gameId);
    }
  }, [title, gameId]);

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
      .select('xp, level, totalPlayTime')
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
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-scripts allow-same-origin"
        allowFullScreen
        title={title}
        onError={() => setIframeError(true)}
      />

      {/* Fallback Overlay for Blocked Iframes - ONLY shows on actual error */}
      {iframeError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-30">
          <div className="text-center p-8 max-w-md space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <AlertCircle className="w-10 h-10 text-emerald-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Connection Issue?</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                This game might block being played inside small windows. Try our high-performance dedicated tab mode!
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a 
                href={iframeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-emerald-500 text-black px-8 py-4 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                <ExternalLink className="w-5 h-5" />
                Play in New Tab
              </a>
              
              <button 
                onClick={() => window.location.reload()}
                className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
              >
                Try Reloading Page
              </button>
            </div>
          </div>
        </div>
      )}

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
      
      {/* Control Overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <a 
          href={iframeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="glass p-3 rounded-full hover:bg-white/10 transition-colors"
          title="Play in New Tab"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
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
