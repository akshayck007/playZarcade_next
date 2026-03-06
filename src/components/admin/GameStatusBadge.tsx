'use client';

import React, { useState } from 'react';
import { Zap, Loader2, Check, Globe } from 'lucide-react';

interface GameStatusBadgeProps {
  gameId: string;
  isPublished: boolean;
  iframeUrl: string | null;
}

export function GameStatusBadge({ gameId, isPublished, iframeUrl }: GameStatusBadgeProps) {
  const [isActivating, setIsActivating] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isShadow = !iframeUrl;

  const handleActivate = async () => {
    if (!url) return;
    setIsActivating(true);
    try {
      const res = await fetch('/api/admin/games/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, iframeUrl: url })
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Failed to activate game");
    } finally {
      setIsActivating(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center gap-2 text-emerald-500 animate-pulse">
        <Check className="w-3 h-3" />
        <span className="text-[10px] font-black uppercase tracking-widest">Activated!</span>
      </div>
    );
  }

  if (isShadow) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">Shadow Page</span>
        </div>
        
        {!showInput ? (
          <button 
            onClick={() => setShowInput(true)}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter text-white/40 hover:text-emerald-500 transition-colors"
          >
            <Zap className="w-3 h-3" />
            Go Live
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Iframe URL" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-emerald-500/50 w-32"
            />
            <button 
              onClick={handleActivate}
              disabled={isActivating || !url}
              className="p-1.5 glass rounded hover:bg-emerald-500 hover:text-black transition-colors disabled:opacity-50"
            >
              {isActivating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            </button>
            <button 
              onClick={() => setShowInput(false)}
              className="p-1.5 glass rounded hover:bg-red-500/20 text-white/40 hover:text-red-500 transition-colors"
            >
              <span className="text-[10px]">×</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
        {isPublished ? 'Live' : 'Draft'}
      </span>
    </div>
  );
}
