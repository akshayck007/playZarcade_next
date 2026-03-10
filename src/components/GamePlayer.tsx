'use client';

import React, { useRef } from 'react';
import { Maximize2 } from 'lucide-react';

interface GamePlayerProps {
  iframeUrl: string;
  title: string;
}

export function GamePlayer({ iframeUrl, title }: GamePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
