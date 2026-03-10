'use client';

import { useEffect, useState } from 'react';

interface AdSlotProps {
  id: string;
  type: 'banner' | 'rectangle' | 'skyscraper';
  className?: string;
}

export function AdSlot({ id, type, className }: AdSlotProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // In a real scenario, we would trigger adsbygoogle.push({}) here
    // For now, we simulate loading
    const timer = setTimeout(() => setIsLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, [id]);

  const dimensions = {
    banner: 'h-[90px] w-full max-w-[728px]',
    rectangle: 'h-[250px] w-full max-w-[300px]',
    skyscraper: 'h-[600px] w-full max-w-[160px]',
  };

  return (
    <div className={`relative flex flex-col items-center justify-center glass rounded-2xl border-dashed border-white/10 overflow-hidden ${dimensions[type]} ${className}`}>
      <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-[0.3em] text-white/10 z-10">Advertisement</span>
      
      {!isLoaded ? (
        <div className="w-full h-full bg-white/5 animate-pulse" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest text-center px-4">
            {type} Ad Slot<br/>
            <span className="text-[8px] opacity-50 font-mono">ID: {id}</span>
          </span>
        </div>
      )}
      
      {/* Real AdSense Tag would go here */}
      {/* <ins className="adsbygoogle" ... /> */}
    </div>
  );
}
