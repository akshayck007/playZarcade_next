import { getPrisma } from "@/lib/prisma";
import { Search, Filter, MoreVertical, Edit, Trash2, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { GameStatusBadge } from "@/components/admin/GameStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminGamesPage() {
  const prisma = getPrisma();
  const games = await prisma.game.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Game Library</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Manage {games.length} games in your database</p>
        </div>
        <div className="flex gap-4">
          <button className="glass px-6 py-3 rounded-full font-bold uppercase tracking-tight hover:bg-white/10 transition-colors flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter
          </button>
          <Link href="/admin/games/new" className="bg-emerald-500 text-black px-6 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Game
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
        <input 
          type="text" 
          placeholder="Search by title, slug or category..." 
          className="w-full glass py-4 pl-16 pr-8 rounded-2xl text-sm font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
        />
      </div>

      {/* Games Table */}
      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Game</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Category</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Stats</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Status</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {games.map((game) => (
              <tr key={game.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 relative">
                      <Image 
                        src={game.thumbnail} 
                        alt="" 
                        fill 
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold group-hover:text-emerald-500 transition-colors">{game.title}</span>
                      <span className="text-[10px] text-white/30 font-mono">{game.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 border border-white/10">
                    {game.category?.name || "Uncategorized"}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-emerald-500">{game.playCount.toLocaleString()} Plays</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">Trend: {game.trendScore.toFixed(1)}</span>
                  </div>
                </td>
                <td className="p-6">
                  <GameStatusBadge 
                    gameId={game.id} 
                    isPublished={game.isPublished} 
                    iframeUrl={game.iframeUrl} 
                  />
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/game/${game.slug}`} target="_blank" className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </Link>
                    <button className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                      <Edit className="w-4 h-4 text-white/40" />
                    </button>
                    <button className="p-2 glass rounded-lg hover:bg-red-500/20 transition-colors group/del">
                      <Trash2 className="w-4 h-4 text-white/40 group-hover/del:text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
