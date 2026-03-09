'use client';

import { Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

interface GameCardProps {
  game: any;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link 
      href={`/game/${game.slug}`} 
      className="group relative flex flex-col gap-3"
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-emerald-500/50 transition-colors">
        <Image 
          src={game.thumbnail} 
          alt={game.title}
          fill
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          <motion.div 
            initial={{ scale: 0.5 }}
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20"
          >
            <Play className="w-6 h-6 text-black fill-current ml-1" />
          </motion.div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Play Now</span>
        </div>
      </div>

      <div className="px-1">
        <h3 className="text-sm font-bold truncate group-hover:text-emerald-500 transition-colors uppercase tracking-tight text-white">
          {game.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">
            {game.Category?.name || "Casual"}
          </span>
          <span className="text-[10px] text-white/20 font-mono">
            {(game.playCount || 0).toLocaleString()} Plays
          </span>
        </div>
      </div>
    </Link>
  );
}
