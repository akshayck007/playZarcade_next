import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { HomeTabsSection } from "@/components/HomeTabsSection";
import { TrendingSection } from "@/components/TrendingSection";
import { BlogSection } from "@/components/BlogSection";
import { Play, Sparkles } from "lucide-react";

export const revalidate = 600; // Revalidate every hour

export default async function Home() {
  console.log('[Home] Rendering home page on server');
  const { data: categories } = await supabase
    .from("Category")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-16 pb-20">
      <HomeTabsSection />
      
      <TrendingSection />

      <BlogSection />

      {/* SEO Content Section */}
      <section className="prose prose-invert max-w-none border-t border-neon-cyan/10 pt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter m-0 cyber-text-glow text-neon-cyan">
            The Best Free <span className="text-white">Browser Games</span> Online
          </h2>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-neon-cyan">
              NO DOWNLOADS
            </div>
            <div className="px-4 py-2 bg-neon-magenta/5 border border-neon-magenta/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-neon-magenta">
              FREE TO PLAY
            </div>
          </div>
        </div>
        
        <p className="text-white/60 leading-relaxed text-lg max-w-4xl font-mono">
          [SYSTEM_LOG]: Welcome to PlayZ Arcade. Initializing high-performance gaming protocols. Whether you&apos;re looking for action-packed shooters, brain-teasing puzzles, or high-speed racing games, we have something for everyone. Our platform is optimized for performance, ensuring you can play your favorite games instantly on any device without downloads.
        </p>
        
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
