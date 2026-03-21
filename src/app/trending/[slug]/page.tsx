import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Sparkles, Gamepad2, Share2, ArrowLeft, TrendingUp } from "lucide-react";
import { GameCard } from "@/components/GameCard";
import Link from "next/link";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: trend } = await supabase
    .from("TrendingKeyword")
    .select("*")
    .eq("shadowSlug", slug)
    .maybeSingle();

  if (!trend) return { title: "Trend Not Found" };

  const title = trend.shadowTitle || `${trend.keyword} | Trending Gaming News`;
  const description = trend.shadowSeoDescription || `Explore the latest insights and news about ${trend.keyword} on PlayZ Arcade.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ['https://picsum.photos/seed/gaming/1200/630'],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://picsum.photos/seed/gaming/1200/630'],
    },
  };
}

export default async function ShadowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: trend } = await supabase
    .from("TrendingKeyword")
    .select("*")
    .eq("shadowSlug", slug)
    .single();

  if (!trend) {
    notFound();
  }

  let relevantGames: any[] = [];
  if (trend.relevantGameIds && trend.relevantGameIds.length > 0) {
    const { data: games } = await supabase
      .from("Game")
      .select("*")
      .in("id", trend.relevantGameIds);
    relevantGames = games || [];
  }

  const baseUrl = process.env.APP_URL?.replace(/\/$/, '') || 'https://playzarcade.com';
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": trend.shadowTitle || trend.keyword,
    "description": trend.shadowSeoDescription || `Everything you need to know about the rising trend: ${trend.keyword}`,
    "image": "https://picsum.photos/seed/gaming/1200/630",
    "datePublished": trend.lastUpdated,
    "dateModified": trend.lastUpdated,
    "author": {
      "@type": "Organization",
      "name": "PlayZ Arcade",
      "url": baseUrl
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent opacity-50" />
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/gaming/1920/1080')] bg-cover bg-center opacity-20 grayscale" />
        
        <div className="relative z-10 max-w-4xl px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-[0.2em]">
            <Sparkles className="w-4 h-4" />
            Trending Now
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
            {trend.shadowTitle || trend.keyword}
          </h1>
          <p className="text-xl text-white/60 font-medium max-w-2xl mx-auto">
            {trend.shadowSeoDescription || `Everything you need to know about the rising trend: ${trend.keyword}`}
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-8">
            <Link 
              href="/"
              className="px-8 py-4 rounded-full bg-white text-black font-black uppercase tracking-tight hover:bg-emerald-500 transition-colors flex items-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              Explore More Games
            </Link>
            <button className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="glass p-10 md:p-20 rounded-[3rem] border border-white/5 space-y-12">
          <div className="prose prose-invert prose-emerald max-w-none">
            <MarkdownRenderer content={trend.shadowContent || "Content coming soon..."} />
          </div>

          {/* Relevant Games Section */}
          {relevantGames.length > 0 && (
            <div className="pt-20 border-t border-white/5 space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                  <span className="w-2 h-10 bg-emerald-500 rounded-full"></span>
                  Play Games Like {trend.keyword}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {relevantGames.map((game: any) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="pt-20 border-t border-white/5">
            <div className="bg-emerald-500/5 rounded-3xl p-10 border border-emerald-500/10 text-center space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-tight">Looking for {trend.keyword}?</h3>
              <p className="text-white/60">We&apos;re constantly adding new games. Check back soon or explore our current library!</p>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest hover:gap-4 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Arcade
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
          Published {new Date(trend.lastUpdated).toLocaleDateString()} • {trend.searchVolume.toLocaleString()} People Searching
        </p>
      </footer>
    </div>
  );
}
