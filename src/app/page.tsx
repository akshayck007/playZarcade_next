import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { TrendingSection } from "@/components/TrendingSection";
import { Play, Sparkles } from "lucide-react";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function Home() {
  const { data: featuredGames } = await supabase
    .from("Game")
    .select("*, Category(name, slug)")
    .eq("isFeatured", true)
    .eq("isPublished", true)
    .order("playCount", { ascending: false })
    .limit(1);

  const heroGame = featuredGames?.[0];

  return (
    <div className="space-y-32 pb-20">
      {/* Discovery Section - Tasks 1-11 - Now at the top */}
      <TrendingSection />

      {/* Hero Section - Task 13 Refinement */}
      <section className="relative z-10 h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden group border border-white/5 shadow-2xl">
        {heroGame ? (
          <>
            <Image 
              src={heroGame.thumbnail} 
              alt={heroGame.title} 
              fill
              priority
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent flex flex-col justify-end p-10 md:p-16">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px]">Featured Game</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 group-hover:text-emerald-500 transition-colors duration-500 leading-none">
                {heroGame.title}
              </h1>
              <p className="text-white/60 max-w-2xl mb-10 text-lg font-medium leading-relaxed">
                {heroGame.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={`/game/${heroGame.slug}`} className="bg-emerald-500 text-black px-10 py-4 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-3 active:scale-95">
                  <Play className="w-5 h-5 fill-current" />
                  Play Now
                </Link>
                <Link href={`/game/${heroGame.slug}`} className="glass px-10 py-4 rounded-full font-black uppercase tracking-tight hover:bg-white/10 transition-all border border-white/10 active:scale-95">
                  View Details
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-white/5 flex flex-col items-center justify-center gap-4">
            <Sparkles className="w-12 h-12 text-white/10" />
            <p className="text-white/20 font-black uppercase tracking-[0.5em]">No Featured Games</p>
          </div>
        )}
      </section>

      {/* SEO Content Section */}
      <section className="prose prose-invert max-w-none border-t border-white/10 pt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter m-0">
            The Best Free <span className="text-emerald-500">Browser Games</span> Online
          </h2>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40">
              No Downloads
            </div>
            <div className="px-4 py-2 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40">
              Free to Play
            </div>
          </div>
        </div>
        
        <p className="text-white/60 leading-relaxed text-lg max-w-4xl">
          Welcome to PlayZ Arcade, your number one destination for high-quality browser games. Whether you&apos;re looking for action-packed shooters, brain-teasing puzzles, or high-speed racing games, we have something for everyone. Our platform is optimized for performance, ensuring you can play your favorite games instantly on any device without downloads.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="glass p-8 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
              <Sparkles className="w-6 h-6 text-emerald-500 group-hover:text-black transition-colors" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-3">No Downloads Required</h3>
            <p className="text-sm text-white/40 leading-relaxed">All our games are HTML5 based, meaning they run directly in your browser. Just click and play.</p>
          </div>
          <div className="glass p-8 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
              <Play className="w-6 h-6 text-emerald-500 group-hover:text-black transition-colors" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-3">Mobile Optimized</h3>
            <p className="text-sm text-white/40 leading-relaxed">Take your gaming on the go. Our platform is fully responsive and works perfectly on smartphones and tablets.</p>
          </div>
          <div className="glass p-8 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
              <TrendingUp className="w-6 h-6 text-emerald-500 group-hover:text-black transition-colors" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-3">Global Leaderboards</h3>
            <p className="text-sm text-white/40 leading-relaxed">Compete with players from around the world and prove your skills on our global high-score boards.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper component for SEO section
function TrendingUp({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
