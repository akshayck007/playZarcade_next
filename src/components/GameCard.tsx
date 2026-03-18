'use client';

import { Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { FavoriteButton } from "./FavoriteButton";

interface GameCardProps {
  game: any;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <div className="group relative flex flex-col gap-3">
      <Link 
        href={`/game/${game.slug}`} 
        className="relative aspect-[4/3] rounded-xl overflow-hidden bg-dark-surface border border-white/5 group-hover:border-neon-cyan/50 transition-all duration-300 shadow-lg group-hover:shadow-neon-cyan/20"
      >
        <Image 
          src={game.thumbnail} 
          alt={game.title}
          fill
          loading="lazy"
          className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
          referrerPolicy="no-referrer"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
          <motion.div 
            initial={{ scale: 0.5, rotate: -45 }}
            whileHover={{ scale: 1.1, rotate: 0 }}
            className="w-12 h-12 bg-neon-cyan rounded-none flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.5)] skew-x-[-12deg]"
          >
            <Play className="w-6 h-6 text-black fill-current ml-1" />
          </motion.div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-cyan cyber-text-glow">Access Protocol</span>
        </div>
      </Link>

      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <FavoriteButton gameId={game.id} />
      </div>

      <Link href={`/game/${game.slug}`} className="px-1">
        <h3 className="text-xs font-black truncate group-hover:text-neon-cyan transition-colors uppercase tracking-widest text-white/90 font-mono">
          {game.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] text-neon-magenta/60 uppercase tracking-widest font-black">
            {game.Category?.name || "Casual"}
          </span>
          <span className="text-[9px] text-white/20 font-mono uppercase">
            {(game.playCount || 0).toLocaleString()} USERS
          </span>
        </div>
      </Link>
    </div>
  );
}
