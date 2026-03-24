'use client';

import { useEffect, useRef, useState } from 'react';
import { trackPlay } from './RecentlyPlayed';
import { Maximize2, Heart, Share2, Swords, ExternalLink } from 'lucide-react';
import { ShareButtons } from './ShareButtons';

interface GameActionsProps {
  game: any;
}

export function GameActions({ game }: GameActionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Track play on mount
    trackPlay(game);

    // Check if liked in local storage
    const likedGames = JSON.parse(localStorage.getItem('playz_favorites') || '[]');
    setIsLiked(likedGames.includes(game.id));
  }, [game]);

  const handleChallenge = () => {
    const challengeUrl = `${window.location.href}?challenge=true`;
    const text = `I challenge you to play ${game.title} on PlayZ Arcade! Can you beat my score?`;
    
    if (navigator.share) {
      navigator.share({
        title: `Challenge: ${game.title}`,
        text: text,
        url: challengeUrl,
      });
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(`${text} ${challengeUrl}`);
      alert('Challenge link copied to clipboard!');
    }
  };

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
    const container = document.querySelector('.game-container') || document.querySelector('iframe');
    if (container) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
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
      setShowShare(!showShare);
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
            onClick={handleChallenge}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            <Swords className="w-4 h-4" />
            <span>Challenge</span>
          </button>
          <div className="relative">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-neon-cyan transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Sync</span>
            </button>
            {showShare && (
              <div className="absolute bottom-full left-0 mb-4 glass p-4 rounded-xl border border-white/10 z-50 min-w-[200px]">
                <ShareButtons title={game.title} url={typeof window !== 'undefined' ? window.location.href : ''} />
              </div>
            )}
          </div>
          <button 
            onClick={handleFullscreen}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-neon-cyan transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Full Protocol</span>
          </button>
          {game.iframeUrl && (
            <a 
              href={game.iframeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>New Tab</span>
            </a>
          )}
        </div>
      </div>
      <div className="text-right mt-4 md:mt-0 skew-x-[2deg]">
        <span className="block text-2xl font-black text-neon-cyan cyber-text-glow font-mono">{game.playCount.toLocaleString()}</span>
        <span className="block text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">Total Users</span>
      </div>
    </div>
  );
}
