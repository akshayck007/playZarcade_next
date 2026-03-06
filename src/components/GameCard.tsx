import { Game } from "@prisma/client";
import { Play, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link 
      href={`/game/${game.slug}`} 
      className="group relative flex flex-col gap-3 game-card-hover"
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5">
        <Image 
          src={game.thumbnail} 
          alt={game.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-black fill-current ml-1" />
          </div>
        </div>

        {/* Badges */}
        {game.trendScore > 100 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
            <TrendingUp className="w-3 h-3" />
            Hot
          </div>
        )}
      </div>

      <div className="px-1">
        <h3 className="text-sm font-bold truncate group-hover:text-emerald-500 transition-colors uppercase tracking-tight text-white">
          {game.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">
            {game.tags?.[0] || "Casual"}
          </span>
          <span className="text-[10px] text-white/20 font-mono">
            {game.playCount.toLocaleString()} Plays
          </span>
        </div>
      </div>
    </Link>
  );
}
