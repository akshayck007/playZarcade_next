'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Maximize2, Trophy, ExternalLink, AlertCircle, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

interface GamePlayerProps {
  iframeUrl: string;
  title: string;
  thumbnail: string;
}

export function GamePlayer({ iframeUrl, title, thumbnail }: GamePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [playTime, setPlayTime] = useState(0);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [iframeError, setIframeError] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      {/* Play Now Overlay (Initial State) */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center"
          >
            <div className="absolute inset-0">
              <Image 
                src={thumbnail} 
                alt={title} 
                fill 
                className="object-cover blur-sm opacity-50"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 flex flex-col items-center gap-6"
            >
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                <Image 
                  src={thumbnail} 
                  alt={title} 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter">{title}</h2>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Ready to Play?</p>
              </div>

              <button 
                onClick={() => setHasStarted(true)}
                className="group/btn relative bg-emerald-500 text-black px-12 py-4 rounded-full font-black uppercase tracking-tight text-xl hover:bg-emerald-400 transition-all hover:scale-105 shadow-[0_0_50px_rgba(16,185,129,0.4)] flex items-center gap-3"
              >
                <Play className="w-6 h-6 fill-current" />
                Play Now
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasStarted && (
        <>
          {isLoading && !iframeError && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505] space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 animate-pulse">Loading Game Engine...</p>
            </div>
          )}
          <iframe 
            src={iframeUrl} 
            className={`w-full h-full border-0 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-scripts allow-same-origin"
            allowFullScreen
            title={title}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIframeError(true);
              setIsLoading(false);
            }}
          />
        </>
      )}

      {/* Fallback Overlay for Blocked Iframes */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-500 z-30 ${iframeError ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'}`}>
        <div className="text-center p-8 max-w-md space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <AlertCircle className="w-10 h-10 text-emerald-500" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Connection Issue?</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Some games block being played inside small windows for security. If the game doesn&apos;t load, try our high-performance dedicated tab mode!
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
            
            {iframeError && (
              <button 
                onClick={() => window.location.reload()}
                className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
              >
                Try Reloading Page
              </button>
            )}
          </div>
        </div>
      </div>

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
