import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { HomeTabsSection } from "@/components/HomeTabsSection";
import { TrendingSection } from "@/components/TrendingSection";
import { BlogSection } from "@/components/BlogSection";
import { Play, Sparkles } from "lucide-react";

export const runtime = "edge";
export const revalidate = 600; // Revalidate every hour

export default async function Home() {
  console.log('[Home] Rendering home page on server');
  const { data: categories } = await supabase
    .from("Category")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-16 pb-20">
      {/* Compact Top Header - SEO friendly but user focused */}
      <section className="pt-4 px-6 md:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter m-0 cyber-text-glow text-neon-cyan leading-none">
            Free <span className="text-white">Browser Games</span> Online
          </h1>
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1 bg-neon-cyan/5 border border-neon-cyan/20 rounded text-[9px] font-black uppercase tracking-widest text-neon-cyan">
              NO DOWNLOADS
            </div>
            <div className="px-3 py-1 bg-neon-magenta/5 border border-neon-magenta/20 rounded text-[9px] font-black uppercase tracking-widest text-neon-magenta">
              FREE TO PLAY
            </div>
          </div>
        </div>
      </section>

      <HomeTabsSection />
      
      <TrendingSection />

      <BlogSection />

      {/* SEO Content & Features Section moved to bottom */}
      <section className="prose prose-invert max-w-none border-t border-white/5 pt-20">
        <div className="max-w-4xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-neon-cyan">
            The Ultimate Arcade for Free Browser Games
          </h2>
          <p className="text-white/60 leading-relaxed text-lg">
            Welcome to PlayZ Arcade, your premier destination for the ultimate collection of free online games. Whether you&apos;re looking for action-packed shooters like <span className="text-neon-cyan font-bold">Metal Gear Solid</span>, brain-teasing puzzles, or high-speed racing games, we have the best browser games for every player. Our platform is optimized for speed, ensuring you can play your favorite free games instantly on any device with no downloads required.
          </p>
          <p className="text-white/40 leading-relaxed text-sm">
            Explore our <span className="text-neon-magenta">trending blog genres</span> and stay updated with the latest <span className="text-neon-lime">intel reports</span>. From <span className="text-neon-cyan">Funko Fusion</span> crossovers to tactical espionage in <span className="text-neon-magenta font-bold">Gear Solid</span>, our <span className="text-neon-lime">playzarcade home trending</span> section keeps you in the loop with the hottest gaming themes and news.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="glass p-8 rounded-none border border-white/5 hover:border-neon-cyan/30 transition-all group skew-x-[-2deg]">
            <div className="w-12 h-12 bg-neon-cyan/10 rounded-none flex items-center justify-center mb-6 group-hover:bg-neon-cyan transition-colors shadow-[0_0_15px_rgba(0,243,255,0.2)]">
              <Sparkles className="w-6 h-6 text-neon-cyan group-hover:text-black transition-colors" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-neon-cyan">Instant Access</h3>
            <p className="text-xs font-mono text-white/40 leading-relaxed">All our games are HTML5 based, meaning they run directly in your browser. Just click and play.</p>
          </div>
          <div className="glass p-8 rounded-none border border-white/5 hover:border-neon-magenta/30 transition-all group skew-x-[2deg]">
            <div className="w-12 h-12 bg-neon-magenta/10 rounded-none flex items-center justify-center mb-6 group-hover:bg-neon-magenta transition-colors shadow-[0_0_15px_rgba(255,0,255,0.2)]">
              <Play className="w-6 h-6 text-neon-magenta group-hover:text-black transition-colors" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-neon-magenta">Mobile Ready</h3>
            <p className="text-xs font-mono text-white/40 leading-relaxed">Take your gaming on the go. Our platform is fully responsive and works perfectly on smartphones and tablets.</p>
          </div>
          <div className="glass p-8 rounded-none border border-white/5 hover:border-neon-lime/30 transition-all group skew-x-[-2deg]">
            <div className="w-12 h-12 bg-neon-lime/10 rounded-none flex items-center justify-center mb-6 group-hover:bg-neon-lime transition-colors shadow-[0_0_15px_rgba(188,255,0,0.2)]">
              <TrendingUp className="w-6 h-6 text-neon-lime group-hover:text-black transition-colors" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-neon-lime">Global Sync</h3>
            <p className="text-xs font-mono text-white/40 leading-relaxed">Compete with players from around the world and prove your skills on our global high-score boards.</p>
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
