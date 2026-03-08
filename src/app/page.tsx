import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { GameCard } from "@/components/GameCard";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function Home() {
  const { data: featuredGames } = await supabase
    .from("Game")
    .select("*")
    .eq("isFeatured", true)
    .eq("isPublished", true)
    .order("playCount", { ascending: false })
    .limit(6);

  const { data: trendingGames } = await supabase
    .from("Game")
    .select("*")
    .eq("isPublished", true)
    .order("trendScore", { ascending: false })
    .limit(12);

  const { data: categories } = await supabase
    .from("Category")
    .select("*")
    .limit(8);

  const heroGame = (featuredGames?.[0] || trendingGames?.[0]);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-3xl overflow-hidden group">
        {heroGame ? (
          <>
            <Image 
              src={heroGame.thumbnail} 
              alt={heroGame.title} 
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-10">
              <span className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-2">Featured Now</span>
              <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">{heroGame.title}</h1>
              <p className="text-white/70 max-w-xl mb-6">{heroGame.description}</p>
              <div className="flex gap-4">
                <Link href={`/game/${heroGame.slug}`} className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-500 transition-colors">Play Now</Link>
                <Link href={`/game/${heroGame.slug}`} className="glass px-8 py-3 rounded-full font-bold uppercase tracking-tight hover:bg-white/10 transition-colors">Details</Link>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
            <p className="text-white/20 font-black uppercase tracking-[0.5em]">No Featured Games</p>
          </div>
        )}
      </section>

      {/* Trending Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
            Trending Games
          </h2>
          <Link href="/trending" className="text-sm font-bold text-white/40 hover:text-emerald-500 transition-colors uppercase tracking-widest">View All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {trendingGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Category Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link 
            key={cat.id} 
            href={`/${cat.slug}`}
            className="h-32 glass rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors group"
          >
            <span className="text-lg font-black uppercase tracking-tighter group-hover:text-emerald-500 transition-colors">{cat.name}</span>
            <span className="text-[10px] text-white/30 uppercase tracking-widest">Explore Games</span>
          </Link>
        ))}
      </section>

      {/* SEO Content Section */}
      <section className="prose prose-invert max-w-none border-t border-white/10 pt-16">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-6">The Best Free Browser Games Online</h2>
        <p className="text-white/60 leading-relaxed">
          Welcome to PlayZ Arcade, your number one destination for high-quality browser games. Whether you&apos;re looking for action-packed shooters, brain-teasing puzzles, or high-speed racing games, we have something for everyone. Our platform is optimized for performance, ensuring you can play your favorite games instantly on any device without downloads.
        </p>
        <div className="grid md:grid-cols-3 gap-8 mt-10">
          <div>
            <h3 className="text-lg font-bold mb-3">No Downloads Required</h3>
            <p className="text-sm text-white/40">All our games are HTML5 based, meaning they run directly in your browser. Just click and play.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-3">Mobile Optimized</h3>
            <p className="text-sm text-white/40">Take your gaming on the go. Our platform is fully responsive and works perfectly on smartphones and tablets.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-3">Global Leaderboards</h3>
            <p className="text-sm text-white/40">Compete with players from around the world and prove your skills on our global high-score boards.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
