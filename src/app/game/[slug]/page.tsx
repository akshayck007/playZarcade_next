import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { GameCard } from "@/components/GameCard";
import { Play, Maximize2, Share2, Heart, MessageSquare, Info, Keyboard, HelpCircle } from "lucide-react";
import Markdown from "@/components/Markdown";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface GamePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GamePageProps) {
  const { slug } = await params;
  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game) return { title: "Game Not Found" };

  return {
    title: `Play ${game.title} Online | Free Browser Game`,
    description: game.description,
    openGraph: {
      title: game.title,
      description: game.description,
      images: [game.thumbnail],
    },
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      mediaAssets: true,
      category: true,
    }
  });

  if (!game) notFound();

  const relatedGames = await prisma.game.findMany({
    where: { 
      categoryId: game.categoryId,
      id: { not: game.id },
      isPublished: true 
    },
    take: 12,
    orderBy: { playCount: 'desc' }
  });

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": game.title,
    "description": game.description,
    "image": game.thumbnail,
    "genre": game.category?.name || "Casual",
    "playMode": "SinglePlayer",
    "applicationCategory": "Game",
    "operatingSystem": "Web Browser",
    "url": `https://playzarcade.com/game/${game.slug}`,
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
        <Link href={`/${game.category?.slug}`} className="hover:text-emerald-500 transition-colors">{game.category?.name}</Link>
        <span>/</span>
        <span className="text-white/60">{game.title}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Game Window Container */}
          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl group">
            {isShadowPage ? (
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
            ) : (
              <iframe 
                src={game.iframeUrl!} 
                className="w-full h-full border-0"
                allowFullScreen
                title={game.title}
              />
            )}
            
            {/* Fullscreen Overlay (Placeholder for logic) */}
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="glass p-3 rounded-full hover:bg-white/10 transition-colors">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between glass p-4 rounded-2xl">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <h1 className="text-xl font-black uppercase tracking-tight">{game.title}</h1>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{game.category?.name}</span>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>{game.playCount > 1000 ? "1.2k" : "842"}</span>
                </button>
                <button className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-emerald-500 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-lg font-black text-emerald-500">{game.playCount.toLocaleString()}</span>
              <span className="block text-[10px] text-white/30 uppercase tracking-widest font-bold">Total Plays</span>
            </div>
          </div>

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
              {game.mediaAssets.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Play className="w-5 h-5 text-emerald-500" />
                    Gameplay Media
                  </h2>
                  <div className="space-y-4">
                    {game.mediaAssets.map((asset) => (
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
          {/* Ad Slot Placeholder */}
          <div className="h-[600px] glass rounded-3xl flex flex-col items-center justify-center p-6 text-center border-dashed border-white/10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4">Advertisement</span>
            <div className="w-full h-full bg-white/5 rounded-2xl flex items-center justify-center">
              <span className="text-xs text-white/10 font-bold uppercase">Skyscraper Ad Slot</span>
            </div>
          </div>

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
          {relatedGames.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>
    </div>
  );
}
