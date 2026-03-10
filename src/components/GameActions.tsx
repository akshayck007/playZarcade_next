'use client';

import { useEffect, useRef, useState } from 'react';
import { trackPlay } from './RecentlyPlayed';
import { Maximize2, Heart, Share2 } from 'lucide-react';

interface GameActionsProps {
  game: any;
}

export function GameActions({ game }: GameActionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Track play on mount
    trackPlay(game);

    // Check if liked in local storage
    const likedGames = JSON.parse(localStorage.getItem('playz_favorites') || '[]');
    setIsLiked(likedGames.includes(game.id));
  }, [game]);

  const toggleLike = () => {
    const likedGames = JSON.parse(localStorage.getItem('playz_favorites') || '[]');
    let newLiked;
    if (isLiked) {
      newLiked = likedGames.filter((id: string) => id !== game.id);
    } else {
      newLiked = [...likedGames, game.id];
    }
    localStorage.setItem('playz_favorites', JSON.stringify(newLiked));
    setIsLiked(!isLiked);
  };

  const handleFullscreen = () => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if ((iframe as any).webkitRequestFullscreen) {
        (iframe as any).webkitRequestFullscreen();
      } else if ((iframe as any).msRequestFullscreen) {
        (iframe as any).msRequestFullscreen();
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: game.title,
        text: game.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between bg-dark-surface border border-white/5 p-6 rounded-none skew-x-[-2deg]">
      <div className="flex flex-col md:flex-row md:items-center gap-6 skew-x-[2deg]">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-neon-cyan cyber-text-glow">{game.title}</h1>
          <span className="text-[10px] text-neon-magenta/60 uppercase tracking-[0.2em] font-black">{game.Category?.name}</span>
        </div>
        <div className="hidden md:block h-8 w-px bg-white/10"></div>
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleLike}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isLiked ? 'text-neon-magenta' : 'text-white/40 hover:text-neon-magenta'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{game.playCount > 1000 ? "1.2k" : "842"}</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-neon-cyan transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Sync</span>
          </button>
          <button 
            onClick={handleFullscreen}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-neon-cyan transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Full Protocol</span>
          </button>
        </div>
      </div>
      <div className="text-right mt-4 md:mt-0 skew-x-[2deg]">
        <span className="block text-2xl font-black text-neon-cyan cyber-text-glow font-mono">{game.playCount.toLocaleString()}</span>
        <span className="block text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">Total Users</span>
      </div>
    </div>
  );
}
