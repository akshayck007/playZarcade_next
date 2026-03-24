'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Maximize2, RefreshCw, Gamepad2 } from 'lucide-react';

interface RetroPlayerProps {
  romUrl: string;
  system: string; // e.g., 'nes', 'snes', 'gba', 'n64'
  title: string;
}

declare global {
  interface Window {
    EJS_player: string;
    EJS_core: string;
    EJS_gameUrl: string;
    EJS_pathtodata: string;
    EJS_startOnLoaded: boolean;
    EJS_DEBUG_XX: boolean;
    EJS_onGameStart: () => void;
  }
}

export default function RetroPlayer({ romUrl, system, title }: RetroPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!romUrl || !system) return;

    // Set configuration
    window.EJS_player = '#retro-game-container';
    window.EJS_core = system;
    window.EJS_gameUrl = romUrl;
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_startOnLoaded = true;
    
    window.EJS_onGameStart = () => {
      setIsLoading(false);
    };

    // Load script
    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.async = true;
    
    script.onload = () => {
      console.log('EmulatorJS loader script loaded');
    };

    script.onerror = () => {
      setError('Failed to load emulator engine. Please check your connection.');
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      // Clear global config to prevent conflicts on re-mount
      delete (window as any).EJS_player;
      delete (window as any).EJS_core;
      delete (window as any).EJS_gameUrl;
      delete (window as any).EJS_pathtodata;
      delete (window as any).EJS_startOnLoaded;
    };
  }, [romUrl, system]);

  const handleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group" ref={containerRef}>
      {/* Emulator Container */}
      <div id="retro-game-container" className="w-full h-full"></div>

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050505] text-white">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full border-t-2 border-neon-cyan animate-spin"></div>
            <Gamepad2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-neon-cyan animate-pulse" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter italic mb-2">
            Initializing <span className="text-neon-cyan">{system.toUpperCase()}</span> Core
          </h3>
          <p className="text-xs font-mono text-white/40 animate-pulse">
            LOADING ROM DATA...
          </p>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-md p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
            <RefreshCw className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white mb-4">
            Emulation Failed
          </h3>
          <p className="text-sm text-red-200/60 max-w-md mb-8 font-medium">
            {error}
          </p>
          <button 
            onClick={handleReload}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-500/20"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Controls Overlay (Bottom Right) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
        <button 
          onClick={handleFullscreen}
          className="p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg hover:bg-neon-cyan/20 hover:border-neon-cyan/50 text-white transition-all"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
