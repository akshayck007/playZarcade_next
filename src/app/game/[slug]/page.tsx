import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { GameCard } from "@/components/GameCard";
import { GameActions } from "@/components/GameActions";
import { GamePlayer } from "@/components/GamePlayer";
import { AdSlot } from "@/components/AdSlot";
import { Play, Maximize2, Share2, Heart, MessageSquare, Info, Keyboard, HelpCircle, TrendingUp, Swords } from "lucide-react";
import Markdown from "@/components/Markdown";

// Using Edge Runtime for Cloudflare Pages
export const runtime = "edge";
export const revalidate = 3600; // Revalidate every hour

interface GamePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ challenge?: string }>;
}

export async function generateMetadata({ params }: GamePageProps) {
  const { slug } = await params;
  const baseUrl = process.env.APP_URL?.replace(/\/$/, '') || 'https://playzarcade.com';
  
  const { data: game } = await supabase
    .from("Game")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!game) return { title: "Game Not Found" };

  const title = `Play ${game.title} Online | Free Browser Game`;
  const description = game.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/game/${game.slug}`,
      images: [game.thumbnail],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [game.thumbnail],
    },
  };
}

export default async function GamePage({ params, searchParams }: GamePageProps) {
  const { slug } = await params;
  const { challenge } = await searchParams;
  const isChallenge = challenge === 'true';
  const baseUrl = process.env.APP_URL?.replace(/\/$/, '') || 'https://playzarcade.com';
  
  const { data: game, error } = await supabase
    .from("Game")
    .select("*, Category(*), MediaAsset(*)")
    .eq("slug", slug)
    .eq("isPublished", true)
    .maybeSingle();

  if (!game || error) notFound();

  const { data: relatedGames } = await supabase
    .from("Game")
    .select("*")
    .eq("categoryId", game.categoryId)
    .neq("id", game.id)
    .eq("isPublished", true)
    .order("playCount", { ascending: false })
    .limit(12);

  // 3. Find relevant trending topics for internal linking
  const gameWords = game.title.split(' ').filter((w: string) => w.length > 3);
  let relevantTrends: any[] = [];
  
  if (gameWords.length > 0) {
    const { data: trends } = await supabase
      .from("TrendingKeyword")
      .select("id, keyword, shadowSlug, shadowTitle")
      .eq("status", "shadow_page_live")
      .or(gameWords.map((word: string) => `keyword.ilike.%${word}%`).join(','))
      .limit(3);
    
    relevantTrends = trends || [];
  }

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": game.title,
    "description": game.description,
    "image": game.thumbnail,
    "genre": game.Category?.name || "Casual",
    "playMode": "SinglePlayer",
    "applicationCategory": "Game",
    "operatingSystem": "Web Browser",
    "url": `${baseUrl}/game/${game.slug}`,
  };

  const isShadowPage = !game.iframeUrl;

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/30 font-bold">
        <Link href="/" className="hover:text-emerald-500 transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/${game.Category?.slug}`} className="hover:text-emerald-500 transition-colors">{game.Category?.name}</Link>
        <span>/</span>
        <span className="text-white/60">{game.title}</span>
      </nav>

      {/* Challenge Notification */}
      {isChallenge && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-black">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter">Challenge Accepted!</h3>
              <p className="text-white/40 text-sm">A friend has challenged you to beat their score in {game.title}. Prove your skills!</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Good Luck, Player</span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Game Window Container */}
          {isShadowPage ? (
            <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl group">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                  <Info className="w-12 h-12 text-white/20" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Coming Soon to PlayZ</h2>
                  <p className="text-white/40 max-w-md mx-auto">We&apos;re currently working on bringing {game.title} to our platform. In the meantime, check out the gameplay video and related games below!</p>
                </div>
                <div className="flex gap-4">
                  <Link href="#related" className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors">Try Similar Games</Link>
                </div>
              </div>
            </div>
          ) : (
            <GamePlayer iframeUrl={game.iframeUrl!} title={game.title} thumbnail={game.thumbnail} />
          )}

          {/* Action Bar */}
          <GameActions game={game} />

          {/* Game Info Tabs/Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Description & How to Play */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Info className="w-5 h-5 text-emerald-500" />
                  About {game.title}
                </h2>
                <div className="text-white/60 text-sm leading-relaxed space-y-4">
                  <p>{game.description}</p>
                  {game.contentBody && (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <Markdown content={game.contentBody} />
                    </div>
                  )}
                </div>
              </div>

              {game.controls && (
                <div className="space-y-4">
                  <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-emerald-500" />
                    Controls
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(game.controls as Record<string, string>).map(([key, action]) => (
                      <div key={key} className="flex items-center justify-between glass px-4 py-2 rounded-xl">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{action}</span>
                        <kbd className="bg-white/10 px-2 py-1 rounded text-xs font-mono border border-white/10 uppercase">{key}</kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Media & FAQ */}
            <div className="space-y-8">
              {game.MediaAsset && game.MediaAsset.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Play className="w-5 h-5 text-emerald-500" />
                    Gameplay Media
                  </h2>
                  <div className="space-y-4">
                    {game.MediaAsset.map((asset: any) => (
                      <div key={asset.id} className="rounded-2xl overflow-hidden border border-white/5">
                        {asset.type === 'video_embed' ? (
                          <div className="aspect-video" dangerouslySetInnerHTML={{ __html: asset.url }} />
                        ) : (
                          <div className="relative aspect-video">
                            <Image 
                              src={asset.url} 
                              alt={asset.title || game.title} 
                              fill
                              className="object-cover" 
                              referrerPolicy="no-referrer" 
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {game.faq && (
                <div className="space-y-4">
                  <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-emerald-500" />
                    FAQ
                  </h2>
                  <div className="space-y-4">
                    {(game.faq as Array<{q: string, a: string}>).map((item, i) => (
                      <div key={i} className="glass p-4 rounded-2xl space-y-2">
                        <h3 className="text-sm font-bold text-white/80">{item.q}</h3>
                        <p className="text-xs text-white/40 leading-relaxed">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Ads & Related */}
        <aside className="space-y-8">
          {/* Trending Topics (Internal Linking) */}
          {relevantTrends.length > 0 && (
            <div className="glass p-6 rounded-3xl border border-emerald-500/10 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending Now
              </h3>
              <div className="space-y-3">
                {relevantTrends.map((trend: any) => (
                  <Link 
                    key={trend.id}
                    href={`/trending/${trend.shadowSlug}`}
                    className="block p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all group"
                  >
                    <p className="text-xs font-bold text-white/80 group-hover:text-emerald-500 transition-colors">
                      {trend.shadowTitle || trend.keyword}
                    </p>
                    <span className="text-[10px] text-white/20 uppercase font-black">Read More →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Ad Slot */}
          <AdSlot id="game-page-sidebar" type="skyscraper" className="mx-auto" />

          {/* Quick Stats */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Game Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Rating</span>
                <span className="text-xs font-bold text-emerald-500">4.8 / 5.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Difficulty</span>
                <span className="text-xs font-bold">Medium</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Platform</span>
                <span className="text-xs font-bold">HTML5</span>
              </div>
            </div>
          </div>

          {/* Popular in Category Sidebar */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Popular in {game.Category?.name}
            </h3>
            <div className="space-y-4">
              {relatedGames?.slice(0, 5).map((g) => (
                <Link key={g.id} href={`/game/${g.slug}`} className="flex gap-4 group">
                  <div className="relative w-20 h-15 rounded-xl overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-emerald-500/50 transition-colors">
                    <Image 
                      src={g.thumbnail} 
                      alt={g.title} 
                      fill 
                      className="object-cover transition-transform group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="text-xs font-bold uppercase tracking-tight truncate group-hover:text-emerald-500 transition-colors">{g.title}</h4>
                    <span className="text-[8px] text-white/20 font-mono uppercase tracking-widest">{g.playCount.toLocaleString()} Plays</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Related Games Section */}
      <section id="related">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
            You Might Also Like
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {relatedGames?.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>
    </div>
  );
}
