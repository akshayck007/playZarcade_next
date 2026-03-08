import { supabase } from "@/lib/supabase";
import { GameCard } from "@/components/GameCard";
import { Search as SearchIcon } from "lucide-react";

export const runtime = "edge";
export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let games: any[] = [];
  if (q) {
    const { data } = await supabase
      .from("Game")
      .select("*")
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .eq("isPublished", true)
      .order("playCount", { ascending: false })
      .limit(24);
    games = data || [];
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter italic">
          Search <span className="text-emerald-500">Results</span>
        </h1>
        <p className="text-white/40 max-w-2xl font-medium">
          {q 
            ? `Showing results for "${q}"` 
            : "Enter a game title or keyword to start searching."}
        </p>
      </div>

      {games.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : q ? (
        <div className="h-[400px] glass rounded-3xl flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <SearchIcon className="w-10 h-10 text-white/20" />
          </div>
          <p className="text-white/20 font-black uppercase tracking-[0.5em] text-xl">No Games Found</p>
          <p className="text-white/40 max-w-md">We couldn&apos;t find any games matching your search. Try different keywords or browse our categories!</p>
        </div>
      ) : null}
    </div>
  );
}
