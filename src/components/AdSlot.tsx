'use client';

import { useEffect, useState } from 'react';

interface AdSlotProps {
  id: string;
  type: 'banner' | 'rectangle' | 'skyscraper';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSlot({ id, type, className }: AdSlotProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsLoaded(true);
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [id]);

  const dimensions = {
    banner: 'h-[90px] w-full max-w-[728px]',
    rectangle: 'h-[250px] w-full max-w-[300px]',
    skyscraper: 'h-[600px] w-full max-w-[160px]',
  };

  return (
    <div className={`relative flex flex-col items-center justify-center glass rounded-2xl border border-white/5 overflow-hidden ${dimensions[type]} ${className}`}>
      <span className="absolute top-1 left-2 text-[8px] font-black uppercase tracking-[0.3em] text-white/10 z-10">Advertisement</span>
      
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={id}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
          <span className="text-[10px] text-white/10 font-bold uppercase tracking-widest">Loading Protocol...</span>
        </div>
      )}
    </div>
  );
}
