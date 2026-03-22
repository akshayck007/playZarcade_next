import { supabase } from "@/lib/supabase";
import { Filter, Plus } from "lucide-react";
import Link from "next/link";
import { GameLibraryClient } from "@/components/admin/GameLibraryClient";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminGamesPage() {
  const { data: gamesRaw } = await supabase
    .from("Game")
    .select("*, Category(*)")
    .order("createdAt", { ascending: false });

  const games = (gamesRaw || []).map(g => ({ ...g, category: g.Category }));

  // Fetch all section items to determine which games are in which sections
  const { data: sectionItems } = await supabase
    .from("SectionItem")
    .select("gameId, Section(slug)");

  const gameSectionsMap: Record<string, string[]> = {};
  sectionItems?.forEach((item: any) => {
    if (!gameSectionsMap[item.gameId]) {
      gameSectionsMap[item.gameId] = [];
    }
    gameSectionsMap[item.gameId].push(item.Section.slug);
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

      <GameLibraryClient initialGames={games} gameSectionsMap={gameSectionsMap} />
    </div>
  );
}
